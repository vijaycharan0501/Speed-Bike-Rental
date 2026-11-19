import { getGoogleReviews } from '../services/googleReviewsService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export async function getPublicGoogleReviews(_req, res, next) {
  try {
    const data = await getGoogleReviews();
    return sendSuccess(res, { data });
  } catch (err) {
    next(err);
  }
}
