import { Customer } from '../models/Customer.js';
import { Booking } from '../models/Booking.js';
import { ApiError } from '../utils/apiError.js';
import { sendSuccess } from '../utils/apiResponse.js';

function escapeRegex(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function listAdminCustomers(req, res, next) {
  try {
    const { search = '', page = '1', limit = '20' } = req.query;
    const filter = {};

    if (search && String(search).trim()) {
      const rx = new RegExp(escapeRegex(String(search).trim()), 'i');
      filter.$or = [{ fullName: rx }, { phone: rx }, { normalizedPhone: rx }, { email: rx }];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [customers, total] = await Promise.all([
      Customer.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limitNum).lean(),
      Customer.countDocuments(filter),
    ]);

    const customerIds = customers.map((c) => c._id);
    const bookingStats = await Booking.aggregate([
      { $match: { customerId: { $in: customerIds } } },
      {
        $group: {
          _id: '$customerId',
          totalRequests: { $sum: 1 },
          completedRentals: {
            $sum: { $cond: [{ $eq: ['$bookingStatus', 'Completed'] }, 1, 0] },
          },
          lastBookingAt: { $max: '$createdAt' },
        },
      },
    ]);

    const statMap = new Map(bookingStats.map((s) => [s._id.toString(), s]));
    const enriched = customers.map((c) => {
      const st = statMap.get(c._id.toString());
      return {
        ...c,
        totalRequests: st?.totalRequests || 0,
        completedRentals: st?.completedRentals || 0,
        lastBookingAt: st?.lastBookingAt || null,
      };
    });

    return sendSuccess(res, {
      data: { customers: enriched },
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

export async function getAdminCustomerById(req, res, next) {
  try {
    const customer = await Customer.findById(req.params.id).lean();
    if (!customer) throw new ApiError(404, 'Customer not found.');

    const bookings = await Booking.find({ customerId: customer._id })
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, {
      data: {
        customer,
        bookings,
      },
    });
  } catch (err) {
    next(err);
  }
}
