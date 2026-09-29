import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://drpholidayhomes.ae"),
  title: "DRP Holiday Homes — Dubai's Curated Short-Stay Collection",
  description:
    "DRP Holiday Homes is Dubai's boutique collection of professionally designed, fully managed holiday homes across Palm Jumeirah, Dubai Marina, Downtown and beyond. A division of D|R|P.",
  openGraph: {
    title: "DRP Holiday Homes — Dubai's Curated Short-Stay Collection",
    description:
      "Professionally designed, fully managed holiday homes across Dubai's most sought-after addresses.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-canvas text-ink">
        {children}
      </body>
    </html>
  );
}
