import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BlogSearchDropdown from '@/features/blog/components/BlogSearchDropdown';
import { getCachedArticles, getCachedCategories } from '@/lib/cached-data';
import { Search, ArrowLeft, ArrowUpRight, Calendar, User } from 'lucide-react';
import { Metadata } from 'next';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}): Promise<Metadata> {
  const { q, category } = await searchParams;
  const queryText = q || category || 'Saham BEI';

  return {
    title: `Pencarian Artikel: "${queryText}" | HitungSaham Blog`,
    description: `Hasil pencarian artikel dan jurnal  saham BEI untuk kata kunci "${queryText}".`,
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function LandingOneBlogSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q = '', category = 'ALL' } = await searchParams;
  const [articles, categories] = await Promise.all([
    getCachedArticles(),
    getCachedCategories(),
  ]);

  const query = q.trim().toLowerCase();
  const activeCategory = category.trim().toLowerCase();

  const searchResults = articles.filter((art) => {
    const matchesCategory =
      activeCategory === 'all' || art.category.toLowerCase() === activeCategory;

    const matchesQuery =
      !query ||
      art.title.toLowerCase().includes(query) ||
      (art.excerpt && art.excerpt.toLowerCase().includes(query)) ||
      (art.category && art.category.toLowerCase().includes(query)) ||
      (art.content && art.content.toLowerCase().includes(query));

    return matchesCategory && matchesQuery;
  });

  return (
    <div className="flex flex-col min-h-screen bg-page text-main transition-colors duration-300">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full grow space-y-8">
        {/* BREADCRUMB NAV */}
        <div className="pt-2">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-main transition-colors"
          >
            <ArrowLeft size={14} /> Kembali ke Blog &amp; Artikel
          </Link>
        </div>

        {/* HERO PROMINENT SEARCHBAR SECTION (Agak Besar dengan Keyword) */}
        <div className="w-full max-w-3xl mx-auto space-y-3 py-2 text-center">
          <div className="w-full">
            <BlogSearchDropdown
              articles={articles}
              basePath="/blog"
              placeholder="Cari artikel, jurnal, atau edukasi saham..."
              defaultValue={q}
            />
          </div>
          {q && (
            <p className="text-xs text-muted font-medium">
              Menampilkan hasil pencarian untuk kata kunci: <strong className="text-main">&quot;{q}&quot;</strong> ({searchResults.length} ditemukan)
            </p>
          )}
        </div>

        {/* CATEGORY FILTER BAR */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <Link
            href={q ? `/blog/search?q=${encodeURIComponent(q)}` : '/blog/search'}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              category === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-xs'
                : 'bg-sub-slate text-sub hover:bg-sub-blue hover:text-acc-blue'
            }`}
          >
            Semua ({articles.length})
          </Link>
          {categories.map((cat) => {
            const isActive = category.toLowerCase() === cat.name.toLowerCase();
            const searchUrl = `/blog/search?${q ? `q=${encodeURIComponent(q)}&` : ''}category=${encodeURIComponent(cat.name)}`;
            return (
              <Link
                key={cat.id}
                href={searchUrl}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-xs'
                    : 'bg-sub-slate text-sub hover:bg-sub-blue hover:text-acc-blue'
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>

        {/* SEARCH RESULTS GRID / UN-BOXED EMPTY STATE */}
        {searchResults.length === 0 ? (
          /* EMPTY STATE (USER DIRECTIVE: "jangan menggunakan style card menyatu dengan bg saja") */
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-4 my-8">
            <div className="w-16 h-16 rounded-full bg-sub-blue text-acc-blue flex items-center justify-center text-2xl font-bold">
              <Search size={28} />
            </div>
            <div className="space-y-1.5 max-w-md">
              <h2 className="text-2xl font-black text-main">Tidak Ada Catatan Ditemukan</h2>
              <p className="text-xs text-muted leading-relaxed">
                Maaf, tidak ada catatan jurnal yang cocok dengan kata kunci &quot;{q || category}&quot;. Silakan coba pencarian lain.
              </p>
            </div>
            <Link
              href="/blog"
              className="px-6 py-2.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-black text-xs font-extrabold hover:bg-black transition-colors"
            >
              Lihat Semua Catatan Jurnal
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {searchResults.map((art) => (
              <Link
                key={art.id}
                href={`/blog/${art.slug}`}
                className="group bg-card rounded-2xl p-4 flex flex-col justify-between transition-colors hover:bg-sub-slate/50 border border-border-custom/40 shadow-xs"
              >
                <div className="space-y-3">
                  <div className="relative w-full h-48 rounded-xl overflow-hidden bg-sub-slate">
                    <Image
                      src={art.coverImage || '/assets/images/img.png'}
                      alt={art.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-3 py-1 rounded-full bg-slate-900/80 text-white text-[10px] font-extrabold uppercase tracking-wider">
                        {art.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-3 pt-1">
                    <h2 className="text-base font-extrabold text-main group-hover:text-acc-blue transition-colors leading-snug line-clamp-2">
                      {art.title}
                    </h2>
                    <div className="w-7 h-7 rounded-full bg-sub-slate flex items-center justify-center text-main shrink-0 mt-0.5">
                      <ArrowUpRight size={15} />
                    </div>
                  </div>

                  <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>

                <div className="pt-3 mt-3 flex items-center gap-2 text-xs text-muted font-medium border-t border-border-custom/30">
                  <div className="w-5 h-5 rounded-full bg-acc-blue/20 text-acc-blue flex items-center justify-center font-bold text-[9px]">
                    <User size={11} />
                  </div>
                  <span>{art.author || 'HitungSaham'}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {new Date(art.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* FOOTER */}
      </main>

      {/* UNIFIED FOOTER */}
      <Footer />
    </div>
  );
}
