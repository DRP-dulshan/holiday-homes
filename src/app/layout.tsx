import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { site, siteUrl, socialLinks } from "@/config/site";
import { JsonLd } from "@/components/JsonLd";
import { Analytics } from "@/components/Analytics";
import { ConsentBanner } from "@/components/ConsentBanner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const defaultTitle = "DRP Holiday Homes — Dubai's Curated Short-Stay Collection";
const defaultDescription =
  "DRP Holiday Homes is Dubai's boutique collection of professionally designed, fully managed holiday homes across Palm Jumeirah, Dubai Marina, Downtown and beyond. A division of D|R|P.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: defaultTitle,
    template: `%s — ${site.name}`,
  },
  description: defaultDescription,
  keywords: [
    "Dubai holiday homes",
    "Dubai short-term rentals",
    "Palm Jumeirah villa rental",
    "Dubai Marina apartment rental",
    "furnished apartments Dubai",
    "DRP Holiday Homes",
  ],
  authors: [{ name: site.name }],
  robots: { index: true, follow: true },
  openGraph: {
    title: defaultTitle,
    description:
      "Professionally designed, fully managed holiday homes across Dubai's most sought-after addresses.",
    type: "website",
    url: siteUrl(),
    siteName: site.name,
    locale: "en_AE",
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description:
      "Professionally designed, fully managed holiday homes across Dubai's most sought-after addresses.",
  },
};

export const viewport: Viewport = {
  themeColor: "#2e2e2e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-canvas text-ink">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": ["Organization", "LodgingBusiness"],
                "@id": `${siteUrl()}#org`,
                name: site.name,
                legalName: `${site.parentFull} — ${site.name}`,
                url: siteUrl(),
                logo: `${siteUrl()}/brand/holiday-homes-logo-dark.png`,
                description: site.tagline,
                telephone: site.phoneDisplay,
                email: site.email,
                address: {
                  "@type": "PostalAddress",
                  streetAddress: `${site.address.line1}, ${site.address.line2}`,
                  addressLocality: site.address.city,
                  addressCountry: "AE",
                },
                sameAs: socialLinks.map((s) => s.href),
              },
              { "@type": "WebSite", "@id": `${siteUrl()}#site`, url: siteUrl(), name: site.name, publisher: { "@id": `${siteUrl()}#org` } },
            ],
          }}
        />
        {children}
        <ConsentBanner />
        <Analytics />
      </body>
    </html>
  );
}
