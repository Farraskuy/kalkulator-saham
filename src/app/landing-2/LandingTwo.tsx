'use client';

import React, { Suspense, useState } from 'react';
import Image from 'next/image';
import {
  BarChart3,
  ShieldCheck,
  Target,
} from 'lucide-react';
import styles from './landing-2.module.css';
import LandingTwoHeader from './components/LandingTwoHeader';
import LandingTwoPredictionCalculator from './components/LandingTwoPredictionCalculator';
import LandingTwoAraArbCalculator from './components/LandingTwoAraArbCalculator';
import LandingTwoAvgCalculator from './components/LandingTwoAvgCalculator';
import FaqSection from '@/features/faq/components/FaqSection';
import AnalyticsTracker from '@/components/analytics/AnalyticsTracker';
import Footer from '@/components/layout/Footer';
import { FractionRule } from '@/lib/calculations';

interface LandingTwoProps {
  fractionRules?: FractionRule[];
  tax?: number;
  faqs?: { id: string; question: string; answer: string }[];
}

const tabs = [
  { id: 'target', label: 'Target Jual & Beli', icon: Target },
  { id: 'ara', label: 'ARA / ARB', icon: ShieldCheck },
  { id: 'average', label: 'Average Up / Down', icon: BarChart3 },
];

export default function LandingTwo({ fractionRules, tax, faqs: faqsProp }: LandingTwoProps) {
  const [activeTab, setActiveTab] = useState<string>('target');
  const faqs = faqsProp || [];

  return (
    <div className={styles.page}>
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>

      {/* NAVBAR (Acme Style Clean Header with Offcanvas Drawer) */}
      <LandingTwoHeader />

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

        {/* CALCULATOR SECTION (Acme Segmented Card Form Style) */}
        <section className={styles.calculatorSection} id="calculator">
          <div className={styles.calculatorContainer}>
            {/* Acme Segmented Tab Pill Controller */}
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
              {activeTab === 'target' && <LandingTwoPredictionCalculator fractionRules={fractionRules} tax={tax} />}
              {activeTab === 'ara' && <LandingTwoAraArbCalculator fractionRules={fractionRules} />}
              {activeTab === 'average' && <LandingTwoAvgCalculator />}
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
