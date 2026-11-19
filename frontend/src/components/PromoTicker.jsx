export function PromoTicker({ items = [] }) {
  const displayItems = items.length
    ? items
    : ['RIDE MORE', 'EXPLORE MORE', 'PREMIUM BIKES', 'EASY BOOKINGS'];


  return (
    <section
      aria-label="Promotional highlights"
      className="overflow-hidden border-y border-brand-black/10 bg-brand-yellow py-3.5 text-brand-black"
    >
      <div className="sbr-ticker-track">
        {[0, 1].map((dupIndex) => (
          <div
            key={dupIndex}
            className="flex shrink-0 items-center gap-8 pr-8"
            aria-hidden={dupIndex === 1}
          >
            {displayItems.map((text, idx) => (
              <span
                key={`${dupIndex}-${idx}`}
                className="inline-flex items-center gap-8 font-display text-sm font-extrabold uppercase tracking-[0.2em]"
              >
                <span>{text}</span>
                <span className="h-2 w-2 rounded-full bg-brand-black" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
