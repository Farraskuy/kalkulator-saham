import './globals.css';
import type { Metadata } from 'next';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';

export const metadata: Metadata = {
  metadataBase: new URL('https://hitungsaham.com'),
  title: 'HitungSaham: Kalkulator ARA ARB & Target Profit Online',
  description:
    'Bingung hitung lot untuk average down? Gunakan kalkulator hitungsaham.com untuk simulasi pembelian, cek batas auto rejection, dan atur stop loss akurat.',
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
    description:
      'Bingung hitung lot untuk average down? Gunakan kalkulator hitungsaham.com untuk simulasi pembelian, cek batas auto rejection, dan atur stop loss akurat.',
    url: 'https://hitungsaham.com',
    siteName: 'HitungSaham',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HitungSaham: Kalkulator ARA ARB & Target Profit Online',
    description:
      'Bingung hitung lot untuk average down? Gunakan kalkulator hitungsaham.com untuk simulasi pembelian, cek batas auto rejection, dan atur stop loss akurat.',
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}