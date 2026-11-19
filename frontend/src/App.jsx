import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ScrollToTop } from './components/ScrollToTop';
import { LoadingState } from './components/LoadingState';
import { SettingsProvider } from './context/SettingsContext';
import { AuthProvider } from './context/AuthContext';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Public core pages (loaded immediately for fast initial paint)
import { HomePage } from './pages/Home/HomePage';
import { BikesPage } from './pages/Bikes/BikesPage';
import { BikeDetailsPage } from './pages/BikeDetails/BikeDetailsPage';
import { BookingPage } from './pages/Booking/BookingPage';
import { AboutPage } from './pages/About/AboutPage';
import { ContactPage } from './pages/Contact/ContactPage';

// Lazy-loaded secondary public pages
const TermsPage = lazy(() => import('./pages/Terms/TermsPage').then((m) => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import('./pages/Privacy/PrivacyPage').then((m) => ({ default: m.PrivacyPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

// Lazy-loaded Admin pages (reduces customer-facing initial bundle size)
const AdminLoginPage = lazy(() => import('./admin/Login/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import('./admin/Dashboard/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const AdminBikesPage = lazy(() => import('./admin/Bikes/AdminBikesPage').then((m) => ({ default: m.AdminBikesPage })));
const AdminBikeFormPage = lazy(() => import('./admin/Bikes/AdminBikeFormPage').then((m) => ({ default: m.AdminBikeFormPage })));
const AdminBookingsPage = lazy(() => import('./admin/Bookings/AdminBookingsPage').then((m) => ({ default: m.AdminBookingsPage })));
const AdminCustomersPage = lazy(() => import('./admin/Customers/AdminCustomersPage').then((m) => ({ default: m.AdminCustomersPage })));
const AdminReviewsPage = lazy(() => import('./admin/Reviews/AdminReviewsPage').then((m) => ({ default: m.AdminReviewsPage })));
const AdminReportsPage = lazy(() => import('./admin/Reports/AdminReportsPage').then((m) => ({ default: m.AdminReportsPage })));
const AdminWebsiteContentPage = lazy(() => import('./admin/WebsiteContent/AdminWebsiteContentPage').then((m) => ({ default: m.AdminWebsiteContentPage })));
const AdminSettingsPage = lazy(() => import('./admin/Settings/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage })));

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center p-8">
      <LoadingState message="Loading page..." />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <SettingsProvider>
        <AuthProvider>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              {/* Customer Website Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/bikes" element={<BikesPage />} />
                <Route path="/bikes/:slug" element={<BikeDetailsPage />} />
                <Route path="/book" element={<BookingPage />} />
                <Route path="/book/:slug" element={<BookingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* Admin Auth Route */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Protected Admin Portal Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboardPage />} />
                <Route path="bikes" element={<AdminBikesPage />} />
                <Route path="bikes/new" element={<AdminBikeFormPage />} />
                <Route path="bikes/:id/edit" element={<AdminBikeFormPage />} />
                <Route path="bookings" element={<AdminBookingsPage />} />
                <Route path="customers" element={<AdminCustomersPage />} />
                <Route path="reviews" element={<AdminReviewsPage />} />
                <Route path="reports" element={<AdminReportsPage />} />
                <Route path="content" element={<AdminWebsiteContentPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>
            </Routes>
          </Suspense>
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}
