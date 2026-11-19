import { Booking } from '../models/Booking.js';
import { ApiError } from '../utils/apiError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { createBookingSchema } from '../validators/bookingValidators.js';
import { createBookingRequest } from '../services/bookingService.js';
import { emitBookingCreated } from '../services/socketService.js';

export async function createPublicBooking(req, res, next) {
  try {
    const validated = createBookingSchema.parse(req.body);
    const result = await createBookingRequest(validated);
    emitBookingCreated(result.booking);

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Booking request saved as Pending.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getBookingByReference(req, res, next) {
  try {
    const reference = String(req.params.reference || '').trim().toUpperCase();
    if (!reference) {
      throw new ApiError(400, 'Booking reference is required.');
    }

    const booking = await Booking.findOne({ bookingReference: reference })
      .select(
        'bookingReference bookingStatus bikeSnapshot.name bikeSnapshot.category pickupDate returnDate rentalDays pricePerDaySnapshot estimatedTotal createdAt'
      )
      .lean();

    if (!booking) {
      throw new ApiError(404, 'No booking found with that reference.');
    }

    return sendSuccess(res, {
      data: {
        bookingReference: booking.bookingReference,
        bookingStatus: booking.bookingStatus,
        bikeName: booking.bikeSnapshot?.name,
        bikeCategory: booking.bikeSnapshot?.category,
        pickupDate: booking.pickupDate,
        returnDate: booking.returnDate,
        rentalDays: booking.rentalDays,
        pricePerDay: booking.pricePerDaySnapshot,
        estimatedTotal: booking.estimatedTotal,
        createdAt: booking.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}
