'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BarChart3,
  ShieldCheck,
  Target,
} from 'lucide-react';
import styles from './landing-2.module.css';
import AppLogo from '@/components/layout/AppLogo';
import LandingTwoHeader from './components/LandingTwoHeader';
import LandingTwoPredictionCalculator from './components/LandingTwoPredictionCalculator';
import LandingTwoAraArbCalculator from './components/LandingTwoAraArbCalculator';
import LandingTwoAvgCalculator from './components/LandingTwoAvgCalculator';
import FaqSection from '@/features/faq/components/FaqSection';
import AnalyticsTracker from '@/components/analytics/AnalyticsTracker';
import DynamicDisclaimer from '@/components/layout/DynamicDisclaimer';
import { FractionRule } from '@/lib/calculations';

interface LandingTwoProps {
  fractionRules?: FractionRule[];
  tax?: number;
  faqs?: { id: string; question: string; answer: string }[];
}

const tabs = [
  { id: 'target', label: 'Target Jual & Beli', icon: Target },
  { id: 'ara', label: 'ARA / ARB BEI', icon: ShieldCheck },
  { id: 'average', label: 'Average Up / Down', icon: BarChart3 },
];

const fallbackFaqs = [
  {
    id: 'l2-faq-1',
    question: 'Bagaimana cara kerja Kalkulator ARA & ARB di HitungSaham?',
    answer:
      'Kalkulator ARA (Auto Rejection Atas) dan ARB (Auto Rejection Bawah) menghitung batas maksimum kenaikan dan penurunan harga saham harian secara otomatis sesuai dengan regulasi fraksi harga resmi Bursa Efek Indonesia (BEI).',
  },
  {
    id: 'l2-faq-2',
    question: 'Apakah biaya transaksi sekuritas (Beli/Jual) dimasukkan dalam kalkulasi?',
    answer:
      'Ya. Anda dapat menyesuaikan persentase fee beli (default ~0.15%) dan fee jual (default ~0.25% termasuk PPh 0.1%) agar hasil proyeksi keuntungan bersih dan modal saham lebih akurat.',
  },
  {
    id: 'l2-faq-3',
    question: 'Bagaimana rumus Average Down dihitung?',
    answer:
      'Harga rata-rata baru dihitung dengan menjumlahkan total modal lama (harga awal × lot lama × 100) ditambah modal baru (harga baru × lot baru × 100), kemudian dibagi dengan total keseluruhan lot yang dimiliki.',
  },
  {
    id: 'l2-faq-4',
    question: 'Apakah batas ARA/ARB BEI 2026 sudah menggunakan aturan simetris?',
    answer:
      'Ya, kalkulator kami selalu diperbarui mengikuti ketentuan simetris BEI terbaru berdasarkan rentang harga saham (Rp 50-200: 35%, Rp 200-5000: 25%, >Rp 5000: 20%).',
  },
];

export default function LandingTwo({ fractionRules, tax, faqs: faqsProp }: LandingTwoProps) {
  const [activeTab, setActiveTab] = useState<string>('target');
  const faqs = faqsProp && faqsProp.length > 0 ? faqsProp : fallbackFaqs;

  return (
    <div className={styles.page}>
      <AnalyticsTracker />

      {/* NAVBAR (Acme Style Clean Header with Offcanvas Drawer) */}
      <LandingTwoHeader />

      <main>
        {/* HERO SECTION */}
        <section className={styles.hero} id="home">
          <p className={styles.breadcrumb}>HitungSaham / Kalkulator &amp; Jurnal Saham BEI</p>

          <div className={styles.heroContentGrid}>
            <div className={styles.heroLeft}>
              <h1>Hitung Profit &amp;<br />Risiko Saham BEI</h1>
            </div>
            <div className={styles.heroRightCopy}>
              Simulasi perhitungan batas Auto Rejection (ARA/ARB), simulasi pembelian rata-rata (average down), serta estimasi target profit &amp; stop loss akurat sesuai fraksi resmi BEI.
            </div>
          </div>
        </section>

        {/* HERO BANNER IMAGE CONTAINER */}
        <div className={styles.bannerWrap}>
          <div className={styles.heroImageContainer}>
            <Image
              src="/assets/images/img.png"
              alt="Grafik dan Pasar Saham Bursa Efek Indonesia"
              fill
              priority
              sizes="100vw"
            />
            <div className={styles.imageOverlay}>
              <span>Analisis Presisi BEI</span>
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

      {/* PROFESSIONAL CLEAN FOOTER */}
      <footer className={styles.footer} id="about">
        <div className={styles.footerContainer}>
          <div className={styles.footerGrid}>
            {/* BRAND COLUMN */}
            <div className={styles.footerColBrand}>
              <div className={styles.footerBrandLogo}>
                <AppLogo size={26} variant="dark-icon" />
                <span>HitungSaham</span>
              </div>
              <p className={styles.footerBrandDesc}>
                Platform personal berisi kalkulator analisis dan catatan jurnal trading saham bursa efek Indonesia (BEI).
              </p>
            </div>

            {/* QUICK LINKS */}
            <div>
              <div className={styles.footerColTitle}>Kalkulator Saham</div>
              <ul className={styles.footerNavList}>
                <li><a href="#calculator" onClick={() => setActiveTab('target')}>Prediksi Target Jual/Beli</a></li>
                <li><a href="#calculator" onClick={() => setActiveTab('ara')}>Auto Rejection (ARA/ARB)</a></li>
                <li><a href="#calculator" onClick={() => setActiveTab('average')}>Average Up / Down</a></li>
                <li><Link href="/landing-2/faq">Pertanyaan Umum (FAQ)</Link></li>
              </ul>
            </div>

            {/* JURNAL & NAVIGASI */}
            <div>
              <div className={styles.footerColTitle}>Jurnal &amp; Navigasi</div>
              <ul className={styles.footerNavList}>
                <li><Link href="/landing-2/blog">Jurnal  &amp; Catatan</Link></li>
                <li><Link href="/landing-2/faq">Pusat Bantuan &amp; FAQ</Link></li>
                <li><Link href="/admin">Admin Panel CMS</Link></li>
              </ul>
            </div>

            {/* PROFIL PENGELOLA */}
            <div>
              <div className={styles.footerColTitle}>Profil Pengelola</div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Dikelola secara mandiri sebagai ruang berbagi catatan pengalaman transaksi dan penyedia alat kalkulasi matematis saham ritel.
              </p>
            </div>
          </div>

          {/* FOOTER BOTTOM (LEGAL DISCLAIMER & COPYRIGHT) */}
          <div className={styles.footerBottom}>
            <div className={styles.footerCopyText}>
              &copy; {new Date().getFullYear()} HitungSaham.com • Catatan  &amp; Alat Analisis Saham BEI
            </div>
            <div className={styles.footerDisclaimerBox}>
              <DynamicDisclaimer />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
