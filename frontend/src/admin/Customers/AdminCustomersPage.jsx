import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, LogIn, Search, Users, X } from 'lucide-react';
import { adminApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { StatusBadge } from '../../components/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/format';

export function AdminCustomersPage() {
  useDocumentTitle('Customers');
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { settings } = useSettings();
  const sym = settings.currencySymbol || '$';

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.listCustomers({ search: search.trim(), limit: 50 });
      setCustomers(res.data?.customers || []);
    } catch (err) {
      if (err.status === 401 || err.message?.includes('Session expired') || err.message?.includes('Authentication required')) {
        setError('Session expired or invalid. Please log in again.');
      } else {
        setError(err.message || 'Could not load customers.');
      }
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const isAuthError = error.includes('Session expired') || error.includes('log in');

  const handleLoginRedirect = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  const openCustomerHistory = async (customerId) => {
    setDetailLoading(true);
    try {
      const res = await adminApi.getCustomer(customerId);
      setDetail(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-black sm:text-3xl">Customers</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Authorized directory of customers matched by normalized phone number, along with booking
          history.
        </p>
      </div>

      <div className="card p-4">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or email..."
            className="input-field pl-9"
          />
        </div>
      </div>

      {error && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <div className="flex items-center gap-2">
            <span>{error}</span>
          </div>
          <div className="flex items-center gap-2">
            {isAuthError ? (
              <button
                type="button"
                onClick={handleLoginRedirect}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition"
              >
                <LogIn className="h-3.5 w-3.5" />
                Log In Again
              </button>
            ) : (
              <button
                type="button"
                onClick={loadCustomers}
                className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <LoadingState message="Loading customer directory..." />
      ) : customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers recorded yet"
          description="Customers are automatically created and reused by phone number when booking requests are submitted."
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-brand-border bg-brand-grey/60 text-xs font-bold uppercase text-brand-muted">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Requests</th>
                  <th className="px-4 py-3">Last Request</th>
                  <th className="px-4 py-3 text-right">History</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {customers.map((c) => (
                  <tr key={c._id} className="hover:bg-brand-grey/30">
                    <td className="px-4 py-3 font-bold text-brand-black">{c.fullName || c.name || 'Customer'}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-brand-black">{c.phone || '—'}</p>
                      {c.normalizedPhone && (
                        <p className="font-mono text-[11px] text-brand-muted">{c.normalizedPhone}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-brand-muted">{c.email || '—'}</td>
                    <td className="px-4 py-3 font-bold text-brand-black">
                      {Number(c.totalRequests) || 1} ({Number(c.completedRentals) || 0} completed)
                    </td>
                    <td className="px-4 py-3 text-xs text-brand-muted">
                      {c.lastBookingAt ? formatDate(c.lastBookingAt) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openCustomerHistory(c._id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-brand-border px-3 py-1.5 text-xs font-semibold hover:bg-brand-yellow"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {(detail || detailLoading) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-brand-black px-6 py-4 text-white">
              <h2 className="text-lg font-extrabold">
                {detail?.customer?.fullName || 'Customer Record'}
              </h2>
              <button
                type="button"
                onClick={() => setDetail(null)}
                className="rounded-lg p-1.5 text-white/80 hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {detailLoading ? (
              <LoadingState message="Loading booking history..." />
            ) : (
              <div className="space-y-5 p-6">
                <div className="rounded-xl bg-brand-grey p-4 text-sm space-y-1">
                  <p>
                    <strong>Phone:</strong> {detail.customer.phone} (Normalized:{' '}
                    {detail.customer.normalizedPhone})
                  </p>
                  {detail.customer.email && (
                    <p>
                      <strong>Email:</strong> {detail.customer.email}
                    </p>
                  )}
                  {detail.customer.address && (
                    <p>
                      <strong>Address:</strong> {detail.customer.address}
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-brand-muted">
                    Booking History ({detail.bookings?.length || 0})
                  </h3>
                  {!detail.bookings?.length ? (
                    <p className="mt-2 text-sm text-brand-muted">No booking requests found.</p>
                  ) : (
                    <div className="mt-3 space-y-2.5">
                      {detail.bookings.map((b) => (
                        <div
                          key={b._id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand-border p-3.5 text-sm"
                        >
                          <div>
                            <p className="font-mono text-xs font-bold text-brand-black">
                              {b.bookingReference}
                            </p>
                            <p className="font-semibold text-brand-black">{b.bikeSnapshot?.name}</p>
                            <p className="text-xs text-brand-muted">
                              {formatDate(b.pickupDate)} → {formatDate(b.returnDate)} (
                              {b.rentalDays}d)
                            </p>
                          </div>
                          <div className="text-right">
                            <StatusBadge status={b.bookingStatus} />
                            <p className="mt-1 font-bold text-brand-black">
                              {formatCurrency(b.estimatedTotal, sym)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
