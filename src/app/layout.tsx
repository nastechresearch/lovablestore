import type { Metadata, Viewport } from "next";
import { Cormorant, Montserrat } from "next/font/google";
import "./globals.css";
import { Analytics } from "@/components/analytics";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";

const display = Cormorant({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const sans = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-montserrat",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Lovable Store",
  title: {
    default: "Lovable Store | Where magic gift starts from",
    template: "%s | Lovable Store",
  },
  description:
    "Considered gifts for him, her and couples. Shop watches, fragrance, fashion and ready-to-give gift boxes with delivery across South Africa in 2–5 days.",
  keywords: [
    "Lovable Store",
    "gifts South Africa",
    "watches for men South Africa",
    "perfume gifts",
    "Valentine's gifts",
    "couples gifts",
    "online gift shop Johannesburg",
    "fashion online South Africa",
  ],
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "Lovable Store",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: siteUrl,
    siteName: "Lovable Store",
    title: "Lovable Store | Where magic gift starts from",
    description:
      "Watches, fragrance, fashion and ready-to-give gift boxes. Delivered across South Africa in 2–5 days.",
    images: [
      {
        url: "/images/editorial/hero-gifts.jpg",
        width: 1500,
        height: 1800,
        alt: "The Lovable Store gifting edit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lovable Store | Where magic gift starts from",
    description:
      "Watches, fragrance, fashion and ready-to-give gift boxes. Delivery across South Africa.",
    images: ["/images/editorial/hero-gifts.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f3eb" },
    { media: "(prefers-color-scheme: dark)", color: "#12100e" },
  ],
};

const themeScript = `(function(){try{var t=localStorage.getItem('bm-theme');if(t!=='light'&&t!=='dark'&&t!=='amoled'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}var r=document.documentElement;r.dataset.theme=t;r.style.colorScheme=t==='light'?'light':'dark';}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-ZA"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen">
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
