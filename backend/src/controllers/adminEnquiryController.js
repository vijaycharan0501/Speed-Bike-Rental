import { ContactEnquiry, ENQUIRY_STATUSES } from '../models/ContactEnquiry.js';
import { ApiError } from '../utils/apiError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { updateEnquiryStatusSchema } from '../validators/contactValidators.js';

export async function listAdminEnquiries(req, res, next) {
  try {
    const { status = '', page = '1', limit = '20' } = req.query;
    const filter = {};
    if (status && ENQUIRY_STATUSES.includes(status)) {
      filter.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [enquiries, total] = await Promise.all([
      ContactEnquiry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      ContactEnquiry.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      data: { enquiries },
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.max(1, Math.ceil(total / limitNum)),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminEnquiryStatus(req, res, next) {
  try {
    const { status } = updateEnquiryStatusSchema.parse(req.body);
    const enquiry = await ContactEnquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!enquiry) throw new ApiError(404, 'Enquiry not found.');

    return sendSuccess(res, {
      message: 'Enquiry status updated.',
      data: { enquiry },
    });
  } catch (err) {
    next(err);
  }
}
