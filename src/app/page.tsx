import type { Metadata } from 'next';
import {
  getCachedFaqs,
  getCachedFractionRules,
  getCachedTaxSetting,
} from '@/lib/cached-data';
import LandingView from '@/components/landing/LandingView';

export const metadata: Metadata = {
  title: 'Hitungsaham.com | Kalkulator Penghitung Saham',
  description:
    'Kalkulator penghitung saham untuk ARA/ARB, average up/down, target jual, target profit, dan stop loss.',
};

export default async function HomePage() {
  const [fractionRules, tax, faqs] = await Promise.all([
    getCachedFractionRules(),
    getCachedTaxSetting(),
    getCachedFaqs(),
  ]);

  return <LandingView fractionRules={fractionRules} tax={tax} faqs={faqs} />;
}

