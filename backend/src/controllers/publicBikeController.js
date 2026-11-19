import { Bike, BIKE_CATEGORIES } from '../models/Bike.js';
import { Booking } from '../models/Booking.js';
import { Review } from '../models/Review.js';
import { ApiError } from '../utils/apiError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { createReviewSchema } from '../validators/reviewValidators.js';

function escapeRegex(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function attachReviewStats(bikes) {
  if (!bikes.length) return bikes;
  const bikeIds = bikes.map((b) => b._id);

  const stats = await Review.aggregate([
    { $match: { bikeId: { $in: bikeIds }, moderationStatus: 'approved' } },
    {
      $group: {
        _id: '$bikeId',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const map = new Map(
    stats.map((s) => [
      s._id.toString(),
      {
        averageRating: Number(s.averageRating.toFixed(1)),
        reviewCount: s.reviewCount,
      },
    ])
  );

  return bikes.map((b) => {
    const stat = map.get(b._id.toString());
    return {
      ...b,
      ratingSummary: stat || { averageRating: null, reviewCount: 0 },
    };
  });
}

export async function listPublicBikes(req, res, next) {
  try {
    const {
      search = '',
      category = '',
      brand = '',
      minPrice = '',
      maxPrice = '',
      availability = '',
      sort = 'newest',
      page = '1',
      limit = '9',
    } = req.query;

    const filter = { isPublished: true, isArchived: false };

    if (category && category !== 'All' && BIKE_CATEGORIES.includes(category)) {
      filter.category = category;
    }

    if (brand && brand !== 'All') {
      filter.brand = new RegExp(`^${escapeRegex(brand)}$`, 'i');
    }

    if (availability === 'available') {
      filter.availabilityStatus = 'available';
    } else if (availability === 'unavailable') {
      filter.availabilityStatus = { $ne: 'available' };
    }

    if (minPrice !== '' || maxPrice !== '') {
      filter.pricePerDay = {};
      if (minPrice !== '' && !Number.isNaN(Number(minPrice))) {
        filter.pricePerDay.$gte = Number(minPrice);
      }
      if (maxPrice !== '' && !Number.isNaN(Number(maxPrice))) {
        filter.pricePerDay.$lte = Number(maxPrice);
      }
      if (!Object.keys(filter.pricePerDay).length) delete filter.pricePerDay;
    }

    if (search && String(search).trim()) {
      const rx = new RegExp(escapeRegex(String(search).trim()), 'i');
      filter.$or = [{ name: rx }, { brand: rx }, { category: rx }, { description: rx }];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 9));
    const skip = (pageNum - 1) * limitNum;

    let bikes = [];
    const total = await Bike.countDocuments(filter);

    if (sort === 'popular') {
      // Popularity backed by real non-cancelled booking counts
      const bookingCounts = await Booking.aggregate([
        { $match: { bookingStatus: { $ne: 'Cancelled' } } },
        { $group: { _id: '$bikeId', count: { $sum: 1 } } },
      ]);
      const countMap = new Map(bookingCounts.map((c) => [c._id.toString(), c.count]));
      const allMatching = await Bike.find(filter).sort({ createdAt: -1 }).lean();
      allMatching.sort((a, b) => (countMap.get(b._id.toString()) || 0) - (countMap.get(a._id.toString()) || 0));
      bikes = allMatching.slice(skip, skip + limitNum);
    } else {
      const sortMap = {
        price_asc: { pricePerDay: 1, createdAt: -1 },
        price_desc: { pricePerDay: -1, createdAt: -1 },
        newest: { createdAt: -1 },
      };
      bikes = await Bike.find(filter)
        .sort(sortMap[sort] || sortMap.newest)
        .skip(skip)
        .limit(limitNum)
        .lean();
    }

    const enrichedBikes = await attachReviewStats(bikes);

    // Collect distinct brands across all published bikes for filter dropdown
    const publishedFilter = { isPublished: true, isArchived: false };
    const [brands, priceBounds] = await Promise.all([
      Bike.distinct('brand', publishedFilter),
      Bike.aggregate([
        { $match: publishedFilter },
        {
          $group: {
            _id: null,
            minPrice: { $min: '$pricePerDay' },
            maxPrice: { $max: '$pricePerDay' },
          },
        },
      ]),
    ]);

    return sendSuccess(res, {
      data: {
        bikes: enrichedBikes,
        facets: {
          categories: BIKE_CATEGORIES,
          brands: brands.sort((a, b) => a.localeCompare(b)),
          minPrice: priceBounds[0]?.minPrice ?? 0,
          maxPrice: priceBounds[0]?.maxPrice ?? 0,
        },
      },
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

export async function getPublicBikeBySlug(req, res, next) {
  try {
    const slug = String(req.params.slug || '').toLowerCase();
    const bike = await Bike.findOne({ slug, isPublished: true, isArchived: false }).lean();

    if (!bike) {
      throw new ApiError(404, 'Motorcycle not found.');
    }

    const [approvedReviews, otherBikesRaw] = await Promise.all([
      Review.find({ bikeId: bike._id, moderationStatus: 'approved' })
        .sort({ createdAt: -1 })
        .select('customerName rating reviewText createdAt')
        .lean(),
      Bike.find({
        _id: { $ne: bike._id },
        isPublished: true,
        isArchived: false,
        availabilityStatus: 'available',
      })
        .sort({ createdAt: -1 })
        .limit(4)
        .lean(),
    ]);

    const otherBikes = await attachReviewStats(otherBikesRaw);
    const reviewCount = approvedReviews.length;
    const averageRating = reviewCount
      ? Number((approvedReviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1))
      : null;

    return sendSuccess(res, {
      data: {
        bike: {
          ...bike,
          ratingSummary: { averageRating, reviewCount },
        },
        reviews: approvedReviews,
        otherBikes,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function submitBikeReview(req, res, next) {
  try {
    const slug = String(req.params.slug || '').toLowerCase();
    const bike = await Bike.findOne({ slug, isPublished: true, isArchived: false }).lean();

    if (!bike) {
      throw new ApiError(404, 'Motorcycle not found.');
    }

    const validated = createReviewSchema.parse(req.body);
    const review = await Review.create({
      bikeId: bike._id,
      customerName: validated.customerName,
      rating: validated.rating,
      reviewText: validated.reviewText,
      moderationStatus: 'pending',
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Thank you! Your review has been submitted and will appear once approved by our team.',
      data: {
        id: review._id,
        moderationStatus: review.moderationStatus,
      },
    });
  } catch (err) {
    next(err);
  }
}
