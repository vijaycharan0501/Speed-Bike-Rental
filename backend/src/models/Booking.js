import mongoose from 'mongoose';

export const BOOKING_STATUSES = ['Pending', 'Confirmed', 'Active', 'Completed', 'Cancelled'];
export const PAYMENT_STATUSES = ['Unpaid', 'Paid', 'Partial', 'Refunded'];

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: BOOKING_STATUSES,
      required: true,
    },
    note: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },
    changedBy: {
      type: String,
      default: 'System',
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    bikeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bike',
      required: true,
    },
    bikeSnapshot: {
      name: { type: String, required: true },
      slug: { type: String, default: '' },
      brand: { type: String, default: '' },
      category: { type: String, default: '' },
      primaryImageUrl: { type: String, default: '' },
    },
    customerSnapshot: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      normalizedPhone: { type: String, required: true },
      address: { type: String, required: true },
    },
    pickupDate: {
      type: Date,
      required: true,
    },
    rentalDays: {
      type: Number,
      required: true,
      min: 1,
      max: 365,
    },
    returnDate: {
      type: Date,
      required: true,
    },
    pricePerDaySnapshot: {
      type: Number,
      required: true,
      min: 0,
    },
    estimatedTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    bookingStatus: {
      type: String,
      enum: BOOKING_STATUSES,
      default: 'Pending',
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: 'Unpaid',
    },
    adminNotes: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
    },
    additionalMessage: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
    },
    licenceFileName: {
      type: String,
      default: '',
      trim: true,
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },
  },
  { timestamps: true }
);

bookingSchema.index({ bookingStatus: 1, createdAt: -1 });
bookingSchema.index({ bikeId: 1, bookingStatus: 1, pickupDate: 1, returnDate: 1 });
bookingSchema.index({ customerId: 1, createdAt: -1 });
bookingSchema.index({ pickupDate: 1 });

export const Booking = mongoose.model('Booking', bookingSchema);
