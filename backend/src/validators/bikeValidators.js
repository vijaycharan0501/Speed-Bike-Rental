import { z } from 'zod';
import { BIKE_CATEGORIES, AVAILABILITY_STATUSES } from '../models/Bike.js';

const imageSchema = z.object({
  url: z.string().trim().min(1, 'Image URL is required'),
  publicId: z.string().trim().optional().default(''),
  alt: z.string().trim().optional().default(''),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  format: z.string().optional().default(''),
  isDemo: z.boolean().optional().default(false),
});

export const bikePayloadSchema = z.object({
  name: z.string().trim().min(2, 'Bike name must be at least 2 characters.').max(120),
  slug: z.string().trim().max(140).optional().default(''),
  brand: z.string().trim().min(1, 'Brand is required.').max(80),
  category: z.enum(BIKE_CATEGORIES, {
    errorMap: () => ({ message: `Category must be one of: ${BIKE_CATEGORIES.join(', ')}` }),
  }),
  description: z.string().trim().min(10, 'Description must be at least 10 characters.').max(3000),
  pricePerDay: z.coerce
    .number({ invalid_type_error: 'Daily price must be a valid number.' })
    .positive('Daily price must be greater than zero.')
    .max(1000000),
  dailyDistanceKm: z.coerce.number().nonnegative().nullable().optional(),
  pricePerWeek: z.coerce.number().positive().nullable().optional(),
  weeklyDistanceKm: z.coerce.number().nonnegative().nullable().optional(),
  specifications: z
    .object({
      engineCC: z.string().trim().max(60).optional().default(''),
      power: z.string().trim().max(60).optional().default(''),
      mileage: z.string().trim().max(60).optional().default(''),
      transmission: z.string().trim().max(60).optional().default(''),
      fuelType: z.string().trim().max(60).optional().default(''),
      seats: z.string().trim().max(30).optional().default(''),
    })
    .optional()
    .default({}),
  features: z.array(z.string().trim().min(1).max(120)).max(30).optional().default([]),
  rentalTerms: z.string().trim().max(4000).optional().default(''),
  images: z.array(imageSchema).max(12).optional().default([]),
  primaryImage: imageSchema.nullable().optional(),
  availabilityStatus: z.enum(AVAILABILITY_STATUSES).optional().default('available'),
  isPublished: z.boolean().optional().default(false),
  isArchived: z.boolean().optional().default(false),
});
