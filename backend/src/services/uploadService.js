import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';

export function uploadImageBuffer(buffer, { folder = env.cloudinary.folder, alt = '' } = {}) {
  if (!isCloudinaryConfigured()) {
    throw new ApiError(
      503,
      'Cloudinary is not configured yet. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env.'
    );
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) {
          return reject(new ApiError(502, `Image upload failed: ${error.message}`));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          alt,
          isDemo: false,
        });
      }
    );

    stream.end(buffer);
  });
}

export async function deleteImageByPublicId(publicId) {
  if (!publicId || !isCloudinaryConfigured()) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  } catch (err) {
    console.warn(`[Cloudinary] Failed to delete ${publicId}:`, err.message);
  }
}
