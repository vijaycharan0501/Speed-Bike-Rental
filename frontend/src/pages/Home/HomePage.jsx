import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Headset,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Search,
  Sparkles,
  Star,
  Tag,
  Trophy,
  Users,
  Wrench,
} from 'lucide-react';
import { publicApi } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { BikeCard } from '../../components/BikeCard';
import { PromoTicker } from '../../components/PromoTicker';
import { GoogleReviewsSection } from '../../components/GoogleReviewsSection';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { getTodayInputDate } from '../../utils/format';
import { OFFICIAL_5_BIKES } from '../../utils/centralizedBikes';
import { useRealtimeBikes } from '../../hooks/useRealtimeBikes';

// Cleaned categories: Naked, Cruiser, and Commuter removed
const CATEGORIES = ['All Bikes', 'Scooter', 'Sports'];

export function HomePage() {
  useDocumentTitle(
    '',
    'Speed Bike Rental — Ride More. Worry Less. Premium bike rentals in Vijayawada for daily use, trips & commutes.'
  );
  const navigate = useNavigate();
  const { settings, featuredReviews } = useSettings();

  const hero = settings.heroContent || {};
  const singlePickupLocation =
    'Speed Bike Rental – Hotel SNR Twilight, Gandhi Nagar, Vijayawada';

  // Search strip state
  const [pickupLocation, setPickupLocation] = useState(singlePickupLocation);
  const [pickupDate, setPickupDate] = useState(getTodayInputDate());
  const [rentalDays, setRentalDays] = useState('2');
  const [bikeType, setBikeType] = useState('All');

  // Popular collection state
  const [activeCategory, setActiveCategory] = useState('All Bikes');
  const [bikes, setBikes] = useState([]);
  const [loadingBikes, setLoadingBikes] = useState(true);
  const [bikesError, setBikesError] = useState('');

  const fetchPopularBikes = async (cat) => {
    setLoadingBikes(true);
    setBikesError('');
    try {
      const params = { limit: 8, sort: 'newest' };
      if (cat && cat !== 'All Bikes') params.category = cat;
      const res = await publicApi.getBikes(params);
      if (res.data?.bikes && res.data.bikes.length > 0) {
        setBikes(res.data.bikes);
      } else {
        const filtered =
          cat && cat !== 'All Bikes'
            ? OFFICIAL_5_BIKES.filter((b) => b.category.toLowerCase() === cat.toLowerCase())
            : OFFICIAL_5_BIKES;
        setBikes(filtered);
      }
    } catch {
      const filtered =
        cat && cat !== 'All Bikes'
          ? OFFICIAL_5_BIKES.filter((b) => b.category.toLowerCase() === cat.toLowerCase())
          : OFFICIAL_5_BIKES;
      setBikes(filtered);
      setBikesError('');
    } finally {
      setLoadingBikes(false);
    }
  };

  useEffect(() => {
    fetchPopularBikes(activeCategory);
  }, [activeCategory]);

  // Live real-time synchronization with admin actions (create, edit, delete, status)
  useRealtimeBikes(bikes, setBikes, () => fetchPopularBikes(activeCategory));

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const sp = new URLSearchParams();
    if (bikeType && bikeType !== 'All') sp.set('category', bikeType);
    if (pickupDate) sp.set('pickupDate', pickupDate);
    if (rentalDays && Number(rentalDays) > 0) sp.set('days', String(rentalDays));
    sp.set('location', singlePickupLocation);
    sp.set('availability', 'available');
    navigate(`/bikes?${sp.toString()}`);
  };

  const featureBullets = hero.featureBullets?.length
    ? hero.featureBullets
    : [
        'Multiple Bike Options',
        'Convenient Daily & Weekly Plans',
        'Verified & Maintained Fleet',
        'Direct WhatsApp Enquiries',
      ];

  const whyChoosePoints = [
    {
      icon: Trophy,
      title: 'Premium Bike Collection',
      desc: 'Choose from 5 well-known, trusted models — Honda Activa, TVS Jupiter, Bajaj Pulsar, Yamaha FZ-S, and Hero Glamour — each inspected and road-ready.',
    },
    {
      icon: Tag,
      title: 'Affordable Rental Prices',
      desc: 'Transparent daily rates starting at just ₹399 with clearly included distance — no hidden charges, no surprise billing.',
    },
    {
      icon: CheckCircle2,
      title: 'Easy Online Booking',
      desc: 'Submit your booking request online in under a minute and confirm directly via WhatsApp with our team.',
    },
    {
      icon: Wrench,
      title: 'Well-Maintained Motorcycles',
      desc: 'All bikes are regularly serviced and maintained. Our fleet is reliable and safe for city commutes, highway trips, and daily use.',
    },
    {
      icon: Clock,
      title: 'Flexible Rental Duration',
      desc: 'Choose daily or selected weekly rental plans to suit your schedule — whether it\'s a one-day trip or an extended stay.',
    },
    {
      icon: Headset,
      title: 'Responsive Customer Support',
      desc: 'Reach us directly on WhatsApp for real-time answers about availability, bike selection, pickup location, and rental terms.',
    },
  ];

  const rentalProcessSteps = [
    {
      step: '01',
      title: 'Explore Available Bikes',
      desc: 'Browse our selection of verified scooters and motorcycles.',
    },
    {
      step: '02',
      title: 'Select Preferred Motorcycle',
      desc: 'Choose the bike matching your personal comfort, route, and travel plans.',
    },
    {
      step: '03',
      title: 'Check Pricing & Distance',
      desc: 'Review transparent daily or weekly rental prices and included distance.',
    },
    {
      step: '04',
      title: 'Submit Booking Enquiry',
      desc: 'Fill in your name, contact phone, pickup date, and rental duration.',
    },
    {
      step: '05',
      title: 'Connect on WhatsApp',
      desc: 'Connect with our owner through WhatsApp with prefilled trip details.',
    },
    {
      step: '06',
      title: 'Confirm & Ride',
      desc: 'Confirm vehicle availability, inspect your bike, and start riding.',
    },
  ];

  return (
    <div className="w-full overflow-x-hidden">
      {/* ===================================================================
          HERO BANNER
      =================================================================== */}
      <section className="sbr-hero" aria-label="Speed Bike Rental Hero Banner">
        <img
          src="/demo/hero-bg-track.jpg"
          alt=""
          aria-hidden="true"
          className="sbr-hero-bg"
        />
        <div aria-hidden="true" className="sbr-hero-overlay" />
        <div aria-hidden="true" className="sbr-hero-floor" />

        <div className="sbr-hero-stage">
          <div className="sbr-hero-content">
            <span className="sbr-hero-badge">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-yellow sm:h-2 sm:w-2" />
              {hero.badge || 'PREMIUM MOTORCYCLE RENTAL'}
            </span>

            <h1 className="sbr-hero-title">
              <span className="block">{hero.headline || 'Ride More.'}</span>
              <span className="block text-brand-yellow">
                {hero.headlineAccent || 'Worry Less.'}
              </span>
            </h1>

            <p className="sbr-hero-desc">
              {hero.subtitle ||
                'Speed Bike Rental provides convenient two-wheeler rentals in Vijayawada for trips, daily commutes & personal work.'}
            </p>

            <ul className="sbr-hero-features">
              {featureBullets.map((bullet, idx) => (
                <li key={idx} className="sbr-hero-feature-item">
                  <CheckCircle2 className="h-3 w-3 shrink-0 text-brand-yellow sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="sbr-hero-actions">
              <Link to="/book" className="sbr-hero-btn-primary">
                <span>Book a Bike</span>
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Link>
              <Link to="/bikes" className="sbr-hero-btn-secondary">
                <span>Explore Bikes</span>
              </Link>
            </div>
          </div>

          <img
            src={
              hero.imageUrl && hero.imageUrl !== '/demo/hero-bike.jpg'
                ? hero.imageUrl
                : '/demo/hero-bike-cutout.png'
            }
            alt="Speed Bike Rental motorcycle"
            className="hero-bike-image"
          />
        </div>
      </section>

      {/* MOBILE SCROLLING PROMO BAR */}
      <div className="mt-[5px] md:hidden">
        <PromoTicker items={hero.tickerItems} />
      </div>

      {/* ===================================================================
          SEARCH PANEL
          - Single verified pickup location
          - Filter categories: All, Scooter, Sports, Commuter
      =================================================================== */}
      <section className="mx-auto max-w-7xl px-3 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        <form
          onSubmit={handleSearchSubmit}
          className="rounded-2xl border border-brand-border bg-white p-4 shadow-card sm:p-6"
          aria-label="Search available motorcycles"
        >
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5 lg:items-end lg:gap-4">
            <div className="lg:col-span-2">
              <label htmlFor="home-location" className="label-field flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-brand-yellow-hover" />
                Pickup Location
              </label>
              <select
                id="home-location"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className="input-field"
              >
                <option value={singlePickupLocation}>
                  {singlePickupLocation}
                </option>
              </select>
              <p className="mt-1 text-[11px] text-brand-muted truncate">
                Narravari St, Opp. Building, Gandhi Nagar, Vijayawada 520003
              </p>
            </div>

            <div>
              <label htmlFor="home-pickup-date" className="label-field flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-brand-yellow-hover" />
                Pickup Date
              </label>
              <input
                id="home-pickup-date"
                type="date"
                min={getTodayInputDate()}
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="home-type" className="label-field">
                Bike Category
              </label>
              <select
                id="home-type"
                value={bikeType}
                onChange={(e) => setBikeType(e.target.value)}
                className="input-field"
              >
                <option value="All">All Categories</option>
                <option value="Scooter">Scooter (Activa, Jupiter)</option>
                <option value="Sports">Sports (Pulsar, FZ, Glamour)</option>
              </select>
            </div>

            <div>
              <button type="submit" className="btn-primary w-full py-2.5">
                <Search className="h-4 w-4" />
                Search Bikes
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* ===================================================================
          POPULAR BIKE COLLECTION (Strict 2-columns on mobile)
      =================================================================== */}
      <section className="mx-auto max-w-7xl px-3 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-muted">
              Our Fleet
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-brand-black sm:text-3xl lg:text-4xl">
              Available Motorcycles
            </h2>
          </div>
          <Link
            to="/bikes"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-black transition hover:text-brand-yellow-hover"
          >
            View Complete Fleet
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Category Chips: Naked and Cruiser removed */}
        <div
          className="mt-5 flex flex-wrap gap-2"
          role="tablist"
          aria-label="Bike categories"
        >
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${
                  active
                    ? 'bg-brand-black text-brand-yellow shadow-sm'
                    : 'border border-brand-border bg-white text-brand-black hover:border-brand-black'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="mt-6 sm:mt-8">
          <ErrorBanner message={bikesError} onRetry={() => fetchPopularBikes(activeCategory)} />

          {loadingBikes ? (
            <LoadingState message="Loading motorcycles..." />
          ) : bikes.length === 0 ? (
            <EmptyState
              title="No bikes found in this category"
              description="Browse our complete fleet of scooters and motorcycles."
              action={
                activeCategory !== 'All Bikes' ? (
                  <button
                    type="button"
                    onClick={() => setActiveCategory('All Bikes')}
                    className="btn-primary"
                  >
                    Show All Bikes
                  </button>
                ) : null
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
              {bikes.map((bike) => (
                <BikeCard key={bike._id} bike={bike} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* PROMOTIONAL TICKER */}
      <div className="hidden md:block">
        <PromoTicker items={hero.tickerItems} />
      </div>

      {/* ===================================================================
          EXPANDED WHO WE ARE / ABOUT SECTION
          - Based strictly on verified business foundation text
          - How Our Rental Process Works (6 steps)
          - Clear CTA: "Explore Our Bikes"
      =================================================================== */}
      <section className="border-t border-brand-border bg-white py-14 sm:py-20" aria-label="About Speed Bike Rental">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 space-y-14">
          <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="space-y-4 text-base leading-relaxed text-brand-muted lg:col-span-7">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-brand-yellow-hover">
                <Sparkles className="h-3.5 w-3.5" />
                Who We Are
              </span>
              <h2 className="text-2xl font-extrabold text-brand-black sm:text-3xl lg:text-4xl">
                About Speed Bike Rental
              </h2>
              <p className="text-brand-black/90 font-medium">
                Speed Bike Rental is a bike rental service based in Vijayawada, Andhra Pradesh, providing convenient two-wheeler rental options for customers who need flexible and affordable transportation.
              </p>
              <p>
                We offer a selection of motorcycles and Bobber bikes, including <strong className="text-brand-black">Bobber, Pulsar, FZ, Activa and Jupiter</strong>, to suit different travel requirements.
              </p>
              <p>
                Whether customers need a bike for daily transportation, personal work, local travel or short trips, our rental service provides daily and selected weekly rental plans.
              </p>
              <div className="rounded-xl border-l-4 border-brand-yellow bg-brand-grey p-4 text-sm font-semibold text-brand-black">
                Our goal is to make bike rentals simple, convenient and accessible.
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <Link to="/bikes" className="btn-primary">
                  Explore Our Bikes
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/about" className="btn-secondary">
                  Learn More About Us
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-brand-border bg-brand-black shadow-card lg:col-span-5">
              <img
                src="/demo/bike-bobber.jpg"
                alt="Speed Bike Rental Bobber Motorcycle in Vijayawada"
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>

          {/* How Our Rental Process Works */}
          <div>
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-muted">
                Step-by-Step
              </span>
              <h2 className="mt-2 text-2xl font-extrabold text-brand-black sm:text-3xl lg:text-4xl">
                How Our Rental Process Works
              </h2>
              <p className="mt-2 text-sm text-brand-muted sm:text-base">
                Renting your two-wheeler is simple, quick, and hassle-free.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rentalProcessSteps.map((s) => (
                <div
                  key={s.step}
                  className="card p-6 relative overflow-hidden group hover:border-brand-black transition"
                >
                  <span className="font-display text-3xl font-extrabold text-brand-yellow/80 group-hover:text-brand-yellow transition">
                    {s.step}
                  </span>
                  <h3 className="mt-3 text-base font-bold text-brand-black">{s.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-brand-muted">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          WHY CHOOSE SPEED BIKE RENTAL – FULL-WIDTH BLACK SECTION (#0B0B0D)
          - Arranged directly below About Speed Bike Rental
          - 100% viewport width, zero white side spaces
          - Inner container centered max-w-[1300px]
          - Responsive: 3 cards desktop (lg:grid-cols-3), 2 cards tablet (sm:grid-cols-2), 1 card mobile (grid-cols-1)
      =================================================================== */}
      <section
        className="w-full bg-[#0B0B0D] py-16 sm:py-20 lg:py-24 text-white relative overflow-hidden border-y border-white/5"
        style={{ width: '100%', boxSizing: 'border-box' }}
        aria-label="Why Choose Speed Bike Rental"
      >
        <div className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-yellow">
              The Speed Advantage
            </span>
            <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl lg:text-4xl text-white">
              Why Choose Speed Bike Rental?
            </h2>
            <p className="mt-3 text-sm text-white/70 sm:text-base">
              Six verified commitments that make Speed Bike Rental the smart choice for your two-wheeler needs in Vijayawada.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {whyChoosePoints.map((pt, idx) => {
              const Icon = pt.icon;
              return (
                <div
                  key={idx}
                  className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#16181F] p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-yellow/60 hover:bg-[#1C1E27] hover:shadow-[0_0_30px_rgba(255,196,0,0.08)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-brand-yellow/30 bg-brand-black text-brand-yellow transition-all duration-300 group-hover:border-brand-yellow group-hover:bg-brand-yellow/10">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white sm:text-lg">{pt.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/65">{pt.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================================================================
          GOOGLE CUSTOMER REVIEWS SECTION
          - "WHAT OUR CUSTOMERS SAY"
          - Reusable component connected to Google Places API
          - View All Google Reviews + Write a Review buttons
          - Honest Google verification, 5.0 rating, 81+ ratings
      =================================================================== */}
      <GoogleReviewsSection fallbackReviews={featuredReviews} />

      {/* ===================================================================
          BUSINESS LOCATION SECTION
          - Business Name: Speed Bike Rental
          - Address: Hotel SNR Twilight, Narravari St, Opp. Building,
            Gandhi Nagar, Vijayawada, Andhra Pradesh 520003, India
          - Google Maps embed + Location icon + Get Directions + Map Link
      =================================================================== */}
      <section className="border-t border-brand-border bg-white py-14 sm:py-20" aria-label="Business Location">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-brand-yellow-hover">
              <MapPin className="h-3.5 w-3.5" />
              Find Our Location
            </span>
            <h2 className="mt-2 text-2xl font-extrabold text-brand-black sm:text-3xl lg:text-4xl">
              Speed Bike Rental Hub
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-brand-muted sm:text-base">
              Conveniently situated in Gandhi Nagar, Vijayawada. Visit our rental hub to inspect your bike, complete physical verification, and ride out.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12 lg:gap-8">
            {/* Left: Detailed Information Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-brand-border bg-brand-grey/30 p-6 shadow-card sm:p-8 lg:col-span-5">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-black text-brand-yellow shadow-md">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="rounded-md bg-brand-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-yellow">
                      Main Showroom
                    </span>
                    <h3 className="mt-1 text-xl font-extrabold text-brand-black">
                      Speed Bike Rental
                    </h3>
                  </div>
                </div>

                <div className="mt-6 space-y-4 border-t border-brand-border pt-5">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-yellow" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                        Official Business Address
                      </p>
                      <p className="mt-1 text-sm font-bold leading-relaxed text-brand-black">
                        Hotel SNR Twilight,<br />
                        Narravari St, Opp. Building,<br />
                        Gandhi Nagar, Vijayawada,<br />
                        Andhra Pradesh 520003, India.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand-yellow" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                        Operating Hours
                      </p>
                      <p className="mt-1 text-sm font-semibold text-brand-black">
                        {settings.operatingHours || 'Mon–Sun: 7:00 AM – 10:00 PM'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-5 w-5 shrink-0 text-brand-yellow" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                        Customer & WhatsApp Support
                      </p>
                      <p className="mt-1 text-sm font-semibold text-brand-black">
                        {settings.whatsappNumber || '+91 94407 49649'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=Speed+Bike+rental,+Hotel+SNR+Twilight,+Narravari+St,+Gandhi+Nagar,+Vijayawada,+Andhra+Pradesh+520003"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex-1 justify-center py-3 text-xs sm:text-sm"
                >
                  <Navigation className="h-4 w-4" />
                  Get Directions
                </a>
                <a
                  href="https://maps.app.goo.gl/DDHHmSEPxHrd5YCLA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex-1 justify-center py-3 text-xs sm:text-sm"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in Google Maps
                </a>
              </div>
            </div>

            {/* Right: Google Maps Embed pointing directly to Speed Bike Rental listing coordinates */}
            <div className="min-h-[340px] overflow-hidden rounded-2xl border border-brand-border bg-white shadow-card lg:col-span-7">
              <iframe
                title="Speed Bike Rental Location - Hotel SNR Twilight, Vijayawada"
                src="https://maps.google.com/maps?q=16.5173157,80.625143&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ minHeight: '360px', border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          FULL-WIDTH READY TO ROLL BANNER
          - Occupies 100% of available row without side gaps
          - No horizontal overflow
          - Clear CTA button
      =================================================================== */}
      <section
        className="w-full bg-brand-black py-14 sm:py-20 text-white relative overflow-hidden border-t border-brand-yellow/30"
        style={{ width: '100%', boxSizing: 'border-box' }}
        aria-label="Ready To Roll"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-yellow/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-brand-yellow/10 blur-3xl"
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-yellow/30 bg-brand-yellow/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-brand-yellow">
                <Sparkles className="h-3.5 w-3.5" />
                Ready To Roll?
              </span>
              <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl lg:text-4xl text-white">
                Reserve Your Motorcycle in Minutes
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
                Select your dates, submit your booking request, and continue straight to our owner on
                WhatsApp for quick availability confirmation and hassle-free pickup in Vijayawada.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <Link
                to="/bikes"
                className="btn-primary w-full justify-center px-8 py-4 text-base font-extrabold shadow-[0_10px_25px_rgba(255,196,0,0.3)] hover:shadow-[0_12px_32px_rgba(255,196,0,0.45)] sm:w-auto"
              >
                Book a Bike Now
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
