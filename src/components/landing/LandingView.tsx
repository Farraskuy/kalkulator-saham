'use client';

import React, { Suspense, useState } from 'react';
import Image from 'next/image';
import {
  BarChart3,
  ShieldCheck,
  Target,
} from 'lucide-react';
import styles from './landing.module.css';
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
    <div className={styles.page}>
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>

      {/* NAVBAR */}
      <LandingHeader />

      <main>
        {/* HERO SECTION */}
        <section className={styles.hero} id="home">
          <p className={styles.breadcrumb}>HitungSaham / Kalkulator &amp; Blog Saham</p>

          <div className={styles.heroContentGrid}>
            <div className={styles.heroLeft}>
              <h1>Hitung Profit &amp;<br />Risiko Saham</h1>
            </div>
            <div className={styles.heroRightCopy}>
              Simulasi perhitungan batas Auto Rejection (ARA/ARB), simulasi pembelian rata-rata (average down), serta estimasi target profit &amp; stop loss akurat sesuai fraksi harga resmi.
            </div>
          </div>
        </section>

        {/* HERO BANNER IMAGE CONTAINER */}
        <div className={styles.bannerWrap}>
          <div className={styles.heroImageContainer}>
            <Image
              src="/assets/images/img.png"
              alt="Grafik dan Pasar Saham Indonesia"
              fill
              priority
              sizes="100vw"
            />
            <div className={styles.imageOverlay}>
              <span>Analisis Presisi</span>
              <strong>Keputusan Investasi Lebih Percaya Diri.</strong>
            </div>
          </div>
        </div>

        {/* CALCULATOR SECTION */}
        <section className={styles.calculatorSection} id="calculator">
          <div className={styles.calculatorContainer}>
            {/* Segmented Tab Controller */}
            <div className={styles.calculatorTabs} role="tablist" aria-label="Pilih kalkulator saham">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  className={`${styles.tab} ${activeTab === id ? styles.activeTab : ''}`}
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === id}
                  onClick={() => setActiveTab(id)}
                >
                  <span className={styles.tabIcon}>
                    <Icon size={13} strokeWidth={2.4} />
                  </span>
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Active Calculator Component */}
            <div className={styles.activeCalculator}>
              {activeTab === 'target' && <LandingPredictionCalculator fractionRules={fractionRules} tax={tax} />}
              {activeTab === 'ara' && <LandingAraArbCalculator fractionRules={fractionRules} />}
              {activeTab === 'average' && <LandingAvgCalculator />}
            </div>
          </div>
        </section>

        {/* FAQ ACCORDION SECTION */}
        <div className={styles.faqWrap} id="faq">
          <FaqSection faqs={faqs} showHeader={true} theme="acme" />
        </div>
      </main>

      {/* UNIFIED ACME FOOTER */}
      <Footer variant="acme" />
    </div>
  );
}
