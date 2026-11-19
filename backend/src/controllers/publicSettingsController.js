import { Review } from '../models/Review.js';
import { getOrCreateSettings } from '../services/settingsService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export async function getPublicSettings(_req, res, next) {
  try {
    const [settingsDoc, approvedReviews] = await Promise.all([
      getOrCreateSettings(),
      Review.find({ moderationStatus: 'approved' })
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('bikeId', 'name slug category')
        .select('customerName rating reviewText bikeId createdAt')
        .lean(),
    ]);

    const settings = settingsDoc.toObject();
    delete settings.__v;
    delete settings.singletonKey;

    return sendSuccess(res, {
      data: {
        settings,
        featuredReviews: approvedReviews.map((r) => ({
          id: r._id,
          customerName: r.customerName,
          rating: r.rating,
          reviewText: r.reviewText,
          bikeName: r.bikeId?.name || '',
          bikeSlug: r.bikeId?.slug || '',
          createdAt: r.createdAt,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
}
