import { useEffect, useState } from 'react';
import { CheckCircle2, Plus, Save, Trash2 } from 'lucide-react';
import { adminApi } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { LoadingState } from '../../components/LoadingState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { ImageUploader } from '../../components/ImageUploader';

export function AdminWebsiteContentPage() {
  useDocumentTitle('Website Content');
  const { refreshSettings } = useSettings();

  const [tab, setTab] = useState('hero');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.getSettings();
        setData(res.data?.settings);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSavedMsg('');
    try {
      await adminApi.updateSettings({
        heroContent: data.heroContent,
        aboutContent: data.aboutContent,
        footerContent: data.footerContent,
        legalContent: data.legalContent,
      });
      await refreshSettings();
      setSavedMsg('Website content updated and live on the public site!');
    } catch (err) {
      setError(err.message || 'Could not save content.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Loading website content..." />;
  if (!data) return <ErrorBanner message={error || 'Unable to load settings.'} />;

  const hero = data.heroContent || {};
  const about = data.aboutContent || {};
  const footer = data.footerContent || {};
  const legal = data.legalContent || {};

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-black sm:text-3xl">Website Content</h1>
          <p className="mt-1 text-sm text-brand-muted">
            Edit homepage hero, About Us, footer copy, and Terms & Privacy pages without touching
            code.
          </p>
        </div>
        <button type="submit" disabled={saving} className="btn-primary">
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Content'}
        </button>
      </div>

      <ErrorBanner message={error} />
      {savedMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
          <CheckCircle2 className="h-4 w-4 text-brand-green" />
          {savedMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-brand-border">
        {[
          { id: 'hero', label: 'Home Hero & Ticker' },
          { id: 'about', label: 'About Us' },
          { id: 'footer', label: 'Footer' },
          { id: 'legal', label: 'Terms & Privacy' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-bold ${
              tab === t.id
                ? 'border-brand-yellow text-brand-black'
                : 'border-transparent text-brand-muted hover:text-brand-black'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'hero' && (
        <div className="card p-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label-field">Top Badge</label>
              <input
                type="text"
                value={hero.badge || ''}
                onChange={(e) =>
                  setData((d) => ({ ...d, heroContent: { ...d.heroContent, badge: e.target.value } }))
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field">Headline</label>
              <input
                type="text"
                value={hero.headline || ''}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    heroContent: { ...d.heroContent, headline: e.target.value },
                  }))
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field">Yellow Accent Headline</label>
              <input
                type="text"
                value={hero.headlineAccent || ''}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    heroContent: { ...d.heroContent, headlineAccent: e.target.value },
                  }))
                }
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="label-field">Hero Subtitle</label>
            <textarea
              rows={3}
              value={hero.subtitle || ''}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  heroContent: { ...d.heroContent, subtitle: e.target.value },
                }))
              }
              className="input-field"
            />
          </div>

          <div>
            <label className="label-field">Feature Bullets (one per line)</label>
            <textarea
              rows={3}
              value={(hero.featureBullets || []).join('\n')}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  heroContent: {
                    ...d.heroContent,
                    featureBullets: e.target.value
                      .split('\n')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  },
                }))
              }
              className="input-field"
            />
          </div>

          <div>
            <label className="label-field">Promotional Ticker Phrases (one per line)</label>
            <textarea
              rows={3}
              value={(hero.tickerItems || []).join('\n')}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  heroContent: {
                    ...d.heroContent,
                    tickerItems: e.target.value
                      .split('\n')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  },
                }))
              }
              className="input-field"
            />
          </div>

          <div>
            <label className="label-field">Hero Banner Image</label>
            <ImageUploader
              multiple={false}
              folder="hero"
              images={hero.imageUrl ? [{ url: hero.imageUrl, publicId: hero.imagePublicId || '' }] : []}
              primaryImage={hero.imageUrl ? { url: hero.imageUrl } : null}
              onChange={(imgs) => {
                const first = imgs[0];
                setData((d) => ({
                  ...d,
                  heroContent: {
                    ...d.heroContent,
                    imageUrl: first?.url || '',
                    imagePublicId: first?.publicId || '',
                  },
                }));
              }}
            />
          </div>
        </div>
      )}

      {tab === 'about' && (
        <div className="card p-6 space-y-5">
          <div>
            <label className="label-field">About Headline</label>
            <input
              type="text"
              value={about.headline || ''}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  aboutContent: { ...d.aboutContent, headline: e.target.value },
                }))
              }
              className="input-field"
            />
          </div>
          <div>
            <label className="label-field">Company Story / Introduction</label>
            <textarea
              rows={4}
              value={about.intro || ''}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  aboutContent: { ...d.aboutContent, intro: e.target.value },
                }))
              }
              className="input-field"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label-field">Mission</label>
              <textarea
                rows={3}
                value={about.mission || ''}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    aboutContent: { ...d.aboutContent, mission: e.target.value },
                  }))
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field">Vision</label>
              <textarea
                rows={3}
                value={about.vision || ''}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    aboutContent: { ...d.aboutContent, vision: e.target.value },
                  }))
                }
                className="input-field"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label-field">Maintenance Standards</label>
              <textarea
                rows={3}
                value={about.maintenanceStandards || ''}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    aboutContent: { ...d.aboutContent, maintenanceStandards: e.target.value },
                  }))
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field">Customer Support Summary</label>
              <textarea
                rows={3}
                value={about.supportSummary || ''}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    aboutContent: { ...d.aboutContent, supportSummary: e.target.value },
                  }))
                }
                className="input-field"
              />
            </div>
          </div>
        </div>
      )}

      {tab === 'footer' && (
        <div className="card p-6 space-y-5">
          <div>
            <label className="label-field">Footer Brand Summary</label>
            <textarea
              rows={3}
              value={footer.brandSummary || ''}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  footerContent: { ...d.footerContent, brandSummary: e.target.value },
                }))
              }
              className="input-field"
            />
          </div>
          <div>
            <label className="label-field">Copyright Line</label>
            <input
              type="text"
              value={footer.copyrightText || ''}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  footerContent: { ...d.footerContent, copyrightText: e.target.value },
                }))
              }
              className="input-field"
            />
          </div>
        </div>
      )}

      {tab === 'legal' && (
        <div className="space-y-6">
          {/* Terms Editor */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-brand-black">Terms & Conditions Sections</h2>
              <button
                type="button"
                onClick={() =>
                  setData((d) => ({
                    ...d,
                    legalContent: {
                      ...d.legalContent,
                      termsSections: [
                        ...(d.legalContent?.termsSections || []),
                        { heading: 'New Section', body: 'Add policy text...' },
                      ],
                    },
                  }))
                }
                className="btn-secondary py-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" /> Add Section
              </button>
            </div>

            <div>
              <label className="label-field">Draft Notice Banner (clear once owner-approved)</label>
              <input
                type="text"
                value={legal.termsDraftNotice || ''}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    legalContent: { ...d.legalContent, termsDraftNotice: e.target.value },
                  }))
                }
                className="input-field"
              />
            </div>

            {(legal.termsSections || []).map((sec, idx) => (
              <div key={idx} className="rounded-xl border border-brand-border p-4 space-y-2.5">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={sec.heading}
                    onChange={(e) => {
                      const next = [...legal.termsSections];
                      next[idx] = { ...next[idx], heading: e.target.value };
                      setData((d) => ({
                        ...d,
                        legalContent: { ...d.legalContent, termsSections: next },
                      }));
                    }}
                    className="input-field font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const next = legal.termsSections.filter((_, i) => i !== idx);
                      setData((d) => ({
                        ...d,
                        legalContent: { ...d.legalContent, termsSections: next },
                      }));
                    }}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={sec.body}
                  onChange={(e) => {
                    const next = [...legal.termsSections];
                    next[idx] = { ...next[idx], body: e.target.value };
                    setData((d) => ({
                      ...d,
                      legalContent: { ...d.legalContent, termsSections: next },
                    }));
                  }}
                  className="input-field"
                />
              </div>
            ))}
          </div>

          {/* Privacy Editor */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-brand-black">Privacy Policy Sections</h2>
              <button
                type="button"
                onClick={() =>
                  setData((d) => ({
                    ...d,
                    legalContent: {
                      ...d.legalContent,
                      privacySections: [
                        ...(d.legalContent?.privacySections || []),
                        { heading: 'New Section', body: 'Add privacy text...' },
                      ],
                    },
                  }))
                }
                className="btn-secondary py-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" /> Add Section
              </button>
            </div>

            <div>
              <label className="label-field">Privacy Draft Notice Banner</label>
              <input
                type="text"
                value={legal.privacyDraftNotice || ''}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    legalContent: { ...d.legalContent, privacyDraftNotice: e.target.value },
                  }))
                }
                className="input-field"
              />
            </div>

            {(legal.privacySections || []).map((sec, idx) => (
              <div key={idx} className="rounded-xl border border-brand-border p-4 space-y-2.5">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={sec.heading}
                    onChange={(e) => {
                      const next = [...legal.privacySections];
                      next[idx] = { ...next[idx], heading: e.target.value };
                      setData((d) => ({
                        ...d,
                        legalContent: { ...d.legalContent, privacySections: next },
                      }));
                    }}
                    className="input-field font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const next = legal.privacySections.filter((_, i) => i !== idx);
                      setData((d) => ({
                        ...d,
                        legalContent: { ...d.legalContent, privacySections: next },
                      }));
                    }}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={sec.body}
                  onChange={(e) => {
                    const next = [...legal.privacySections];
                    next[idx] = { ...next[idx], body: e.target.value };
                    setData((d) => ({
                      ...d,
                      legalContent: { ...d.legalContent, privacySections: next },
                    }));
                  }}
                  className="input-field"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
