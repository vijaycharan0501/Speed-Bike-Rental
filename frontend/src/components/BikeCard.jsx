import { Link } from 'react-router-dom';
import { ArrowRight, Gauge, Settings2, Star } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { formatCurrency } from '../utils/format';

export function BikeCard({ bike }) {
  const { settings } = useSettings();
  const imageUrl = bike.primaryImage?.url || bike.images?.[0]?.url || '/demo/bike-sports.jpg';
  const imageAlt = bike.primaryImage?.alt || `${bike.name} motorcycle`;
  const isAvailable = bike.availabilityStatus === 'available';
  const rating = bike.ratingSummary;

  return (
    <article className="card group flex h-full min-w-0 flex-col overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <Link
        to={`/bikes/${bike.slug}`}
        className="relative block aspect-[16/10] w-full overflow-hidden bg-brand-black"
      >
        <img
          src={imageUrl}
          alt={imageAlt}
          loading="lazy"
          className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-105"
        />
        <div className="absolute left-2 top-2 flex flex-wrap gap-1 sm:left-3 sm:top-3 sm:gap-1.5">
          <span className="rounded-md bg-brand-black/85 px-1.5 py-0.5 text-[10px] font-bold text-brand-yellow backdrop-blur sm:rounded-lg sm:px-2.5 sm:py-1 sm:text-xs">
            {bike.category}
          </span>
          {bike.isDemo && (
            <span className="hidden rounded-lg bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-black sm:inline-block">
              Demo
            </span>
          )}
        </div>
        {!isAvailable && (
          <div className="absolute right-2 top-2 rounded-md bg-red-600 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white sm:right-3 sm:top-3 sm:rounded-lg sm:px-2.5 sm:py-1 sm:text-xs">
            {bike.availabilityStatus === 'maintenance' ? 'Service' : 'Unavailable'}
          </div>
        )}
      </Link>

      {/* Compact padding at 320px-430px for strict 2-column mobile grid; roomy on tablet/desktop */}
      <div className="flex flex-1 flex-col p-2.5 sm:p-4 lg:p-5">
        <div className="flex items-start justify-between gap-1.5">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-brand-muted sm:text-xs">
              {bike.brand}
            </p>
            <h3 className="mt-0.5 line-clamp-2 text-xs font-bold leading-snug text-brand-black group-hover:text-brand-black/80 sm:text-base lg:text-lg">
              <Link to={`/bikes/${bike.slug}`}>{bike.name}</Link>
            </h3>
          </div>

          {rating?.reviewCount > 0 && rating.averageRating !== null && (
            <div className="inline-flex shrink-0 items-center gap-0.5 rounded-md bg-brand-grey px-1.5 py-0.5 text-[10px] font-bold text-brand-black sm:gap-1 sm:rounded-lg sm:px-2 sm:py-1 sm:text-xs">
              <Star className="h-3 w-3 fill-brand-yellow text-brand-yellow sm:h-3.5 sm:w-3.5" />
              <span>{rating.averageRating}</span>
              <span className="hidden text-brand-muted sm:inline">({rating.reviewCount})</span>
            </div>
          )}
        </div>

        {/* Included Distance & Weekly Plan */}
        <div className="mt-2 flex flex-col gap-0.5 text-[10px] sm:text-xs">
          {bike.dailyDistanceKm && (
            <span className="font-semibold text-brand-black/80">
              <span className="text-brand-yellow font-extrabold mr-1">✓</span>
              Includes <strong className="text-brand-black">{bike.dailyDistanceKm} KM</strong> / day
            </span>
          )}
          {bike.pricePerWeek && (
            <span className="text-brand-muted">
              Weekly: <strong>{formatCurrency(bike.pricePerWeek, settings.currencySymbol)}</strong> ({bike.weeklyDistanceKm} KM)
            </span>
          )}
        </div>

        {/* Key Specs — shown on sm+ to keep 2-column mobile cards clean & equal height */}
        {(bike.specifications?.engineCC || bike.specifications?.transmission) && (
          <div className="mt-2.5 hidden flex-wrap gap-1.5 text-xs text-brand-muted sm:flex">
            {bike.specifications?.engineCC && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-brand-grey px-2 py-1 text-[11px] font-medium text-brand-black/80">
                <Gauge className="h-3 w-3 text-brand-black/60" />
                {bike.specifications.engineCC}
              </span>
            )}
            {bike.specifications?.transmission && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-brand-grey px-2 py-1 text-[11px] font-medium text-brand-black/80">
                <Settings2 className="h-3 w-3 text-brand-black/60" />
                {bike.specifications.transmission}
              </span>
            )}
          </div>
        )}

        {/* Price + View Details CTA: stacks neatly at 320px-639px, side-by-side on sm+ */}
        <div className="mt-auto border-t border-brand-border pt-2.5 mt-3 flex flex-col gap-2 sm:mt-4 sm:pt-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="leading-none">
            <span className="font-display text-base font-extrabold text-brand-black sm:text-xl lg:text-2xl">
              {formatCurrency(bike.pricePerDay, settings.currencySymbol)}
            </span>
            <span className="text-[10px] font-medium text-brand-muted sm:text-xs"> / day</span>
          </div>

          <Link
            to={`/bikes/${bike.slug}`}
            className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-brand-yellow px-2.5 py-2 text-[11px] font-bold text-brand-black transition hover:bg-brand-yellow-hover sm:w-auto sm:rounded-xl sm:px-3.5 sm:py-2 sm:text-xs"
          >
            <span>View Details</span>
            <ArrowRight className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
