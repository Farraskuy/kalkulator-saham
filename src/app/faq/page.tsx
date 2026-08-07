import React from 'react';
import Navbar from '@/components/layout/Navbar';
import FaqSection from '@/features/faq/components/FaqSection';
import Footer from '@/components/layout/Footer';
import { Metadata } from 'next';
import { HelpCircle } from 'lucide-react';
import { getCachedFaqs } from '@/lib/cached-data';

export const metadata: Metadata = {
  title: 'Pertanyaan Umum (FAQ) | HitungSaham.com',
  description:
    'Jawaban lengkap seputar penggunaan kalkulator saham, aturan fraksi BEI, batas ARA ARB, dan cara menghitung average down.',
};

export default async function FaqPage() {
  const faqs = await getCachedFaqs();

  return (
    <div className="flex flex-col min-h-screen bg-page text-main transition-colors duration-300">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full grow space-y-10">
        <section className="space-y-3 text-center pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sub-blue text-acc-blue text-xs font-extrabold mx-auto">
            <HelpCircle size={14} /> Pusat Bantuan &amp; FAQ
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-main tracking-tight">
            Pertanyaan yang Sering Diajukan
          </h1>
          <p className="text-sm text-muted max-w-xl mx-auto font-medium leading-relaxed">
            Temukan jawaban lengkap seputar kalkulasi ARA/ARB, strategi average down, dan regulasi fraksi bursa efek Indonesia.
          </p>
        </section>

        {/* Dynamic Individual FAQ Item Cards (Cached via Server Cache) */}
        <FaqSection faqs={faqs} showHeader={false} />
      </main>

      {/* UNIFIED FOOTER */}
      <Footer />
    </div>
  );
}
