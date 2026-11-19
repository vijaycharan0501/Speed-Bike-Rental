import { Booking, BOOKING_STATUSES } from '../models/Booking.js';
import { ApiError } from '../utils/apiError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { updateBookingStatusSchema } from '../validators/bookingValidators.js';
import { updateBookingStatusService } from '../services/bookingService.js';

function escapeRegex(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function listAdminBookings(req, res, next) {
  try {
    const {
      search = '',
      status = '',
      fromDate = '',
      toDate = '',
      page = '1',
      limit = '20',
    } = req.query;

    const filter = {};
    if (status && BOOKING_STATUSES.includes(status)) {
      filter.bookingStatus = status;
    }

    if (fromDate || toDate) {
      filter.pickupDate = {};
      if (fromDate) {
        const start = new Date(fromDate);
        if (!Number.isNaN(start.getTime())) filter.pickupDate.$gte = start;
      }
      if (toDate) {
        const end = new Date(toDate);
        if (!Number.isNaN(end.getTime())) {
          end.setUTCHours(23, 59, 59, 999);
          filter.pickupDate.$lte = end;
        }
      }
      if (!Object.keys(filter.pickupDate).length) delete filter.pickupDate;
    }

    if (search && String(search).trim()) {
      const rx = new RegExp(escapeRegex(String(search).trim()), 'i');
      filter.$or = [
        { bookingReference: rx },
        { 'customerSnapshot.fullName': rx },
        { 'customerSnapshot.phone': rx },
        { 'bikeSnapshot.name': rx },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      Booking.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Booking.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      data: { bookings },
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.max(1, Math.ceil(total / limitNum)),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getAdminBookingById(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('bikeId', 'name slug brand category pricePerDay availabilityStatus')
      .populate('customerId', 'fullName phone normalizedPhone email address')
      .lean();

    if (!booking) throw new ApiError(404, 'Booking not found.');

    return sendSuccess(res, { data: { booking } });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminBookingStatus(req, res, next) {
  try {
    const validated = updateBookingStatusSchema.parse(req.body);
    const updated = await updateBookingStatusService({
      bookingId: req.params.id,
      bookingStatus: validated.bookingStatus,
      paymentStatus: validated.paymentStatus,
      note: validated.note,
      adminNotes: validated.adminNotes,
      adminName: req.admin?.name || 'Admin',
    });

    return sendSuccess(res, {
      message: 'Booking updated successfully.',
      data: { booking: updated },
    });
  } catch (err) {
    next(err);
  }
}
