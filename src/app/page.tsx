import Navbar from '@/components/layout/Navbar';
import AraArbSection from '@/features/calculators/components/AraArbSection';
import AvgUpDownSection from '@/features/calculators/components/AvgUpDownSection';
import PredictionSection from '@/features/calculators/components/PredictionSection';
import FaqSection from '@/features/faq/components/FaqSection';
import AnalyticsTracker from '@/components/analytics/AnalyticsTracker';
import DynamicDisclaimer from '@/components/layout/DynamicDisclaimer';
import WebsiteBrand from '@/components/layout/WebsiteBrand';
import AutoUsagePromoTrigger from '@/components/feedback/AutoUsagePromoTrigger';
import { Suspense } from 'react';
import {
  getCachedFaqs,
  getCachedFractionRules,
  getCachedTaxSetting,
} from '@/lib/cached-data';

export default async function HomePage() {
  const [fractionRules, tax, faqs] = await Promise.all([
    getCachedFractionRules(),
    getCachedTaxSetting(),
    getCachedFaqs(),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-page text-main transition-colors duration-300">
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
      <AutoUsagePromoTrigger />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full grow space-y-16">
        {/* HERO SECTION LANDING 1 */}
        <section className="max-w-3xl mt-8 mb-10 space-y-4 px-4 md:px-0 pt-8 pb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-main">
            Kalkulator Penghitung <span className="text-acc-blue">Saham BEI</span>
          </h1>
          <p className="text-base sm:text-lg text-muted max-w-2xl">
            Alat bantu analisis untuk menghitung batas auto rejection (ARA/ARB), simulasi pembelian rata-rata (average up/down), serta estimasi target profit dan batas stop loss sesuai ketentuan bursa.
          </p>
        </section>

        {/* SECTION 1: ARA / ARB */}
        <AraArbSection fractionRules={fractionRules} />

        {/* SECTION 2: AVERAGE UP / DOWN */}
        <AvgUpDownSection />

        {/* SECTION 3: PREDIKSI TARGET JUAL / BELI */}
        <PredictionSection fractionRules={fractionRules} tax={tax} />

        {/* SECTION 4: FAQ ACCORDION (Cached via Server Cache) */}
        <FaqSection faqs={faqs} showHeader={true} />
      </main>

      <footer className="border-t border-border-custom bg-card/50 py-8 text-center mt-auto px-4">
        <div className="max-w-7xl mx-auto">
          <p className="font-bold text-main mb-1.5">
            <WebsiteBrand /> • Alat Analisis Saham BEI
          </p>
          <DynamicDisclaimer />
        </div>
      </footer>
    </div>
  );
}
