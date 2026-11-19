import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { BrandLogo } from '../../components/BrandLogo';
import { ErrorBanner } from '../../components/ErrorBanner';

export function AdminLoginPage() {
  useDocumentTitle('Admin Login');
  const { admin, checkingAuth, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!checkingAuth && admin) {
    const dest = location.state?.from?.pathname || '/admin';
    return <Navigate to={dest} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      const dest = location.state?.from?.pathname || '/admin';
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-black px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandLogo variant="dark" />
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.22em] text-brand-yellow">
            Protected Admin Portal
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white p-6 shadow-2xl sm:p-8">
          <h1 className="text-2xl font-extrabold text-brand-black">Administrator Sign In</h1>
          <p className="mt-1 text-sm text-brand-muted">
            Sign in with your authorized Speed Bike Rental administrator account.
          </p>

          <div className="mt-5">
            <ErrorBanner message={error} />
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="admin-email" className="label-field">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yourdomain.com"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="label-field">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
                <input
                  id="admin-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary mt-2 w-full py-3.5 text-base"
            >
              {submitting ? 'Signing In...' : 'Sign In to Admin Portal'}
            </button>
          </form>

          <div className="mt-6 border-t border-brand-border pt-4 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-muted hover:text-brand-black"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Public Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
