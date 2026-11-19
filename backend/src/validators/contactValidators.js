import { z } from 'zod';
import { isValidPhone } from '../utils/phone.js';
import { ENQUIRY_STATUSES } from '../models/ContactEnquiry.js';

export const createContactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(120),
  phone: z.string().trim().refine(isValidPhone, 'Please enter a valid phone number.'),
  email: z.string().trim().email('Please enter a valid email address.').optional().or(z.literal('')),
  subject: z.string().trim().min(2, 'Subject is required.').max(200),
  message: z.string().trim().min(5, 'Message must be at least 5 characters.').max(3000),
});

export const updateEnquiryStatusSchema = z.object({
  status: z.enum(ENQUIRY_STATUSES),
});
