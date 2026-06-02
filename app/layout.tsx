import type { Metadata, Viewport } from "next";
import { Anton, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

/* Display: Anton — jersey-number, broadcast energy for headlines & scores. */
const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

/* Body: Hanken Grotesk — clean, characterful, not Inter/Roboto/Arial. */
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-hanken",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://wc26.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "World Cup 2026 — Globe, Fixtures & IST Reminders",
    template: "%s · WC26",
  },
  description:
    "A cinematic companion for the 2026 FIFA World Cup. An interactive 3D globe of all 16 host cities, every fixture in IST, your two favourite teams pinned, and kickoff reminders on Telegram.",
  applicationName: "WC26",
  keywords: [
    "FIFA World Cup 2026",
    "World Cup fixtures",
    "IST kickoff times",
    "interactive globe",
    "Telegram reminders",
  ],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WC26",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "World Cup 2026 — Globe, Fixtures & IST Reminders",
    description:
      "Spin a realistic 3D globe of all 16 host cities, follow your two teams, and never miss a kickoff (in IST).",
    siteName: "WC26",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "WC26" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "World Cup 2026 — Globe, Fixtures & IST Reminders",
    description:
      "A cinematic 3D companion for the 2026 FIFA World Cup. Fixtures in IST, your teams pinned, Telegram reminders.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#05060b",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${hanken.variable} h-full`}
    >
      <body className="min-h-dvh font-body antialiased">{children}</body>
    </html>
  );
}
