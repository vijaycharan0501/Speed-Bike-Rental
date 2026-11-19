import { useCallback, useEffect, useState } from 'react';
import { Clock, Eye, Search, X } from 'lucide-react';
import { adminApi } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { StatusBadge } from '../../components/StatusBadge';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/format';
import { subscribeToRealtimeEvent, joinAdminRealtime } from '../../services/socket';

const BOOKING_STATUSES = ['Pending', 'Confirmed', 'Active', 'Completed', 'Cancelled'];
const PAYMENT_STATUSES = ['Unpaid', 'Partial', 'Paid', 'Refunded'];

export function AdminBookingsPage() {
  useDocumentTitle('Manage Bookings');
  const { settings } = useSettings();
  const sym = settings.currencySymbol || '$';

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Selected booking modal
  const [selected, setSelected] = useState(null);
  const [nextBookingStatus, setNextBookingStatus] = useState('Pending');
  const [nextPaymentStatus, setNextPaymentStatus] = useState('Unpaid');
  const [statusNote, setStatusNote] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [modalError, setModalError] = useState('');

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.listBookings({
        search: search.trim(),
        status,
        fromDate,
        toDate,
        limit: 50,
      });
      setBookings(res.data?.bookings || []);
    } catch (err) {
      setError(err.message || 'Could not load bookings.');
    } finally {
      setLoading(false);
    }
  }, [search, status, fromDate, toDate]);

  useEffect(() => {
    loadBookings();
    joinAdminRealtime();

    const unsub = subscribeToRealtimeEvent('booking:created', (newBooking) => {
      if (newBooking) {
        setBookings((prev) => [newBooking, ...prev]);
      }
    });

    return () => unsub();
  }, [loadBookings]);

  const openDetails = (booking) => {
    setSelected(booking);
    setNextBookingStatus(booking.bookingStatus);
    setNextPaymentStatus(booking.paymentStatus || 'Unpaid');
    setStatusNote('');
    setAdminNotes(booking.adminNotes || '');
    setModalError('');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setUpdating(true);
    setModalError('');
    try {
      const res = await adminApi.updateBookingStatus(selected._id, {
        bookingStatus: nextBookingStatus,
        paymentStatus: nextPaymentStatus,
        note: statusNote.trim(),
        adminNotes: adminNotes.trim(),
      });
      setSelected(res.data?.booking);
      setStatusNote('');
      loadBookings();
    } catch (err) {
      setModalError(err.message || 'Could not update booking status.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-black sm:text-3xl">Manage Bookings</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Review pending requests, confirm availability (with automatic overlap conflict checks),
          and track rental status history.
        </p>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference, customer, phone, bike..."
              className="input-field pl-9"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input-field"
          >
            <option value="">All Statuses</option>
            {BOOKING_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            aria-label="Pickup from date"
            className="input-field"
          />

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            aria-label="Pickup to date"
            className="input-field"
          />
        </div>
      </div>

      <ErrorBanner message={error} onRetry={loadBookings} />

      {loading ? (
        <LoadingState message="Loading booking requests..." />
      ) : bookings.length === 0 ? (
        <EmptyState
          title="No bookings match your filters"
          description="Booking requests submitted by customers on the public website appear here automatically."
        />
      ) : (
        <>
          {/* Mobile Booking Cards (< md) */}
          <div className="space-y-3 md:hidden">
            {bookings.map((b) => (
              <div key={b._id} className="card p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-brand-black">
                    {b.bookingReference}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={b.bookingStatus} />
                    <StatusBadge status={b.paymentStatus || 'Unpaid'} />
                  </div>
                </div>
                <div>
                  <p className="font-bold text-brand-black">{b.bikeSnapshot?.name}</p>
                  <p className="text-xs text-brand-muted">
                    {b.customerSnapshot?.fullName} • {b.customerSnapshot?.phone}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-brand-border pt-2.5 text-xs">
                  <span className="text-brand-muted">
                    {formatDate(b.pickupDate)} ({b.rentalDays}d)
                  </span>
                  <span className="font-display text-base font-extrabold text-brand-black">
                    {formatCurrency(b.estimatedTotal, sym)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => openDetails(b)}
                  className="btn-primary w-full py-2 text-xs"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Manage Booking
                </button>
              </div>
            ))}
          </div>

          {/* Desktop Table (md+) */}
          <div className="card hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
              <thead className="border-b border-brand-border bg-brand-grey/60 text-xs font-bold uppercase text-brand-muted">
                <tr>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Bike</th>
                  <th className="px-4 py-3">Pickup / Days</th>
                  <th className="px-4 py-3">Est. Total</th>
                  <th className="px-4 py-3">Booking</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-brand-grey/30">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-brand-black">
                      {b.bookingReference}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-brand-black">
                        {b.customerSnapshot?.fullName}
                      </p>
                      <p className="text-xs text-brand-muted">{b.customerSnapshot?.phone}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-brand-black">
                      {b.bikeSnapshot?.name}
                    </td>
                    <td className="px-4 py-3 text-xs text-brand-muted">
                      <p className="font-semibold text-brand-black">{formatDate(b.pickupDate)}</p>
                      <p>{b.rentalDays} day(s)</p>
                    </td>
                    <td className="px-4 py-3 font-bold text-brand-black">
                      {formatCurrency(b.estimatedTotal, sym)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.bookingStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.paymentStatus || 'Unpaid'} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openDetails(b)}
                        className="inline-flex items-center gap-1 rounded-lg border border-brand-border px-3 py-1.5 text-xs font-semibold text-brand-black hover:bg-brand-yellow"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </>
      )}

      {/* Booking Detail & Status Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-brand-border bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-brand-border bg-brand-black px-6 py-4 text-white">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-brand-yellow">
                  Booking Details
                </p>
                <h2 className="font-mono text-lg font-extrabold">{selected.bookingReference}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg p-1.5 text-white/80 hover:bg-white/10"
                aria-label="Close booking details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <ErrorBanner message={modalError} />

              {/* Snapshots */}
              <div className="grid gap-4 rounded-xl bg-brand-grey p-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase text-brand-muted">Customer Snapshot</p>
                  <p className="mt-1 font-bold text-brand-black">
                    {selected.customerSnapshot?.fullName}
                  </p>
                  <p className="text-xs text-brand-black/80">{selected.customerSnapshot?.phone}</p>
                  <p className="mt-1 text-xs text-brand-muted">
                    {selected.customerSnapshot?.address}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-brand-muted">
                    Bike & Pricing Snapshot
                  </p>
                  <p className="mt-1 font-bold text-brand-black">{selected.bikeSnapshot?.name}</p>
                  <p className="text-xs text-brand-black/80">
                    {formatDate(selected.pickupDate)} → {formatDate(selected.returnDate)} (
                    {selected.rentalDays} day{selected.rentalDays === 1 ? '' : 's'})
                  </p>
                  <p className="mt-1 text-xs font-bold text-brand-black">
                    {formatCurrency(selected.pricePerDaySnapshot, sym)}/day × {selected.rentalDays}{' '}
                    = {formatCurrency(selected.estimatedTotal, sym)}
                  </p>
                </div>
              </div>

              {/* Update Form */}
              <form onSubmit={handleUpdateStatus} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="modal-booking-status" className="label-field">
                      Booking Status
                    </label>
                    <select
                      id="modal-booking-status"
                      value={nextBookingStatus}
                      onChange={(e) => setNextBookingStatus(e.target.value)}
                      className="input-field"
                    >
                      {BOOKING_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="modal-payment-status" className="label-field">
                      Payment Status
                    </label>
                    <select
                      id="modal-payment-status"
                      value={nextPaymentStatus}
                      onChange={(e) => setNextPaymentStatus(e.target.value)}
                      className="input-field"
                    >
                      {PAYMENT_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="modal-status-note" className="label-field">
                    Status Change Note (Added to History)
                  </label>
                  <input
                    id="modal-status-note"
                    type="text"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="e.g. Confirmed via WhatsApp, deposit agreed"
                    className="input-field"
                  />
                </div>

                <div>
                  <label htmlFor="modal-admin-notes" className="label-field">
                    Internal Admin Notes
                  </label>
                  <textarea
                    id="modal-admin-notes"
                    rows={2}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Internal notes (not visible to customer)"
                    className="input-field"
                  />
                </div>

                <div className="flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="btn-secondary py-2"
                  >
                    Close
                  </button>
                  <button type="submit" disabled={updating} className="btn-primary py-2">
                    {updating ? 'Updating...' : 'Save Status Update'}
                  </button>
                </div>
              </form>

              {/* Status History */}
              <div className="border-t border-brand-border pt-4">
                <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-muted">
                  <Clock className="h-3.5 w-3.5" />
                  Status History
                </h3>
                <ul className="mt-3 space-y-2.5">
                  {(selected.statusHistory || [])
                    .slice()
                    .reverse()
                    .map((entry, idx) => (
                      <li
                        key={idx}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand-border px-3.5 py-2.5 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <StatusBadge status={entry.status} />
                          <span className="text-brand-black">{entry.note}</span>
                        </div>
                        <span className="text-brand-muted">
                          {entry.changedBy} • {formatDateTime(entry.changedAt)}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
