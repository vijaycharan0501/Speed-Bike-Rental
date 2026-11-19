import { z } from 'zod';
import { isValidPhone } from '../utils/phone.js';
import { BOOKING_STATUSES, PAYMENT_STATUSES } from '../models/Booking.js';

export const createBookingSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters.')
    .max(120, 'Full name is too long.'),
  phone: z
    .string()
    .trim()
    .refine(isValidPhone, 'Please enter a valid phone number (7–15 digits).'),
  email: z.string().trim().email('Invalid email address.').optional().or(z.literal('')),
  address: z
    .string()
    .trim()
    .min(5, 'Please provide your pickup/residential address.')
    .max(500, 'Address is too long.'),
  pickupDate: z
    .string()
    .trim()
    .refine((val) => {
      const parsed = new Date(val);
      if (Number.isNaN(parsed.getTime())) return false;
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const pickupDay = new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
      return pickupDay >= today;
    }, 'Pickup date cannot be in the past.'),
  rentalDays: z.coerce
    .number({ invalid_type_error: 'Rental days must be a number.' })
    .int('Rental days must be a whole number.')
    .min(1, 'Minimum rental duration is 1 day.')
    .max(365, 'Maximum rental duration is 365 days.'),
  bikeId: z.string().trim().min(1, 'Please select a motorcycle.'),
  additionalMessage: z.string().trim().max(1000).optional().default(''),
  licenceFileName: z.string().trim().optional().default(''),
});

export const updateBookingStatusSchema = z.object({
  bookingStatus: z.enum(BOOKING_STATUSES).optional(),
  paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
  note: z.string().trim().max(500).optional().default(''),
  adminNotes: z.string().trim().max(1000).optional(),
});
