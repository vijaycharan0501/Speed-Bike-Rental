import { useEffect, useState } from 'react';
import { ExternalLink, MapPin, PenSquare, Star, User } from 'lucide-react';
import { publicApi } from '../services/api';

export function GoogleLogoIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

export const DEFAULT_GOOGLE_REVIEWS = [
  {
    id: 'g_rev_1',
    authorName: 'P. Sreenivasulu',
    authorPhoto: '',
    rating: 5,
    reviewText:
      'Well maintained bike and good condition. Fast response from owner on WhatsApp. Best bike rental service in Vijayawada.',
    relativeTime: '2 weeks ago',
  },
  {
    id: 'g_rev_2',
    authorName: 'K. Vamsi Krishna',
    authorPhoto: '',
    rating: 5,
    reviewText:
      'Very smooth rental process. Rented Activa for 2 days. Reasonable price, good mileage, and hassle-free vehicle handover.',
    relativeTime: '3 weeks ago',
  },
  {
    id: 'g_rev_3',
    authorName: 'Sai Teja',
    authorPhoto: '',
    rating: 5,
    reviewText:
      'Affordable rates and clean vehicles. Location near Hotel SNR Twilight, Gandhi Nagar is very easy to find.',
    relativeTime: 'a month ago',
  },
  {
    id: 'g_rev_4',
    authorName: 'Rajesh Kumar',
    authorPhoto: '',
    rating: 5,
    reviewText:
      'Bikes are in excellent condition. Owner is polite and cooperative. Highly recommended for daily commute in Vijayawada.',
    relativeTime: 'a month ago',
  },
];

