"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Property } from "@/data/properties";
import { useSaved } from "@/lib/saved";
import { PropertyCard } from "@/components/PropertyCard";
import { IconArrowRight } from "@/components/icons";

export function SavedHomes() {
  const saved = useSaved();
  const [homes, setHomes] = useState<Property[] | null>(null);
  const key = saved.join(",");

  useEffect(() => {
    if (!key) return;
    let live = true;
    fetch(`/api/properties?slugs=${encodeURIComponent(key)}`)
      .then((r) => r.json())
      .then((j) => live && setHomes(j.homes ?? []))
      .catch(() => live && setHomes([]));
    return () => {
      live = false;
    };
  }, [key]);

  if (!saved.length) {
    return (
      <div className="rounded-card border border-dashed border-ink-20 bg-canvas p-12 text-center">
        <p className="display text-xl font-semibold text-ink">No saved homes yet.</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-60">
          Tap the heart on any home to keep it here, so you can compare later.
        </p>
        <Link href="/explore" className="btn btn-primary mt-6">
          Explore stays
          <IconArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }
  if (homes === null) return <p className="text-sm text-ink-60">Loading your saved homes…</p>;
  const shown = homes.filter((h) => saved.includes(h.slug));
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {shown.map((p) => (
        <PropertyCard key={p.slug} property={p} />
      ))}
    </div>
  );
}
