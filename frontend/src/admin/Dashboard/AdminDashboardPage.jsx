import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowRight,
  Bike,
  CalendarCheck2,
  CheckCircle2,
  DollarSign,
  Plus,
  Users,
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { LoadingState } from '../../components/LoadingState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { StatusBadge } from '../../components/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/format';
import { subscribeToRealtimeEvent, joinAdminRealtime } from '../../services/socket';

const STATUS_COLORS = {
  Pending: '#F59E0B',
  Confirmed: '#2563EB',
  Active: '#4F46E5',
  Completed: '#16A34A',
  Cancelled: '#DC2626',
};

export function AdminDashboardPage() {
  useDocumentTitle('Admin Dashboard');
  const { settings } = useSettings();
  const [summary, setSummary] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [sumRes, revRes] = await Promise.all([
        adminApi.getReportsSummary(),
        adminApi.getRevenueReport(),
      ]);
      setSummary(sumRes.data);
      setRevenue(revRes.data?.monthly || []);
    } catch (err) {
      setError(err.message || 'Could not load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    joinAdminRealtime();

    const unsubBooking = subscribeToRealtimeEvent('booking:created', () => {
      loadDashboard();
    });
    const unsubBike = subscribeToRealtimeEvent('bike:updated', () => {
      loadDashboard();
    });
    const unsubBikeCreated = subscribeToRealtimeEvent('bike:created', () => {
      loadDashboard();
    });
    const unsubBikeDeleted = subscribeToRealtimeEvent('bike:deleted', () => {
      loadDashboard();
    });

    return () => {
      unsubBooking();
      unsubBike();
      unsubBikeCreated();
      unsubBikeDeleted();
    };
  }, [loadDashboard]);

  if (loading) return <LoadingState message="Loading live database metrics..." />;
  if (error) return <ErrorBanner message={error} onRetry={loadDashboard} />;
  if (!summary) return null;

  const { kpis, availabilitySummary, bookingStatusChart, recentBookings, popularBikes } = summary;
  const sym = settings.currencySymbol || '$';

  const kpiCards = [
    {
      label: 'Total Bikes',
      value: kpis.totalBikes,
      sub: `${kpis.publishedBikes} published publicly`,
      icon: Bike,
    },
    {
      label: 'Available Bikes',
      value: kpis.availableBikes,
      sub: `${kpis.maintenanceBikes} in service • ${kpis.unavailableBikes} unavailable`,
      icon: CheckCircle2,
    },
    {
      label: 'Active & Confirmed',
      value: kpis.activeBookings,
      sub: `${kpis.pendingBookings} pending review`,
      icon: CalendarCheck2,
    },
    {
      label: 'Total Customers',
      value: kpis.totalCustomers,
      sub: `${kpis.newEnquiries} unread contact enquiries`,
      icon: Users,
    },
    {
      label: 'Recorded Revenue',
      value: formatCurrency(kpis.recordedRevenue, sym),
      sub: `${kpis.recordedRevenueCount} qualifying • Est. pipeline: ${formatCurrency(
        kpis.estimatedPipelineValue,
        sym
      )}`,
      icon: DollarSign,
      highlight: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-black sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-brand-muted">
            Real-time overview backed directly by MongoDB records.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link to="/admin/bookings" className="btn-secondary py-2.5">
            Manage Bookings
          </Link>
          <Link to="/admin/bikes/new" className="btn-primary py-2.5">
            <Plus className="h-4 w-4" />
            Add New Bike
          </Link>
        </div>
      </div>

      {/* KPI Cards — Strictly 2 columns on mobile */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`rounded-2xl border p-3.5 shadow-card sm:p-5 ${
                card.highlight
                  ? 'col-span-2 border-brand-black bg-brand-black text-white lg:col-span-1'
                  : 'border-brand-border bg-white text-brand-black'
              }`}
            >
              <div className="flex items-center justify-between gap-1.5">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider sm:text-xs ${
                    card.highlight ? 'text-brand-yellow' : 'text-brand-muted'
                  }`}
                >
                  {card.label}
                </span>
                <Icon
                  className={`h-4 w-4 shrink-0 sm:h-5 sm:w-5 ${
                    card.highlight ? 'text-brand-yellow' : 'text-brand-black/60'
                  }`}
                />
              </div>
              <p className="mt-2 font-display text-2xl font-extrabold sm:mt-3 sm:text-3xl">
                {card.value}
              </p>
              <p
                className={`mt-1 text-[11px] leading-snug sm:mt-1.5 sm:text-xs ${
                  card.highlight ? 'text-white/70' : 'text-brand-muted'
                }`}
              >
                {card.sub}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Monthly Revenue Chart */}
        <div className="card p-6 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-brand-black">Monthly Recorded Revenue</h2>
              <p className="text-xs text-brand-muted">
                Earned revenue ({summary.revenueRule === 'completed_or_paid' ? 'Completed or Paid' : 'Completed rentals only'}) vs pending/active estimated value
              </p>
            </div>
            <Link to="/admin/reports" className="text-xs font-bold text-brand-black hover:underline">
              Full Reports
            </Link>
          </div>

          <div className="mt-5 h-64">
            {revenue.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-xl bg-brand-grey text-sm text-brand-muted">
                No booking history recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar
                    dataKey="earnedRevenue"
                    name="Recorded Revenue"
                    fill="#101114"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="estimatedRequested"
                    name="Estimated Pipeline (Not Earned)"
                    fill="#FFC400"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Booking Status Chart */}
        <div className="card p-6 lg:col-span-5">
          <h2 className="text-lg font-bold text-brand-black">Bookings by Status</h2>
          <p className="text-xs text-brand-muted">Current distribution across all booking requests</p>

          <div className="mt-5 h-64">
            {!bookingStatusChart?.some((b) => b.count > 0) ? (
              <div className="flex h-full items-center justify-center rounded-xl bg-brand-grey text-sm text-brand-muted">
                No booking requests recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingStatusChart} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                  <YAxis dataKey="status" type="category" width={84} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Bookings" radius={[0, 6, 6, 0]}>
                    {bookingStatusChart.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#101114'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Bookings + Popular Bikes & Availability */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="card overflow-hidden lg:col-span-8">
          <div className="flex items-center justify-between border-b border-brand-border px-6 py-4">
            <h2 className="text-lg font-bold text-brand-black">Recent Booking Requests</h2>
            <Link
              to="/admin/bookings"
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-black hover:underline"
            >
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <div className="p-8 text-center text-sm text-brand-muted">
              No booking requests submitted yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-brand-border bg-brand-grey/60 text-xs font-bold uppercase text-brand-muted">
                  <tr>
                    <th className="px-5 py-3">Reference</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Bike</th>
                    <th className="px-5 py-3">Pickup</th>
                    <th className="px-5 py-3">Est. Total</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {recentBookings.map((b) => (
                    <tr key={b._id} className="hover:bg-brand-grey/40">
                      <td className="px-5 py-3 font-mono text-xs font-bold text-brand-black">
                        {b.bookingReference}
                      </td>
                      <td className="px-5 py-3 font-medium text-brand-black">
                        {b.customerSnapshot?.fullName}
                      </td>
                      <td className="px-5 py-3 text-brand-muted">{b.bikeSnapshot?.name}</td>
                      <td className="px-5 py-3 text-xs text-brand-muted">
                        {formatDate(b.pickupDate)} ({b.rentalDays}d)
                      </td>
                      <td className="px-5 py-3 font-bold text-brand-black">
                        {formatCurrency(b.estimatedTotal, sym)}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={b.bookingStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-6 lg:col-span-4">
          {/* Availability Summary */}
          <div className="card p-6">
            <h2 className="text-base font-bold text-brand-black">Fleet Availability</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-brand-muted">Available</dt>
                <dd className="font-bold text-brand-green">{availabilitySummary.available}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-brand-muted">In Maintenance</dt>
                <dd className="font-bold text-amber-600">{availabilitySummary.maintenance}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-brand-muted">Unavailable</dt>
                <dd className="font-bold text-red-600">{availabilitySummary.unavailable}</dd>
              </div>
            </dl>
          </div>

          {/* Popular Bikes */}
          <div className="card p-6">
            <h2 className="text-base font-bold text-brand-black">Most Requested Bikes</h2>
            {popularBikes.length === 0 ? (
              <p className="mt-3 text-xs text-brand-muted">
                Popular bikes will appear here once booking requests are received.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {popularBikes.map((item) => (
                  <li
                    key={item._id}
                    className="flex items-center justify-between rounded-xl bg-brand-grey px-3.5 py-2.5 text-sm"
                  >
                    <div>
                      <p className="font-bold text-brand-black">{item.bikeName}</p>
                      <p className="text-xs text-brand-muted">{item.category}</p>
                    </div>
                    <span className="rounded-lg bg-brand-black px-2.5 py-1 text-xs font-bold text-brand-yellow">
                      {item.bookingsCount} req
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