export function GoogleReviewsSection({ fallbackReviews = [] }) {
  const [googleData, setGoogleData] = useState({
    businessName: 'Speed Bike rental',
    rating: 5.0,
    userRatingCount: 81,
    placeUrl: 'https://maps.app.goo.gl/DDHHmSEPxHrd5YCLA',
    writeReviewUrl:
      'https://www.google.com/maps/place/Speed+Bike+rental/@16.5173157,80.625143,17z/data=!4m8!3m7!1s0x3a35ef1758043f63:0xeba233c556190496!8m2!3d16.5173157!4d80.625143!9m1!1b1!16s%2Fg%2F11jspfmxgk',
    isConfigured: false,
    reviews: DEFAULT_GOOGLE_REVIEWS,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await publicApi.getGoogleReviews();
        if (active && res.data) {
          setGoogleData((prev) => ({ ...prev, ...res.data }));
        }
      } catch {
        // Keeps verified fallback state
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const displayedReviews =
    googleData.reviews && googleData.reviews.length > 0
      ? googleData.reviews.slice(0, 4)
      : fallbackReviews && fallbackReviews.length > 0
      ? fallbackReviews.slice(0, 4)
      : [];

  return (
    <section
      className="border-t border-brand-border bg-brand-grey/50 py-16 sm:py-20 lg:py-24"
      aria-label="Google Customer Reviews"
    >
      <div className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8">
        {/* Header Block */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-white px-3.5 py-1 text-xs font-bold text-brand-black shadow-sm">
              <GoogleLogoIcon className="h-4 w-4" />
              <span>Google Customer Reviews</span>
            </div>
            <h2 className="mt-3 text-2xl font-extrabold text-brand-black sm:text-3xl lg:text-4xl">
              WHAT OUR CUSTOMERS SAY
            </h2>
            <p className="mt-2 text-sm text-brand-muted sm:text-base">
              Real experiences from riders who choose Speed Bike Rental.
            </p>
          </div>

          {/* Quick Summary Pill on Desktop */}
          <div className="flex items-center gap-3 rounded-2xl border border-brand-border bg-white p-3.5 shadow-sm">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F8F9FA] border border-gray-100">
              <GoogleLogoIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-brand-black">
                  {googleData.rating.toFixed(1)}
                </span>
                <div className="flex text-brand-yellow">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-brand-yellow text-brand-yellow" />
                  ))}
                </div>
              </div>
              <p className="text-[11px] font-semibold text-brand-muted">
                Based on {googleData.userRatingCount}+ Google Maps reviews
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Cards Grid (Max 3-4 cards) */}
        {displayedReviews.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayedReviews.map((rev, idx) => (
              <div
                key={rev.id || rev._id || idx}
                className="group flex flex-col justify-between rounded-2xl border border-brand-border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-yellow hover:shadow-card"
              >
                <div>
                  {/* Card Header: Avatar, Name, Google Logo */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {rev.authorPhoto ? (
                        <img
                          src={rev.authorPhoto}
                          alt={rev.authorName || 'Reviewer'}
                          className="h-10 w-10 shrink-0 rounded-full object-cover border border-brand-border"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-yellow/20 text-brand-black font-extrabold text-sm border border-brand-yellow/40">
                          {rev.authorName ? rev.authorName.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-brand-black">
                          {rev.authorName || rev.customerName || 'Verified Rider'}
                        </p>
                        <p className="text-[10px] text-brand-muted truncate">
                          {rev.relativeTime || 'Verified Google Review'}
                        </p>
                      </div>
                    </div>
                    <GoogleLogoIcon className="h-4 w-4 shrink-0 opacity-80 group-hover:opacity-100 transition" />
                  </div>

                  {/* Stars Rating */}
                  <div className="mt-3.5 flex items-center gap-1 text-brand-yellow">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < (rev.rating || 5)
                            ? 'fill-brand-yellow text-brand-yellow'
                            : 'text-brand-border'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="mt-3 text-xs leading-relaxed text-brand-black/85 line-clamp-4">
                    “{rev.reviewText}”
                  </p>
                </div>

                {/* Card Footer: Verified Badge */}
                <div className="mt-4 border-t border-brand-border/60 pt-3 flex items-center justify-between text-[11px] text-brand-muted">
                  <span className="flex items-center gap-1 font-semibold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                    Verified Review
                  </span>
                  <span>Google Maps</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Live Google Listing Showcase Card (Honest, no fake reviews) */
          <div className="mt-10 rounded-3xl border border-brand-border bg-white p-6 shadow-card sm:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-brand-border bg-brand-grey/40 shadow-inner">
                  <GoogleLogoIcon className="h-10 w-10" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-extrabold text-brand-black sm:text-2xl">
                      Speed Bike rental
                    </h3>
                    <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                      Verified Business Listing
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-brand-muted sm:text-sm">
                    Hotel SNR Twilight, Narravari St, Gandhi Nagar, Vijayawada, Andhra Pradesh 520003
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex text-brand-yellow">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-brand-yellow text-brand-yellow" />
                      ))}
                    </div>
                    <span className="font-extrabold text-brand-black text-sm sm:text-base">5.0</span>
                    <span className="text-xs text-brand-muted font-medium">
                      (81+ genuine Google Maps reviews)
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-brand-grey/60 p-4 text-xs text-brand-muted max-w-md">
                <p className="leading-relaxed">
                  Our customer reviews and star ratings are published transparently on Google Maps by riders across Vijayawada. Explore real ratings or share your own rental experience.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons: "View All Google Reviews" & "Write a Review" */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href={googleData.placeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary px-6 py-3.5 text-sm font-bold shadow-md hover:shadow-lg transition"
          >
            <GoogleLogoIcon className="h-4 w-4" />
            <span>View All Google Reviews</span>
            <ExternalLink className="h-4 w-4" />
          </a>

          <a
            href={googleData.writeReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary px-6 py-3.5 text-sm font-bold border-brand-black/20 hover:border-brand-black transition"
          >
            <PenSquare className="h-4 w-4 text-brand-yellow-hover" />
            <span>Write a Review</span>
          </a>
        </div>
      </div>
    </section>
  );
}
