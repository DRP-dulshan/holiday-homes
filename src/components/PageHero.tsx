import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: ReactNode;
}) {
  return (
    <section className="bg-ink pt-32 pb-16 text-white md:pt-40 md:pb-20">
      <div className="container-drp">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-400">
          <span className="h-px w-6 bg-brand" />
          {eyebrow}
        </span>
        <h1 className="display mt-4 max-w-3xl text-4xl leading-[1.08] sm:text-5xl">
          {title}
        </h1>
        {intro ? (
          <p className="mt-5 max-w-xl text-white/70">{intro}</p>
        ) : null}
      </div>
    </section>
  );
}
