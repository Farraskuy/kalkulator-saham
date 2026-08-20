import './globals.css';
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import { getCachedSiteDescription } from '@/lib/cached-data';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const description = await getCachedSiteDescription();

  return {
    metadataBase: new URL('https://hitungsaham.com'),
    title: {
      template: '%s | HitungSaham.com',
      default: 'HitungSaham: Kalkulator ARA ARB & Target Profit Online',
    },
    description,
    keywords: [
      'HitungSaham',
      'kalkulator saham',
      'kalkulator ARA ARB',
      'average down saham',
      'average up saham',
      'prediksi profit saham',
      'stop loss saham',
      'fraksi harga BEI',
      'saham Bursa Efek Indonesia',
    ],
    authors: [{ name: 'HitungSaham' }],
    creator: 'HitungSaham',
    publisher: 'HitungSaham',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical: 'https://hitungsaham.com',
    },
    openGraph: {
      title: 'HitungSaham: Kalkulator ARA ARB & Target Profit Online',
      description,
      url: 'https://hitungsaham.com',
      siteName: 'HitungSaham',
      locale: 'id_ID',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'HitungSaham: Kalkulator ARA ARB & Target Profit Online',
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: [
        {
          url: '/assets/images/icon_dark_bg_transparent.png',
          media: '(prefers-color-scheme: light)',
        },
        {
          url: '/assets/images/icon_white_bg_transparent.png',
          media: '(prefers-color-scheme: dark)',
        },
      ],
      shortcut: '/assets/images/icon_dark_bg_transparent.png',
      apple: '/assets/images/icon_dark_bg_white.png',
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
      </head>
      <body>
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
