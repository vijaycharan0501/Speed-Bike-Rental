import { Link } from 'react-router-dom';
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useSettings } from '../context/SettingsContext';
import { buildGeneralWhatsAppUrl } from '../utils/whatsapp';

export function Footer() {
  const { settings } = useSettings();
  const whatsappUrl = buildGeneralWhatsAppUrl(
    settings.whatsappNumber,
    'Hello Speed Bike Rental, I would like to enquire about bike rentals.'
  );
  const telHref = settings.phone ? `tel:${settings.phone.replace(/[^\d+]/g, '')}` : null;
  const mailHref = settings.email ? `mailto:${settings.email}` : null;

  const socials = [
    { label: 'Instagram', url: settings.socialLinks?.instagram },
    { label: 'Facebook', url: settings.socialLinks?.facebook },
    { label: 'YouTube', url: settings.socialLinks?.youtube },
    { label: 'X', url: settings.socialLinks?.x },
  ].filter((s) => Boolean(s.url));

  return (
    <footer className="border-t border-white/10 bg-brand-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {/* Brand column */}
          <div>
            <BrandLogo variant="dark" />
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              {settings.footerContent?.brandSummary ||
                'Premium motorcycle rentals with transparent daily pricing, inspected machines, and fast WhatsApp booking handoff.'}
            </p>
            {socials.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-white/15 bg-brand-surface px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:border-brand-yellow hover:text-brand-yellow"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-yellow">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-white/75">
              <li>
                <Link to="/" className="transition hover:text-brand-yellow">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/bikes" className="transition hover:text-brand-yellow">
                  Browse Bikes
                </Link>
              </li>
              <li>
                <Link to="/book" className="transition hover:text-brand-yellow">
                  Book a Bike
                </Link>
              </li>
              <li>
                <Link to="/about" className="transition hover:text-brand-yellow">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-yellow">
              Support & Legal
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-white/75">
              <li>
                <Link to="/contact" className="transition hover:text-brand-yellow">
                  Contact & Location
                </Link>
              </li>
              <li>
                <Link to="/terms" className="transition hover:text-brand-yellow">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="transition hover:text-brand-yellow">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="transition hover:text-brand-yellow">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info from Admin Settings */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-yellow">
              Contact Information
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-white/75">
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-yellow" />
                {telHref ? (
                  <a href={telHref} className="break-all transition hover:text-brand-yellow">
                    {settings.phone}
                  </a>
                ) : (
                  <span>Phone not yet configured</span>
                )}
              </li>
              <li className="flex items-start gap-2.5">
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                {whatsappUrl ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all transition hover:text-brand-yellow"
                  >
                    WhatsApp: {settings.whatsappNumber}
                  </a>
                ) : (
                  <span>WhatsApp not yet configured</span>
                )}
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-yellow" />
                {mailHref ? (
                  <a href={mailHref} className="break-all transition hover:text-brand-yellow">
                    {settings.email}
                  </a>
                ) : (
                  <span>Email not yet configured</span>
                )}
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-yellow" />
                <span>{settings.address || 'Business address not yet configured'}</span>
              </li>
              {settings.operatingHours && (
                <li className="flex items-start gap-2.5">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-yellow" />
                  <span>{settings.operatingHours}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-center text-xs text-white/55 sm:flex-row sm:text-left">
          <p>
            © {new Date().getFullYear()}{' '}
            {settings.footerContent?.copyrightText || 'Speed Bike Rental. All rights reserved.'}
          </p>
          <div className="flex items-center gap-5">
            <Link to="/terms" className="hover:text-white">
              Terms
            </Link>
            <Link to="/privacy" className="hover:text-white">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
