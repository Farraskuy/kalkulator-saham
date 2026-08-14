import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ArrowLeft, Calculator, ChevronRight } from 'lucide-react';
import { Metadata } from 'next';
import Footer from '@/components/layout/Footer';
import LandingHeader from '@/components/landing/LandingHeader';
import BlogSearchDropdown from '@/features/blog/components/BlogSearchDropdown';
import BlogPagination from '@/features/blog/components/BlogPagination';
import CategoryDropdownFilter from '@/features/blog/components/CategoryDropdownFilter';
import { getCachedArticles, getCachedCategories } from '@/lib/cached-data';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
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
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const { q = '', category = 'ALL', page: pageParam } = await searchParams;
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

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(searchResults.length / pageSize));
  const requestedPage = Number.parseInt(pageParam || '1', 10);
  const currentPage = Number.isFinite(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), totalPages)
    : 1;
  const paginatedResults = searchResults.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const searchPageHref = (page: number) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category !== 'ALL') params.set('category', category);
    params.set('page', String(page));
    return `/blog/search?${params.toString()}`;
  };

  const popularPicks = searchResults.slice(0, 3).map((art) => ({
    title: art.title,
    category: art.category,
    slug: art.slug,
    readTime: '5 min baca',
  }));

  const categoryPillClass = "inline-flex items-center justify-center px-5 py-[9px] rounded-full text-xs font-semibold text-(--landing-muted) bg-(--landing-soft) hover:bg-(--landing-soft-strong) hover:text-(--landing-text) no-underline whitespace-nowrap transition-all duration-200";
  const categoryPillActiveClass = "inline-flex items-center justify-center px-5 py-[9px] rounded-full text-xs font-bold bg-(--landing-inverse-bg) text-(--landing-inverse-text) no-underline whitespace-nowrap";

  return (
    <div className="min-h-screen w-full overflow-x-hidden text-(--landing-text) bg-(--landing-bg) font-sans">
      <LandingHeader />

      <main className="max-w-[1200px] mx-auto px-5 sm:px-8 md:px-16 pt-8 pb-[72px]">
        {/* BREADCRUMB */}
        <div className="mb-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-main transition-colors"
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
            <p className="text-xs text-muted font-medium">
              Menampilkan hasil pencarian untuk kata kunci: <strong className="text-main">&quot;{q}&quot;</strong> ({searchResults.length} ditemukan)
            </p>
          )}
        </div>

        {/* MOBILE VIEW: CUSTOM DROPDOWN WITH SEARCH */}
        <div className="block sm:hidden w-full mb-4">
          <CategoryDropdownFilter
            categories={categories.map((c) => c.name)}
            activeCategory={category}
            searchQuery={q}
            totalArticles={articles.length}
            theme="acme"
          />
        </div>

        {/* TABLET / DESKTOP: CATEGORY PILLS BAR */}
        <div className="hidden sm:flex items-center gap-2 w-full overflow-x-auto overscroll-x-contain pb-2 snap-x snap-proximity landing-scroller [&>*]:shrink-0 [&>*]:snap-start">
          <Link
            href={q ? `/blog/search?q=${encodeURIComponent(q)}` : '/blog/search'}
            className={category === 'ALL' ? categoryPillActiveClass : categoryPillClass}
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
                className={isActive ? categoryPillActiveClass : categoryPillClass}
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
              <h2 className="text-2xl font-bold text-main">Tidak Ada Catatan Ditemukan</h2>
              <p className="text-xs text-muted leading-relaxed">
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
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-9 mt-9">
            <div>
              <div className="mb-6 pb-3 border-b border-(--landing-border)">
                <h2 className="text-[22px] font-bold text-(--landing-text) tracking-[-0.5px] m-0">Daftar Hasil Pencarian ({searchResults.length})</h2>
              </div>

              <div className="flex flex-col gap-5">
                {paginatedResults.map((art) => (
                  <Link key={art.id} href={`/blog/${art.slug}`} className="group bg-(--landing-card) rounded-[14px] p-[22px] no-underline text-inherit flex flex-col sm:flex-row gap-5  hover:bg-(--landing-soft) transition-all duration-200">
                    <div className="relative w-full sm:w-[140px] h-[160px] sm:h-[105px] rounded-lg overflow-hidden shrink-0 bg-(--landing-inverse-bg)">
                      <Image
                        src={art.coverImage || '/assets/images/img.png'}
                        alt={art.title}
                        fill
                        className="object-cover transition-transform duration-300 "
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-[0.5px] bg-(--landing-soft-strong) text-(--landing-text) w-fit">{art.category}</span>
                      <h2 className="my-1 text-base font-bold text-(--landing-text) leading-[1.35]">{art.title}</h2>
                      <p className="my-1 line-clamp-2 text-xs leading-relaxed text-muted">{art.excerpt}</p>
                      <div className="text-xs font-medium text-(--landing-faint) mt-auto pt-3">
                        Dipublikasikan {new Date(art.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <BlogPagination
                currentPage={currentPage}
                totalPages={totalPages}
                hrefForPage={searchPageHref}
              />
            </div>

            <aside className="flex flex-col gap-6">
              <div className="bg-(--landing-card) rounded-[14px] p-6 border border-(--landing-border)">
                <h3 className="text-[15px] font-bold text-(--landing-text) m-0 mb-4 pb-[10px] border-b border-(--landing-border)">Catatan Terkait</h3>
                <div className="flex flex-col gap-3.5">
                  {popularPicks.map((pick, i) => (
                    <Link key={i} href={`/blog/${pick.slug}`} className="group/pick no-underline text-inherit transition-colors">
                      <div className="text-[11px] text-(--landing-faint)">
                        <span className="font-bold text-sub">{pick.category}</span> • {pick.readTime}
                      </div>
                      <div className="text-xs font-semibold text-(--landing-text) leading-[1.4] mt-0.5 group-hover/pick:text-(--accent-blue) transition-colors">{pick.title}</div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="bg-(--landing-inverse-bg) text-(--landing-inverse-text) border border-white/12 rounded-[14px] p-6 sm:p-7 flex flex-col gap-3">
                <div className="text-[11px] font-bold tracking-[1.5px] uppercase text-[#aebbd0]">
                  <Calculator size={14} className="inline mr-1" /> Simulasikan Portofolio
                </div>
                <h4 className="text-[18px] font-bold leading-[1.35] m-0">Kalkulator ARA/ARB &amp; Average Down</h4>
                <p className="text-xs leading-[1.5] text-[#cbd5e1] m-0">
                  Hitung persentase batas auto rejection dan kebutuhan lot pembelian tambahan saham kamu secara gratis.
                </p>
                <Link href="/#calculator" className="inline-flex items-center justify-center px-[18px] py-2.5 bg-(--landing-cta-bg) text-(--landing-cta-text) rounded-lg text-xs font-bold no-underline mt-1 hover:bg-[#e2e8f0] transition-colors">
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

