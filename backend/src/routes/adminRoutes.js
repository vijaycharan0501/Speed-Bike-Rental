import { Router } from 'express';
import { requireAdminAuth } from '../middleware/auth.js';
import { requireCsrfProtection } from '../middleware/csrf.js';
import { imageUpload } from '../middleware/upload.js';
import {
  createAdminBike,
  deleteAdminBike,
  getAdminBikeById,
  listAdminBikes,
  patchAdminBikeStatus,
  updateAdminBike,
} from '../controllers/adminBikeController.js';
import {
  getAdminBookingById,
  listAdminBookings,
  updateAdminBookingStatus,
} from '../controllers/adminBookingController.js';
import {
  getAdminCustomerById,
  listAdminCustomers,
} from '../controllers/adminCustomerController.js';
import {
  deleteAdminReview,
  listAdminReviews,
  moderateAdminReview,
} from '../controllers/adminReviewController.js';
import {
  listAdminEnquiries,
  updateAdminEnquiryStatus,
} from '../controllers/adminEnquiryController.js';
import {
  getBookingsReport,
  getReportsSummary,
  getRevenueReport,
} from '../controllers/adminReportController.js';
import {
  getAdminSettings,
  putAdminSettings,
} from '../controllers/adminSettingsController.js';
import {
  removeUploadedImage,
  uploadImages,
} from '../controllers/adminUploadController.js';

const router = Router();

// Every admin route requires authenticated active admin + CSRF protection for mutations
router.use(requireAdminAuth);
router.use(requireCsrfProtection);

// Bikes
router.get('/bikes', listAdminBikes);
router.post('/bikes', createAdminBike);
router.get('/bikes/:id', getAdminBikeById);
router.put('/bikes/:id', updateAdminBike);
router.patch('/bikes/:id/status', patchAdminBikeStatus);
router.delete('/bikes/:id', deleteAdminBike);

// Bookings
router.get('/bookings', listAdminBookings);
router.get('/bookings/:id', getAdminBookingById);
router.patch('/bookings/:id/status', updateAdminBookingStatus);

// Customers
router.get('/customers', listAdminCustomers);
router.get('/customers/:id', getAdminCustomerById);

// Reviews
router.get('/reviews', listAdminReviews);
router.patch('/reviews/:id', moderateAdminReview);
router.delete('/reviews/:id', deleteAdminReview);

// Contact Enquiries
router.get('/enquiries', listAdminEnquiries);
router.patch('/enquiries/:id', updateAdminEnquiryStatus);

// Reports
router.get('/reports/summary', getReportsSummary);
router.get('/reports/revenue', getRevenueReport);
router.get('/reports/bookings', getBookingsReport);

// Settings
router.get('/settings', getAdminSettings);
router.put('/settings', putAdminSettings);

// Media uploads (Cloudinary)
router.post('/uploads', imageUpload.array('images', 8), uploadImages);
router.delete('/uploads', removeUploadedImage);

export default router;
