type MapEmbedProps = {
  /** A search to show on the map. Ignored when `src` is given. */
  query?: string;
  /** A full embed URL, for a specific place. */
  src?: string;
  label: string;
  className?: string;
};

/** Simple, key-less Google Maps embed (no API key required). */
export function MapEmbed({ query = "", src: place, label, className }: MapEmbedProps) {
  const src = place ?? `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  return (
    <div
      className={["overflow-hidden rounded-card border border-ink-10", className].join(" ")}
    >
      <iframe
        title={`Map showing ${label}`}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-full w-full min-h-[280px] border-0"
      />
    </div>
  );
}
