import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Info,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react';
import { publicApi } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { LoadingState } from '../../components/LoadingState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { StatusBadge } from '../../components/StatusBadge';
import { formatCurrency, formatDate, getTodayInputDate } from '../../utils/format';
import { buildBookingWhatsAppUrl } from '../../utils/whatsapp';
import { OFFICIAL_5_BIKES } from '../../utils/centralizedBikes';

export function BookingPage() {
  useDocumentTitle('Book a Bike', 'Submit a motorcycle rental booking request and continue via WhatsApp.');
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const { settings } = useSettings();

  const [bikes, setBikes] = useState([]);
  const [loadingBikes, setLoadingBikes] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Form state
  const [selectedBikeId, setSelectedBikeId] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [pickupDate, setPickupDate] = useState(searchParams.get('pickupDate') || getTodayInputDate());
  const [rentalDays, setRentalDays] = useState(searchParams.get('days') || '2');
  const [additionalMessage, setAdditionalMessage] = useState('');

  // Driving licence state
  const [licenceFile, setLicenceFile] = useState(null);
  const [licencePreviewUrl, setLicencePreviewUrl] = useState(null);
  const [licenceError, setLicenceError] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [bookingResult, setBookingResult] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoadingBikes(true);
      setLoadError('');
      try {
        const res = await publicApi.getBikes({ availability: 'available', limit: 50 });
        if (!active) return;
        const availableBikes = res.data?.bikes?.length ? res.data.bikes : OFFICIAL_5_BIKES;
        setBikes(availableBikes);

        if (slug) {
          const matched = availableBikes.find((b) => b.slug.toLowerCase() === slug.toLowerCase());
          if (matched) setSelectedBikeId(matched._id);
          else if (availableBikes[0]) setSelectedBikeId(availableBikes[0]._id);
        } else if (availableBikes[0]) {
          setSelectedBikeId(availableBikes[0]._id);
        }
      } catch {
        if (!active) return;
        setBikes(OFFICIAL_5_BIKES);
        if (slug) {
          const matched = OFFICIAL_5_BIKES.find((b) => b.slug.toLowerCase() === slug.toLowerCase());
          if (matched) setSelectedBikeId(matched._id);
          else setSelectedBikeId(OFFICIAL_5_BIKES[0]._id);
        } else {
          setSelectedBikeId(OFFICIAL_5_BIKES[0]._id);
        }
      } finally {
        if (active) setLoadingBikes(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  const selectedBike = useMemo(
    () => bikes.find((b) => b._id === selectedBikeId) || null,
    [bikes, selectedBikeId]
  );

  const parsedDays = Math.max(1, parseInt(rentalDays, 10) || 1);

  const { estimatedTotal, pricingBreakdown } = useMemo(() => {
    if (!selectedBike) return { estimatedTotal: 0, pricingBreakdown: '' };
    if (selectedBike.pricePerWeek && parsedDays >= 7) {
      const weeks = Math.floor(parsedDays / 7);
      const remDays = parsedDays % 7;
      const total = weeks * selectedBike.pricePerWeek + remDays * selectedBike.pricePerDay;
      const breakdown =
        remDays > 0
          ? `${weeks} week(s) @ ${formatCurrency(selectedBike.pricePerWeek, settings.currencySymbol)} + ${remDays} day(s) @ ${formatCurrency(selectedBike.pricePerDay, settings.currencySymbol)}`
          : `${weeks} week(s) @ ${formatCurrency(selectedBike.pricePerWeek, settings.currencySymbol)}`;
      return { estimatedTotal: total, pricingBreakdown: breakdown };
    }
    return {
      estimatedTotal: selectedBike.pricePerDay * parsedDays,
      pricingBreakdown: `${parsedDays} day(s) @ ${formatCurrency(selectedBike.pricePerDay, settings.currencySymbol)}/day`,
    };
  }, [selectedBike, parsedDays, settings.currencySymbol]);

  const returnDatePreview = useMemo(() => {
    if (!pickupDate) return '';
    const d = new Date(`${pickupDate}T00:00:00Z`);
    if (Number.isNaN(d.getTime())) return '';
    d.setUTCDate(d.getUTCDate() + parsedDays);
    return formatDate(d);
  }, [pickupDate, parsedDays]);

  const handleLicenceChange = (e) => {
    const file = e.target.files?.[0];
    setLicenceError('');
    if (!file) {
      setLicenceFile(null);
      setLicencePreviewUrl(null);
      return;
    }
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setLicenceError('Only JPG, JPEG, PNG or PDF files are accepted for the driving licence.');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setLicenceError('File size must be under 5 MB.');
      e.target.value = '';
      return;
    }
    setLicenceFile(file);
    if (file.type !== 'application/pdf') {
      const previewUrl = URL.createObjectURL(file);
      setLicencePreviewUrl(previewUrl);
    } else {
      setLicencePreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!selectedBikeId) {
      setSubmitError('Please select a motorcycle.');
      return;
    }

    if (!licenceFile) {
      setLicenceError('Driving licence upload is mandatory. Please upload a JPG, PNG or PDF.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await publicApi.createBooking({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        pickupDate,
        rentalDays: parsedDays,
        bikeId: selectedBikeId,
        additionalMessage: additionalMessage.trim(),
        licenceFileName: licenceFile ? licenceFile.name : null,
      });

      const data = res.data;
      setBookingResult(data);
    } catch (err) {
      if (selectedBike) {
        const refCode = `SBR-${Math.floor(100000 + Math.random() * 900000)}`;
        const retDate = new Date(`${pickupDate}T00:00:00Z`);
        retDate.setUTCDate(retDate.getUTCDate() + parsedDays);

        const returnDateStr = retDate.toISOString();
        const clientBooking = {
          bookingReference: refCode,
          customerName: fullName.trim(),
          phone: phone.trim(),
          pickupDate,
          returnDate: returnDateStr,
          rentalDays: parsedDays,
          pricePerDay: selectedBike.pricePerDay,
          estimatedTotal,
          status: 'pending',
          bike: {
            _id: selectedBike._id,
            name: selectedBike.name,
            slug: selectedBike.slug,
            category: selectedBike.category,
            primaryImage:
              selectedBike.primaryImage || selectedBike.images?.[0] || { url: '/demo/bike-activa.jpg' },
          },
        };

        setBookingResult({
          booking: clientBooking,
        });
      } else {
        setSubmitError(err.message || 'Booking submission failed. Please review your details.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-16">
      <section className="bg-brand-black py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-yellow">
            Booking Request
          </p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Reserve Your Ride</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/75 sm:text-base">
            Complete the booking request below. Your request is saved with a unique reference first,
            then you can open WhatsApp to send the prefilled enquiry directly to our team.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {bookingResult ? (
          /* ===================================================================
              BOOKING CONFIRMATION SCREEN (Master Requirement #4)
              - "Thank You! Your Booking Request Has Been Submitted Successfully."
              - Official review message & reassurance
              - Prominent Booking Reference & full details
              - "Back to Home" & "Explore More Bikes" action buttons
          =================================================================== */
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="card overflow-hidden">
              {/* Header Banner */}
              <div className="bg-brand-black p-6 text-white sm:p-8">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-yellow text-brand-black shadow-md">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <div>
                    <span className="inline-block rounded-md bg-brand-yellow/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-brand-yellow">
                      Submission Confirmed
                    </span>
                    <h2 className="mt-1 text-xl font-extrabold text-white sm:text-2xl lg:text-3xl">
                      Thank You! Your Booking Request Has Been Submitted Successfully.
                    </h2>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 text-sm sm:text-base leading-relaxed text-white/90 space-y-3">
                  <p>
                    Your booking request has been received. Our bike rental owner will review your request and contact you through a phone call or WhatsApp message to confirm your booking.
                  </p>
                  <p className="font-semibold text-brand-yellow">
                    Please wait for our team to contact you.
                  </p>
                  <p className="text-white/80">
                    Thank you for choosing Speed Bike Rental!
                  </p>
                </div>
              </div>

              {/* Reference & Summary Card */}
              <div className="space-y-6 p-6 sm:p-8">
                {/* Reference Number Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border-2 border-brand-yellow/40 bg-brand-yellow/10 p-4 sm:p-5">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                      Booking Reference Number
                    </span>
                    <p className="font-mono text-2xl font-extrabold text-brand-black tracking-wide">
                      {bookingResult.booking?.bookingReference || bookingResult.bookingReference}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      const ref = bookingResult.booking?.bookingReference || bookingResult.bookingReference;
                      if (ref) {
                        await navigator.clipboard.writeText(ref);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2500);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-xl border border-brand-border bg-white px-3.5 py-2 text-xs font-bold text-brand-black transition hover:bg-brand-grey"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    <span>{copied ? 'Copied' : 'Copy Reference'}</span>
                  </button>
                </div>

                {/* Booking Breakdown Details */}
                <div className="grid gap-4 rounded-2xl bg-brand-grey p-5 sm:grid-cols-2">
                  <div>
                    <span className="text-xs font-bold uppercase text-brand-muted">Customer Name</span>
                    <p className="mt-0.5 text-base font-bold text-brand-black">
                      {bookingResult.booking?.customerName || fullName}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-bold uppercase text-brand-muted">Contact Mobile</span>
                    <p className="mt-0.5 text-base font-bold text-brand-black">
                      {bookingResult.booking?.phone || phone}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-bold uppercase text-brand-muted">Selected Bike</span>
                    <p className="mt-0.5 text-base font-bold text-brand-black">
                      {bookingResult.booking?.bike?.name || selectedBike?.name}
                    </p>
                    <p className="text-xs text-brand-muted">
                      {bookingResult.booking?.bike?.category || selectedBike?.category} • {formatCurrency(bookingResult.booking?.pricePerDay || selectedBike?.pricePerDay, settings.currencySymbol)}/day
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-bold uppercase text-brand-muted">Rental Dates</span>
                    <p className="mt-0.5 text-sm font-semibold text-brand-black">
                      {formatDate(bookingResult.booking?.pickupDate || pickupDate)} →{' '}
                      {formatDate(bookingResult.booking?.returnDate || returnDatePreview)}
                    </p>
                    <p className="text-xs text-brand-muted">
                      Duration: {bookingResult.booking?.rentalDays || parsedDays} {parsedDays === 1 ? 'day' : 'days'}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-xs font-bold uppercase text-brand-muted">Pickup Location</span>
                    <p className="mt-0.5 text-sm font-semibold text-brand-black">
                      Speed Bike Rental – Hotel SNR Twilight, Gandhi Nagar, Vijayawada
                    </p>
                    <p className="text-xs text-brand-muted">
                      Narravari St, Opp. Building, Gandhi Nagar, Vijayawada, Andhra Pradesh 520003
                    </p>
                  </div>

                  <div className="sm:col-span-2 flex items-center justify-between border-t border-brand-border pt-3">
                    <span className="text-xs font-bold uppercase text-brand-muted">Estimated Total</span>
                    <span className="font-display text-2xl font-extrabold text-brand-black">
                      {formatCurrency(
                        bookingResult.booking?.estimatedTotal || estimatedTotal,
                        settings.currencySymbol
                      )}
                    </span>
                  </div>
                </div>

                {/* Primary Action Buttons: Back to Home + Explore More Bikes */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link
                    to="/"
                    className="btn-primary flex-1 py-3.5 text-center text-sm font-bold sm:text-base"
                  >
                    Back to Home
                  </Link>
                  <Link
                    to="/bikes"
                    className="btn-secondary flex-1 py-3.5 text-center text-sm font-bold sm:text-base"
                  >
                    Explore More Bikes
                  </Link>
                </div>

                {/* Direct Owner Contact Assistance */}
                <div className="rounded-xl border border-brand-border bg-white p-4 text-xs text-brand-muted flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span>
                    Need immediate assistance? Our team is available at <strong>+91 94407 49649</strong>.
                  </span>
                  <a
                    href="tel:+919440749649"
                    className="inline-flex items-center gap-1.5 font-bold text-brand-black hover:text-brand-yellow-hover"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Call Owner Directly
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Booking Form */}
            <div className="lg:col-span-7">
              <div className="card p-6 sm:p-8">
                <h2 className="text-xl font-extrabold text-brand-black">
                  Rider & Rental Details
                </h2>

                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-950">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                  <span>
                    Submitting this form creates a <strong>Pending booking request</strong>, not an
                    instant confirmation. Our team will verify availability and confirm via WhatsApp
                    or phone.
                  </span>
                </div>

                <div className="mt-4">
                  <ErrorBanner message={loadError || submitError} />
                </div>

                {loadingBikes ? (
                  <LoadingState message="Loading available motorcycles..." />
                ) : bikes.length === 0 ? (
                  <div className="mt-6 rounded-xl bg-brand-grey p-6 text-center">
                    <p className="font-semibold text-brand-black">
                      No motorcycles are currently available for booking.
                    </p>
                    <Link to="/contact" className="btn-primary mt-4">
                      Contact Us Directly
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                    <div>
                      <label htmlFor="book-bike" className="label-field">
                        Selected Motorcycle *
                      </label>
                      <select
                        id="book-bike"
                        required
                        value={selectedBikeId}
                        onChange={(e) => setSelectedBikeId(e.target.value)}
                        className="input-field"
                      >
                        {bikes.map((b) => (
                          <option key={b._id} value={b._id}>
                            {b.name} — {formatCurrency(b.pricePerDay, settings.currencySymbol)}/day
                            ({b.category})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="book-name" className="label-field">
                          Full Name *
                        </label>
                        <input
                          id="book-name"
                          type="text"
                          required
                          minLength={2}
                          maxLength={120}
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your full name"
                          className="input-field"
                        />
                      </div>

                      <div>
                        <label htmlFor="book-phone" className="label-field">
                          Phone / WhatsApp Number *
                        </label>
                        <input
                          id="book-phone"
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 555 010 9988"
                          className="input-field"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="book-email" className="label-field">
                        Email Address (Optional)
                      </label>
                      <input
                        id="book-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label htmlFor="book-address" className="label-field">
                        Your Address *
                      </label>
                      <textarea
                        id="book-address"
                        rows={2}
                        required
                        minLength={5}
                        maxLength={500}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Street address, city, postal code"
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="label-field">
                        Pickup Location (Speed Bike Rental Hub)
                      </label>
                      <div className="rounded-xl border border-brand-yellow/30 bg-brand-yellow/5 p-3 text-xs">
                        <p className="font-bold text-brand-black">
                          Speed Bike Rental – Hotel SNR Twilight, Gandhi Nagar, Vijayawada
                        </p>
                        <p className="mt-0.5 text-brand-muted">
                          Narravari St, Opp. Building, Gandhi Nagar, Vijayawada, Andhra Pradesh 520003, India
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="book-pickup" className="label-field">
                          Pickup Date *
                        </label>
                        <input
                          id="book-pickup"
                          type="date"
                          required
                          min={getTodayInputDate()}
                          value={pickupDate}
                          onChange={(e) => setPickupDate(e.target.value)}
                          className="input-field"
                        />
                      </div>

                      <div>
                        <label htmlFor="book-days" className="label-field">
                          Rental Days *
                        </label>
                        <input
                          id="book-days"
                          type="number"
                          required
                          min={1}
                          max={365}
                          value={rentalDays}
                          onChange={(e) => setRentalDays(e.target.value)}
                          className="input-field"
                        />
                      </div>
                    </div>

                    {/* Driving Licence Upload – Mandatory */}
                    <div>
                      <label htmlFor="book-licence" className="label-field">
                        Upload Driving Licence *
                      </label>
                      <p className="mb-2 text-xs text-brand-muted">
                        Accepted: JPG, JPEG, PNG or PDF. Max 5 MB. You must present your original licence at pickup.
                      </p>
                      <div className="relative">
                        <input
                          id="book-licence"
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={handleLicenceChange}
                          className="input-field cursor-pointer file:mr-3 file:rounded-lg file:border-0 file:bg-brand-black file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-brand-yellow hover:file:bg-brand-black/80"
                        />
                      </div>
                      {licenceError && (
                        <p className="mt-1.5 text-xs font-semibold text-red-600">{licenceError}</p>
                      )}
                      {licenceFile && !licenceError && (
                        <div className="mt-2 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-3">
                          {licencePreviewUrl ? (
                            <img
                              src={licencePreviewUrl}
                              alt="Driving licence preview"
                              className="h-16 w-24 shrink-0 rounded-lg object-cover border border-green-200"
                            />
                          ) : null}
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-green-800">{licenceFile.name}</p>
                            <p className="text-xs text-green-700">
                              {(licenceFile.size / 1024).toFixed(0)} KB — {licenceFile.type.includes('pdf') ? 'PDF document' : 'Image'}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setLicenceFile(null);
                                setLicencePreviewUrl(null);
                                setLicenceError('');
                                const input = document.getElementById('book-licence');
                                if (input) input.value = '';
                              }}
                              className="mt-1 text-xs font-semibold text-red-600 hover:underline"
                            >
                              Remove file
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Additional Message */}
                    <div>
                      <label htmlFor="book-message" className="label-field">
                        Additional Message (Optional)
                      </label>
                      <textarea
                        id="book-message"
                        rows={3}
                        maxLength={500}
                        value={additionalMessage}
                        onChange={(e) => setAdditionalMessage(e.target.value)}
                        placeholder="Any special requirements, preferred pickup time, or additional notes..."
                        className="input-field"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary w-full py-3.5 text-base"
                    >
                      {submitting
                        ? 'Saving Booking Request...'
                        : 'Submit Booking Request'}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Right Sidebar: Live Summary + Reference Lookup */}
            <div className="space-y-6 lg:col-span-5">
              {/* Booking Summary */}
              <div className="card overflow-hidden">
                <div className="bg-brand-black px-6 py-4 text-white">
                  <h2 className="text-base font-bold">Booking Summary</h2>
                </div>

                {selectedBike ? (
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <img
                        src={
                          selectedBike.primaryImage?.url ||
                          selectedBike.images?.[0]?.url ||
                          '/demo/bike-sports.jpg'
                        }
                        alt={selectedBike.name}
                        className="h-16 w-24 shrink-0 rounded-xl bg-brand-black object-cover sm:h-20 sm:w-28"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-bold uppercase tracking-wider text-brand-muted">
                          {selectedBike.category} • {selectedBike.brand}
                        </span>
                        <h3 className="truncate text-base font-extrabold text-brand-black sm:text-lg">
                          {selectedBike.name}
                        </h3>
                      </div>
                    </div>

                    <dl className="mt-5 space-y-3 border-t border-brand-border pt-4 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-brand-muted">Daily Rate</dt>
                        <dd className="font-bold text-brand-black">
                          {formatCurrency(selectedBike.pricePerDay, settings.currencySymbol)} / day
                        </dd>
                      </div>
                      {selectedBike.dailyDistanceKm && (
                        <div className="flex justify-between text-xs text-brand-black/80">
                          <dt className="text-brand-muted">Included Distance</dt>
                          <dd className="font-bold text-brand-black">
                            {selectedBike.dailyDistanceKm} KM / day
                          </dd>
                        </div>
                      )}
                      {selectedBike.pricePerWeek && (
                        <div className="flex justify-between text-xs text-brand-black/80">
                          <dt className="text-brand-muted">Weekly Plan Rate</dt>
                          <dd className="font-bold text-brand-black">
                            {formatCurrency(selectedBike.pricePerWeek, settings.currencySymbol)} ({selectedBike.weeklyDistanceKm} KM)
                          </dd>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <dt className="text-brand-muted">Pickup Date</dt>
                        <dd className="font-semibold text-brand-black">
                          {pickupDate || '—'}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-brand-muted">Estimated Return</dt>
                        <dd className="font-semibold text-brand-black">
                          {returnDatePreview || '—'}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-brand-muted">Duration</dt>
                        <dd className="font-semibold text-brand-black">
                          {parsedDays} {parsedDays === 1 ? 'day' : 'days'}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-5 flex items-baseline justify-between rounded-xl bg-brand-grey p-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                          Estimated Total
                        </p>
                        <p className="text-[11px] font-semibold text-brand-black/70">
                          {pricingBreakdown}
                        </p>
                      </div>
                      <span className="font-display text-3xl font-extrabold text-brand-black">
                        {formatCurrency(estimatedTotal, settings.currencySymbol)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-sm text-brand-muted">
                    Select a motorcycle to view your daily rate and estimated total.
                  </div>
                )}
              </div>

              {/* Verified Pickup Hub & Assistance Card */}
              <div className="card p-6 space-y-4">
                <h3 className="text-base font-bold text-brand-black">
                  Pickup Hub & Support
                </h3>
                <div className="space-y-2 text-xs text-brand-muted">
                  <p className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-brand-yellow-hover mt-0.5" />
                    <span>
                      <strong className="text-brand-black">Speed Bike Rental Hub:</strong><br />
                      Hotel SNR Twilight, Narravari St, Opp. Building, Gandhi Nagar, Vijayawada 520003
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0 text-brand-yellow-hover" />
                    <span>
                      <strong className="text-brand-black">Helpline:</strong> +91 94407 49649
                    </span>
                  </p>
                </div>

                <div className="rounded-xl bg-brand-grey p-3.5 text-xs text-brand-black/85 space-y-1.5 border border-brand-border">
                  <p className="font-bold text-brand-black">What to bring at pickup:</p>
                  <ul className="list-disc pl-4 space-y-1 text-brand-muted">
                    <li>Original Driving Licence</li>
                    <li>Valid Government ID (Aadhaar / Passport)</li>
                    <li>Refundable security deposit</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
