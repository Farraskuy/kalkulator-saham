import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import LandingOneBlogFilter from '@/features/blog/components/LandingOneBlogFilter';
import { getCachedArticles, getCachedCategories } from '@/lib/cached-data';

export const metadata: Metadata = {
  title: 'Blog & Catatan Artikel Pribadi | HitungSaham.com',
  description: 'Kumpulan blog artikel opini pribadi, catatan pengalaman pengelola, dan alat simulasi kalkulasi matematis saham.',
  keywords: ['blog saham', 'artikel pribadi', 'catatan opini saham', 'average down saham', 'kalkulator saham'],
  openGraph: {
    title: 'Blog & Catatan Artikel Pribadi | HitungSaham.com',
    description: 'Catatan artikel opini pribadi, ulasan pengalaman, dan alat simulasi matematis saham.',
    url: 'https://hitungsaham.com/blog',
    siteName: 'HitungSaham.com',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog & Catatan Artikel Pribadi | HitungSaham.com',
    description: 'Catatan artikel opini pribadi, ulasan pengalaman, dan alat simulasi matematis saham.',
  },
  alternates: {
    canonical: 'https://hitungsaham.com/blog',
  },
};

export default async function LandingOneBlogPage() {
  const [articles, categories] = await Promise.all([
    getCachedArticles(),
    getCachedCategories(),
  ]);

  const mainHero = articles[0] || null;
  const secondaryHero1 = articles[1] || null;
  const secondaryHero2 = articles[2] || null;

  // JSON-LD Structured Data Schema for Blog & Collection
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'HitungSaham Blog & Catatan Artikel Pribadi',
    description: 'Kumpulan artikel opini pribadi dan simulasi kalkulasi matematis saham.',
    url: 'https://hitungsaham.com/blog',
    blogPost: articles.map((art) => ({
      '@type': 'BlogPosting',
      headline: art.title,
      description: art.excerpt,
      url: `https://hitungsaham.com/blog/${art.slug}`,
      datePublished: new Date(art.publishedAt).toISOString(),
      author: {
        '@type': 'Person',
        name: art.author || 'HitungSaham',
      },
    })),
  };

  return (
    <div className="flex flex-col min-h-screen bg-page text-main transition-colors duration-300">
      {/* Inject Structured JSON-LD Schema for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full grow space-y-10">
        {/* DATABASE INTEGRATED BENTO HERO OR EMPTY STATE */}
        {articles.length === 0 ? (
          <section className="flex flex-col items-center justify-center py-20 px-4 text-center bg-sub-slate/50 rounded-3xl border border-dashed border-border-custom space-y-4 my-6">
            <div className="space-y-1.5 max-w-md">
              <h1 className="text-2xl font-extrabold text-main">Belum Ada Artikel Dipublikasikan</h1>
              <p className="text-xs text-muted leading-relaxed">
                Saat ini belum ada artikel blog pribadi yang dipublikasikan di database. Silakan kembali lagi nanti.
              </p>
            </div>
            <Link
              href="/"
              className="px-6 py-2.5 rounded-full bg-[#111210] text-white text-xs font-extrabold hover:bg-black transition-colors inline-flex items-center gap-2"
            >
              <span>Kembali ke Beranda</span>
            </Link>
          </section>
        ) : (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
            {/* Main Big Feature Card (Left - 7 cols) */}
            {mainHero && (
              <Link
                href={`/blog/${mainHero.slug}`}
                className="lg:col-span-7 group relative h-[380px] sm:h-[440px] rounded-2xl overflow-hidden flex flex-col justify-end p-6 sm:p-8 text-white transition-opacity duration-200 hover:opacity-95"
              >
                <Image
                  src={mainHero.coverImage || '/assets/images/img.png'}
                  alt={mainHero.title}
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />

                <div className="relative z-10 space-y-4">
                  <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight tracking-tight text-white">
                    {mainHero.title}
                  </h1>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 text-xs text-gray-300 border-t border-white/15">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">PENULIS</span>
                        <span className="font-bold text-white">{mainHero.author || 'HitungSaham'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">DIPUBLIKASIKAN</span>
                        <span className="font-bold text-white">
                          {new Date(mainHero.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-white/20 font-extrabold text-[11px] uppercase tracking-wider text-white">
                        {mainHero.category}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Right Stacked Column (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              {secondaryHero1 && (
                <Link
                  href={`/blog/${secondaryHero1.slug}`}
                  className="group relative h-[180px] sm:h-[208px] rounded-2xl overflow-hidden flex flex-col justify-end p-5 text-white transition-opacity duration-200 hover:opacity-95"
                >
                  <Image
                    src={secondaryHero1.coverImage || '/assets/images/img.png'}
                    alt={secondaryHero1.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                  <div className="relative z-10 space-y-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 font-extrabold text-[10px] uppercase tracking-wider text-white w-fit block">
                      {secondaryHero1.category}
                    </span>
                    <h2 className="text-base sm:text-lg font-extrabold leading-snug text-white">
                      {secondaryHero1.title}
                    </h2>
                  </div>
                </Link>
              )}

              {secondaryHero2 && (
                <Link
                  href={`/blog/${secondaryHero2.slug}`}
                  className="group relative h-[180px] sm:h-[208px] rounded-2xl overflow-hidden flex flex-col justify-end p-5 text-white transition-opacity duration-200 hover:opacity-95"
                >
                  <Image
                    src={secondaryHero2.coverImage || '/assets/images/img.png'}
                    alt={secondaryHero2.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                  <div className="relative z-10 space-y-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 font-extrabold text-[10px] uppercase tracking-wider text-white w-fit block">
                      {secondaryHero2.category}
                    </span>
                    <h2 className="text-base sm:text-lg font-extrabold leading-snug text-white">
                      {secondaryHero2.title}
                    </h2>
                  </div>
                </Link>
              )}
            </div>
          </section>
        )}

        {/* SECTION HEADER & INTERACTIVE DYNAMIC BLOG FILTER CLIENT */}
        {articles.length > 0 && (
          <section className="space-y-6 pt-2">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-main">Blog &amp; Artikel Pribadi</h2>
              <p className="text-xs sm:text-sm text-muted mt-1 font-medium">
                Catatan artikel opini pribadi pengelola, ulasan pengalaman, dan simulasi perhitungan matematis saham.
              </p>
            </div>

            <LandingOneBlogFilter
              initialArticles={articles}
              categories={categories}
            />
          </section>
        )}

      </main>

      {/* UNIFIED FOOTER */}
      <Footer />
    </div>
  );
}
