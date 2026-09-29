import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
};

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  tone = "light",
}: SectionHeadingProps) {
  const isCenter = align === "center";
  return (
    <Reveal
      className={[
        "max-w-2xl",
        isCenter ? "mx-auto text-center" : "",
      ].join(" ")}
    >
      {eyebrow ? (
        <span
          className={[
            "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]",
            tone === "dark" ? "text-brand-400" : "text-brand-600",
          ].join(" ")}
        >
          <span className="h-px w-6 bg-brand" />
          {eyebrow}
        </span>
      ) : null}
      <h2
        className={[
          "display mt-4 text-3xl leading-tight sm:text-4xl md:text-[2.75rem]",
          tone === "dark" ? "text-white" : "text-ink",
        ].join(" ")}
      >
        {title}
      </h2>
      {intro ? (
        <p
          className={[
            "mt-4 text-base leading-relaxed sm:text-lg",
            tone === "dark" ? "text-white/70" : "text-ink-80",
          ].join(" ")}
        >
          {intro}
        </p>
      ) : null}
    </Reveal>
  );
}
