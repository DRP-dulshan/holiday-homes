type MapEmbedProps = {
  query: string;
  label: string;
  className?: string;
};

/** Simple, key-less Google Maps embed (no API key required). */
export function MapEmbed({ query, label, className }: MapEmbedProps) {
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
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
