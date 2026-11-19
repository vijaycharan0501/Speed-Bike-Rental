import mongoose from 'mongoose';
import { Bike } from '../models/Bike.js';
import { Booking } from '../models/Booking.js';
import { Customer } from '../models/Customer.js';
import { ApiError } from '../utils/apiError.js';
import { normalizePhone } from '../utils/phone.js';
import { generateBookingReference } from '../utils/reference.js';
import { buildBookingWhatsAppPayload } from '../utils/whatsapp.js';
import { getOrCreateSettings } from './settingsService.js';

export function toUtcDateStart(dateInput) {
  const d = new Date(dateInput);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function computeReturnDate(pickupDate, rentalDays) {
  const start = toUtcDateStart(pickupDate);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + Number(rentalDays));
  return end;
}

/**
 * Checks whether any Confirmed or Active booking overlaps [pickupDate, returnDate) for the same bike.
 */
export async function findOverlappingActiveOrConfirmedBooking({
  bikeId,
  pickupDate,
  returnDate,
  excludeBookingId = null,
}) {
  const query = {
    bikeId,
    bookingStatus: { $in: ['Confirmed', 'Active'] },
    pickupDate: { $lt: returnDate },
    returnDate: { $gt: pickupDate },
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  return Booking.findOne(query).lean();
}

export async function createBookingRequest(input) {
  // Resolve bike by ObjectId or slug from database (never trust client price)
  let bike = null;
  if (mongoose.Types.ObjectId.isValid(input.bikeId)) {
    bike = await Bike.findOne({ _id: input.bikeId, isPublished: true, isArchived: false });
  } else {
    bike = await Bike.findOne({ slug: input.bikeId.toLowerCase(), isPublished: true, isArchived: false });
  }

  if (!bike) {
    throw new ApiError(404, 'The selected motorcycle was not found or is no longer available.');
  }

  if (bike.availabilityStatus !== 'available') {
    throw new ApiError(
      400,
      `${bike.name} is currently marked as ${bike.availabilityStatus} and cannot accept new booking requests.`
    );
  }

  const pickupDate = toUtcDateStart(input.pickupDate);
  const rentalDays = Number(input.rentalDays);
  const returnDate = computeReturnDate(pickupDate, rentalDays);

  // Check if bike already has an overlapping Confirmed/Active booking so customer is informed early
  const conflict = await findOverlappingActiveOrConfirmedBooking({
    bikeId: bike._id,
    pickupDate,
    returnDate,
  });

  if (conflict) {
    throw new ApiError(
      409,
      `${bike.name} is already reserved for overlapping dates (${conflict.pickupDate.toISOString().split('T')[0]} to ${conflict.returnDate.toISOString().split('T')[0]}). Please pick different dates or another motorcycle.`
    );
  }

  // Server-side authoritative pricing
  const pricePerDaySnapshot = Number(bike.pricePerDay);
  const estimatedTotal = Number((pricePerDaySnapshot * rentalDays).toFixed(2));

  // Upsert customer by normalized phone
  const normalizedPhone = normalizePhone(input.phone);
  let customer = await Customer.findOne({ normalizedPhone });
  if (customer) {
    customer.fullName = input.fullName;
    customer.phone = input.phone;
    customer.address = input.address;
    if (input.email) customer.email = input.email;
    await customer.save();
  } else {
    customer = await Customer.create({
      fullName: input.fullName,
      phone: input.phone,
      normalizedPhone,
      email: input.email || '',
      address: input.address,
    });
  }

  // Create unique booking reference
  let bookingReference = generateBookingReference();
  for (let attempt = 0; attempt < 5; attempt++) {
    const exists = await Booking.exists({ bookingReference });
    if (!exists) break;
    bookingReference = generateBookingReference();
  }

  const primaryImageUrl = bike.primaryImage?.url || bike.images?.[0]?.url || '';

  const booking = await Booking.create({
    bookingReference,
    customerId: customer._id,
    bikeId: bike._id,
    bikeSnapshot: {
      name: bike.name,
      slug: bike.slug,
      brand: bike.brand,
      category: bike.category,
      primaryImageUrl,
    },
    customerSnapshot: {
      fullName: input.fullName,
      phone: input.phone,
      normalizedPhone,
      address: input.address,
    },
    pickupDate,
    rentalDays,
    returnDate,
    pricePerDaySnapshot,
    estimatedTotal,
    bookingStatus: 'Pending',
    paymentStatus: 'Unpaid',
    additionalMessage: input.additionalMessage || '',
    licenceFileName: input.licenceFileName || '',
    statusHistory: [
      {
        status: 'Pending',
        note: 'Booking request submitted by customer via website.',
        changedBy: 'Customer',
        changedAt: new Date(),
      },
    ],
  });

  const settings = await getOrCreateSettings();
  const whatsapp = buildBookingWhatsAppPayload({
    whatsappNumber: settings.whatsappNumber,
    currencySymbol: settings.currencySymbol || '₹',
    bookingReference: booking.bookingReference,
    customerName: booking.customerSnapshot.fullName,
    phone: booking.customerSnapshot.phone,
    email: customer.email || '',
    address: booking.customerSnapshot.address,
    bikeName: booking.bikeSnapshot.name,
    bikeBrand: booking.bikeSnapshot.brand,
    category: booking.bikeSnapshot.category,
    pickupDate: booking.pickupDate,
    returnDate: booking.returnDate,
    rentalDays: booking.rentalDays,
    pricePerDay: booking.pricePerDaySnapshot,
    estimatedTotal: booking.estimatedTotal,
    licenceFileName: booking.licenceFileName,
    additionalMessage: booking.additionalMessage,
  });

  return {
    booking: {
      bookingReference: booking.bookingReference,
      bookingStatus: booking.bookingStatus,
      bike: booking.bikeSnapshot,
      pickupDate: booking.pickupDate,
      returnDate: booking.returnDate,
      rentalDays: booking.rentalDays,
      pricePerDay: booking.pricePerDaySnapshot,
      estimatedTotal: booking.estimatedTotal,
      createdAt: booking.createdAt,
    },
    whatsapp,
    notice:
      'Your booking request has been saved as Pending. It is not confirmed until Speed Bike Rental reviews and confirms availability.',
  };
}

export async function updateBookingStatusService({
  bookingId,
  bookingStatus,
  paymentStatus,
  note = '',
  adminNotes,
  adminName = 'Admin',
}) {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, 'Booking not found.');
  }

  if (bookingStatus && ['Confirmed', 'Active'].includes(bookingStatus)) {
    const conflict = await findOverlappingActiveOrConfirmedBooking({
      bikeId: booking.bikeId,
      pickupDate: booking.pickupDate,
      returnDate: booking.returnDate,
      excludeBookingId: booking._id,
    });

    if (conflict) {
      throw new ApiError(
        409,
        `Cannot mark as ${bookingStatus}: overlaps with ${conflict.bookingStatus} booking ${conflict.bookingReference} (${conflict.pickupDate.toISOString().split('T')[0]} to ${conflict.returnDate.toISOString().split('T')[0]}).`
      );
    }
  }

  if (bookingStatus && bookingStatus !== booking.bookingStatus) {
    booking.bookingStatus = bookingStatus;
    booking.statusHistory.push({
      status: bookingStatus,
      note: note || `Status updated to ${bookingStatus}`,
      changedBy: adminName,
      changedAt: new Date(),
    });
  }

  if (paymentStatus && paymentStatus !== booking.paymentStatus) {
    booking.paymentStatus = paymentStatus;
  }

  if (adminNotes !== undefined) {
    booking.adminNotes = adminNotes;
  }

  await booking.save();
  return booking;
}
