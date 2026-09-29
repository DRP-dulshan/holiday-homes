import type { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const IconSofa = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 11V8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3" />
    <path d="M3 13a2 2 0 0 1 2-2 2 2 0 0 1 2 2v3h10v-3a2 2 0 0 1 4 0v6" />
    <path d="M3 19v-6" />
    <path d="M6 19v2M18 19v2" />
    <path d="M7 16h10" />
  </svg>
);

export const IconKey = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="8" cy="8" r="4" />
    <path d="M10.8 10.8 20 20" />
    <path d="M17 17l2-2M15 15l2-2" />
  </svg>
);

export const IconCar = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13" />
    <path d="M4 13h16v5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
    <circle cx="7.5" cy="15.5" r=".8" />
    <circle cx="16.5" cy="15.5" r=".8" />
  </svg>
);

export const IconBadgeCheck = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3l2.1 1.6 2.6-.3 1 2.4 2.4 1-.3 2.6L23 12l-1.5 2.1.3 2.6-2.4 1-1 2.4-2.6-.3L12 21l-2.1-1.5-2.6.3-1-2.4-2.4-1 .3-2.6L1 12l1.6-2.1-.3-2.6 2.4-1 1-2.4 2.6.3z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

export const IconShield = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3l7 3v5c0 4.6-3 8.2-7 10-4-1.8-7-5.4-7-10V6z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

export const IconLock = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    <path d="M12 15v2" />
  </svg>
);

export const IconHeadset = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
    <rect x="3" y="13" width="4" height="6" rx="1.5" />
    <rect x="17" y="13" width="4" height="6" rx="1.5" />
    <path d="M20 19a4 4 0 0 1-4 4h-2" />
  </svg>
);

export const IconSparkle = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z" />
    <path d="M18 15l.7 1.8L20.5 17.5 18.7 18.2 18 20l-.7-1.8L15.5 17.5l1.8-.7z" />
  </svg>
);

export const IconBed = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M3 7v10M3 12h18v5M21 17V12a2 2 0 0 0-2-2h-7v-3H5" />
    <circle cx="7.5" cy="9.5" r="1.5" />
  </svg>
);

export const IconUsers = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
    <path d="M16 6.2A3 3 0 0 1 18 12M17 14.5a5.5 5.5 0 0 1 3.5 4.5" />
  </svg>
);

export const IconPin = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 21s7-5.4 7-11a7 7 0 0 0-14 0c0 5.6 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export const IconCalendar = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="4" y="5" width="16" height="16" rx="2" />
    <path d="M4 10h16M8 3v4M16 3v4" />
  </svg>
);

export const IconArrowRight = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const IconChevronDown = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export const IconStar = (p: IconProps) => (
  <svg {...base} fill="currentColor" stroke="none" {...p}>
    <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" />
  </svg>
);

export const IconWhatsApp = (p: IconProps) => (
  <svg viewBox="0 0 24 24" width={24} height={24} fill="currentColor" {...p}>
    <path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.48 1.34 5L2 22l5.2-1.36a9.9 9.9 0 0 0 4.84 1.24h.01c5.5 0 9.96-4.46 9.96-9.96 0-2.66-1.04-5.16-2.92-7.04A9.9 9.9 0 0 0 12.04 2zm0 1.8a8.14 8.14 0 0 1 5.8 2.4 8.1 8.1 0 0 1 2.4 5.77c0 4.52-3.68 8.2-8.2 8.2a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.1.81.83-3.02-.2-.31a8.16 8.16 0 0 1-1.25-4.35c0-4.52 3.68-8.2 8.2-8.2zm-2.9 4.4c-.14 0-.36.05-.55.26-.19.2-.72.7-.72 1.72 0 1.02.74 2 .84 2.14.1.14 1.44 2.3 3.56 3.14 1.76.7 2.12.56 2.5.52.38-.03 1.23-.5 1.4-.99.17-.48.17-.9.12-.99-.05-.08-.19-.13-.4-.24-.21-.11-1.23-.61-1.42-.68-.19-.07-.33-.1-.47.1-.14.21-.54.68-.66.82-.12.14-.24.16-.45.05-.21-.1-.88-.32-1.68-1.03-.62-.55-1.04-1.24-1.16-1.45-.12-.21-.01-.32.09-.43.09-.09.21-.24.31-.36.1-.12.14-.21.21-.35.07-.14.03-.26-.02-.37-.05-.11-.46-1.14-.64-1.56-.17-.41-.34-.35-.46-.36l-.4-.01z" />
  </svg>
);

