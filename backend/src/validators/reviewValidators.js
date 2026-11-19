import { z } from 'zod';
import { REVIEW_STATUSES } from '../models/Review.js';

export const createReviewSchema = z.object({
  customerName: z.string().trim().min(2, 'Please enter your name.').max(100),
  rating: z.coerce.number().int().min(1, 'Rating must be between 1 and 5.').max(5),
  reviewText: z.string().trim().min(5, 'Please write at least 5 characters.').max(1200),
});

export const moderateReviewSchema = z.object({
  moderationStatus: z.enum(REVIEW_STATUSES),
});
