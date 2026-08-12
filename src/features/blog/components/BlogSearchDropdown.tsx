'use client';

import React, { useState, useEffect, useRef, useTransition, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight, History, ImageOff, Clock, Trash2, ArrowLeft } from 'lucide-react';
import { ArticleData } from '@/types';
import {
  getSearchHistory,
  addSearchHistory,
  removeSearchHistoryItem,
  clearSearchHistory,
  getRecentlyViewedBlogs,
  RecentlyViewedBlog,
} from '../utils/blogStorage';

interface BlogSearchDropdownProps {
  articles: ArticleData[];
  basePath: string;
  placeholder?: string;
  theme?: 'default' | 'acme';
  defaultValue?: string;
}

function BlogThumbnail({ src, alt }: { src?: string | null; alt: string }) {
  const [hasError, setHasError] = useState(!src);

  useEffect(() => {
    setHasError(!src);
  }, [src]);

  if (hasError || !src) {
    return (
      <div className="w-10 h-10 rounded-lg bg-sub-slate text-muted flex items-center justify-center shrink-0 border border-border-custom/30">
        <ImageOff size={16} className="opacity-70" />
      </div>
    );
  }

  return (
    <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-sub-slate border border-border-custom/30">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export default function BlogSearchDropdown({
  articles,
  basePath,
  placeholder = 'Cari artikel / jurnal...',
  theme = 'default',
  defaultValue = '',
}: BlogSearchDropdownProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState(defaultValue);
  const [debouncedQuery, setDebouncedQuery] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);

  // Local storage state for history & recently viewed blogs
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedBlog[]>([]);

  useEffect(() => {
    setQuery(defaultValue);
    setDebouncedQuery(defaultValue);
  }, [defaultValue]);

  // Load history & recently viewed on mount & when dropdown opens
  const refreshStorageData = () => {
    setSearchHistory(getSearchHistory());
    setRecentlyViewed(getRecentlyViewedBlogs());
  };

  useEffect(() => {
    refreshStorageData();
  }, []);

  // Debounce search query input (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  // Focus mobile input automatically when dropdown opens
  useEffect(() => {
    if (isOpen && mobileInputRef.current) {
      setTimeout(() => {
        mobileInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Close dropdown on click outside for desktop
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter top 5 articles matching debouncedQuery
  const topResults = useMemo(() => {
    if (!debouncedQuery) return [];
    const q = debouncedQuery.toLowerCase();
    return articles
      .filter(
        (art) =>
          art.title.toLowerCase().includes(q) ||
          (art.excerpt && art.excerpt.toLowerCase().includes(q)) ||
          (art.category && art.category.toLowerCase().includes(q))
      )
      .slice(0, 5);
  }, [articles, debouncedQuery]);

  const totalResultsCount = useMemo(() => {
    if (!debouncedQuery) return 0;
    const q = debouncedQuery.toLowerCase();
    return articles.filter(
      (art) =>
        art.title.toLowerCase().includes(q) ||
        (art.excerpt && art.excerpt.toLowerCase().includes(q)) ||
        (art.category && art.category.toLowerCase().includes(q))
    ).length;
  }, [articles, debouncedQuery]);

  // Handle ENTER key or form submit -> Save history and navigate
  const handleSearchSubmit = (searchWord?: string) => {
    const targetQuery = searchWord !== undefined ? searchWord : query;
    if (!targetQuery.trim()) return;

    addSearchHistory(targetQuery.trim());
    setIsOpen(false);

    const searchUrl = `${basePath}/search?q=${encodeURIComponent(targetQuery.trim())}`;
    startTransition(() => {
      router.push(searchUrl);
    });
  };

  const handleRemoveHistoryItem = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    const updated = removeSearchHistoryItem(item);
    setSearchHistory(updated);
  };

  const handleClearAllHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = clearSearchHistory();
    setSearchHistory(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const isAcme = theme === 'acme';

  // Recently viewed max 3 items
  const recentThreeViewed = useMemo(() => {
    return recentlyViewed.slice(0, 3);
  }, [recentlyViewed]);

  const renderDropdownContent = () => (
    <>
      {/* STATE A: WHEN USER HAS NOT TYPED ANYTHING (Query is empty) */}
      {!debouncedQuery ? (
        <div className="p-4 space-y-4">
          {/* 1. SEARCH HISTORY SECTION */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <History size={13} className="text-acc-blue" /> Riwayat Pencarian
              </span>
              {searchHistory.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllHistory}
                  className="text-[11px] font-bold text-rose-500 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Trash2 size={11} /> Hapus Semua
                </button>
              )}
            </div>

            {searchHistory.length === 0 ? (
              <div className="py-4 px-3 text-center text-xs text-muted font-medium bg-sub-slate/40 rounded-xl border border-dashed border-border-custom/40">
                Belum ada riwayat pencarian
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {searchHistory.map((item) => (
                  <div
                    key={item}
                    onClick={() => {
                      setQuery(item);
                      handleSearchSubmit(item);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sub-slate hover:bg-sub-blue/60 text-main hover:text-acc-blue text-xs font-semibold cursor-pointer transition-colors group"
                  >
                    <Clock size={12} className="text-muted group-hover:text-acc-blue shrink-0" />
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveHistoryItem(e, item)}
                      className="text-muted hover:text-rose-500 transition-colors p-0.5 rounded-full"
                      title="Hapus riwayat"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. RECENTLY VIEWED BLOGS SECTION (MAX 3) */}
          {/* CRITICAL USER REQUIREMENT: "jika belum buka apa2 hilangkan beserta headernya" */}
          {recentThreeViewed.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-border-custom/40">
              <div className="px-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted">
                  Terakhir Dibuka (Maks 3)
                </span>
              </div>

              <div className="space-y-1.5">
                {recentThreeViewed.map((blog) => (
                  <Link
                    key={blog.slug}
                    href={`${basePath}/${blog.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-sub-slate transition-colors group cursor-pointer"
                  >
                    <BlogThumbnail src={blog.coverImage} alt={blog.title} />

                    <div className="grow min-w-0">
                      <div className="text-[10px] font-bold text-acc-blue uppercase tracking-wider">
                        {blog.category}
                      </div>
                      <div className="text-xs font-bold text-main group-hover:text-acc-blue transition-colors line-clamp-1">
                        {blog.title}
                      </div>
                    </div>

                    <ArrowRight size={14} className="text-muted group-hover:text-main shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* STATE B: WHEN USER HAS TYPED A QUERY (Showing debounced Top 5 results) */
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted">
              Top 5 Hasil Pencarian
            </span>
            <button
              type="button"
              onClick={() => handleSearchSubmit()}
              className="text-xs font-bold text-acc-blue hover:underline transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat semua ({totalResultsCount})</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {topResults.length === 0 ? (
            <div className="py-6 px-3 text-center text-xs text-muted space-y-1 bg-sub-slate/30 rounded-xl border border-dashed border-border-custom/40">
              <p className="font-bold text-main">Tidak ada artikel ditemukan</p>
              <p className="text-[11px]">
                Coba kata kunci lain seperti &quot;Average Down&quot; atau &quot;ARA/ARB&quot;
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {topResults.map((art) => (
                <Link
                  key={art.id}
                  href={`${basePath}/${art.slug}`}
                  onClick={() => {
                    addSearchHistory(query);
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-sub-slate transition-colors group cursor-pointer"
                >
                  {/* BLOG COVER THUMBNAIL WITH FALLBACK BROKEN IMAGE ICON */}
                  <BlogThumbnail src={art.coverImage} alt={art.title} />

                  <div className="grow min-w-0">
                    <div className="text-[10px] font-semibold text-muted mb-0.5 flex items-center gap-1.5">
                      <span className="text-acc-blue font-extrabold uppercase tracking-wider">
                        {art.category}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(art.publishedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-main group-hover:text-acc-blue transition-colors leading-snug line-clamp-1">
                      {art.title}
                    </div>
                  </div>

                  <ArrowRight size={14} className="text-muted group-hover:text-main shrink-0" />
                </Link>
              ))}
            </div>
          )}

          {/* FOOTER SEE ALL ACTION */}
          <div className="pt-2 border-t border-border-custom/40 flex items-center justify-between text-xs px-1">
            <span className="text-[11px] text-muted">Maksimal 5 hasil teratas</span>
            <button
              type="button"
              onClick={() => handleSearchSubmit()}
              className="font-bold text-acc-blue hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Semua Hasil ({totalResultsCount})</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div ref={dropdownRef} className="relative w-full min-w-60">
      {/* PAGE TRIGGER INPUT (ON PAGE) */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearchSubmit();
        }}
        className="relative w-full"
      >
        <Search
          size={15}
          className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
            isAcme ? 'text-muted' : 'text-muted'
          }`}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            refreshStorageData();
            setIsOpen(true);
          }}
          placeholder={placeholder}
          className={
            isAcme
              ? 'w-full bg-card border border-border-custom rounded-xl pl-9 pr-9 py-2 text-base sm:text-xs font-semibold text-main outline-none focus:border-main transition-colors shadow-2xs'
              : 'w-full bg-sub-slate border border-border-custom/50 rounded-xl pl-9 pr-9 py-2 text-xs font-semibold text-main outline-none focus:border-acc-blue transition-colors shadow-2xs'
          }
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setDebouncedQuery('');
            }}
            className={`absolute right-3 top-1/2 -translate-y-1/2 ${
              isAcme ? 'text-muted hover:text-main' : 'text-muted hover:text-main'
            }`}
            title="Hapus kata kunci"
          >
            <X size={14} />
          </button>
        )}
      </form>

      {/* Desktop helper panel follows the full width of its search input. */}
      {isOpen && (
        <div
          className={`hidden sm:block absolute inset-x-0 top-full mt-2 z-50 max-h-[calc(100vh-8rem) w-full overflow-y-auto rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 ${
            isAcme
              ? 'bg-card text-main border border-border-custom'
              : 'bg-card text-main border border-border-custom/80'
          }`}
        >
          {renderDropdownContent()}
        </div>
      )}

      {/* MOBILE FULLSCREEN OVERLAY MODAL (< sm) */}
      {/* USER DIRECTIVE: "untuk versi responsivenya ketika search bar di klik maka BlogSearchDropdown akan full screen..." */}
      {isOpen && (
        <div
          className={`sm:hidden fixed inset-0 z-50 flex flex-col overflow-y-auto animate-in fade-in duration-200 ${
            isAcme ? 'bg-page text-main' : 'bg-page text-main'
          }`}
        >
          {/* MOBILE FULLSCREEN HEADER SEARCH BAR */}
          <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border-custom/50 bg-card p-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl text-muted hover:text-main hover:bg-sub-slate transition-colors"
              aria-label="Kembali"
            >
              <ArrowLeft size={18} />
            </button>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearchSubmit();
              }}
              className="relative grow"
            >
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                ref={mobileInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full bg-sub-slate border border-border-custom/50 rounded-xl pl-10 pr-9 py-2.5 text-base font-semibold text-main outline-none focus:border-acc-blue"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setDebouncedQuery('');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-main"
                >
                  <X size={16} />
                </button>
              )}
            </form>
          </div>

          {/* MOBILE FULLSCREEN CONTENT BODY */}
          <div className="grow">{renderDropdownContent()}</div>
        </div>
      )}
    </div>
  );
}
