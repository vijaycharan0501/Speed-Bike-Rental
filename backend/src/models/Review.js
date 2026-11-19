import mongoose from 'mongoose';

export const REVIEW_STATUSES = ['pending', 'approved', 'hidden'];

const reviewSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    bikeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bike',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    reviewText: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 1200,
    },
    moderationStatus: {
      type: String,
      enum: REVIEW_STATUSES,
      default: 'pending',
    },
  },
  { timestamps: true }
);

reviewSchema.index({ bikeId: 1, moderationStatus: 1, createdAt: -1 });
reviewSchema.index({ moderationStatus: 1, createdAt: -1 });

export const Review = mongoose.model('Review', reviewSchema);
