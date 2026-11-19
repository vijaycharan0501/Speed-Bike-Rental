import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Archive, Edit3, Eye, EyeOff, Plus, RotateCcw, Search, Trash2 } from 'lucide-react';
import { adminApi } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { StatusBadge } from '../../components/StatusBadge';
import { ConfirmModal } from '../../components/ConfirmModal';
import { formatCurrency } from '../../utils/format';
import { useRealtimeBikes } from '../../hooks/useRealtimeBikes';

export function AdminBikesPage() {
  useDocumentTitle('Manage Bikes');
  const { settings } = useSettings();
  const sym = settings.currencySymbol || '₹';

  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [availability, setAvailability] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const [confirmTarget, setConfirmTarget] = useState(null);
  const [confirmAction, setConfirmAction] = useState('archive'); // 'archive' | 'delete'
  const [actionLoading, setActionLoading] = useState(false);

  const loadBikes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.listBikes({
        search: search.trim(),
        category,
        availability,
        archived: showArchived ? 'true' : 'false',
        limit: 50,
      });
      setBikes(res.data?.bikes || []);
    } catch (err) {
      setError(err.message || 'Could not load fleet inventory.');
    } finally {
      setLoading(false);
    }
  }, [search, category, availability, showArchived]);

  useEffect(() => {
    loadBikes();
  }, [loadBikes]);

  // Real-time synchronization
  useRealtimeBikes(bikes, setBikes, loadBikes);

  const handleTogglePublish = async (bike) => {
    try {
      await adminApi.patchBikeStatus(bike._id, { isPublished: !bike.isPublished });
      loadBikes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAvailabilityChange = async (bike, nextStatus) => {
    try {
      await adminApi.patchBikeStatus(bike._id, { availabilityStatus: nextStatus });
      loadBikes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRestore = async (bike) => {
    try {
      await adminApi.patchBikeStatus(bike._id, { isArchived: false });
      loadBikes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleConfirmArchiveOrDelete = async () => {
    if (!confirmTarget) return;
    setActionLoading(true);
    try {
      await adminApi.deleteBike(confirmTarget._id, confirmAction === 'delete');
      setConfirmTarget(null);
      loadBikes();
    } catch (err) {
      setError(err.message);
      setConfirmTarget(null);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-black sm:text-3xl">Manage Bikes</h1>
          <p className="mt-1 text-sm text-brand-muted">
            Add, edit, publish/unpublish, update availability, and archive motorcycles.
          </p>
        </div>
        <Link to="/admin/bikes/new" className="btn-primary">
          <Plus className="h-4 w-4" />
          Add Bike
        </Link>
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
              placeholder="Search name, brand, slug..."
              className="input-field pl-9"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field"
          >
            <option value="">All Categories</option>
            <option value="Scooter">Scooter</option>
            <option value="Sports">Sports</option>
          </select>

          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="input-field"
          >
            <option value="">All Availability</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
            <option value="maintenance">Maintenance</option>
          </select>

          <button
            type="button"
            onClick={() => setShowArchived((v) => !v)}
            className={showArchived ? 'btn-dark py-2 text-xs' : 'btn-secondary py-2 text-xs'}
          >
            <Archive className="h-4 w-4" />
            {showArchived ? 'Viewing Archived' : 'Show Archived'}
          </button>
        </div>
      </div>

      <ErrorBanner message={error} onRetry={loadBikes} />

      {loading ? (
        <LoadingState message="Loading bikes..." />
      ) : bikes.length === 0 ? (
        <EmptyState
          title={showArchived ? 'No archived bikes' : 'No bikes found'}
          description={
            showArchived
              ? 'Archived motorcycles will appear here.'
              : 'Add your first motorcycle to start building your fleet.'
          }
          action={
            !showArchived && (
              <Link to="/admin/bikes/new" className="btn-primary">
                <Plus className="h-4 w-4" />
                Add New Bike
              </Link>
            )
          }
        />
      ) : (
        <>
          {/* Mobile Bike Management Cards (< md) */}
          <div className="space-y-3 md:hidden">
            {bikes.map((bike) => (
              <div key={bike._id} className="card p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <img
                    src={
                      bike.primaryImage?.url ||
                      bike.images?.[0]?.url ||
                      '/demo/bike-sports.jpg'
                    }
                    alt={bike.name}
                    className="h-16 w-24 shrink-0 rounded-xl bg-brand-black object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-brand-black">{bike.name}</p>
                    <p className="text-xs text-brand-muted">
                      {bike.brand} • {bike.category}
                    </p>
                    <p className="mt-1 font-display text-lg font-extrabold text-brand-black">
                      {formatCurrency(bike.pricePerDay, sym)}
                      <span className="text-xs font-normal text-brand-muted">/day</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-brand-border pt-3">
                  <select
                    aria-label={`Availability for ${bike.name}`}
                    value={bike.availabilityStatus}
                    disabled={bike.isArchived}
                    onChange={(e) => handleAvailabilityChange(bike, e.target.value)}
                    className="rounded-lg border border-brand-border bg-white px-2.5 py-1.5 text-xs font-semibold"
                  >
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                    <option value="maintenance">Maintenance</option>
                  </select>

                  {bike.isArchived ? (
                    <StatusBadge status="archived" label="Archived" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(bike)}
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                        bike.isPublished
                          ? 'border-green-200 bg-green-50 text-green-800'
                          : 'border-gray-200 bg-gray-100 text-gray-700'
                      }`}
                    >
                      {bike.isPublished ? (
                        <>
                          <Eye className="h-3.5 w-3.5" /> Published
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3.5 w-3.5" /> Draft
                        </>
                      )}
                    </button>
                  )}

                  <div className="ml-auto flex items-center gap-1.5">
                    <Link
                      to={`/admin/bikes/${bike._id}/edit`}
                      className="rounded-lg border border-brand-border p-2 text-brand-black hover:bg-brand-grey"
                      title="Edit bike"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Link>
                    {bike.isArchived ? (
                      <button
                        type="button"
                        onClick={() => handleRestore(bike)}
                        className="rounded-lg border border-brand-border p-2 text-brand-green hover:bg-green-50"
                        title="Restore bike"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmTarget(bike);
                          setConfirmAction('archive');
                        }}
                        className="rounded-lg border border-brand-border p-2 text-amber-700 hover:bg-amber-50"
                        title="Archive bike"
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table (md+) */}
          <div className="card hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
              <thead className="border-b border-brand-border bg-brand-grey/60 text-xs font-bold uppercase text-brand-muted">
                <tr>
                  <th className="px-4 py-3">Motorcycle</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Daily Rate</th>
                  <th className="px-4 py-3">Availability</th>
                  <th className="px-4 py-3">Publication</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {bikes.map((bike) => (
                  <tr key={bike._id} className="hover:bg-brand-grey/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            bike.primaryImage?.url ||
                            bike.images?.[0]?.url ||
                            '/demo/bike-sports.jpg'
                          }
                          alt={bike.name}
                          className="h-12 w-16 shrink-0 rounded-lg bg-brand-black object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-brand-black">{bike.name}</p>
                            {bike.isDemo && (
                              <span className="rounded bg-brand-grey px-1.5 py-0.5 text-[10px] font-bold uppercase text-brand-muted">
                                Demo
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-brand-muted">{bike.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-brand-black">{bike.category}</td>
                    <td className="px-4 py-3 font-bold text-brand-black">
                      {formatCurrency(bike.pricePerDay, sym)}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        aria-label={`Availability for ${bike.name}`}
                        value={bike.availabilityStatus}
                        disabled={bike.isArchived}
                        onChange={(e) => handleAvailabilityChange(bike, e.target.value)}
                        className="rounded-lg border border-brand-border bg-white px-2.5 py-1 text-xs font-semibold"
                      >
                        <option value="available">Available</option>
                        <option value="unavailable">Unavailable</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {bike.isArchived ? (
                        <StatusBadge status="archived" label="Archived" />
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(bike)}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                            bike.isPublished
                              ? 'border-green-200 bg-green-50 text-green-800 hover:bg-green-100'
                              : 'border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {bike.isPublished ? (
                            <>
                              <Eye className="h-3.5 w-3.5" /> Published
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3.5 w-3.5" /> Draft
                            </>
                          )}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/bikes/${bike._id}/edit`}
                          className="rounded-lg border border-brand-border p-2 text-brand-black hover:bg-brand-grey"
                          title="Edit bike"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Link>
                        {bike.isArchived ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleRestore(bike)}
                              className="rounded-lg border border-brand-border p-2 text-brand-green hover:bg-green-50"
                              title="Restore bike"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmTarget(bike);
                                setConfirmAction('delete');
                              }}
                              className="rounded-lg border border-brand-border p-2 text-red-600 hover:bg-red-50"
                              title="Permanently delete (if no booking history)"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmTarget(bike);
                              setConfirmAction('archive');
                            }}
                            className="rounded-lg border border-brand-border p-2 text-amber-700 hover:bg-amber-50"
                            title="Archive bike"
                          >
                            <Archive className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </>
      )}

      <ConfirmModal
        open={Boolean(confirmTarget)}
        title={confirmAction === 'delete' ? 'Permanently Delete Bike?' : 'Archive Bike?'}
        description={
          confirmAction === 'delete'
            ? `Permanently delete "${confirmTarget?.name}"? Note: if this bike has booking history, the server will automatically preserve it as archived.`
            : `Archive "${confirmTarget?.name}"? It will be unpublished from the public website while preserving all historical bookings.`
        }
        confirmLabel={confirmAction === 'delete' ? 'Delete Permanently' : 'Archive Bike'}
        destructive={confirmAction === 'delete'}
        loading={actionLoading}
        onConfirm={handleConfirmArchiveOrDelete}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}
