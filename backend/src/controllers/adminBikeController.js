import { Bike, BIKE_CATEGORIES, AVAILABILITY_STATUSES } from '../models/Bike.js';
import { Booking } from '../models/Booking.js';
import { ApiError } from '../utils/apiError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { slugify } from '../utils/slug.js';
import { bikePayloadSchema } from '../validators/bikeValidators.js';
import { deleteImageByPublicId } from '../services/uploadService.js';
import {
  emitBikeCreated,
  emitBikeUpdated,
  emitBikeAvailabilityChanged,
  emitBikeDeleted,
} from '../services/socketService.js';

function escapeRegex(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function ensureUniqueSlug(rawSlug, excludeId = null) {
  const base = slugify(rawSlug) || `bike-${Date.now()}`;
  let candidate = base;
  let counter = 2;

  while (true) {
    const query = { slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await Bike.exists(query);
    if (!exists) return candidate;
    candidate = `${base}-${counter++}`;
  }
}

export async function listAdminBikes(req, res, next) {
  try {
    const {
      search = '',
      category = '',
      availability = '',
      published = '',
      archived = 'false',
      page = '1',
      limit = '20',
    } = req.query;

    const filter = {};
    if (archived === 'true') {
      filter.isArchived = true;
    } else if (archived === 'false') {
      filter.isArchived = false;
    }

    if (category && BIKE_CATEGORIES.includes(category)) {
      filter.category = category;
    }

    if (availability && AVAILABILITY_STATUSES.includes(availability)) {
      filter.availabilityStatus = availability;
    }

    if (published === 'true') filter.isPublished = true;
    if (published === 'false') filter.isPublished = false;

    if (search && String(search).trim()) {
      const rx = new RegExp(escapeRegex(String(search).trim()), 'i');
      filter.$or = [{ name: rx }, { brand: rx }, { slug: rx }, { category: rx }];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [bikes, total] = await Promise.all([
      Bike.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Bike.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      data: { bikes },
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

export async function getAdminBikeById(req, res, next) {
  try {
    const bike = await Bike.findById(req.params.id).lean();
    if (!bike) throw new ApiError(404, 'Bike not found.');

    const bookingCount = await Booking.countDocuments({ bikeId: bike._id });
    return sendSuccess(res, { data: { bike, bookingCount } });
  } catch (err) {
    next(err);
  }
}

export async function createAdminBike(req, res, next) {
  try {
    const validated = bikePayloadSchema.parse(req.body);
    const uniqueSlug = await ensureUniqueSlug(validated.slug || validated.name);

    const images = validated.images || [];
    const primaryImage = validated.primaryImage || images[0] || null;

    const bike = await Bike.create({
      ...validated,
      slug: uniqueSlug,
      images,
      primaryImage,
      isDemo: false,
    });

    emitBikeCreated(bike.toObject());

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Bike created successfully.',
      data: { bike },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminBike(req, res, next) {
  try {
    const existing = await Bike.findById(req.params.id);
    if (!existing) throw new ApiError(404, 'Bike not found.');

    const validated = bikePayloadSchema.parse(req.body);
    const desiredSlug = validated.slug ? validated.slug : existing.slug;
    const uniqueSlug =
      slugify(desiredSlug) === existing.slug
        ? existing.slug
        : await ensureUniqueSlug(desiredSlug, existing._id);

    const images = validated.images || [];
    const primaryImage =
      validated.primaryImage && images.some((i) => i.url === validated.primaryImage.url)
        ? validated.primaryImage
        : images[0] || validated.primaryImage || null;

    Object.assign(existing, {
      ...validated,
      slug: uniqueSlug,
      images,
      primaryImage,
    });

    await existing.save();

    emitBikeUpdated(existing.toObject());

    return sendSuccess(res, {
      message: 'Bike updated successfully.',
      data: { bike: existing },
    });
  } catch (err) {
    next(err);
  }
}

export async function patchAdminBikeStatus(req, res, next) {
  try {
    const bike = await Bike.findById(req.params.id);
    if (!bike) throw new ApiError(404, 'Bike not found.');

    const { isPublished, availabilityStatus, isArchived } = req.body;
    if (typeof isPublished === 'boolean') bike.isPublished = isPublished;
    if (typeof isArchived === 'boolean') {
      bike.isArchived = isArchived;
      if (isArchived) bike.isPublished = false;
    }
    if (availabilityStatus && AVAILABILITY_STATUSES.includes(availabilityStatus)) {
      bike.availabilityStatus = availabilityStatus;
    }

    await bike.save();

    emitBikeAvailabilityChanged({ id: bike._id, slug: bike.slug, availabilityStatus: bike.availabilityStatus });
    emitBikeUpdated(bike.toObject());

    return sendSuccess(res, {
      message: 'Bike status updated.',
      data: { bike },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteAdminBike(req, res, next) {
  try {
    const bike = await Bike.findById(req.params.id);
    if (!bike) throw new ApiError(404, 'Bike not found.');

    const forceDelete = req.query.force === 'true';
    const bookingCount = await Booking.countDocuments({ bikeId: bike._id });

    // Prefer soft archive whenever booking history exists
    if (bookingCount > 0 || !forceDelete) {
      bike.isArchived = true;
      bike.isPublished = false;
      bike.availabilityStatus = 'unavailable';
      await bike.save();
      emitBikeDeleted({ id: bike._id, slug: bike.slug });
      return sendSuccess(res, {
        message:
          bookingCount > 0
            ? 'Bike archived to preserve existing booking history.'
            : 'Bike archived successfully.',
        data: { archived: true, bike },
      });
    }

    // Permanent delete only when there is no booking history and force=true
    for (const img of bike.images || []) {
      if (img.publicId) await deleteImageByPublicId(img.publicId);
    }
    await bike.deleteOne();

    emitBikeDeleted({ id: bike._id, slug: bike.slug });

    return sendSuccess(res, {
      message: 'Bike permanently deleted.',
      data: { deleted: true },
    });
  } catch (err) {
    next(err);
  }
}
