import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Save, X } from 'lucide-react';
import { adminApi } from '../../services/api';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { LoadingState } from '../../components/LoadingState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { ImageUploader } from '../../components/ImageUploader';

const EMPTY_FORM = {
  name: '',
  slug: '',
  brand: '',
  category: 'Sports',
  pricePerDay: '',
  dailyDistanceKm: '120',
  pricePerWeek: '',
  weeklyDistanceKm: '',
  description: '',
  specifications: {
    engineCC: '',
    power: '',
    mileage: '',
    transmission: '',
    fuelType: '',
    seats: '',
  },
  features: [],
  rentalTerms: '',
  images: [],
  primaryImage: null,
  availabilityStatus: 'available',
  isPublished: true,
};

export function AdminBikeFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  useDocumentTitle(isEdit ? 'Edit Bike' : 'Add New Bike');

  const [form, setForm] = useState(EMPTY_FORM);
  const [featureInput, setFeatureInput] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    let active = true;
    (async () => {
      try {
        const res = await adminApi.getBike(id);
        if (!active) return;
        const b = res.data?.bike;
        if (b) {
          setForm({
            name: b.name || '',
            slug: b.slug || '',
            brand: b.brand || '',
            category: b.category || 'Sports',
            pricePerDay: b.pricePerDay ?? '',
            dailyDistanceKm: b.dailyDistanceKm ?? '',
            pricePerWeek: b.pricePerWeek ?? '',
            weeklyDistanceKm: b.weeklyDistanceKm ?? '',
            description: b.description || '',
            specifications: {
              engineCC: b.specifications?.engineCC || '',
              power: b.specifications?.power || '',
              mileage: b.specifications?.mileage || '',
              transmission: b.specifications?.transmission || '',
              fuelType: b.specifications?.fuelType || '',
              seats: b.specifications?.seats || '',
            },
            features: b.features || [],
            rentalTerms: b.rentalTerms || '',
            images: b.images || [],
            primaryImage: b.primaryImage || null,
            availabilityStatus: b.availabilityStatus || 'available',
            isPublished: Boolean(b.isPublished),
          });
        }
      } catch (err) {
        if (active) setError(err.message || 'Could not load motorcycle.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, isEdit]);

  const handleAddFeature = () => {
    const trimmed = featureInput.trim();
    if (!trimmed) return;
    if (!form.features.includes(trimmed)) {
      setForm((f) => ({ ...f, features: [...f.features, trimmed] }));
    }
    setFeatureInput('');
  };

  const handleRemoveFeature = (idx) => {
    setForm((f) => ({ ...f, features: f.features.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        pricePerDay: Number(form.pricePerDay),
        dailyDistanceKm: form.dailyDistanceKm ? Number(form.dailyDistanceKm) : null,
        pricePerWeek: form.pricePerWeek ? Number(form.pricePerWeek) : null,
        weeklyDistanceKm: form.weeklyDistanceKm ? Number(form.weeklyDistanceKm) : null,
      };
      if (isEdit) {
        await adminApi.updateBike(id, payload);
      } else {
        await adminApi.createBike(payload);
      }
      navigate('/admin/bikes');
    } catch (err) {
      setError(err.message || 'Failed to save motorcycle.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Loading bike details..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            to="/admin/bikes"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-muted hover:text-brand-black"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Fleet
          </Link>
          <h1 className="mt-1 text-2xl font-extrabold text-brand-black sm:text-3xl">
            {isEdit ? 'Edit Motorcycle' : 'Add New Motorcycle'}
          </h1>
        </div>
      </div>

      <ErrorBanner message={error} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Info */}
        <div className="card p-6 space-y-5">
          <h2 className="text-base font-bold text-brand-black">Basic Details</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="bike-name" className="label-field">
                Bike Name *
              </label>
              <input
                id="bike-name"
                type="text"
                required
                minLength={2}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Yamaha R7"
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="bike-slug" className="label-field">
                URL Slug (auto-generated if blank)
              </label>
              <input
                id="bike-slug"
                type="text"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="yamaha-r7"
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="bike-brand" className="label-field">
                Brand *
              </label>
              <input
                id="bike-brand"
                type="text"
                required
                value={form.brand}
                onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                placeholder="e.g. Yamaha, Kawasaki, Ducati"
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="bike-category" className="label-field">
                Category *
              </label>
              <select
                id="bike-category"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="input-field"
              >
                <option value="Scooter">Scooter</option>
                <option value="Sports">Sports</option>
              </select>
            </div>

            <div>
              <label htmlFor="bike-price" className="label-field">
                Daily Price (₹) *
              </label>
              <input
                id="bike-price"
                type="number"
                required
                min="1"
                step="1"
                value={form.pricePerDay}
                onChange={(e) => setForm((f) => ({ ...f, pricePerDay: e.target.value }))}
                placeholder="399"
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="bike-daily-dist" className="label-field">
                Daily Included Distance (KM)
              </label>
              <input
                id="bike-daily-dist"
                type="number"
                min="0"
                step="1"
                value={form.dailyDistanceKm}
                onChange={(e) => setForm((f) => ({ ...f, dailyDistanceKm: e.target.value }))}
                placeholder="120"
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="bike-weekly-price" className="label-field">
                Weekly Price (₹) (Optional)
              </label>
              <input
                id="bike-weekly-price"
                type="number"
                min="1"
                step="1"
                value={form.pricePerWeek}
                onChange={(e) => setForm((f) => ({ ...f, pricePerWeek: e.target.value }))}
                placeholder="2499"
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="bike-weekly-dist" className="label-field">
                Weekly Included Distance (KM)
              </label>
              <input
                id="bike-weekly-dist"
                type="number"
                min="0"
                step="1"
                value={form.weeklyDistanceKm}
                onChange={(e) => setForm((f) => ({ ...f, weeklyDistanceKm: e.target.value }))}
                placeholder="749"
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="bike-availability" className="label-field">
                Availability Status
              </label>
              <select
                id="bike-availability"
                value={form.availabilityStatus}
                onChange={(e) => setForm((f) => ({ ...f, availabilityStatus: e.target.value }))}
                className="input-field"
              >
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="bike-desc" className="label-field">
              Description *
            </label>
            <textarea
              id="bike-desc"
              rows={4}
              required
              minLength={10}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Describe riding feel, condition, and ideal trip types..."
              className="input-field"
            />
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-brand-black">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
              className="h-4 w-4 rounded border-brand-border accent-brand-black"
            />
            Publish publicly on the customer website
          </label>
        </div>

        {/* Specifications */}
        <div className="card p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-brand-black">Technical Specifications</h2>
            <p className="text-xs text-brand-muted">
              Leave unknown fields blank — blank specifications are automatically hidden on the
              public details page.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ['engineCC', 'Engine CC', 'e.g. 689 cc'],
              ['power', 'Power', 'e.g. 73 HP'],
              ['mileage', 'Mileage / Economy', 'e.g. 24 km/l'],
              ['transmission', 'Transmission', 'e.g. 6-Speed Manual'],
              ['fuelType', 'Fuel Type', 'e.g. Petrol'],
              ['seats', 'Seats', 'e.g. 2 Seats'],
            ].map(([key, label, placeholder]) => (
              <div key={key}>
                <label htmlFor={`spec-${key}`} className="label-field">
                  {label}
                </label>
                <input
                  id={`spec-${key}`}
                  type="text"
                  value={form.specifications[key]}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      specifications: { ...f.specifications, [key]: e.target.value },
                    }))
                  }
                  placeholder={placeholder}
                  className="input-field"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Features & Rental Terms */}
        <div className="card p-6 space-y-5">
          <div>
            <h2 className="text-base font-bold text-brand-black">Features & Rental Terms</h2>
          </div>

          <div>
            <label htmlFor="bike-feature-input" className="label-field">
              Highlights / Features
            </label>
            <div className="flex gap-2">
              <input
                id="bike-feature-input"
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                placeholder="e.g. Dual-channel ABS, Phone mount, Helmet included..."
                className="input-field"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="btn-secondary shrink-0 py-2"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
            {form.features.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {form.features.map((feat, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-grey px-3 py-1 text-xs font-semibold text-brand-black"
                  >
                    {feat}
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="text-brand-muted hover:text-red-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="bike-terms" className="label-field">
              Bike-Specific Rental Terms
            </label>
            <textarea
              id="bike-terms"
              rows={3}
              value={form.rentalTerms}
              onChange={(e) => setForm((f) => ({ ...f, rentalTerms: e.target.value }))}
              placeholder="Optional terms specific to this bike (license class, security deposit, mileage cap)..."
              className="input-field"
            />
          </div>
        </div>

        {/* Cloudinary Images */}
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-bold text-brand-black">Photos & Primary Image</h2>
          <ImageUploader
            images={form.images}
            primaryImage={form.primaryImage}
            folder="bikes"
            onChange={(nextImages, nextPrimary) =>
              setForm((f) => ({ ...f, images: nextImages, primaryImage: nextPrimary }))
            }
          />
        </div>

        <div className="flex justify-end gap-3">
          <Link to="/admin/bikes" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={saving} className="btn-primary px-7">
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Motorcycle'}
          </button>
        </div>
      </form>
    </div>
  );
}
