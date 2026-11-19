import mongoose from 'mongoose';

export const BIKE_CATEGORIES = ['Scooter', 'Sports'];
export const AVAILABILITY_STATUSES = ['available', 'unavailable', 'maintenance'];

const bikeImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    publicId: { type: String, default: '', trim: true },
    alt: { type: String, default: '', trim: true },
    width: { type: Number, default: null },
    height: { type: Number, default: null },
    format: { type: String, default: '' },
    isDemo: { type: Boolean, default: false },
  },
  { _id: false }
);

const bikeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    category: {
      type: String,
      required: true,
      enum: BIKE_CATEGORIES,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    pricePerDay: {
      type: Number,
      required: true,
      min: 1,
    },
    dailyDistanceKm: {
      type: Number,
      default: 120,
    },
    pricePerWeek: {
      type: Number,
      default: null,
    },
    weeklyDistanceKm: {
      type: Number,
      default: null,
    },
    specifications: {
      engineCC: { type: String, default: '', trim: true },
      power: { type: String, default: '', trim: true },
      mileage: { type: String, default: '', trim: true },
      transmission: { type: String, default: '', trim: true },
      fuelType: { type: String, default: '', trim: true },
      seats: { type: String, default: '', trim: true },
    },
    features: {
      type: [String],
      default: [],
    },
    rentalTerms: {
      type: String,
      default: '',
      trim: true,
      maxlength: 4000,
    },
    images: {
      type: [bikeImageSchema],
      default: [],
    },
    primaryImage: {
      type: bikeImageSchema,
      default: null,
    },
    availabilityStatus: {
      type: String,
      enum: AVAILABILITY_STATUSES,
      default: 'available',
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isDemo: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

bikeSchema.index({ isPublished: 1, isArchived: 1, category: 1, availabilityStatus: 1 });
bikeSchema.index({ pricePerDay: 1 });
bikeSchema.index({ brand: 1 });

export const Bike = mongoose.model('Bike', bikeSchema);
