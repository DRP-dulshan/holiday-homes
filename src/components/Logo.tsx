import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  tone?: "light" | "dark";
  className?: string;
  /** Rendered height in px; width follows the mark's fixed aspect ratio. */
  height?: number;
};

// Intrinsic size of the source mark (public/brand/logo-mark-*.png) — passing
// the true natural dimensions lets `width: auto` below derive an exact,
// warning-free proportional width instead of a rounded approximation.
const NATURAL_WIDTH = 937;
const NATURAL_HEIGHT = 360;

/**
 * D|R|P mark (from the brand logo file) paired with the "Holiday Homes"
 * division label. The white mark is used over dark backgrounds (hero,
 * footer); the ink mark is used once the nav turns solid/white on scroll.
 */
export function Logo({ tone = "dark", className, height = 30 }: LogoProps) {
  const src = tone === "dark" ? "/brand/logo-mark-dark.png" : "/brand/logo-mark-white.png";
  const sub = tone === "dark" ? "text-ink-60" : "text-white/70";

  return (
    <Link
      href="/"
      className={["group inline-flex items-center gap-3", className].join(" ")}
      aria-label="DRP Holiday Homes — home"
    >
      <Image
        src={src}
        alt="D|R|P"
        width={NATURAL_WIDTH}
        height={NATURAL_HEIGHT}
        priority
        style={{ height, width: "auto" }}
      />
      <span
        className={[
          "hidden text-[0.68rem] font-medium uppercase leading-tight tracking-[0.2em] sm:block",
          sub,
        ].join(" ")}
      >
        Holiday
        <br />
        Homes
      </span>
    </Link>
  );
}
