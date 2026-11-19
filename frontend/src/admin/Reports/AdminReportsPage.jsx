import { useCallback, useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { adminApi } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { LoadingState } from '../../components/LoadingState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { formatCurrency } from '../../utils/format';

export function AdminReportsPage() {
  useDocumentTitle('Reports & Analytics');
  const { settings } = useSettings();
  const sym = settings.currencySymbol || '$';

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [summary, setSummary] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [bookingsReport, setBookingsReport] = useState({ bookingVolume: [], customerGrowth: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const [sumRes, revRes, bookRes] = await Promise.all([
        adminApi.getReportsSummary(params),
        adminApi.getRevenueReport(params),
        adminApi.getBookingsReport(params),
      ]);

      setSummary(sumRes.data);
      setRevenueData(revRes.data?.monthly || []);
      setBookingsReport(bookRes.data || { bookingVolume: [], customerGrowth: [] });
    } catch (err) {
      setError(err.message || 'Could not load reports.');
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-black sm:text-3xl">
            Reports & Analytics
          </h1>
          <p className="mt-1 text-sm text-brand-muted">
            Database-driven reports clearly separating recorded earned revenue from estimated
            pending requests.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-2.5">
          <div>
            <label htmlFor="rep-from" className="label-field">
              From Date
            </label>
            <input
              id="rep-from"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="input-field py-2"
            />
          </div>
          <div>
            <label htmlFor="rep-to" className="label-field">
              To Date
            </label>
            <input
              id="rep-to"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="input-field py-2"
            />
          </div>
          {(fromDate || toDate) && (
            <button
              type="button"
              onClick={() => {
                setFromDate('');
                setToDate('');
              }}
              className="btn-secondary py-2"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <ErrorBanner message={error} onRetry={loadReports} />

      {loading ? (
        <LoadingState message="Calculating analytics from MongoDB..." />
      ) : summary ? (
        <>
          {/* Revenue Separation Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-brand-black p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-yellow">
                Recorded Earned Revenue
              </p>
              <p className="mt-2 font-display text-3xl font-extrabold">
                {formatCurrency(summary.kpis.recordedRevenue, sym)}
              </p>
              <p className="mt-1 text-xs text-white/70">
                From {summary.kpis.recordedRevenueCount} qualifying booking(s) (Rule:{' '}
                {summary.revenueRule === 'completed_or_paid'
                  ? 'Completed or Paid'
                  : 'Completed Only'}
                )
              </p>
            </div>

            <div className="card p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                Estimated Requested Pipeline (Not Earned)
              </p>
              <p className="mt-2 font-display text-3xl font-extrabold text-brand-black">
                {formatCurrency(summary.kpis.estimatedPipelineValue, sym)}
              </p>
              <p className="mt-1 text-xs text-brand-muted">
                Across {summary.kpis.estimatedPipelineCount} Pending, Confirmed, or Active request(s)
              </p>
            </div>

            <div className="card p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                Customer Growth (Selected Period)
              </p>
              <p className="mt-2 font-display text-3xl font-extrabold text-brand-black">
                {summary.kpis.totalCustomers}
              </p>
              <p className="mt-1 text-xs text-brand-muted">Unique customer profiles recorded</p>
            </div>
          </div>

          {/* Revenue vs Requested Chart */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-brand-black">
              Monthly Earned Revenue vs Estimated Requests
            </h2>
            <div className="mt-4 h-72">
              {revenueData.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-xl bg-brand-grey text-sm text-brand-muted">
                  No revenue data for the selected date range.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="earnedRevenue"
                      name="Recorded Earned Revenue"
                      fill="#16A34A"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="estimatedRequested"
                      name="Estimated Pending/Active Requests"
                      fill="#FFC400"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Booking Volume & Customer Growth */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card p-6">
              <h2 className="text-lg font-bold text-brand-black">Monthly Booking Volume</h2>
              <div className="mt-4 h-64">
                {bookingsReport.bookingVolume.length === 0 ? (
                  <div className="flex h-full items-center justify-center rounded-xl bg-brand-grey text-sm text-brand-muted">
                    No booking volume records yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bookingsReport.bookingVolume}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="totalBookings" name="Total" fill="#101114" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="completed" name="Completed" fill="#16A34A" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="cancelled" name="Cancelled" fill="#DC2626" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-bold text-brand-black">Customer Acquisition Trend</h2>
              <div className="mt-4 h-64">
                {bookingsReport.customerGrowth.length === 0 ? (
                  <div className="flex h-full items-center justify-center rounded-xl bg-brand-grey text-sm text-brand-muted">
                    No customer growth records yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={bookingsReport.customerGrowth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="newCustomers"
                        name="New Customers"
                        stroke="#101114"
                        strokeWidth={3}
                        dot={{ fill: '#FFC400', r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Popular Bikes Table */}
          <div className="card overflow-hidden">
            <div className="border-b border-brand-border px-6 py-4">
              <h2 className="text-lg font-bold text-brand-black">Popular Bikes (Non-Cancelled)</h2>
            </div>
            {summary.popularBikes.length === 0 ? (
              <div className="p-6 text-sm text-brand-muted">No booking activity recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-brand-border bg-brand-grey/60 text-xs font-bold uppercase text-brand-muted">
                    <tr>
                      <th className="px-6 py-3">Motorcycle</th>
                      <th className="px-6 py-3">Category</th>
                      <th className="px-6 py-3">Requests</th>
                      <th className="px-6 py-3">Est. Requested Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {summary.popularBikes.map((b) => (
                      <tr key={b._id}>
                        <td className="px-6 py-3 font-bold text-brand-black">{b.bikeName}</td>
                        <td className="px-6 py-3 text-brand-muted">{b.category}</td>
                        <td className="px-6 py-3 font-semibold text-brand-black">
                          {b.bookingsCount}
                        </td>
                        <td className="px-6 py-3 font-bold text-brand-black">
                          {formatCurrency(b.requestedValue, sym)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
