import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle, ChevronRight, Calculator } from 'lucide-react';
import LandingHeader from '@/components/landing/LandingHeader';
import FaqSection from '@/features/faq/components/FaqSection';
import Footer from '@/components/layout/Footer';
import { getCachedFaqs } from '@/lib/cached-data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'FAQ Bantuan & Panduan | HitungSaham.com',
  description:
    'Pertanyaan umum seputar penggunaan kalkulator ARA ARB, simulasi average down, dan regulasi fraksi BEI.',
};

export default async function FaqPage() {
  const faqs = await getCachedFaqs();

  return (
    <div className="min-h-screen w-full overflow-x-hidden text-(--landing-text) bg-(--landing-bg) font-sans">
      {/* HEADER NAVBAR */}
      <LandingHeader />

      <main className="max-w-[1200px] w-full mx-auto px-5 sm:px-8 md:px-16 py-12 grow space-y-10 text-main">
        <section className="space-y-3 text-center pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sub-slate text-main text-xs font-bold mx-auto border border-border-custom">
            <HelpCircle size={15} /> Pusat Bantuan &amp; FAQ
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-main tracking-tight">
            Pertanyaan yang Sering Diajukan
          </h1>
          <p className="text-xs sm:text-sm text-muted max-w-xl mx-auto font-medium leading-relaxed">
            Jawaban lengkap seputar penggunaan kalkulator ARA/ARB, simulasi average down, dan aturan fraksi bursa efek Indonesia.
          </p>
        </section>

        {/* ACME STYLE INDIVIDUAL FAQ ITEM CARDS */}
        <FaqSection faqs={faqs} showHeader={false} theme="acme" />

        {/* PROMO CALC CARD */}
        <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-white/10 bg-slate-900 p-8 text-white sm:flex-row">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-muted flex items-center gap-1.5 mb-1">
              <Calculator size={14} /> HitungSaham Tools
            </div>
            <h3 className="text-xl font-bold text-white">Butuh Menghitung Average Down Saham Kamu?</h3>
            <p className="text-xs text-gray-300 mt-1 max-w-md">
              Gunakan kalkulator simulasi gratis kami untuk menghitung target harga rata-rata dan batas ARA/ARB BEI secara presisi.
            </p>
          </div>
          <Link
            href="/#calculator"
            className="whitespace-nowrap rounded-xl bg-white px-5 py-3 text-xs font-bold text-slate-950 transition-colors hover:bg-slate-200"
          >
            Buka Kalkulator <ChevronRight size={14} className="inline ml-1" />
          </Link>
        </div>
      </main>

      {/* UNIFIED ACME FOOTER */}
      <Footer variant="acme" />
    </div>
  );
}
