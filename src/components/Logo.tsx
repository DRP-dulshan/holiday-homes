import Link from "next/link";

type LogoProps = {
  tone?: "light" | "dark";
  className?: string;
};

/** Wordmark: D|R|P set tight, with the division name alongside. */
export function Logo({ tone = "dark", className }: LogoProps) {
  const text = tone === "dark" ? "text-ink" : "text-white";
  const sub = tone === "dark" ? "text-ink-60" : "text-white/60";
  return (
    <Link
      href="/"
      className={["group inline-flex items-baseline gap-2", className].join(" ")}
      aria-label="DRP Holiday Homes — home"
    >
      <span
        className={[
          "display text-lg font-bold tracking-tight",
          text,
        ].join(" ")}
      >
        D
        <span className="text-brand">|</span>R<span className="text-brand">|</span>
        P
      </span>
      <span
        className={[
          "text-[0.7rem] font-medium uppercase tracking-[0.22em]",
          sub,
        ].join(" ")}
      >
        Holiday Homes
      </span>
    </Link>
  );
}
