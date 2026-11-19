import { useState } from 'react';
import { ArrowLeft, ArrowRight, ImagePlus, Link as LinkIcon, Star, Trash2, Upload } from 'lucide-react';
import { adminApi } from '../services/api';
import { ErrorBanner } from './ErrorBanner';

export function ImageUploader({
  images = [],
  primaryImage = null,
  onChange,
  folder = 'bikes',
  multiple = true,
}) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    setError('');
    setUploading(true);
    try {
      const res = await adminApi.uploadImages(files, folder);
      const uploaded = res.data?.images || [];
      const nextImages = multiple ? [...images, ...uploaded] : [uploaded[0]];
      const nextPrimary = primaryImage || nextImages[0] || null;
      onChange(nextImages, nextPrimary);
    } catch (err) {
      setError(err.message || 'Image upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('https://') && !trimmed.startsWith('http://') && !trimmed.startsWith('/')) {
      setError('Image URL must start with https://, http://, or /');
      return;
    }
    setError('');
    const newImg = { url: trimmed, publicId: '', alt: '' };
    const nextImages = multiple ? [...images, newImg] : [newImg];
    const nextPrimary = primaryImage || nextImages[0] || null;
    onChange(nextImages, nextPrimary);
    setUrlInput('');
  };

  const handleRemove = (index) => {
    const removed = images[index];
    const nextImages = images.filter((_, i) => i !== index);
    let nextPrimary = primaryImage;
    if (primaryImage && removed && primaryImage.url === removed.url) {
      nextPrimary = nextImages[0] || null;
    }
    onChange(nextImages, nextPrimary);
  };

  const handleMove = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const copy = [...images];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    onChange(copy, primaryImage);
  };

  const handleSetPrimary = (img) => {
    onChange(images, img);
  };

  return (
    <div className="space-y-4">
      <ErrorBanner message={error} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="btn-dark cursor-pointer">
          <Upload className="h-4 w-4 text-brand-yellow" />
          <span>{uploading ? 'Uploading to Cloudinary...' : 'Upload Image(s)'}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple={multiple}
            disabled={uploading}
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Or paste an image URL (https://... or /demo/...)"
              className="input-field pl-9"
            />
          </div>
          <button type="button" onClick={handleAddUrl} className="btn-secondary shrink-0 py-2">
            Add URL
          </button>
        </div>
      </div>

      <p className="text-xs text-brand-muted">
        Allowed formats: JPEG, PNG, WebP (max 5 MB each). Uploads go directly to Cloudinary when configured.
      </p>

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-brand-border bg-brand-grey/50 py-8 text-center">
          <ImagePlus className="h-7 w-7 text-brand-muted" />
          <p className="mt-2 text-sm font-medium text-brand-muted">No images added yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img, idx) => {
            const isPrimary = primaryImage?.url === img.url;
            return (
              <div
                key={`${img.url}-${idx}`}
                className={`overflow-hidden rounded-xl border bg-white ${
                  isPrimary ? 'border-brand-yellow ring-2 ring-brand-yellow/40' : 'border-brand-border'
                }`}
              >
                <div className="relative aspect-[16/10] bg-brand-black">
                  <img
                    src={img.url}
                    alt={img.alt || `Upload ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                  {isPrimary && (
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-lg bg-brand-yellow px-2 py-0.5 text-[11px] font-bold text-brand-black">
                      <Star className="h-3 w-3 fill-brand-black" />
                      Primary
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-1 p-2">
                  <div className="flex items-center gap-1">
                    {multiple && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleMove(idx, -1)}
                          disabled={idx === 0}
                          className="rounded-lg border border-brand-border p-1.5 text-brand-black hover:bg-brand-grey disabled:opacity-35"
                          title="Move left"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(idx, 1)}
                          disabled={idx === images.length - 1}
                          className="rounded-lg border border-brand-border p-1.5 text-brand-black hover:bg-brand-grey disabled:opacity-35"
                          title="Move right"
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                    {!isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(img)}
                        className="rounded-lg border border-brand-border px-2 py-1 text-xs font-semibold text-brand-black hover:bg-brand-yellow/20"
                      >
                        Set Primary
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                    title="Remove image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
