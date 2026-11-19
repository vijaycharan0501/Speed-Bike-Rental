import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, MessageCircle, X } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useSettings } from '../context/SettingsContext';
import { buildGeneralWhatsAppUrl } from '../utils/whatsapp';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Bikes', to: '/bikes' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const { settings } = useSettings();

  const isHome = pathname === '/';
  const whatsappUrl = buildGeneralWhatsAppUrl(
    settings.whatsappNumber,
    'Hello Speed Bike Rental, I have a question about renting a motorcycle.'
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 w-full border-b border-white/15 transition-all duration-300 backdrop-blur-xl backdrop-saturate-150 ${
        isHome && !scrolled && !mobileOpen
          ? 'bg-brand-black/45 shadow-[0_8px_32px_rgba(0,0,0,0.20)]'
          : 'bg-brand-black/75 shadow-[0_10px_36px_rgba(0,0,0,0.34)]'
      }`}
    >
      {/* Subtle top glass specular highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
      />

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2.5 sm:px-6 sm:py-3 lg:px-8">
        <Link
          to="/"
          aria-label="Speed Bike Rental Home"
          onClick={() => setMobileOpen(false)}
          className="shrink-0"
        >
          <BrandLogo variant="dark" compact className="sm:hidden" />
          <BrandLogo variant="dark" className="hidden sm:inline-flex" />
        </Link>

        {/* Desktop Nav */}
        <nav
          className="hidden items-center gap-0.5 rounded-2xl border border-white/10 bg-white/[0.06] p-1 backdrop-blur-md md:flex lg:gap-1"
          aria-label="Primary navigation"
        >
          {NAV_LINKS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-xl px-3 py-1.5 text-sm font-semibold transition lg:px-4 ${
                  isActive
                    ? 'bg-white/15 text-brand-yellow shadow-inner ring-1 ring-white/15'
                    : 'text-white/85 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-2 md:flex lg:gap-2.5">
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[40px] items-center gap-1.5 whitespace-nowrap rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md transition hover:border-brand-green hover:bg-brand-green lg:gap-2 lg:px-3.5 lg:text-sm"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="h-4 w-4 text-brand-green" />
              <span>WhatsApp</span>
            </a>
          ) : (
            <Link
              to="/contact"
              className="inline-flex min-h-[40px] items-center gap-1.5 whitespace-nowrap rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white/90 backdrop-blur-md transition hover:border-brand-yellow hover:text-brand-yellow lg:gap-2 lg:px-3.5 lg:text-sm"
              title="Contact & WhatsApp details"
            >
              <MessageCircle className="h-4 w-4 text-brand-yellow" />
              <span>WhatsApp</span>
            </Link>
          )}

          <Link
            to="/book"
            className="btn-primary min-h-[40px] whitespace-nowrap px-3.5 py-2 text-xs lg:px-5 lg:text-sm"
          >
            Book a Bike
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Glassmorphic Slide-Down Navigation Menu */}
      {mobileOpen && (
        <div className="border-t border-white/15 bg-brand-black/85 px-4 pb-5 pt-3 shadow-2xl backdrop-blur-2xl md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {NAV_LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-brand-yellow text-brand-black'
                      : 'text-white/90 hover:bg-white/10'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-4 flex flex-col gap-2.5 border-t border-white/15 pt-4">
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className="btn-whatsapp w-full"
              >
                <MessageCircle className="h-4 w-4" />
                Chat on WhatsApp
              </a>
            ) : (
              <Link
                to="/contact"
                onClick={() => setMobileOpen(false)}
                className="btn-dark w-full border border-white/15"
              >
                <MessageCircle className="h-4 w-4 text-brand-yellow" />
                Contact / WhatsApp Info
              </Link>
            )}
            <Link
              to="/book"
              onClick={() => setMobileOpen(false)}
              className="btn-primary w-full"
            >
              Book a Bike
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
