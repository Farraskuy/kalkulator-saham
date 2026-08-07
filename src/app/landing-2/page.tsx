import type { Metadata } from 'next';
import {
  getCachedFaqs,
  getCachedFractionRules,
  getCachedTaxSetting,
} from '@/lib/cached-data';
import LandingTwo from './LandingTwo';

export const metadata: Metadata = {
  title: 'Hitungsaham.com | Kalkulator Penghitung Saham',
  description:
    'Kalkulator penghitung saham untuk ARA/ARB, average up/down, target jual, target profit, dan stop loss.',
};

export default async function LandingTwoPage() {
  const [fractionRules, tax, faqs] = await Promise.all([
    getCachedFractionRules(),
    getCachedTaxSetting(),
    getCachedFaqs(),
  ]);

  return <LandingTwo fractionRules={fractionRules} tax={tax} faqs={faqs} />;
}
