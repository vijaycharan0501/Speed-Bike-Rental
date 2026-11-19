import { useEffect, useState } from 'react';
import { CheckCircle2, Cloud, Save } from 'lucide-react';
import { adminApi } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { LoadingState } from '../../components/LoadingState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { ImageUploader } from '../../components/ImageUploader';
import { normalizeWhatsAppDigits, isPotentiallyIncompletePhone } from '../../utils/whatsapp';

export function AdminSettingsPage() {
  useDocumentTitle('Settings');
  const { refreshSettings } = useSettings();

  const [data, setData] = useState(null);
  const [cloudinaryConfigured, setCloudinaryConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.getSettings();
        setData(res.data?.settings);
        setCloudinaryConfigured(Boolean(res.data?.cloudinaryConfigured));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSavedMsg('');
    try {
      await adminApi.updateSettings({
        businessName: data.businessName,
        currencyCode: data.currencyCode,
        currencySymbol: data.currencySymbol,
        logo: data.logo,
        whatsappNumber: data.whatsappNumber,
        phone: data.phone,
        email: data.email,
        address: data.address,
        pickupLocations: data.pickupLocations,
        mapEmbedUrl: data.mapEmbedUrl,
        mapLinkUrl: data.mapLinkUrl,
        operatingHours: data.operatingHours,
        socialLinks: data.socialLinks,
        revenueRule: data.revenueRule,
      });
      await refreshSettings();
      setSavedMsg('Business settings saved and updated across the public website.');
    } catch (err) {
      setError(err.message || 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Loading settings..." />;
  if (!data) return <ErrorBanner message={error || 'Unable to load settings.'} />;

  const waDigits = normalizeWhatsAppDigits(data.whatsappNumber);

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-black sm:text-3xl">Business Settings</h1>
          <p className="mt-1 text-sm text-brand-muted">
            Configure your real business phone, WhatsApp number, showroom address, Google Maps
            embed, operating hours, and branding.
          </p>
        </div>
        <button type="submit" disabled={saving} className="btn-primary">
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <ErrorBanner message={error} />
      {savedMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
          <CheckCircle2 className="h-4 w-4 text-brand-green" />
          {savedMsg}
        </div>
      )}

      {/* Cloudinary status badge */}
      <div
        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-xs font-semibold ${
          cloudinaryConfigured
            ? 'border-green-200 bg-green-50 text-green-800'
            : 'border-amber-200 bg-amber-50 text-amber-900'
        }`}
      >
        <Cloud className="h-4 w-4 shrink-0" />
        <span>
          Cloudinary Media Storage:{' '}
          {cloudinaryConfigured
            ? 'Connected and ready for image uploads.'
            : 'Not configured in backend/.env yet (image URL entry still works for development).'}
        </span>
      </div>

      {/* Contact & WhatsApp */}
      <div className="card p-6 space-y-5">
        <h2 className="text-base font-bold text-brand-black">Contact & WhatsApp Handoff</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label-field">Owner WhatsApp Number (International Format)</label>
            <input
              type="text"
              value={data.whatsappNumber || ''}
              onChange={(e) => setData((d) => ({ ...d, whatsappNumber: e.target.value }))}
              placeholder="e.g. +1 555 123 4567 or +91 98765 43210"
              className="input-field"
            />
            <p className="mt-1 text-xs text-brand-muted">
              wa.me URL digits: <strong>{waDigits || 'Not set'}</strong>
            </p>
            {isPotentiallyIncompletePhone(data.whatsappNumber) && (
              <p className="mt-2 rounded-lg border border-amber-300 bg-amber-50 p-2 text-xs font-semibold text-amber-900">
                ⚠️ <strong>Owner Verification Note:</strong> The current number ({data.whatsappNumber}) contains {waDigits.length} digits. Standard Indian mobile numbers contain 10 digits. Please verify and confirm if a digit is missing before production deployment.
              </p>
            )}
          </div>

          <div>
            <label className="label-field">Public Phone Number</label>
            <input
              type="text"
              value={data.phone || ''}
              onChange={(e) => setData((d) => ({ ...d, phone: e.target.value }))}
              placeholder="+1 555 123 4567"
              className="input-field"
            />
          </div>

          <div>
            <label className="label-field">Business Email</label>
            <input
              type="email"
              value={data.email || ''}
              onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
              placeholder="bookings@yourdomain.com"
              className="input-field"
            />
          </div>

          <div>
            <label className="label-field">Operating Hours</label>
            <input
              type="text"
              value={data.operatingHours || ''}
              onChange={(e) => setData((d) => ({ ...d, operatingHours: e.target.value }))}
              placeholder="e.g. Mon–Sun, 8:00 AM – 8:00 PM"
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="label-field">Full Business Address</label>
          <textarea
            rows={2}
            value={data.address || ''}
            onChange={(e) => setData((d) => ({ ...d, address: e.target.value }))}
            placeholder="Street, Area, City, Postal Code"
            className="input-field"
          />
        </div>

        <div>
          <label className="label-field">Pickup Locations (one per line for Home search strip)</label>
          <textarea
            rows={2}
            value={(data.pickupLocations || []).join('\n')}
            onChange={(e) =>
              setData((d) => ({
                ...d,
                pickupLocations: e.target.value
                  .split('\n')
                  .map((s) => s.trim())
                  .filter(Boolean),
              }))
            }
            className="input-field"
          />
        </div>
      </div>

      {/* Google Maps */}
      <div className="card p-6 space-y-4">
        <h2 className="text-base font-bold text-brand-black">Google Maps Configuration</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label-field">Google Maps Embed URL (iframe src)</label>
            <input
              type="url"
              value={data.mapEmbedUrl || ''}
              onChange={(e) => setData((d) => ({ ...d, mapEmbedUrl: e.target.value }))}
              placeholder="https://www.google.com/maps/embed?pb=..."
              className="input-field"
            />
          </div>
          <div>
            <label className="label-field">Direct Google Maps Link</label>
            <input
              type="url"
              value={data.mapLinkUrl || ''}
              onChange={(e) => setData((d) => ({ ...d, mapLinkUrl: e.target.value }))}
              placeholder="https://maps.google.com/?q=..."
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Branding, Currency & Revenue Rule */}
      <div className="card p-6 space-y-5">
        <h2 className="text-base font-bold text-brand-black">Branding, Currency & Reporting</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="label-field">Business Name</label>
            <input
              type="text"
              value={data.businessName || ''}
              onChange={(e) => setData((d) => ({ ...d, businessName: e.target.value }))}
              className="input-field"
            />
          </div>
          <div>
            <label className="label-field">Currency Code</label>
            <input
              type="text"
              value={data.currencyCode || ''}
              onChange={(e) => setData((d) => ({ ...d, currencyCode: e.target.value }))}
              placeholder="USD / INR / EUR"
              className="input-field"
            />
          </div>
          <div>
            <label className="label-field">Currency Symbol</label>
            <input
              type="text"
              value={data.currencySymbol || ''}
              onChange={(e) => setData((d) => ({ ...d, currencySymbol: e.target.value }))}
              placeholder="$ / ₹ / €"
              className="input-field"
            />
          </div>
          <div>
            <label className="label-field">Recorded Revenue Rule</label>
            <select
              value={data.revenueRule || 'completed_only'}
              onChange={(e) => setData((d) => ({ ...d, revenueRule: e.target.value }))}
              className="input-field"
            >
              <option value="completed_only">Completed Rentals Only</option>
              <option value="completed_or_paid">Completed or Marked Paid</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label-field">
            Custom Logo Override (Leave empty to use built-in Speed Bike Rental SVG speedometer logo)
          </label>
          <ImageUploader
            multiple={false}
            folder="branding"
            images={data.logo?.url ? [{ url: data.logo.url, publicId: data.logo.publicId || '' }] : []}
            primaryImage={data.logo?.url ? { url: data.logo.url } : null}
            onChange={(imgs) => {
              const first = imgs[0];
              setData((d) => ({
                ...d,
                logo: { url: first?.url || '', publicId: first?.publicId || '' },
              }));
            }}
          />
        </div>
      </div>

      {/* Social Links */}
      <div className="card p-6 space-y-4">
        <h2 className="text-base font-bold text-brand-black">Social Media Links</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {['instagram', 'facebook', 'youtube', 'x'].map((key) => (
            <div key={key}>
              <label className="label-field capitalize">{key}</label>
              <input
                type="url"
                value={data.socialLinks?.[key] || ''}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    socialLinks: { ...(d.socialLinks || {}), [key]: e.target.value },
                  }))
                }
                placeholder={`https://${key}.com/...`}
                className="input-field"
              />
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
