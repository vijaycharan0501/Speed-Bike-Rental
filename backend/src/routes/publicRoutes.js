import { Router } from 'express';
import {
  getPublicBikeBySlug,
  listPublicBikes,
  submitBikeReview,
} from '../controllers/publicBikeController.js';
import {
  createPublicBooking,
  getBookingByReference,
} from '../controllers/publicBookingController.js';
import { createContactEnquiry } from '../controllers/publicContactController.js';
import { getPublicSettings } from '../controllers/publicSettingsController.js';
import { getPublicGoogleReviews } from '../controllers/publicGoogleReviewsController.js';
import { publicSubmissionLimiter } from '../middleware/rateLimiters.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

// Public bikes
router.get('/bikes', listPublicBikes);
router.get('/bikes/:slug', getPublicBikeBySlug);
router.post('/bikes/:slug/reviews', publicSubmissionLimiter, submitBikeReview);

// Public bookings
router.post('/bookings', publicSubmissionLimiter, createPublicBooking);
router.get('/bookings/reference/:reference', getBookingByReference);

// Public contact
router.post('/contact', publicSubmissionLimiter, createContactEnquiry);

// Public website settings
router.get('/settings/public', getPublicSettings);

// Public Google Reviews
router.get('/reviews/google', getPublicGoogleReviews);

export default router;
