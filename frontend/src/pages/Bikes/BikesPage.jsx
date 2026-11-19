import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Bike as BikeIcon,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { publicApi } from '../../services/api';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { BikeCard } from '../../components/BikeCard';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { OFFICIAL_5_BIKES } from '../../utils/centralizedBikes';
import { useRealtimeBikes } from '../../hooks/useRealtimeBikes';

export function BikesPage() {
  useDocumentTitle(
    'Bikes Fleet',
    'Browse, filter, and compare motorcycles available for daily rental at Speed Bike Rental.'
  );
  const [searchParams, setSearchParams] = useSearchParams();

  const [bikes, setBikes] = useState([]);
  const [facets, setFacets] = useState({
    categories: ['Scooter', 'Sports'],
    brands: [],
  });
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const category = searchParams.get('category') || '';
  const brand = searchParams.get('brand') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const availability = searchParams.get('availability') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = Number(searchParams.get('page') || '1');

  const pickupDate = searchParams.get('pickupDate') || '';
  const days = searchParams.get('days') || '';
  const location = searchParams.get('location') || '';

  const updateParam = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === '' || val === null || val === undefined) {
        next.delete(key);
      } else {
        next.set(key, String(val));
      }
    });
    if (!('page' in updates)) {
      next.set('page', '1');
    }
    setSearchParams(next);
  };

  const loadBikes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await publicApi.getBikes({
        search: searchParams.get('search') || '',
        category,
        brand,
        minPrice,
        maxPrice,
        availability,
        sort,
        page,
        limit: 12,
      });
      if (res.data?.bikes && res.data.bikes.length > 0) {
        setBikes(res.data.bikes);
        if (res.data?.facets) {
          const cleanedCategories = (res.data.facets.categories || []).filter(
            (c) => c !== 'Commuter' && c !== 'Naked' && c !== 'Cruiser'
          );
          setFacets({ ...res.data.facets, categories: cleanedCategories });
        }
        if (res.meta) setMeta(res.meta);
      } else {
        // Filter centralized official fleet
        let filtered = [...OFFICIAL_5_BIKES];
        if (category && category !== 'All' && category !== 'All Bikes') {
          filtered = filtered.filter((b) => b.category.toLowerCase() === category.toLowerCase());
        }
        if (brand && brand !== 'All') {
          filtered = filtered.filter((b) => b.brand.toLowerCase() === brand.toLowerCase());
        }
        const s = (searchParams.get('search') || '').toLowerCase().trim();
        if (s) {
          filtered = filtered.filter(
            (b) => b.name.toLowerCase().includes(s) || b.brand.toLowerCase().includes(s)
          );
        }
        setBikes(filtered);
        setMeta({ page: 1, totalPages: 1, total: filtered.length });
      }
    } catch {
      let filtered = [...OFFICIAL_5_BIKES];
      if (category && category !== 'All' && category !== 'All Bikes') {
        filtered = filtered.filter((b) => b.category.toLowerCase() === category.toLowerCase());
      }
      if (brand && brand !== 'All') {
        filtered = filtered.filter((b) => b.brand.toLowerCase() === brand.toLowerCase());
      }
      const s = (searchParams.get('search') || '').toLowerCase().trim();
      if (s) {
        filtered = filtered.filter(
          (b) => b.name.toLowerCase().includes(s) || b.brand.toLowerCase().includes(s)
        );
      }
      setBikes(filtered);
      setMeta({ page: 1, totalPages: 1, total: filtered.length });
      setError('');
    } finally {
      setLoading(false);
    }
  }, [searchParams, category, brand, minPrice, maxPrice, availability, sort, page]);

  useEffect(() => {
    loadBikes();
  }, [loadBikes]);

  // Live real-time synchronization with admin actions
  useRealtimeBikes(bikes, setBikes, loadBikes);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam({ search: searchInput.trim() });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const activeFilterCount = [
    searchParams.get('search'),
    category,
    brand,
    minPrice,
    maxPrice,
    availability,
  ].filter(Boolean).length;

  const filterControls = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-6 lg:gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="sm:col-span-2">
          <label htmlFor="bikes-search" className="label-field">
            Search
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
              <input
                id="bikes-search"
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Bike name or brand..."
                className="input-field pl-9"
              />
            </div>
            <button type="submit" className="btn-dark shrink-0 px-4 py-2 text-xs">
              Go
            </button>
          </div>
        </form>

        {/* Category */}
        <div>
          <label htmlFor="filter-category" className="label-field">
            Category
          </label>
          <select
            id="filter-category"
            value={category}
            onChange={(e) => updateParam({ category: e.target.value })}
            className="input-field"
          >
            <option value="">All Categories</option>
            {facets.categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Brand */}
        <div>
          <label htmlFor="filter-brand" className="label-field">
            Brand
          </label>
          <select
            id="filter-brand"
            value={brand}
            onChange={(e) => updateParam({ brand: e.target.value })}
            className="input-field"
          >
            <option value="">All Brands</option>
            {facets.brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Availability */}
        <div>
          <label htmlFor="filter-availability" className="label-field">
            Availability
          </label>
          <select
            id="filter-availability"
            value={availability}
            onChange={(e) => updateParam({ availability: e.target.value })}
            className="input-field"
          >
            <option value="">All Published</option>
            <option value="available">Available Now</option>
            <option value="unavailable">Currently Unavailable</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <label htmlFor="filter-sort" className="label-field">
            Sort By
          </label>
          <select
            id="filter-sort"
            value={sort}
            onChange={(e) => updateParam({ sort: e.target.value })}
            className="input-field"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="popular">Most Requested</option>
          </select>
        </div>
      </div>

      {/* Price Range Row */}
      <div className="flex flex-wrap items-center gap-2.5 border-t border-brand-border pt-4">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">
          Daily Price:
        </span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            aria-label="Minimum daily price"
            value={minPrice}
            onChange={(e) => updateParam({ minPrice: e.target.value })}
            className="input-field w-24 py-2 sm:w-28"
          />
          <span className="text-sm text-brand-muted">to</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            aria-label="Maximum daily price"
            value={maxPrice}
            onChange={(e) => updateParam({ maxPrice: e.target.value })}
            className="input-field w-24 py-2 sm:w-28"
          />
        </div>
        <span className="ml-auto text-xs font-semibold text-brand-muted">
          Showing {bikes.length} of {meta.total} bike{meta.total === 1 ? '' : 's'}
        </span>
      </div>
    </div>
  );

  return (
    <div className="pb-16">
      {/* Dark Page Header */}
      <section className="bg-brand-black py-8 text-white sm:py-12">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-yellow">
            Speed Bike Rental Fleet
          </p>
          <h1 className="mt-1.5 text-2xl font-extrabold sm:text-4xl">Explore Our Motorcycles</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/75 sm:text-base">
            Filter by category, brand, daily rate, and availability to find the ideal motorcycle for
            your ride.
          </p>

          {(pickupDate || days || location) && (
            <div className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-xl border border-brand-yellow/35 bg-brand-yellow/10 px-3.5 py-2 text-xs font-semibold text-brand-yellow">
              <span>Trip selection:</span>
              {location && <span>{location}</span>}
              {pickupDate && <span>• Pickup {pickupDate}</span>}
              {days && <span>• {days} day(s)</span>}
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-3 pt-5 sm:px-6 sm:pt-8 lg:px-8">
        {/* Compact Mobile Filter Toggle Bar (< lg) */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((open) => !open)}
            className="btn-dark flex-1 justify-center py-2.5 text-xs sm:text-sm"
            aria-expanded={mobileFiltersOpen}
          >
            <SlidersHorizontal className="h-4 w-4 text-brand-yellow" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-brand-yellow px-1.5 py-0.5 text-[10px] font-extrabold text-brand-black">
                {activeFilterCount}
              </span>
            )}
          </button>

          <select
            aria-label="Sort motorcycles"
            value={sort}
            onChange={(e) => updateParam({ sort: e.target.value })}
            className="input-field w-40 py-2.5 text-xs sm:w-48 sm:text-sm"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low–High</option>
            <option value="price_desc">Price: High–Low</option>
            <option value="popular">Most Requested</option>
          </select>
        </div>

        {/* Expandable Mobile Filter Panel */}
        {mobileFiltersOpen && (
          <div className="card mt-3 p-4 lg:hidden">
            <div className="mb-3 flex items-center justify-between border-b border-brand-border pb-3">
              <span className="text-sm font-bold text-brand-black">Filter Motorcycles</span>
              <div className="flex items-center gap-3">
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-muted hover:text-brand-black"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="rounded-lg p-1 text-brand-muted hover:bg-brand-grey"
                  aria-label="Close filters"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            {filterControls}
          </div>
        )}

        {/* Desktop Always-Visible Filter Bar (lg+) */}
        <div className="card hidden p-5 lg:block">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-brand-border pb-4">
            <div className="flex items-center gap-2 text-sm font-bold text-brand-black">
              <SlidersHorizontal className="h-4 w-4 text-brand-yellow-hover" />
              <span>Filter & Sort Fleet</span>
            </div>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-muted hover:text-brand-black"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Filters
              </button>
            )}
          </div>
          {filterControls}
        </div>

        {/* Mobile Quick Category Chips */}
        <div className="mt-3 flex flex-wrap gap-1.5 lg:hidden">
          {['', ...facets.categories].map((cat) => {
            const active = category === cat;
            return (
              <button
                key={cat || 'all'}
                type="button"
                onClick={() => updateParam({ category: cat })}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                  active
                    ? 'bg-brand-black text-brand-yellow'
                    : 'border border-brand-border bg-white text-brand-black'
                }`}
              >
                {cat || 'All'}
              </button>
            );
          })}
        </div>

        {/* Results Grid — STRICT 2-COLUMN ON MOBILE */}
        <div className="mt-5 sm:mt-8">
          <ErrorBanner message={error} onRetry={loadBikes} />

          {loading ? (
            <LoadingState message="Fetching available motorcycles..." />
          ) : bikes.length === 0 ? (
            <EmptyState
              icon={BikeIcon}
              title="No motorcycles match your filters"
              description="Try clearing a filter or adjusting your daily price range."
              action={
                <button type="button" onClick={handleResetFilters} className="btn-primary">
                  Clear All Filters
                </button>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
                {bikes.map((bike) => (
                  <BikeCard key={bike._id} bike={bike} />
                ))}
              </div>

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-3 sm:mt-10">
                  <button
                    type="button"
                    disabled={meta.page <= 1}
                    onClick={() => updateParam({ page: meta.page - 1 })}
                    className="btn-secondary px-3.5 py-2 text-xs sm:text-sm"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                  </button>
                  <span className="text-xs font-semibold text-brand-black sm:text-sm">
                    Page {meta.page} of {meta.totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={meta.page >= meta.totalPages}
                    onClick={() => updateParam({ page: meta.page + 1 })}
                    className="btn-secondary px-3.5 py-2 text-xs sm:text-sm"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
