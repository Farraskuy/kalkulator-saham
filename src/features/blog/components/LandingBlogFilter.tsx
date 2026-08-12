'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calculator, ChevronRight } from 'lucide-react';
import { ArticleData, CategoryData } from '@/types';
import BlogSearchDropdown from './BlogSearchDropdown';
import BlogPagination from './BlogPagination';

interface LandingBlogFilterProps {
  allArticles: ArticleData[];
  articles: ArticleData[];
  categories: CategoryData[];
  currentPage: number;
  totalPages: number;
  totalArticles: number;
}

export default function LandingBlogFilter({
  allArticles,
  articles,
  categories,
  currentPage,
  totalPages,
  totalArticles,
}: LandingBlogFilterProps) {
  const categoryList = useMemo(() => {
    const list: string[] = [];
    categories.forEach((category) => {
      if (category.name && !list.includes(category.name)) list.push(category.name);
    });
    allArticles.forEach((article) => {
      if (article.category && !list.includes(article.category)) list.push(article.category);
    });
    return list;
  }, [allArticles, categories]);

  const traderPicks = allArticles.filter((article) => article.isTraderPick).slice(0, 3).map((article) => ({
    title: article.title,
    category: article.category,
    slug: article.slug,
    readTime: '5 min baca',
  }));

  return (
    <section id="articles" className="space-y-8">
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm sm:text-base font-bold text-(--landing-text) m-0">Cari Artikel/Blog</h3>
          <BlogSearchDropdown
            articles={allArticles}
            basePath="/blog"
            placeholder="Cari artikel / jurnal..."
            theme="acme"
          />
        </div>

        <nav className="flex flex-wrap items-center gap-2 w-full" aria-label="Jelajahi kategori artikel">
          <Link href="/blog/search" className="inline-flex items-center justify-center px-5 py-[9px] rounded-full text-xs font-semibold text-(--landing-muted) bg-(--landing-soft) hover:bg-(--landing-soft-strong) hover:text-(--landing-text) no-underline whitespace-nowrap transition-all duration-200">
            Semua Artikel
          </Link>
          {categoryList.map((categoryName) => (
            <Link
              key={categoryName}
              href={`/blog/search?category=${encodeURIComponent(categoryName)}`}
              className="inline-flex items-center justify-center px-5 py-[9px] rounded-full text-xs font-semibold text-(--landing-muted) bg-(--landing-soft) hover:bg-(--landing-soft-strong) hover:text-(--landing-text) no-underline whitespace-nowrap transition-all duration-200"
            >
              {categoryName}
            </Link>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-9 mt-9">
        <div>
          <div className="mb-6 pb-3 border-b border-(--landing-border)">
            <h2 className="text-[22px] font-bold text-(--landing-text) tracking-[-0.5px] m-0">Semua Catatan ({totalArticles})</h2>
          </div>

          <div className="flex flex-col gap-5">
            {articles.map((article) => (
              <Link key={article.id} href={`/blog/${article.slug}`} className="group bg-(--landing-card) rounded-[14px] p-[22px] no-underline text-inherit flex flex-col sm:flex-row gap-5  hover:bg-(--landing-soft) transition-all duration-200">
                <div className="relative w-full sm:w-[140px] h-[160px] sm:h-[105px] rounded-lg overflow-hidden shrink-0 bg-(--landing-inverse-bg)">
                  <Image src={article.coverImage || '/assets/images/img.png'} alt={article.title} fill className="object-cover transition-transform duration-300 " />
                </div>
                <div className="flex min-w-0 flex-col justify-center">
                  <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-[0.5px] bg-(--landing-soft-strong) text-(--landing-text) w-fit">{article.category}</span>
                  <h3 className="my-1 text-base font-bold text-(--landing-text) leading-[1.35]">{article.title}</h3>
                  <p className="my-1 line-clamp-2 text-xs leading-relaxed text-muted">{article.excerpt}</p>
                  <div className="text-xs font-medium text-(--landing-faint) mt-auto pt-3">
                    Dipublikasikan {new Date(article.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <BlogPagination
            currentPage={currentPage}
            totalPages={totalPages}
            hrefForPage={(page) => `/blog?page=${page}#articles`}
          />
        </div>

        <aside className="flex flex-col gap-6">
          <div className="bg-(--landing-card) rounded-[14px] p-6 border border-(--landing-border)">
            <h3 className="text-[15px] font-bold text-(--landing-text) m-0 mb-4 pb-[10px] border-b border-(--landing-border)">Catatan Pilihan Teratas</h3>
            <div className="flex flex-col gap-3.5">
              {traderPicks.length === 0 && <p className="text-xs leading-relaxed text-muted">Belum ada artikel pilihan teratas yang ditandai.</p>}
              {traderPicks.map((pick) => (
                <Link key={pick.slug} href={`/blog/${pick.slug}`} className="group/pick no-underline text-inherit transition-colors">
                  <div className="text-[11px] text-(--landing-faint)">
                    <span className="font-bold text-sub">{pick.category}</span> • {pick.readTime}
                  </div>
                  <div className="text-xs font-semibold text-(--landing-text) leading-[1.4] mt-0.5 group-hover/pick:text-(--accent-blue) transition-colors">{pick.title}</div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-(--landing-inverse-bg) text-(--landing-inverse-text) border border-white/12 rounded-[14px] p-6 sm:p-7 flex flex-col gap-3">
            <div className="text-[11px] font-bold tracking-[1.5px] uppercase text-[#aebbd0]"><Calculator size={14} className="mr-1 inline" /> Simulasikan Portofolio</div>
            <h4 className="text-[18px] font-bold leading-[1.35] m-0">Kalkulator ARA/ARB &amp; Average Down</h4>
            <p className="text-xs leading-[1.5] text-[#cbd5e1] m-0">Hitung persentase batas auto rejection dan kebutuhan lot pembelian tambahan saham kamu secara gratis.</p>
            <Link href="/#calculator" className="inline-flex items-center justify-center px-[18px] py-2.5 bg-(--landing-cta-bg) text-(--landing-cta-text) rounded-lg text-xs font-bold no-underline mt-1 hover:bg-[#e2e8f0] transition-colors">Coba Kalkulator Sekarang <ChevronRight size={14} className="ml-1 inline" /></Link>
          </div>
        </aside>
      </div>
    </section>
  );
}

