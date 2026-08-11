'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calculator, ChevronRight, X, BookOpen } from 'lucide-react';
import { ArticleData, CategoryData } from '@/types';
import BlogSearchDropdown from './BlogSearchDropdown';
import styles from '@/app/blog/blog-acme.module.css';

interface LandingTwoBlogFilterProps {
  initialArticles: ArticleData[];
  categories: CategoryData[];
}

export default function LandingTwoBlogFilter({
  initialArticles,
  categories,
}: LandingTwoBlogFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('category') || 'ALL';
  const [activeCategory, setActiveCategory] = useState(currentCategory);

  useEffect(() => {
    setActiveCategory(currentCategory);
  }, [currentCategory]);

  // Combine DB categories + distinct article categories so no category is ever missed
  const categoryList = useMemo(() => {
    const list: string[] = [];
    categories.forEach((c) => {
      if (c.name && !list.includes(c.name)) {
        list.push(c.name);
      }
    });
    initialArticles.forEach((art) => {
      if (art.category && !list.includes(art.category)) {
        list.push(art.category);
      }
    });
    return list;
  }, [categories, initialArticles]);

  const handleCategorySelect = (catName: string) => {
    setActiveCategory(catName);
    const params = new URLSearchParams(window.location.search);
    if (catName !== 'ALL') {
      params.set('category', catName);
    } else {
      params.delete('category');
    }
    const queryString = params.toString();
    const newUrl = queryString ? `/blog?${queryString}` : '/blog';
    router.replace(newUrl, { scroll: false });
  };

  const handleResetCategory = () => {
    setActiveCategory('ALL');
    router.replace('/blog', { scroll: false });
  };

  const filteredArticles = initialArticles.filter((art) => {
    return (
      activeCategory === 'ALL' ||
      art.category.toLowerCase() === activeCategory.toLowerCase()
    );
  });

  const popularPicks = filteredArticles.slice(0, 3).map((art) => ({
    title: art.title,
    category: art.category,
    slug: art.slug,
    readTime: '5 min baca',
  }));

  return (
    <div className="space-y-8">
      {/* Category Pills Bar + Acme Search Bar Dropdown */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <nav className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => handleCategorySelect('ALL')}
            className={activeCategory === 'ALL' ? styles.categoryPillActive : styles.categoryPill}
            type="button"
          >
            Semua Artikel
          </button>
          {categoryList.map((catName) => {
            const isActive = activeCategory.toLowerCase() === catName.toLowerCase();
            return (
              <button
                key={catName}
                onClick={() => handleCategorySelect(catName)}
                className={isActive ? styles.categoryPillActive : styles.categoryPill}
                type="button"
              >
                {catName}
              </button>
            );
          })}
        </nav>

        <div className="w-full md:w-80 shrink-0">
          <BlogSearchDropdown
            articles={initialArticles}
            basePath="/blog"
            placeholder="Cari artikel / jurnal..."
            theme="acme"
          />
        </div>
      </div>

      {/* Active Category Indicator Badge */}
      {activeCategory !== 'ALL' && (
        <div className="flex items-center justify-between">
          <div>
            Menampilkan <span className="font-extrabold text-[#111210]">{filteredArticles.length}</span> artikel
            dalam kategori <strong className="underline">{activeCategory}</strong>
          </div>
          <button
            onClick={handleResetCategory}
            className="text-xs font-extrabold text-rose-600 hover:underline cursor-pointer flex items-center gap-1"
          >
            <X size={13} /> Reset Kategori
          </button>
        </div>
      )}

      {/* Filtered Articles Split Layout */}
      {filteredArticles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-[#f2f2ef] rounded-3xl border border-dashed border-[#111210]/15 space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#111210] text-white flex items-center justify-center text-xl font-bold">
            <BookOpen size={24} />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="text-xl font-bold text-[#111210]">Tidak Ada Catatan Ditemukan</h3>
            <p className="text-xs text-[#52534e]">
              Tidak ada catatan jurnal dalam kategori &quot;{activeCategory}&quot;. Silakan pilih kategori lain.
            </p>
          </div>
          <button
            onClick={handleResetCategory}
            className="px-5 py-2 rounded-full bg-[#111210] text-white text-xs font-bold hover:bg-black transition-colors"
          >
            Lihat Semua Catatan
          </button>
        </div>
      ) : (
        <div className={styles.splitLayout}>
          <div>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Semua Catatan ({filteredArticles.length})</h2>
            </div>

            <div className={styles.articlesGrid}>
              {filteredArticles.map((art) => (
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
                    <h3 className={styles.articleTitle}>{art.title}</h3>
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
              <h3 className={styles.sidebarTitle}>Catatan Pilihan Trader</h3>
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
    </div>
  );
}
