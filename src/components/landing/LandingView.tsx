'use client';

import React, { Suspense, useState } from 'react';
import Image from 'next/image';
import {
  BarChart3,
  ShieldCheck,
  Target,
} from 'lucide-react';
import LandingHeader from './LandingHeader';
import LandingPredictionCalculator from './LandingPredictionCalculator';
import LandingAraArbCalculator from './LandingAraArbCalculator';
import LandingAvgCalculator from './LandingAvgCalculator';
import FaqSection from '@/features/faq/components/FaqSection';
import AnalyticsTracker from '@/components/analytics/AnalyticsTracker';
import Footer from '@/components/layout/Footer';
import type { FractionRule } from '@/types';

interface LandingViewProps {
  fractionRules?: FractionRule[];
  tax?: number;
  faqs?: { id: string; question: string; answer: string }[];
}

const tabs = [
  { id: 'target', label: 'Target Jual & Beli', icon: Target },
  { id: 'ara', label: 'ARA / ARB', icon: ShieldCheck },
  { id: 'average', label: 'Average Up / Down', icon: BarChart3 },
];

export default function LandingView({ fractionRules, tax, faqs: faqsProp }: LandingViewProps) {
  const [activeTab, setActiveTab] = useState<string>('target');
  const faqs = faqsProp || [];

  return (
    <div className="min-h-screen w-full overflow-x-hidden text-(--landing-text) bg-(--landing-bg) font-sans">
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>

      {/* NAVBAR */}
      <LandingHeader />

      <main>
        {/* HERO SECTION */}
        <section className="py-[48px] px-5 sm:px-8 md:px-16 max-w-[1200px] mx-auto pb-6" id="home">
          <p className="m-0 mb-4 text-xs sm:text-[13px] font-medium text-(--landing-muted) underline underline-offset-[3px]">
            HitungSaham / Kalkulator &amp; Blog Saham
          </p>

          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-[36px] items-end">
            <div>
              <h1 className="m-0 text-(--landing-text) text-[34px] sm:text-[clamp(34px,3.8vw,56px)] leading-[1.1] tracking-[-2px] font-bold">
                Hitung Profit &amp;<br />Risiko Saham
              </h1>
            </div>
            <div className="mt-1.5 text-(--landing-muted) text-sm leading-[1.65] font-normal">
              Simulasi perhitungan batas Auto Rejection (ARA/ARB), simulasi pembelian rata-rata (average down), serta estimasi target profit &amp; stop loss akurat sesuai fraksi harga resmi.
            </div>
          </div>
        </section>

        {/* HERO BANNER IMAGE CONTAINER */}
        <div className="max-w-[1200px] mx-auto mt-4 px-4 sm:px-8 md:px-16">
          <div className="relative w-full h-[clamp(320px,32vw,480px)] rounded-xl overflow-hidden bg-(--landing-inverse-bg) after:content-[''] after:absolute after:inset-0 after:z-10 after:bg-(--landing-image-scrim) after:pointer-events-none">
            <Image
              src="/assets/images/img.png"
              alt="Grafik dan Pasar Saham Indonesia"
              fill
              priority
              sizes="100vw"
              className="object-cover object-[center_40%]"
            />
            <div className="absolute z-20 left-[clamp(24px,4vw,48px)] bottom-9 flex flex-col text-(--landing-inverse-text) drop-shadow-md">
              <span className="text-[11px] font-semibold uppercase tracking-[2px]">Analisis Presisi</span>
              <strong className="mt-1 text-[clamp(20px,2.4vw,32px)] font-medium tracking-[-0.5px]">Keputusan Investasi Lebih Percaya Diri.</strong>
            </div>
          </div>
        </div>

        {/* CALCULATOR SECTION */}
        <section className="max-w-[1200px] mx-auto py-14 px-4 sm:px-8 md:px-16 pb-18" id="calculator">
          <div className="bg-(--landing-card) rounded-2xl p-4 sm:p-[36px_32px] border border-(--landing-border) min-w-0">
            {/* Segmented Tab Controller */}
            <div
              className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 bg-(--landing-soft-strong) p-1.5 rounded-2xl w-full max-w-2xl mx-auto mb-7 sm:mb-9"
              role="tablist"
              aria-label="Pilih kalkulator saham."
            >
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  className={`min-h-[42px] sm:min-h-[44px] px-4 py-2.5 border-0 rounded-xl flex items-center justify-center gap-2 text-(--landing-muted) hover:text-(--landing-text) hover:bg-(--landing-soft) bg-transparent font-inherit text-xs font-semibold w-full cursor-pointer transition-all duration-200 ${
                    activeTab === id ? '!bg-(--landing-control) !text-(--landing-text) shadow-[0_0_0_1px_var(--landing-border)]' : ''
                  }`}
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === id}
                  onClick={() => setActiveTab(id)}
                >
                  <span className="w-4 h-4 grid place-items-center shrink-0 text-current transition-all">
                    <Icon size={14} strokeWidth={2.4} />
                  </span>
                  <span className="whitespace-normal text-center">{label}</span>
                </button>
              ))}
            </div>

            {/* Active Calculator Component */}
            <div className="w-full min-w-0 landing-active-calc">
              <div hidden={activeTab !== 'target'}>
                <LandingPredictionCalculator fractionRules={fractionRules} tax={tax} />
              </div>
              <div hidden={activeTab !== 'ara'}>
                <LandingAraArbCalculator fractionRules={fractionRules} />
              </div>
              <div hidden={activeTab !== 'average'}>
                <LandingAvgCalculator />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ ACCORDION SECTION */}
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 md:px-16 pb-20" id="faq">
          <FaqSection faqs={faqs} showHeader={true} theme="acme" />
        </div>
      </main>

      {/* UNIFIED ACME FOOTER */}
      <Footer variant="acme" />
    </div>
  );
}

