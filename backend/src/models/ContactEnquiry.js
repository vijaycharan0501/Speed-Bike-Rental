import mongoose from 'mongoose';

export const ENQUIRY_STATUSES = ['new', 'read', 'replied', 'archived'];

const contactEnquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    email: {
      type: String,
      default: '',
      lowercase: true,
      trim: true,
      maxlength: 160,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 3000,
    },
    status: {
      type: String,
      enum: ENQUIRY_STATUSES,
      default: 'new',
    },
  },
  { timestamps: true }
);

contactEnquirySchema.index({ status: 1, createdAt: -1 });

export const ContactEnquiry = mongoose.model('ContactEnquiry', contactEnquirySchema);
