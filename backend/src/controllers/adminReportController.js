import { Bike } from '../models/Bike.js';
import { Booking, BOOKING_STATUSES } from '../models/Booking.js';
import { Customer } from '../models/Customer.js';
import { Review } from '../models/Review.js';
import { ContactEnquiry } from '../models/ContactEnquiry.js';
import { getOrCreateSettings } from '../services/settingsService.js';
import { sendSuccess } from '../utils/apiResponse.js';

function buildDateRangeFilter(fromDate, toDate) {
  const filter = {};
  if (fromDate || toDate) {
    filter.createdAt = {};
    if (fromDate) {
      const start = new Date(fromDate);
      if (!Number.isNaN(start.getTime())) filter.createdAt.$gte = start;
    }
    if (toDate) {
      const end = new Date(toDate);
      if (!Number.isNaN(end.getTime())) {
        end.setUTCHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }
    if (!Object.keys(filter.createdAt).length) delete filter.createdAt;
  }
  return filter;
}

function getRevenueMatchCondition(revenueRule) {
  if (revenueRule === 'completed_or_paid') {
    return {
      bookingStatus: { $ne: 'Cancelled' },
      $or: [{ bookingStatus: 'Completed' }, { paymentStatus: 'Paid' }],
    };
  }
  return { bookingStatus: 'Completed' };
}

export async function getReportsSummary(req, res, next) {
  try {
    const { fromDate = '', toDate = '' } = req.query;
    const dateFilter = buildDateRangeFilter(fromDate, toDate);
    const settings = await getOrCreateSettings();
    const revenueMatch = { ...dateFilter, ...getRevenueMatchCondition(settings.revenueRule) };

    const [
      totalBikes,
      publishedBikes,
      availableBikes,
      unavailableBikes,
      maintenanceBikes,
      totalCustomers,
      activeBookings,
      pendingBookings,
      pendingReviews,
      newEnquiries,
      recordedRevenueAgg,
      estimatedPipelineAgg,
      statusBreakdownAgg,
      recentBookings,
      popularBikesAgg,
    ] = await Promise.all([
      Bike.countDocuments({ isArchived: false }),
      Bike.countDocuments({ isArchived: false, isPublished: true }),
      Bike.countDocuments({ isArchived: false, availabilityStatus: 'available' }),
      Bike.countDocuments({ isArchived: false, availabilityStatus: 'unavailable' }),
      Bike.countDocuments({ isArchived: false, availabilityStatus: 'maintenance' }),
      Customer.countDocuments(dateFilter),
      Booking.countDocuments({ ...dateFilter, bookingStatus: { $in: ['Confirmed', 'Active'] } }),
      Booking.countDocuments({ ...dateFilter, bookingStatus: 'Pending' }),
      Review.countDocuments({ moderationStatus: 'pending' }),
      ContactEnquiry.countDocuments({ status: 'new' }),
      Booking.aggregate([
        { $match: revenueMatch },
        { $group: { _id: null, total: { $sum: '$estimatedTotal' }, count: { $sum: 1 } } },
      ]),
      Booking.aggregate([
        {
          $match: {
            ...dateFilter,
            bookingStatus: { $in: ['Pending', 'Confirmed', 'Active'] },
          },
        },
        { $group: { _id: null, total: { $sum: '$estimatedTotal' }, count: { $sum: 1 } } },
      ]),
      Booking.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$bookingStatus', count: { $sum: 1 }, amount: { $sum: '$estimatedTotal' } } },
      ]),
      Booking.find(dateFilter).sort({ createdAt: -1 }).limit(6).lean(),
      Booking.aggregate([
        { $match: { ...dateFilter, bookingStatus: { $ne: 'Cancelled' } } },
        {
          $group: {
            _id: '$bikeId',
            bikeName: { $first: '$bikeSnapshot.name' },
            category: { $first: '$bikeSnapshot.category' },
            bookingsCount: { $sum: 1 },
            requestedValue: { $sum: '$estimatedTotal' },
          },
        },
        { $sort: { bookingsCount: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const statusMap = new Map(statusBreakdownAgg.map((s) => [s._id, s]));
    const bookingStatusChart = BOOKING_STATUSES.map((status) => ({
      status,
      count: statusMap.get(status)?.count || 0,
      amount: statusMap.get(status)?.amount || 0,
    }));

    return sendSuccess(res, {
      data: {
        revenueRule: settings.revenueRule,
        kpis: {
          totalBikes,
          publishedBikes,
          availableBikes,
          unavailableBikes,
          maintenanceBikes,
          activeBookings,
          pendingBookings,
          totalCustomers,
          pendingReviews,
          newEnquiries,
          recordedRevenue: recordedRevenueAgg[0]?.total || 0,
          recordedRevenueCount: recordedRevenueAgg[0]?.count || 0,
          estimatedPipelineValue: estimatedPipelineAgg[0]?.total || 0,
          estimatedPipelineCount: estimatedPipelineAgg[0]?.count || 0,
        },
        availabilitySummary: {
          available: availableBikes,
          unavailable: unavailableBikes,
          maintenance: maintenanceBikes,
        },
        bookingStatusChart,
        recentBookings,
        popularBikes: popularBikesAgg,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getRevenueReport(req, res, next) {
  try {
    const { fromDate = '', toDate = '' } = req.query;
    const dateFilter = buildDateRangeFilter(fromDate, toDate);
    const settings = await getOrCreateSettings();

    const [earnedByMonth, requestedByMonth] = await Promise.all([
      Booking.aggregate([
        { $match: { ...dateFilter, ...getRevenueMatchCondition(settings.revenueRule) } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            earnedRevenue: { $sum: '$estimatedTotal' },
            qualifyingBookings: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Booking.aggregate([
        { $match: { ...dateFilter, bookingStatus: { $in: ['Pending', 'Confirmed', 'Active'] } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            estimatedRequested: { $sum: '$estimatedTotal' },
            pendingRequests: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    const monthMap = new Map();
    const formatKey = (y, m) => `${y}-${String(m).padStart(2, '0')}`;

    for (const row of earnedByMonth) {
      const key = formatKey(row._id.year, row._id.month);
      monthMap.set(key, {
        month: key,
        earnedRevenue: row.earnedRevenue,
        qualifyingBookings: row.qualifyingBookings,
        estimatedRequested: 0,
        pendingRequests: 0,
      });
    }

    for (const row of requestedByMonth) {
      const key = formatKey(row._id.year, row._id.month);
      const existing = monthMap.get(key) || {
        month: key,
        earnedRevenue: 0,
        qualifyingBookings: 0,
        estimatedRequested: 0,
        pendingRequests: 0,
      };
      existing.estimatedRequested = row.estimatedRequested;
      existing.pendingRequests = row.pendingRequests;
      monthMap.set(key, existing);
    }

    const monthly = Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month));

    return sendSuccess(res, {
      data: {
        revenueRule: settings.revenueRule,
        monthly,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getBookingsReport(req, res, next) {
  try {
    const { fromDate = '', toDate = '' } = req.query;
    const dateFilter = buildDateRangeFilter(fromDate, toDate);

    const [bookingsByMonth, customersByMonth] = await Promise.all([
      Booking.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            totalBookings: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ['$bookingStatus', 'Completed'] }, 1, 0] },
            },
            cancelled: {
              $sum: { $cond: [{ $eq: ['$bookingStatus', 'Cancelled'] }, 1, 0] },
            },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Customer.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            newCustomers: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    const formatKey = (y, m) => `${y}-${String(m).padStart(2, '0')}`;

    return sendSuccess(res, {
      data: {
        bookingVolume: bookingsByMonth.map((r) => ({
          month: formatKey(r._id.year, r._id.month),
          totalBookings: r.totalBookings,
          completed: r.completed,
          cancelled: r.cancelled,
        })),
        customerGrowth: customersByMonth.map((r) => ({
          month: formatKey(r._id.year, r._id.month),
          newCustomers: r.newCustomers,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
}
