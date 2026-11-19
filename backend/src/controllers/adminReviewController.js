import { Review, REVIEW_STATUSES } from '../models/Review.js';
import { ApiError } from '../utils/apiError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { moderateReviewSchema } from '../validators/reviewValidators.js';

export async function listAdminReviews(req, res, next) {
  try {
    const { status = '', page = '1', limit = '20' } = req.query;
    const filter = {};
    if (status && REVIEW_STATUSES.includes(status)) {
      filter.moderationStatus = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('bikeId', 'name slug category')
        .lean(),
      Review.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      data: { reviews },
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

export async function moderateAdminReview(req, res, next) {
  try {
    const { moderationStatus } = moderateReviewSchema.parse(req.body);
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { moderationStatus },
      { new: true }
    ).populate('bikeId', 'name slug');

    if (!review) throw new ApiError(404, 'Review not found.');

    return sendSuccess(res, {
      message: `Review marked as ${moderationStatus}.`,
      data: { review },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteAdminReview(req, res, next) {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id);
    if (!deleted) throw new ApiError(404, 'Review not found.');

    return sendSuccess(res, { message: 'Review deleted.' });
  } catch (err) {
    next(err);
  }
}
