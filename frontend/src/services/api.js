let rawBase = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '').trim();

// When running on a live domain (e.g. Vercel) with no explicit env set, connect directly to the live Render backend
if (!rawBase && typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
  rawBase = 'https://speed-bike-rental.onrender.com';
}

export const API_BASE = rawBase.replace(/\/api\/?$/, '').replace(/\/$/, '');

let inMemoryCsrfToken = '';
let inMemoryAuthToken = typeof localStorage !== 'undefined' ? localStorage.getItem('sbr_token') || '' : '';

export function setCsrfTokenMemory(token) {
  if (token) inMemoryCsrfToken = token;
}

export function setAuthTokenMemory(token) {
  inMemoryAuthToken = token || '';
  if (typeof localStorage !== 'undefined') {
    if (token) localStorage.setItem('sbr_token', token);
    else localStorage.removeItem('sbr_token');
  }
}

function getCsrfToken() {
  if (typeof document !== 'undefined') {
    const match = document.cookie
      .split('; ')
      .find((row) => row.startsWith('sbr_csrf_token='));
    if (match) {
      return decodeURIComponent(match.split('=')[1]);
    }
  }
  return inMemoryCsrfToken;
}

async function request(path, { method = 'GET', body, isFormData = false } = {}) {
  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  // Attach Bearer token for reliable cross-domain requests
  if (inMemoryAuthToken) {
    headers['Authorization'] = `Bearer ${inMemoryAuthToken}`;
  }

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrf = getCsrfToken();
    if (csrf) {
      headers['X-CSRF-Token'] = csrf;
    }
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  const payload = await response.json().catch(() => ({
    success: false,
    message: 'Unexpected server response.',
  }));

  if (!response.ok || payload.success === false) {
    const err = new Error(payload.message || `Request failed (${response.status})`);
    err.status = response.status;
    err.details = payload.details || null;
    throw err;
  }

  return payload;
}

function toQuery(params = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      sp.set(k, String(v));
    }
  });
  const str = sp.toString();
  return str ? `?${str}` : '';
}

export const publicApi = {
  getSettings: () => request('/api/settings/public'),
  getBikes: (params) => request(`/api/bikes${toQuery(params)}`),
  getBikeBySlug: (slug) => request(`/api/bikes/${encodeURIComponent(slug)}`),
  submitReview: (slug, data) =>
    request(`/api/bikes/${encodeURIComponent(slug)}/reviews`, { method: 'POST', body: data }),
  createBooking: (data) => request('/api/bookings', { method: 'POST', body: data }),
  getBookingReference: (ref) => request(`/api/bookings/reference/${encodeURIComponent(ref)}`),
  submitContact: (data) => request('/api/contact', { method: 'POST', body: data }),
  getGoogleReviews: () => request('/api/reviews/google'),
};

export const adminApi = {
  // Auth
  login: async (credentials) => {
    const res = await request('/api/admin/auth/login', { method: 'POST', body: credentials });
    if (res.data?.token) setAuthTokenMemory(res.data.token);
    if (res.data?.csrfToken) setCsrfTokenMemory(res.data.csrfToken);
    return res;
  },
  logout: async () => {
    try {
      await request('/api/admin/auth/logout', { method: 'POST' });
    } finally {
      setAuthTokenMemory('');
    }
  },
  me: async () => {
    const res = await request('/api/admin/auth/me');
    if (res.data?.token) setAuthTokenMemory(res.data.token);
    if (res.data?.csrfToken) setCsrfTokenMemory(res.data.csrfToken);
    return res;
  },

  // Bikes
  listBikes: (params) => request(`/api/admin/bikes${toQuery(params)}`),
  getBike: (id) => request(`/api/admin/bikes/${id}`),
  createBike: (data) => request('/api/admin/bikes', { method: 'POST', body: data }),
  updateBike: (id, data) => request(`/api/admin/bikes/${id}`, { method: 'PUT', body: data }),
  patchBikeStatus: (id, data) =>
    request(`/api/admin/bikes/${id}/status`, { method: 'PATCH', body: data }),
  deleteBike: (id, force = false) =>
    request(`/api/admin/bikes/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' }),

  // Bookings
  listBookings: (params) => request(`/api/admin/bookings${toQuery(params)}`),
  getBooking: (id) => request(`/api/admin/bookings/${id}`),
  updateBookingStatus: (id, data) =>
    request(`/api/admin/bookings/${id}/status`, { method: 'PATCH', body: data }),

  // Customers
  listCustomers: (params) => request(`/api/admin/customers${toQuery(params)}`),
  getCustomer: (id) => request(`/api/admin/customers/${id}`),

  // Reviews
  listReviews: (params) => request(`/api/admin/reviews${toQuery(params)}`),
  moderateReview: (id, moderationStatus) =>
    request(`/api/admin/reviews/${id}`, { method: 'PATCH', body: { moderationStatus } }),
  deleteReview: (id) => request(`/api/admin/reviews/${id}`, { method: 'DELETE' }),

  // Enquiries
  listEnquiries: (params) => request(`/api/admin/enquiries${toQuery(params)}`),
  updateEnquiryStatus: (id, status) =>
    request(`/api/admin/enquiries/${id}`, { method: 'PATCH', body: { status } }),

  // Reports
  getReportsSummary: (params) => request(`/api/admin/reports/summary${toQuery(params)}`),
  getRevenueReport: (params) => request(`/api/admin/reports/revenue${toQuery(params)}`),
  getBookingsReport: (params) => request(`/api/admin/reports/bookings${toQuery(params)}`),

  // Settings
  getSettings: () => request('/api/admin/settings'),
  updateSettings: (data) => request('/api/admin/settings', { method: 'PUT', body: data }),

  // Uploads
  uploadImages: (files, folder = 'bikes') => {
    const fd = new FormData();
    fd.append('folder', folder);
    Array.from(files).forEach((f) => fd.append('images', f));
    return request('/api/admin/uploads', { method: 'POST', body: fd, isFormData: true });
  },
  deleteImage: (publicId) =>
    request('/api/admin/uploads', { method: 'DELETE', body: { publicId } }),
};
