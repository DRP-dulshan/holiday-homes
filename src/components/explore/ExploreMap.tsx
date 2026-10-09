"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Property } from "@/data/properties";
import { areas } from "@/data/areas";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** A stable offset (about ±500 m) so homes in the same area don't sit on top of each other. */
function jitter(slug: string) {
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return { dLat: ((h % 1000) / 1000 - 0.5) * 0.009, dLng: (((h >>> 10) % 1000) / 1000 - 0.5) * 0.009 };
}

/** Homes on an OpenStreetMap map, at their building (or the neighbourhood when a home has no pin yet). */
export default function ExploreMap({ homes, query }: { homes: Property[]; query: string }) {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import("leaflet").Map | undefined;
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !el.current) return;
      map = L.map(el.current, { scrollWheelZoom: false }).setView([25.12, 55.2], 11);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const points: [number, number][] = [];
      for (const p of homes) {
        const area = areas.find((a) => a.name === p.area);
        let at: [number, number];
        if (p.lat != null && p.lng != null) {
          // Homes in the same building share a spot; nudge them a few metres apart so every pin shows.
          const j = jitter(p.slug);
          at = [p.lat + j.dLat / 25, p.lng + j.dLng / 25];
        } else if (area) {
          const j = jitter(p.slug);
          at = [area.lat + j.dLat, area.lng + j.dLng];
        } else continue;
        points.push(at);
        const icon = L.divIcon({
          className: "",
          html: `<span style="display:inline-block;transform:translate(-50%,-100%);white-space:nowrap;background:#f47b49;color:#fff;font:600 12px/1 Inter,system-ui,sans-serif;padding:6px 9px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.25)">AED ${p.pricePerNight.toLocaleString("en-AE")}</span>`,
          iconSize: [0, 0],
        });
        const href = `/property/${p.slug}${query ? `?${query}` : ""}`;
        L.marker(at, { icon, title: p.title, alt: p.title })
          .addTo(map)
          .bindPopup(
            `<a href="${esc(href)}" style="display:block;width:200px;text-decoration:none;color:inherit"><img src="${esc(p.image)}" alt="" style="width:200px;height:120px;object-fit:cover;border-radius:8px"/><strong style="display:block;margin-top:6px;font:600 13px/1.3 Inter,system-ui,sans-serif">${esc(p.title)}</strong><span style="font:12px Inter,system-ui,sans-serif;color:#666">${esc(p.area)} · from AED ${p.pricePerNight.toLocaleString("en-AE")}</span></a>`,
            { closeButton: true, minWidth: 200 },
          );
      }
      if (points.length) map.fitBounds(points, { padding: [40, 40], maxZoom: 13 });
    })();
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [homes, query]);

  return (
    <div>
      <div ref={el} className="h-[28rem] w-full overflow-hidden rounded-card border border-ink-10 sm:h-[34rem]" role="region" aria-label="Map of homes" />
      <p className="mt-2 text-xs text-ink-60">Pins show the building. The unit and access details are shared after you book.</p>
    </div>
  );
}
