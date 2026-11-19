import { AlertTriangle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export function PrivacyPage() {
  useDocumentTitle('Privacy Policy', 'How Speed Bike Rental collects, uses, and protects your booking and enquiry information.');
  const { settings } = useSettings();
  const legal = settings.legalContent || {};
  const sections = legal.privacySections || [];

  return (
    <div className="pb-16">
      <section className="bg-brand-black py-12 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-yellow">
            Data & Privacy
          </p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Privacy Policy</h1>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 lg:px-8 space-y-6">
        {legal.privacyDraftNotice && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <p>{legal.privacyDraftNotice}</p>
          </div>
        )}

        <div className="card divide-y divide-brand-border p-6 sm:p-8">
          {sections.map((sec, idx) => (
            <section key={idx} className={idx === 0 ? 'pb-6' : 'py-6'}>
              <h2 className="text-lg font-extrabold text-brand-black">{sec.heading}</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-brand-muted">
                {sec.body}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