export const IconArrowUpRight = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

export const IconSearch = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="6" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const IconWifi = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M2 8.5a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0M8.5 15.5a6 6 0 0 1 7 0" />
    <circle cx="12" cy="19" r="1" fill="currentColor" />
  </svg>
);

export const IconBroom = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M19 4 12 11" />
    <path d="M8.5 10.5 13.5 15.5" />
    <path d="M11 13c-2 0-4 1-5 3l-2 4 4-2c2-1 3-3 3-5z" />
  </svg>
);

export const IconPool = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M2 17.5c1.5-1.3 3-1.3 4.5 0s3 1.3 4.5 0 3-1.3 4.5 0 3 1.3 4.5 0" />
    <path d="M2 21c1.5-1.3 3-1.3 4.5 0s3 1.3 4.5 0 3-1.3 4.5 0 3 1.3 4.5 0" />
    <path d="M7 13V6a2 2 0 0 1 2-2h2l4 4v5" />
    <circle cx="17" cy="6" r="1.4" />
  </svg>
);

export const IconParking = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
    <path d="M9 16V8h3.2a2.6 2.6 0 0 1 0 5.2H9" />
  </svg>
);

export const IconGym = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 9v6M20 9v6" />
    <path d="M2 12h2M20 12h2" />
    <rect x="6" y="7" width="2.4" height="10" rx="1" />
    <rect x="15.6" y="7" width="2.4" height="10" rx="1" />
    <path d="M8.4 12h7.2" />
  </svg>
);

export const IconWaves = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M2 8c1.5-1.3 3-1.3 4.5 0s3 1.3 4.5 0 3-1.3 4.5 0 3 1.3 4.5 0" />
    <path d="M2 13c1.5-1.3 3-1.3 4.5 0s3 1.3 4.5 0 3-1.3 4.5 0 3 1.3 4.5 0" />
    <path d="M2 18c1.5-1.3 3-1.3 4.5 0s3 1.3 4.5 0 3-1.3 4.5 0 3 1.3 4.5 0" />
  </svg>
);

export const IconLeaf = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M20 4c-9 0-16 5-16 14 9 0 16-5 16-14z" />
    <path d="M6 18C10 12 14 9 20 4" />
  </svg>
);

export const IconWasher = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="4" y="3" width="16" height="18" rx="2.5" />
    <circle cx="12" cy="13" r="4.5" />
    <circle cx="12" cy="13" r="1.6" />
    <path d="M8 6.2h.01M11 6.2h.01" />
  </svg>
);

export const IconLaptop = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="4.5" y="4.5" width="15" height="10" rx="1.5" />
    <path d="M2.5 18.5h19" />
    <path d="M9 18.5l.6-2h4.8l.6 2" />
  </svg>
);

export const IconElevator = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <path d="M10 9l2-2 2 2M10 15l2 2 2-2" />
  </svg>
);

export const IconPaw = (p: IconProps) => (
  <svg {...base} fill="currentColor" stroke="none" {...p}>
    <circle cx="7" cy="8" r="1.8" />
    <circle cx="12" cy="6" r="1.8" />
    <circle cx="17" cy="8" r="1.8" />
    <circle cx="19" cy="12.5" r="1.6" />
    <path d="M12 12c-3.2 0-6 2-6 4.6 0 1.6 1.3 2.6 2.9 2.2.9-.2 1.7-.7 3.1-.7s2.2.5 3.1.7c1.6.4 2.9-.6 2.9-2.2 0-2.6-2.8-4.6-6-4.6z" />
  </svg>
);

export const IconSmartHome = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 11l8-7 8 7" />
    <path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" />
    <circle cx="12" cy="15" r="2" />
  </svg>
);

export const IconRuler = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3" y="7" width="18" height="10" rx="1.5" transform="rotate(0 12 12)" />
    <path d="M7 7v3M11 7v2M15 7v3M19 7v2" />
  </svg>
);

export const IconClose = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const IconEye = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z" />
    <circle cx="12" cy="12" r="2.6" />
  </svg>
);
