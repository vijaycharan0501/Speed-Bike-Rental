import { ContactEnquiry } from '../models/ContactEnquiry.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { createContactSchema } from '../validators/contactValidators.js';

export async function createContactEnquiry(req, res, next) {
  try {
    const validated = createContactSchema.parse(req.body);
    const enquiry = await ContactEnquiry.create(validated);

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Thank you for reaching out! Your message has been received.',
      data: {
        id: enquiry._id,
        createdAt: enquiry.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}
