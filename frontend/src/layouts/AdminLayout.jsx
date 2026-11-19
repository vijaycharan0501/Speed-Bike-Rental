import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Bike,
  CalendarCheck2,
  ExternalLink,
  FileEdit,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Star,
  Users,
  X,
} from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { useAuth } from '../context/AuthContext';

const ADMIN_NAV = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Bikes', to: '/admin/bikes', icon: Bike },
  { label: 'Bookings', to: '/admin/bookings', icon: CalendarCheck2 },
  { label: 'Customers', to: '/admin/customers', icon: Users },
  { label: 'Reviews', to: '/admin/reviews', icon: Star },
  { label: 'Reports', to: '/admin/reports', icon: BarChart3 },
  { label: 'Website Content', to: '/admin/content', icon: FileEdit },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  const renderNavLinks = (onClickItem) => (
    <nav className="mt-6 flex-1 space-y-1 px-3" aria-label="Admin sidebar navigation">
      {ADMIN_NAV.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onClickItem}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? 'bg-brand-yellow text-brand-black shadow-sm'
                  : 'text-white/75 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen w-full max-w-full overflow-x-hidden bg-brand-grey text-brand-black">
      {/* Desktop Dark Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-brand-black text-white lg:flex">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <Link to="/admin">
            <BrandLogo variant="dark" compact />
          </Link>
        </div>

        {renderNavLinks()}

        <div className="border-t border-white/10 p-3">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-1.5 flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <ExternalLink className="h-4 w-4" />
            View Public Site
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-brand-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative flex w-72 max-w-[85vw] flex-col bg-brand-black text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <BrandLogo variant="dark" compact />
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-1.5 text-white/80 hover:bg-white/10"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {renderNavLinks(() => setSidebarOpen(false))}
            <div className="border-t border-white/10 p-3">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Bright Content Workspace */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-brand-border bg-white px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-brand-border p-2 text-brand-black hover:bg-brand-grey lg:hidden"
              aria-label="Open admin navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                Admin Portal
              </p>
              <p className="text-sm font-bold text-brand-black">
                {admin?.name || 'Administrator'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-brand-grey px-3 py-1 text-xs font-medium text-brand-muted sm:inline-block">
              {admin?.email}
            </span>
            <Link to="/" className="btn-secondary py-2 text-xs">
              Storefront
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
