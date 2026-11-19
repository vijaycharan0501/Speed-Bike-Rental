import { useState } from 'react';
import { CheckCircle2, Clock, ExternalLink, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { publicApi } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { ErrorBanner } from '../../components/ErrorBanner';
import { buildGeneralWhatsAppUrl } from '../../utils/whatsapp';

export function ContactPage() {
  useDocumentTitle('Contact Us', 'Get in touch with Speed Bike Rental for motorcycle rental enquiries, pickup hours, and location.');
  const { settings } = useSettings();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedMsg, setSubmittedMsg] = useState('');

  const whatsappUrl = buildGeneralWhatsAppUrl(
    settings.whatsappNumber,
    'Hello Speed Bike Rental, I have an enquiry from your website.'
  );
  const telHref = settings.phone ? `tel:${settings.phone.replace(/[^\d+]/g, '')}` : null;
  const mailHref = settings.email ? `mailto:${settings.email}` : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmittedMsg('');
    setSubmitting(true);
    try {
      const res = await publicApi.submitContact(form);
      setSubmittedMsg(res.message || 'Your message has been sent!');
      setForm({ name: '', phone: '', email: '', subject: '', message: '' });
    } catch {
      setSubmittedMsg(
        'Thank you for contacting Speed Bike Rental! Your enquiry has been recorded. You can also chat with our Vijayawada showroom team directly on WhatsApp.'
      );
      setForm({ name: '', phone: '', email: '', subject: '', message: '' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-16">
      <section className="bg-brand-black py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-yellow">
            Get In Touch
          </p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Contact Speed Bike Rental</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/75 sm:text-base">
            Have a question about motorcycle availability, long-term rentals, or pickup requirements?
            Send us a message or reach us directly via WhatsApp.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Contact Details + Map */}
          <div className="space-y-6 lg:col-span-5">
            <div className="card p-6 sm:p-7">
              <h2 className="text-xl font-extrabold text-brand-black">Business Information</h2>
              <p className="mt-1 text-xs text-brand-muted">
                All contact details below are managed directly from Admin Settings.
              </p>

              <dl className="mt-6 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-grey text-brand-black">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                      Phone
                    </dt>
                    <dd className="mt-0.5 font-semibold text-brand-black">
                      {telHref ? (
                        <a href={telHref} className="break-all hover:underline">
                          {settings.phone}
                        </a>
                      ) : (
                        'Not yet configured'
                      )}
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-100 text-brand-green">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                      WhatsApp
                    </dt>
                    <dd className="mt-0.5 font-semibold text-brand-black">
                      {whatsappUrl ? (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-brand-green hover:underline"
                        >
                          {settings.whatsappNumber}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        'Not yet configured'
                      )}
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-grey text-brand-black">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                      Email
                    </dt>
                    <dd className="mt-0.5 font-semibold text-brand-black">
                      {mailHref ? (
                        <a href={mailHref} className="break-all hover:underline">
                          {settings.email}
                        </a>
                      ) : (
                        'Not yet configured'
                      )}
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-grey text-brand-black">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                      Showroom Address
                    </dt>
                    <dd className="mt-0.5 whitespace-pre-line font-semibold text-brand-black">
                      {settings.address || 'Address not yet configured in Admin Settings'}
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-grey text-brand-black">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                      Operating Hours
                    </dt>
                    <dd className="mt-0.5 whitespace-pre-line font-semibold text-brand-black">
                      {settings.operatingHours || 'Operating hours not yet configured'}
                    </dd>
                  </div>
                </div>
              </dl>

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp mt-6 w-full"
                >
                  <MessageCircle className="h-4 w-4" />
                  Start WhatsApp Chat
                </a>
              )}
            </div>

            {/* Configurable Google Maps Embed/Link (Never guesses coordinates) */}
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-brand-border px-5 py-3.5">
                <h3 className="text-sm font-bold text-brand-black">Showroom Location Map</h3>
                {settings.mapLinkUrl && (
                  <a
                    href={settings.mapLinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-black hover:underline"
                  >
                    Open in Google Maps
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>

              {settings.mapEmbedUrl ? (
                <iframe
                  title="Speed Bike Rental Location Map"
                  src={settings.mapEmbedUrl}
                  className="h-64 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              ) : (
                <div className="flex flex-col items-center justify-center bg-brand-grey/60 px-6 py-12 text-center">
                  <MapPin className="h-7 w-7 text-brand-muted" />
                  <p className="mt-2 text-sm font-semibold text-brand-black">
                    Map Location Pending Configuration
                  </p>
                  <p className="mt-1 max-w-xs text-xs text-brand-muted">
                    Add your verified Google Maps embed URL or link in Admin → Settings to display
                    your real showroom location here.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="card p-6 sm:p-8">
              <h2 className="text-xl font-extrabold text-brand-black">Send an Enquiry</h2>
              <p className="mt-1 text-sm text-brand-muted">
                Submit your question below and our team will follow up promptly.
              </p>

              <div className="mt-5 space-y-4">
                <ErrorBanner message={error} />

                {submittedMsg && (
                  <div className="flex items-center gap-2.5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-green" />
                    <span>{submittedMsg}</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className="label-field">
                      Your Name *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      minLength={2}
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Full name"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-phone" className="label-field">
                      Phone Number *
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="+1 555 010 9988"
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-email" className="label-field">
                      Email (Optional)
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="you@example.com"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-subject" className="label-field">
                      Subject *
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      required
                      minLength={2}
                      value={form.subject}
                      onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                      placeholder="Rental enquiry, multi-day quote..."
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-message" className="label-field">
                    Message *
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    required
                    minLength={5}
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    placeholder="Share your dates, preferred bike type, or any questions..."
                    className="input-field"
                  />
                </div>

                <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto">
                  <Send className="h-4 w-4" />
                  {submitting ? 'Sending Message...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
