import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ArrowLeft, Calculator, ChevronRight } from 'lucide-react';
import { Metadata } from 'next';
import Footer from '@/components/layout/Footer';
import LandingHeader from '@/components/landing/LandingHeader';
import BlogSearchDropdown from '@/features/blog/components/BlogSearchDropdown';
import { getCachedArticles, getCachedCategories } from '@/lib/cached-data';
import styles from '../blog-acme.module.css';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}): Promise<Metadata> {
  const { q, category } = await searchParams;
  const queryText = q || category || 'Saham BEI';

  return {
    title: `Pencarian Artikel: "${queryText}" | HitungSaham Jurnal`,
    description: `Hasil pencarian artikel dan jurnal saham BEI untuk kata kunci "${queryText}".`,
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function BlogSearchPage({
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

  const popularPicks = searchResults.slice(0, 3).map((art) => ({
    title: art.title,
    category: art.category,
    slug: art.slug,
    readTime: '5 min baca',
  }));

  return (
    <div className={styles.page}>
      <LandingHeader />

      <main className={styles.container} style={{ paddingTop: '32px' }}>
        {/* BREADCRUMB */}
        <div className="mb-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#52534e] hover:text-[#111210] transition-colors"
          >
            <ArrowLeft size={14} /> Kembali ke Blog &amp; Artikel
          </Link>
        </div>

        {/* HERO PROMINENT SEARCHBAR SECTION */}
        <div className="w-full max-w-3xl mx-auto space-y-3 py-2 text-center mb-8">
          <div className="w-full">
            <BlogSearchDropdown
              articles={articles}
              basePath="/blog"
              placeholder="Cari kata kunci jurnal atau edukasi..."
              theme="acme"
              defaultValue={q}
            />
          </div>
          {q && (
            <p className="text-xs text-[#52534e] font-medium">
              Menampilkan hasil pencarian untuk kata kunci: <strong className="text-[#111210]">&quot;{q}&quot;</strong> ({searchResults.length} ditemukan)
            </p>
          )}
        </div>

        {/* CATEGORY PILLS BAR ACME STYLE */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-8">
          <Link
            href={q ? `/blog/search?q=${encodeURIComponent(q)}` : '/blog/search'}
            className={category === 'ALL' ? styles.categoryPillActive : styles.categoryPill}
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
                className={isActive ? styles.categoryPillActive : styles.categoryPill}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>

        {/* SEARCH RESULTS SPLIT LAYOUT */}
        {searchResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-4 my-8">
            <div className="w-16 h-16 rounded-full bg-[#111210] text-white flex items-center justify-center text-2xl font-bold">
              <Search size={28} />
            </div>
            <div className="space-y-1.5 max-w-md">
              <h2 className="text-2xl font-bold text-[#111210]">Tidak Ada Catatan Ditemukan</h2>
              <p className="text-xs text-[#52534e] leading-relaxed">
                Maaf, tidak ada catatan jurnal yang cocok dengan kata kunci &quot;{q || category}&quot;. Silakan coba pencarian lain.
              </p>
            </div>
            <Link
              href="/blog"
              className="px-6 py-2.5 rounded-full bg-[#111210] text-white text-xs font-bold hover:bg-black transition-colors"
            >
              Lihat Semua Catatan Jurnal
            </Link>
          </div>
        ) : (
          <div className={styles.splitLayout}>
            <div>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Daftar Hasil Pencarian ({searchResults.length})</h2>
              </div>

              <div className={styles.articlesGrid}>
                {searchResults.map((art) => (
                  <Link key={art.id} href={`/blog/${art.slug}`} className={styles.articleCard}>
                    <div className={styles.articleImage}>
                      <Image
                        src={art.coverImage || '/assets/images/img.png'}
                        alt={art.title}
                        fill
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className={styles.tagPill}>{art.category}</span>
                      <h2 className={styles.articleTitle}>{art.title}</h2>
                      <p className="text-xs text-gray-600 line-clamp-2 my-1">{art.excerpt}</p>
                      <div className={styles.metaInfo}>
                        Dipublikasikan {new Date(art.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <aside className={styles.sidebar}>
              <div className={styles.sidebarWidget}>
                <h3 className={styles.sidebarTitle}>Catatan Terkait</h3>
                <div className={styles.picksList}>
                  {popularPicks.map((pick, i) => (
                    <Link key={i} href={`/blog/${pick.slug}`} className={styles.pickItem}>
                      <div className={styles.pickMeta}>
                        <span className="font-bold text-slate-800">{pick.category}</span> • {pick.readTime}
                      </div>
                      <div className={styles.pickTitle}>{pick.title}</div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className={styles.promoWidget}>
                <div className={styles.promoTag}>
                  <Calculator size={14} className="inline mr-1" /> Simulasikan Portofolio
                </div>
                <h4 className={styles.promoTitle}>Kalkulator ARA/ARB &amp; Average Down</h4>
                <p className={styles.promoDesc}>
                  Hitung persentase batas auto rejection dan kebutuhan lot pembelian tambahan saham kamu secara gratis.
                </p>
                <Link href="/#calculator" className={styles.promoBtn}>
                  Coba Kalkulator Sekarang <ChevronRight size={14} className="inline ml-1" />
                </Link>
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* UNIFIED ACME FOOTER */}
      <Footer variant="acme" />
    </div>
  );
}

