import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { deleteImageByPublicId, uploadImageBuffer } from '../services/uploadService.js';

export async function uploadImages(req, res, next) {
  try {
    const files = req.files?.length ? req.files : req.file ? [req.file] : [];
    if (!files.length) {
      throw new ApiError(400, 'Please attach at least one image file (JPEG, PNG, or WebP).');
    }

    const subfolder = req.body.folder ? String(req.body.folder).replace(/[^a-zA-Z0-9_-]/g, '') : 'bikes';
    const targetFolder = `${env.cloudinary.folder}/${subfolder}`;

    const uploaded = [];
    for (const file of files) {
      const result = await uploadImageBuffer(file.buffer, {
        folder: targetFolder,
        alt: file.originalname.replace(/\.[^/.]+$/, ''),
      });
      uploaded.push(result);
    }

    return sendSuccess(res, {
      statusCode: 201,
      message: `${uploaded.length} image(s) uploaded successfully.`,
      data: { images: uploaded },
    });
  } catch (err) {
    next(err);
  }
}

export async function removeUploadedImage(req, res, next) {
  try {
    const { publicId } = req.body || {};
    if (!publicId || typeof publicId !== 'string') {
      throw new ApiError(400, 'publicId is required.');
    }
    await deleteImageByPublicId(publicId);
    return sendSuccess(res, { message: 'Image removed.' });
  } catch (err) {
    next(err);
  }
}
