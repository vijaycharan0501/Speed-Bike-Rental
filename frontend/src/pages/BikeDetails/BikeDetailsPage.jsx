import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarCheck2,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Star,
} from 'lucide-react';
import { publicApi } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { BikeCard } from '../../components/BikeCard';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingState } from '../../components/LoadingState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { formatCurrency, formatDate } from '../../utils/format';
import { OFFICIAL_5_BIKES } from '../../utils/centralizedBikes';
import { useRealtimeSingleBike } from '../../hooks/useRealtimeBikes';

const SPEC_LABELS = [
  { key: 'engineCC', label: 'Engine Displacement' },
  { key: 'power', label: 'Max Power' },
  { key: 'mileage', label: 'Fuel Economy' },
  { key: 'transmission', label: 'Transmission' },
  { key: 'fuelType', label: 'Fuel Type' },
  { key: 'seats', label: 'Seating' },
];

export function BikeDetailsPage() {
  const { slug } = useParams();
  const { settings } = useSettings();

  const [bike, setBike] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [otherBikes, setOtherBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  // Review submission state
  const [revName, setRevName] = useState('');
  const [revRating, setRevRating] = useState(5);
  const [revText, setRevText] = useState('');
  const [revSubmitting, setRevSubmitting] = useState(false);
  const [revFeedback, setRevFeedback] = useState({ type: '', text: '' });

  useDocumentTitle(bike?.name || 'Motorcycle Details', bike?.description?.slice(0, 150) || '');

  const loadBike = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await publicApi.getBikeBySlug(slug);
      const fetchedBike = res.data?.bike;
      if (fetchedBike) {
        setBike(fetchedBike);
        setReviews(res.data?.reviews || []);
        setOtherBikes(res.data?.otherBikes || []);
      } else {
        throw new Error('Motorcycle not found.');
      }
      setActiveImageIdx(0);
    } catch {
      // Graceful fallback to centralized official 5-bike dataset
      const fallback = OFFICIAL_5_BIKES.find(
        (b) => b.slug.toLowerCase() === String(slug).toLowerCase()
      );
      if (fallback) {
        setBike(fallback);
        setOtherBikes(OFFICIAL_5_BIKES.filter((b) => b.slug !== fallback.slug));
        setError('');
      } else {
        setError('Motorcycle could not be loaded.');
      }
      setActiveImageIdx(0);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadBike();
  }, [loadBike]);

  // Live real-time synchronization with admin edits for this motorcycle
  useRealtimeSingleBike(bike, setBike, loadBike);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setRevSubmitting(true);
    setRevFeedback({ type: '', text: '' });
    try {
      const res = await publicApi.submitReview(slug, {
        customerName: revName,
        rating: revRating,
        reviewText: revText,
      });
      setRevFeedback({ type: 'success', text: res.message });
      setRevName('');
      setRevRating(5);
      setRevText('');
    } catch (err) {
      setRevFeedback({ type: 'error', text: err.message || 'Could not submit review.' });
    } finally {
      setRevSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <LoadingState message="Loading motorcycle details..." />
      </div>
    );
  }

  if (error || !bike) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorBanner message={error || 'Motorcycle not found.'} onRetry={loadBike} />
        <div className="mt-6">
          <Link to="/bikes" className="btn-secondary">
            <ArrowLeft className="h-4 w-4" />
            Back to Fleet
          </Link>
        </div>
      </div>
    );
  }

  const gallery = bike.images?.length
    ? bike.images
    : bike.primaryImage
      ? [bike.primaryImage]
      : [{ url: '/demo/bike-sports.jpg', alt: bike.name }];

  const currentImg = gallery[activeImageIdx] || gallery[0];
  const isAvailable = bike.availabilityStatus === 'available';

  // Only include populated specifications (never invent specs)
  const populatedSpecs = SPEC_LABELS.filter(
    (s) => bike.specifications?.[s.key] && String(bike.specifications[s.key]).trim() !== ''
  );

  return (
    <div className="pb-16 pt-5 sm:pt-8">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Link
          to="/bikes"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-muted hover:text-brand-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to All Bikes
        </Link>

        {/* Main Top Split — Mobile exact order:
            1. Gallery
            2. Name & Price
            3. Specifications
            4. Description
            5. Rental Terms
            6. Book This Bike button
            7. WhatsApp Enquiry button */}
        <div className="mt-4 grid grid-cols-1 gap-6 sm:mt-5 lg:grid-cols-12 lg:gap-8">
          {/* 1. Multi-Image Gallery */}
          <div className="lg:col-span-7">
            <div className="card overflow-hidden">
              <div className="relative aspect-[16/10] overflow-hidden bg-brand-black">
                <img
                  key={activeImageIdx}
                  src={currentImg.url}
                  alt={currentImg.alt || `${bike.name} ${currentImg.view || ''} photo ${activeImageIdx + 1}`}
                  className="h-full w-full object-cover object-center transition-all duration-300 ease-in-out"
                />

                {/* Badges Overlay */}
                <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2">
                  <span className="flex items-center gap-1.5 rounded-lg bg-brand-black/80 px-2.5 py-1 text-xs font-bold text-brand-yellow backdrop-blur">
                    <Camera className="h-3.5 w-3.5" />
                    <span>
                      {activeImageIdx + 1} / {gallery.length}
                    </span>
                  </span>
                </div>

                {currentImg.view && (
                  <div className="pointer-events-none absolute right-3 top-3">
                    <span className="rounded-lg bg-brand-yellow px-2.5 py-1 text-xs font-extrabold uppercase tracking-wider text-brand-black shadow">
                      {currentImg.view}
                    </span>
                  </div>
                )}

                {gallery.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIdx((prev) => (prev - 1 + gallery.length) % gallery.length)
                      }
                      aria-label="Previous image"
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 rounded-full bg-brand-black/75 p-2 text-white backdrop-blur transition hover:bg-brand-yellow hover:text-brand-black sm:left-3 sm:p-2.5"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveImageIdx((prev) => (prev + 1) % gallery.length)}
                      aria-label="Next image"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full bg-brand-black/75 p-2 text-white backdrop-blur transition hover:bg-brand-yellow hover:text-brand-black sm:right-3 sm:p-2.5"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {gallery.length > 1 && (
                <div className="flex gap-2 overflow-x-auto p-2.5 sm:gap-2.5 sm:p-3">
                  {gallery.map((img, idx) => (
                    <button
                      key={`${img.url}-${idx}`}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      className={`group relative flex flex-col items-center shrink-0 rounded-xl border-2 p-0.5 transition ${
                        idx === activeImageIdx
                          ? 'border-brand-yellow bg-brand-yellow/10'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="relative h-12 w-16 overflow-hidden rounded-lg sm:h-14 sm:w-20">
                        <img
                          src={img.url}
                          alt={img.alt || `${bike.name} thumbnail ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="mt-1 block max-w-[80px] truncate text-[10px] font-bold uppercase tracking-wider text-brand-black">
                        {img.view || `View ${idx + 1}`}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 2–7. Summary Card */}
          <div className="lg:col-span-5">
            <div className="card p-4 sm:p-6 lg:p-7">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-brand-black px-2.5 py-1 text-xs font-bold text-brand-yellow">
                  {bike.category}
                </span>
                <StatusBadge status={bike.availabilityStatus} />
                {bike.isDemo && (
                  <span className="rounded-lg bg-brand-grey px-2.5 py-1 text-xs font-bold text-brand-muted">
                    Development Demo
                  </span>
                )}
              </div>

              {/* 2. Bike Name & Rental Price */}
              <p className="mt-3 text-xs font-bold uppercase tracking-wider text-brand-muted">
                {bike.brand}
              </p>
              <h1 className="mt-1 text-2xl font-extrabold text-brand-black sm:text-3xl">
                {bike.name}
              </h1>

              {bike.ratingSummary?.reviewCount > 0 && (
                <div className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-black">
                  <Star className="h-4 w-4 fill-brand-yellow text-brand-yellow" />
                  <span>{bike.ratingSummary.averageRating}</span>
                  <span className="text-brand-muted">
                    ({bike.ratingSummary.reviewCount} approved review
                    {bike.ratingSummary.reviewCount === 1 ? '' : 's'})
                  </span>
                </div>
              )}

              <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <div className="rounded-2xl border border-brand-yellow/30 bg-brand-yellow/10 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-black">
                      Daily Rental Rate
                    </p>
                    {bike.dailyDistanceKm && (
                      <span className="rounded-md bg-brand-black px-1.5 py-0.5 text-[10px] font-bold text-brand-yellow">
                        {bike.dailyDistanceKm} KM / day
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 flex items-baseline gap-1.5">
                    <span className="font-display text-3xl font-extrabold text-brand-black sm:text-4xl">
                      {formatCurrency(bike.pricePerDay, settings.currencySymbol)}
                    </span>
                    <span className="text-sm font-medium text-brand-muted">/ day</span>
                  </div>
                </div>

                {bike.pricePerWeek ? (
                  <div className="rounded-2xl border border-brand-border bg-brand-grey p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                        Weekly Plan
                      </p>
                      {bike.weeklyDistanceKm && (
                        <span className="rounded-md bg-brand-black/10 px-1.5 py-0.5 text-[10px] font-bold text-brand-black">
                          {bike.weeklyDistanceKm} KM / week
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex items-baseline gap-1.5">
                      <span className="font-display text-2xl font-extrabold text-brand-black sm:text-3xl">
                        {formatCurrency(bike.pricePerWeek, settings.currencySymbol)}
                      </span>
                      <span className="text-sm font-medium text-brand-muted">/ week</span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-brand-border bg-brand-grey/50 p-4 flex flex-col justify-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                      Included Distance
                    </p>
                    <p className="mt-1 text-sm font-extrabold text-brand-black">
                      {bike.dailyDistanceKm ? `${bike.dailyDistanceKm} KM Daily Included` : 'Standard Distance Included'}
                    </p>
                  </div>
                )}
              </div>

              {/* 3. Bike Specifications */}
              {populatedSpecs.length > 0 && (
                <div className="mt-5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                    Specifications
                  </h2>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {populatedSpecs.map((s) => (
                      <div key={s.key} className="rounded-xl border border-brand-border p-2.5 sm:p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted sm:text-[11px]">
                          {s.label}
                        </p>
                        <p className="mt-0.5 text-xs font-bold text-brand-black sm:text-sm">
                          {bike.specifications[s.key]}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Bike Description */}
              <div className="mt-5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                  Description
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-brand-muted">
                  {bike.description}
                </p>
              </div>

              {/* 5. Rental Terms Preview */}
              <div className="mt-4 rounded-xl border border-brand-border bg-brand-grey/50 p-3.5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-brand-black">
                  Rental Terms
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-brand-muted">
                  {bike.rentalTerms ||
                    'Standard Speed Bike Rental terms apply. Submitting a booking form creates a Pending request until confirmed by our team.'}
                </p>
              </div>

              {/* 6. Book This Bike Button */}
              <div className="mt-6 flex flex-col gap-3">
                {isAvailable ? (
                  <Link to={`/book/${bike.slug}`} className="btn-primary w-full py-3.5 text-base">
                    <CalendarCheck2 className="h-5 w-5" />
                    Book This Bike
                  </Link>
                ) : (
                  <button type="button" disabled className="btn-primary w-full py-3.5 text-base">
                    Currently Unavailable for Booking
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Tabs: Overview, Specifications, Rental Terms, Reviews */}
        <section className="card mt-8 overflow-hidden sm:mt-10">
          <div
            className="flex flex-wrap border-b border-brand-border bg-brand-grey/60 px-2 pt-2 sm:px-4 sm:pt-3"
            role="tablist"
          >
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'specs', label: 'Specifications' },
              { id: 'terms', label: 'Rental Terms' },
              { id: 'reviews', label: `Reviews (${reviews.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`-mb-px border-b-2 px-3 py-2.5 text-xs font-bold transition sm:px-4 sm:py-3 sm:text-sm ${
                  activeTab === tab.id
                    ? 'rounded-t-xl border-brand-yellow bg-white text-brand-black'
                    : 'border-transparent text-brand-muted hover:text-brand-black'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-8">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-brand-black sm:text-xl">
                    About the {bike.name}
                  </h2>
                  <p className="mt-2.5 whitespace-pre-line text-sm leading-relaxed text-brand-muted">
                    {bike.description}
                  </p>
                </div>
                {bike.features?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-brand-black sm:text-sm">
                      Highlights & Features
                    </h3>
                    <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">
                      {bike.features.map((feat, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 rounded-xl bg-brand-grey px-3.5 py-2.5 text-sm font-medium text-brand-black"
                        >
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-green" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specs' && (
              <div>
                <h2 className="text-lg font-bold text-brand-black sm:text-xl">
                  Technical Specifications
                </h2>
                {populatedSpecs.length === 0 ? (
                  <p className="mt-3 text-sm text-brand-muted">
                    Detailed technical specifications have not been added for this motorcycle yet.
                  </p>
                ) : (
                  <dl className="mt-4 divide-y divide-brand-border rounded-xl border border-brand-border">
                    {populatedSpecs.map((s) => (
                      <div
                        key={s.key}
                        className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-3"
                      >
                        <dt className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                          {s.label}
                        </dt>
                        <dd className="text-sm font-semibold text-brand-black sm:col-span-2">
                          {bike.specifications[s.key]}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            )}

            {activeTab === 'terms' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-brand-black sm:text-xl">Rental Terms</h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-brand-muted">
                  {bike.rentalTerms ||
                    'Standard Speed Bike Rental terms apply. Submitting a booking form creates a Pending request until confirmed by our team.'}
                </p>
                <Link
                  to="/terms"
                  className="inline-flex text-sm font-bold text-brand-black underline decoration-brand-yellow decoration-2 underline-offset-4"
                >
                  Read Full Terms & Conditions
                </Link>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
                <div className="space-y-4 lg:col-span-7">
                  <h2 className="text-lg font-bold text-brand-black sm:text-xl">Customer Reviews</h2>
                  {reviews.length === 0 ? (
                    <p className="rounded-xl bg-brand-grey p-5 text-sm text-brand-muted">
                      No approved reviews for this motorcycle yet. Rented this bike? Share your
                      honest experience using the form.
                    </p>
                  ) : (
                    reviews.map((rev) => (
                      <div key={rev._id} className="rounded-xl border border-brand-border p-4">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-brand-black">{rev.customerName}</p>
                          <span className="text-xs text-brand-muted">
                            {formatDate(rev.createdAt)}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < rev.rating
                                  ? 'fill-brand-yellow text-brand-yellow'
                                  : 'text-brand-border'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="mt-2 text-sm text-brand-black/85">{rev.reviewText}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Submit a review */}
                <form
                  onSubmit={handleReviewSubmit}
                  className="space-y-4 rounded-2xl border border-brand-border bg-brand-grey/50 p-4 sm:p-5 lg:col-span-5"
                >
                  <h3 className="text-base font-bold text-brand-black">Leave a Review</h3>
                  <p className="text-xs text-brand-muted">
                    Reviews are moderated by our team before appearing publicly.
                  </p>

                  {revFeedback.text && (
                    <div
                      className={`rounded-xl px-3.5 py-2.5 text-xs font-semibold ${
                        revFeedback.type === 'success'
                          ? 'border border-green-200 bg-green-50 text-green-800'
                          : 'border border-red-200 bg-red-50 text-red-800'
                      }`}
                    >
                      {revFeedback.text}
                    </div>
                  )}

                  <div>
                    <label htmlFor="rev-name" className="label-field">
                      Your Name
                    </label>
                    <input
                      id="rev-name"
                      type="text"
                      required
                      minLength={2}
                      value={revName}
                      onChange={(e) => setRevName(e.target.value)}
                      className="input-field"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="rev-rating" className="label-field">
                      Rating
                    </label>
                    <select
                      id="rev-rating"
                      value={revRating}
                      onChange={(e) => setRevRating(Number(e.target.value))}
                      className="input-field"
                    >
                      <option value={5}>5 — Excellent</option>
                      <option value={4}>4 — Very Good</option>
                      <option value={3}>3 — Good</option>
                      <option value={2}>2 — Fair</option>
                      <option value={1}>1 — Poor</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="rev-text" className="label-field">
                      Your Review
                    </label>
                    <textarea
                      id="rev-text"
                      rows={3}
                      required
                      minLength={5}
                      value={revText}
                      onChange={(e) => setRevText(e.target.value)}
                      className="input-field"
                      placeholder="How was the bike condition and pickup experience?"
                    />
                  </div>

                  <button type="submit" disabled={revSubmitting} className="btn-dark w-full">
                    {revSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </section>

        {/* 8. OTHER AVAILABLE BIKES — Strict 2-column grid on mobile */}
        {otherBikes.length > 0 && (
          <section className="mt-12 sm:mt-14">
            <div className="flex items-end justify-between gap-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-muted">
                  Keep Exploring
                </p>
                <h2 className="mt-1 text-xl font-extrabold text-brand-black sm:text-3xl">
                  Other Available Bikes
                </h2>
              </div>
              <Link to="/bikes" className="text-xs font-bold text-brand-black hover:underline sm:text-sm">
                View All
              </Link>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-6 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {otherBikes.map((other) => (
                <BikeCard key={other._id} bike={other} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
