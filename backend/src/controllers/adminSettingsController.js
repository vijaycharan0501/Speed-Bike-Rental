import { isCloudinaryConfigured } from '../config/cloudinary.js';
import { getOrCreateSettings, updateWebsiteSettings } from '../services/settingsService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { updateSettingsSchema } from '../validators/settingsValidators.js';
import { emitContentUpdated } from '../services/socketService.js';

export async function getAdminSettings(_req, res, next) {
  try {
    const settings = await getOrCreateSettings();
    return sendSuccess(res, {
      data: {
        settings,
        cloudinaryConfigured: isCloudinaryConfigured(),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function putAdminSettings(req, res, next) {
  try {
    const validated = updateSettingsSchema.parse(req.body);
    const updated = await updateWebsiteSettings(validated);
    emitContentUpdated(updated.toObject ? updated.toObject() : updated);
    return sendSuccess(res, {
      message: 'Website settings saved successfully.',
      data: { settings: updated },
    });
  } catch (err) {
    next(err);
  }
}
