import { useCallback, useEffect, useState } from 'react';
import { Check, EyeOff, Mail, Star, Trash2 } from 'lucide-react';
import { adminApi } from '../../services/api';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { StatusBadge } from '../../components/StatusBadge';
import { ConfirmModal } from '../../components/ConfirmModal';
import { formatDate } from '../../utils/format';

export function AdminReviewsPage() {
  useDocumentTitle('Reviews & Enquiries');
  const [activeTab, setActiveTab] = useState('reviews');

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [revFilter, setRevFilter] = useState('');
  const [revLoading, setRevLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Enquiries state
  const [enquiries, setEnquiries] = useState([]);
  const [enqFilter, setEnqFilter] = useState('');
  const [enqLoading, setEnqLoading] = useState(true);

  const [error, setError] = useState('');

  const loadReviews = useCallback(async () => {
    setRevLoading(true);
    setError('');
    try {
      const res = await adminApi.listReviews({ status: revFilter, limit: 50 });
      setReviews(res.data?.reviews || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setRevLoading(false);
    }
  }, [revFilter]);

  const loadEnquiries = useCallback(async () => {
    setEnqLoading(true);
    setError('');
    try {
      const res = await adminApi.listEnquiries({ status: enqFilter, limit: 50 });
      setEnquiries(res.data?.enquiries || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnqLoading(false);
    }
  }, [enqFilter]);

  useEffect(() => {
    if (activeTab === 'reviews') loadReviews();
    else loadEnquiries();
  }, [activeTab, loadReviews, loadEnquiries]);

  const handleModerate = async (id, moderationStatus) => {
    try {
      await adminApi.moderateReview(id, moderationStatus);
      loadReviews();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteReview = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.deleteReview(deleteTarget._id);
      setDeleteTarget(null);
      loadReviews();
    } catch (err) {
      setError(err.message);
      setDeleteTarget(null);
    }
  };

  const handleEnquiryStatus = async (id, status) => {
    try {
      await adminApi.updateEnquiryStatus(id, status);
      loadEnquiries();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-black sm:text-3xl">
          Reviews & Contact Enquiries
        </h1>
        <p className="mt-1 text-sm text-brand-muted">
          Only approved reviews appear publicly on the website.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-brand-border">
        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-bold ${
            activeTab === 'reviews'
              ? 'border-brand-yellow text-brand-black'
              : 'border-transparent text-brand-muted hover:text-brand-black'
          }`}
        >
          Customer Reviews
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('enquiries')}
          className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-bold ${
            activeTab === 'enquiries'
              ? 'border-brand-yellow text-brand-black'
              : 'border-transparent text-brand-muted hover:text-brand-black'
          }`}
        >
          Contact Enquiries
        </button>
      </div>

      <ErrorBanner message={error} />

      {activeTab === 'reviews' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {[
              { value: '', label: 'All' },
              { value: 'pending', label: 'Pending' },
              { value: 'approved', label: 'Approved' },
              { value: 'hidden', label: 'Hidden' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRevFilter(opt.value)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold ${
                  revFilter === opt.value
                    ? 'bg-brand-black text-brand-yellow'
                    : 'border border-brand-border bg-white text-brand-black'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {revLoading ? (
            <LoadingState message="Loading reviews..." />
          ) : reviews.length === 0 ? (
            <EmptyState
              icon={Star}
              title="No reviews in this queue"
              description="Submitted customer reviews will appear here for approval before going live."
            />
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r._id} className="card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-brand-black">{r.customerName}</span>
                        <StatusBadge status={r.moderationStatus} />
                      </div>
                      <p className="mt-0.5 text-xs text-brand-muted">
                        Bike: <strong>{r.bikeId?.name || 'Unknown'}</strong> •{' '}
                        {formatDate(r.createdAt)}
                      </p>
                      <div className="mt-1.5 flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < r.rating
                                ? 'fill-brand-yellow text-brand-yellow'
                                : 'text-brand-border'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="mt-2 text-sm text-brand-black/85">{r.reviewText}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {r.moderationStatus !== 'approved' && (
                        <button
                          type="button"
                          onClick={() => handleModerate(r._id, 'approved')}
                          className="inline-flex items-center gap-1 rounded-lg bg-brand-green px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                        >
                          <Check className="h-3.5 w-3.5" /> Approve
                        </button>
                      )}
                      {r.moderationStatus !== 'hidden' && (
                        <button
                          type="button"
                          onClick={() => handleModerate(r._id, 'hidden')}
                          className="inline-flex items-center gap-1 rounded-lg border border-brand-border px-3 py-1.5 text-xs font-semibold text-brand-black hover:bg-brand-grey"
                        >
                          <EyeOff className="h-3.5 w-3.5" /> Hide
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(r)}
                        className="rounded-lg border border-brand-border p-1.5 text-red-600 hover:bg-red-50"
                        title="Delete review"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {[
              { value: '', label: 'All' },
              { value: 'new', label: 'New' },
              { value: 'read', label: 'Read' },
              { value: 'replied', label: 'Replied' },
              { value: 'archived', label: 'Archived' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setEnqFilter(opt.value)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold ${
                  enqFilter === opt.value
                    ? 'bg-brand-black text-brand-yellow'
                    : 'border border-brand-border bg-white text-brand-black'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {enqLoading ? (
            <LoadingState message="Loading contact enquiries..." />
          ) : enquiries.length === 0 ? (
            <EmptyState
              icon={Mail}
              title="No contact enquiries"
              description="Messages sent through the public Contact page will appear here."
            />
          ) : (
            <div className="space-y-3">
              {enquiries.map((e) => (
                <div key={e._id} className="card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-brand-black">{e.subject}</h3>
                        <StatusBadge status={e.status} />
                      </div>
                      <p className="mt-0.5 text-xs text-brand-muted">
                        From <strong>{e.name}</strong> • {e.phone}{' '}
                        {e.email ? `• ${e.email}` : ''} • {formatDate(e.createdAt)}
                      </p>
                      <p className="mt-2 whitespace-pre-line text-sm text-brand-black/85">
                        {e.message}
                      </p>
                    </div>

                    <select
                      aria-label={`Status for enquiry ${e.subject}`}
                      value={e.status}
                      onChange={(ev) => handleEnquiryStatus(e._id, ev.target.value)}
                      className="rounded-lg border border-brand-border bg-white px-2.5 py-1.5 text-xs font-semibold"
                    >
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Review?"
        description="This permanently removes the review from the database."
        confirmLabel="Delete Review"
        destructive
        onConfirm={handleDeleteReview}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
