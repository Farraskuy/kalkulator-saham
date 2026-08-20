import "./globals.css";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import { getCachedSiteDescription } from "@/lib/cached-data";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#111827",
};

export async function generateMetadata(): Promise<Metadata> {
  const description = await getCachedSiteDescription();

  return {
    metadataBase: new URL("https://hitungsaham.com"),
    title: {
      template: "%s | HitungSaham",
      default:
        "Kalkulator Saham BEI: Hitung Target Profit, ARA ARB & Average Down | HitungSaham",
    },
    description:
      description ||
      "Kalkulator saham online gratis & terlengkap untuk investor & trader BEI. Hitung simulasi target profit, batas ARA & ARB otomatis, average down, serta fee broker secara akurat.",
    keywords: [
      "HitungSaham",
      "kalkulator saham",
      "kalkulator saham bei",
      "kalkulator ARA ARB",
      "average down saham",
      "average up saham",
      "prediksi profit saham",
      "stop loss saham",
      "fraksi harga BEI",
      "fee beli jual saham",
      "saham Bursa Efek Indonesia",
      "hitung profit saham",
    ],
    authors: [{ name: "HitungSaham", url: "https://hitungsaham.com" }],
    creator: "HitungSaham",
    publisher: "HitungSaham",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical: "https://hitungsaham.com",
    },
    openGraph: {
      title:
        "Kalkulator Saham BEI: Hitung Target Profit, ARA ARB & Average Down | HitungSaham",
      description:
        "Kalkulator saham online gratis & terlengkap untuk investor & trader BEI. Hitung simulasi target profit, batas ARA & ARB otomatis, average down, serta fee broker secara akurat.",
      url: "https://hitungsaham.com",
      siteName: "HitungSaham",
      images: [
        {
          url: "https://hitungsaham.com/opengraph-image.png",
          width: 1200,
          height: 630,
          alt: "HitungSaham - Kalkulator Saham BEI",
        },
      ],
      locale: "id_ID",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title:
        "Kalkulator Saham BEI: Hitung Target Profit, ARA ARB & Average Down | HitungSaham",
      description:
        "Kalkulator saham online gratis & terlengkap untuk investor & trader BEI. Hitung batas ARA ARB, average down, dan target profit secara presisi.",
      images: ["https://hitungsaham.com/opengraph-image.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "48x48 32x32 16x16", type: "image/x-icon" },
        { url: "/icon.png", sizes: "512x512", type: "image/png" },
      ],
      shortcut: "/favicon.ico",
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    manifest: "/manifest.webmanifest",
  };
}

const globalJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://hitungsaham.com/#website",
      url: "https://hitungsaham.com",
      name: "HitungSaham",
      description:
        "Kalkulator Saham BEI, ARA/ARB, dan Simulasi Average Down Online.",
      inLanguage: "id-ID",
      publisher: {
        "@id": "https://hitungsaham.com/#organization",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://hitungsaham.com/#organization",
      name: "HitungSaham",
      url: "https://hitungsaham.com",
      logo: {
        "@type": "ImageObject",
        url: "https://hitungsaham.com/icon.png",
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "HitungSaham - Kalkulator Saham BEI",
      operatingSystem: "All",
      applicationCategory: "FinanceApplication",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "IDR",
      },
      description:
        "Aplikasi kalkulator saham online untuk menghitung target profit, batas ARA ARB, dan simulasi average down saham Bursa Efek Indonesia (BEI).",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var saved=localStorage.getItem('theme');var theme=saved||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',theme);document.documentElement.classList.toggle('dark',theme==='dark')}catch(e){}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalJsonLd) }}
        />
      </head>
      <body>
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}

