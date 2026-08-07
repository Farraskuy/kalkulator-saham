'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Calendar, ArrowUpRight, BookOpen, X } from 'lucide-react';
import { ArticleData, CategoryData } from '@/types';
import BlogSearchDropdown from './BlogSearchDropdown';

interface LandingOneBlogFilterProps {
  initialArticles: ArticleData[];
  categories: CategoryData[];
}

export default function LandingOneBlogFilter({
  initialArticles,
  categories,
}: LandingOneBlogFilterProps) {
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

  return (
    <div className="space-y-8">
      {/* Category Pills Bar + Debounced Search Dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          <button
            onClick={() => handleCategorySelect('ALL')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border-none outline-none ${
              activeCategory === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-xs'
                : 'bg-sub-slate text-sub hover:bg-sub-blue hover:text-acc-blue'
            }`}
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
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border-none outline-none ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-xs'
                    : 'bg-sub-slate text-sub hover:bg-sub-blue hover:text-acc-blue'
                }`}
                type="button"
              >
                {catName}
              </button>
            );
          })}
        </div>

        <div className="w-full sm:w-80 shrink-0">
          <BlogSearchDropdown
            articles={initialArticles}
            basePath="/blog"
            placeholder="Cari artikel / jurnal..."
            theme="default"
          />
        </div>
      </div>

      {/* Active Category Filter Indicator Badge */}
      {activeCategory !== 'ALL' && (
        <div className="flex items-center justify-between bg-sub-blue/50 border border-acc-blue/20 px-4 py-2.5 rounded-xl text-xs font-semibold text-main">
          <div>
            Menampilkan <span className="font-extrabold text-acc-blue">{filteredArticles.length}</span> artikel
            dalam kategori <strong className="underline">{activeCategory}</strong>
          </div>
          <button
            onClick={handleResetCategory}
            className="text-xs font-extrabold text-rose-500 hover:underline cursor-pointer flex items-center gap-1"
          >
            <X size={13} /> Tampilkan Semua Kategori
          </button>
        </div>
      )}

      {/* Articles Grid / Empty State */}
      {filteredArticles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-sub-slate/40 rounded-3xl border border-dashed border-border-custom space-y-4">
          <div className="w-14 h-14 rounded-full bg-sub-blue text-acc-blue flex items-center justify-center text-xl font-bold">
            <BookOpen size={24} />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="text-xl font-bold text-main">Tidak Ada Artikel dalam Kategori Ini</h3>
            <p className="text-xs text-muted">
              Tidak ada artikel yang dikategorikan sebagai &quot;{activeCategory}&quot;. Silakan pilih kategori lain.
            </p>
          </div>
          <button
            onClick={handleResetCategory}
            className="px-5 py-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-black text-xs font-bold transition-colors"
          >
            Lihat Semua Artikel
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((art) => (
            <Link
              key={art.id}
              href={`/blog/${art.slug}`}
              className="group bg-card rounded-2xl p-4 flex flex-col justify-between transition-colors hover:bg-sub-slate/50 border border-border-custom/40"
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
                  <h3 className="text-base font-extrabold text-main group-hover:text-acc-blue transition-colors leading-snug line-clamp-2">
                    {art.title}
                  </h3>
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
    </div>
  );
}
