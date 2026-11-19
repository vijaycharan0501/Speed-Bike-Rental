import { useSettings } from '../context/SettingsContext';

export function BrandLogo({ variant = 'dark', compact = false, className = '' }) {
  const { settings } = useSettings();
  const customLogoUrl = settings?.logo?.url;
  const isDark = variant === 'dark';

  if (customLogoUrl) {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        <img
          src={customLogoUrl}
          alt={settings.businessName || 'Speed Bike Rental'}
          className="h-9 w-auto max-w-[160px] object-contain"
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Original Speedometer / Tachometer Mark */}
      <svg
        width={compact ? 36 : 42}
        height={compact ? 36 : 42}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect
          x="2"
          y="2"
          width="60"
          height="60"
          rx="14"
          fill={isDark ? '#191B20' : '#101114'}
          stroke={isDark ? '#2C303A' : '#101114'}
          strokeWidth="2"
        />
        {/* Outer gauge track */}
        <path
          d="M13 43A21 21 0 1 1 51 43"
          stroke="#323743"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        {/* Racing Yellow active speed arc */}
        <path
          d="M13 43A21 21 0 0 1 48.5 24"
          stroke="#FFC400"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        {/* Tachometer ticks */}
        <line x1="17" y1="30" x2="20.5" y2="31.5" stroke="#FFC400" strokeWidth="2" strokeLinecap="round" />
        <line x1="23" y1="20.5" x2="25" y2="23.5" stroke="#FFC400" strokeWidth="2" strokeLinecap="round" />
        <line x1="32" y1="16.5" x2="32" y2="20" stroke="#FFC400" strokeWidth="2" strokeLinecap="round" />
        <line x1="41" y1="20.5" x2="39" y2="23.5" stroke="#FFC400" strokeWidth="2" strokeLinecap="round" />
        {/* Dynamic needle */}
        <line
          x1="32"
          y1="40"
          x2="45.5"
          y2="25"
          stroke="#FFC400"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Center pivot */}
        <circle cx="32" cy="40" r="4.5" fill="#FFFFFF" />
        <circle cx="32" cy="40" r="2" fill="#101114" />
      </svg>

      <div className="leading-none">
        <div
          className={`font-display text-base font-extrabold tracking-tight sm:text-lg ${
            isDark ? 'text-white' : 'text-brand-black'
          }`}
        >
          SPEED <span className="text-brand-yellow">BIKE</span>
        </div>
        <div
          className={`mt-0.5 text-[10px] font-bold tracking-[0.26em] ${
            isDark ? 'text-white/70' : 'text-brand-muted'
          }`}
        >
          RENTAL
        </div>
      </div>
    </div>
  );
}
