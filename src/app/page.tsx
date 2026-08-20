import type { Metadata } from 'next';
import {
  getCachedFaqs,
  getCachedAraArbRules,
  getCachedFractionRules,
  getCachedTaxSetting,
  getCachedSiteDescription,
} from '@/lib/cached-data';
import LandingView from '@/components/landing/LandingView';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const description = await getCachedSiteDescription();
  return {
    title: 'Hitungsaham.com | Kalkulator Penghitung Saham',
    description,
    openGraph: {
      title: 'Hitungsaham.com | Kalkulator Penghitung Saham',
      description,
      url: 'https://hitungsaham.com',
      siteName: 'HitungSaham',
      locale: 'id_ID',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Hitungsaham.com | Kalkulator Penghitung Saham',
      description,
    },
  };
}

export default async function HomePage() {
  const [fractionRules, araArbRules, tax, faqs] = await Promise.all([
    getCachedFractionRules(),
    getCachedAraArbRules(),
    getCachedTaxSetting(),
    getCachedFaqs(),
  ]);

  return <LandingView fractionRules={fractionRules} araArbRules={araArbRules} tax={tax} faqs={faqs} />;
}
