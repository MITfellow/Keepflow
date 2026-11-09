import type { Metadata, Viewport } from "next";

import { AnalyticsProvider } from "@/components/analytics-provider";
import { CursorGlow } from "@/components/cursor-glow";
import { RevealObserver } from "@/components/reveal-observer";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteUrl, site } from "@/lib/site";

import { instrumentSerif, jost } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: site.title,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: site.name,
    title: site.title,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#04060b" },
    { media: "(prefers-color-scheme: light)", color: "#f8faff" },
  ],
};

const themeScript = `
(function () {
  var root = document.documentElement;
  try {
    var stored = localStorage.getItem("keepflow-theme");
    var system = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    var theme = stored === "light" || stored === "dark" ? stored : system;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  } catch (error) {
    root.dataset.theme = "dark";
    root.style.colorScheme = "dark";
  }
  try {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.add("js-motion");
    }
  } catch (error) {
    /* Motion is an enhancement; content stays visible without it. */
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${jost.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>

        <SiteHeader />

        <main id="main" tabIndex={-1}>
          {children}
        </main>

        <SiteFooter />

        <div className="grain" aria-hidden="true" />
        <CursorGlow />
        <RevealObserver />
        {process.env.VERCEL ? <AnalyticsProvider /> : null}
      </body>
    </html>
  );
}
