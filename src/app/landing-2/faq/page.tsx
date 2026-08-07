import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle, ChevronRight, Calculator } from 'lucide-react';
import LandingTwoHeader from '../components/LandingTwoHeader';
import FaqSection from '@/features/faq/components/FaqSection';
import DynamicDisclaimer from '@/components/layout/DynamicDisclaimer';
import AppLogo from '@/components/layout/AppLogo';
import { getCachedFaqs } from '@/lib/cached-data';
import styles from '../landing-2.module.css';

export const metadata: Metadata = {
  title: 'FAQ Bantuan & Panduan | HitungSaham Landing 2',
  description:
    'Pertanyaan umum seputar penggunaan kalkulator ARA ARB, simulasi average down, dan regulasi fraksi BEI.',
};

export default async function LandingTwoFaqPage() {
  const faqs = await getCachedFaqs();

  return (
    <div className={styles.page}>
      {/* HEADER NAVBAR (Identical Acme Style Header for Landing 2) */}
      <LandingTwoHeader />

      <main className="max-w-[1200px] w-full mx-auto px-5 sm:px-8 md:px-16 py-12 grow space-y-10 text-[#111210]">
        <section className="space-y-3 text-center pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ebebeb] text-[#111210] text-xs font-bold mx-auto border border-black/5">
            <HelpCircle size={15} /> Pusat Bantuan &amp; FAQ
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-[#111210] tracking-tight">
            Pertanyaan yang Sering Diajukan
          </h1>
          <p className="text-xs sm:text-sm text-[#52534e] max-w-xl mx-auto font-medium leading-relaxed">
            Jawaban lengkap seputar penggunaan kalkulator ARA/ARB, simulasi average down, dan aturan fraksi bursa efek Indonesia.
          </p>
        </section>

        {/* ACME STYLE INDIVIDUAL FAQ ITEM CARDS (Cached via Server Cache) */}
        <FaqSection faqs={faqs} showHeader={false} theme="acme" />

        {/* PROMO CALC CARD */}
        <div className="p-8 bg-[#111210] text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#a0a09c] flex items-center gap-1.5 mb-1">
              <Calculator size={14} /> HitungSaham Tools
            </div>
            <h3 className="text-xl font-bold text-white">Butuh Menghitung Average Down Saham Kamu?</h3>
            <p className="text-xs text-gray-300 mt-1 max-w-md">
              Gunakan kalkulator simulasi gratis kami untuk menghitung target harga rata-rata dan batas ARA/ARB BEI secara presisi.
            </p>
          </div>
          <Link
            href="/landing-2#calculator"
            className="bg-white text-[#111210] font-bold text-xs px-5 py-3 rounded-xl whitespace-nowrap hover:bg-gray-200 transition-colors"
          >
            Buka Kalkulator <ChevronRight size={14} className="inline ml-1" />
          </Link>
        </div>
      </main>

      {/* FOOTER ACME CLEAN STYLE */}
      <footer className={styles.footer}>
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
                <li><Link href="/landing-2">Prediksi Target Jual/Beli</Link></li>
                <li><Link href="/landing-2">Auto Rejection (ARA/ARB)</Link></li>
                <li><Link href="/landing-2">Average Up / Down</Link></li>
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

          {/* FOOTER BOTTOM */}
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
