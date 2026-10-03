import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  /** "dark" = charcoal logo for light backgrounds, "light" = white logo for dark ones. */
  tone?: "light" | "dark";
  className?: string;
  size?: "sm" | "md" | "lg";
};

// Intrinsic size of the official lockups in public/brand/ — passing the true
// natural dimensions lets `w-auto` derive an exact proportional width.
const NATURAL_WIDTH = 1984;
const NATURAL_HEIGHT = 1059;

const HEIGHTS = {
  sm: "h-10",
  md: "h-11 md:h-14",
  lg: "h-20 md:h-24",
};

/**
 * Official DRP Holiday Homes lockup (D|R|P mark + "Holiday Homes" wordmark).
 * The white version sits over dark backgrounds (hero, footer); the charcoal
 * version is used on light backgrounds and once the nav turns solid.
 */
export function Logo({ tone = "dark", className, size = "md" }: LogoProps) {
  const src =
    tone === "dark"
      ? "/brand/holiday-homes-logo-dark.png"
      : "/brand/holiday-homes-logo-white.png";

  return (
    <Link
      href="/"
      className={["inline-flex shrink-0 items-center", className].join(" ")}
      aria-label="DRP Holiday Homes — home"
    >
      <Image
        src={src}
        alt="DRP Holiday Homes"
        width={NATURAL_WIDTH}
        height={NATURAL_HEIGHT}
        priority
        sizes="200px"
        className={`${HEIGHTS[size]} w-auto`}
      />
    </Link>
  );
}
