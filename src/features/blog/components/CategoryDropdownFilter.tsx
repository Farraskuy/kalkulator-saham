"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Search, Folder, Check, X } from "lucide-react";

interface CategoryDropdownFilterProps {
  categories: string[];
  activeCategory?: string;
  totalArticles?: number;
  searchQuery?: string;
  theme?: "default" | "acme";
}

export default function CategoryDropdownFilter({
  categories,
  activeCategory = "",
  totalArticles,
  searchQuery = "",
  theme = "acme",
}: CategoryDropdownFilterProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedCategoryName = useMemo(() => {
    if (!activeCategory || activeCategory.toLowerCase() === "all") {
      return "Semua Kategori";
    }
    return activeCategory;
  }, [activeCategory]);

  const filteredCategories = useMemo(() => {
    const term = searchFilter.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter((cat) => cat.toLowerCase().includes(term));
  }, [categories, searchFilter]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchFilter("");
    }
  }, [isOpen]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (categoryName: string) => {
    setIsOpen(false);
    if (
      !categoryName ||
      categoryName.toLowerCase() === "all" ||
      categoryName === "Semua Kategori"
    ) {
      if (searchQuery) {
        router.push(`/blog/search?q=${encodeURIComponent(searchQuery)}`);
      } else {
        router.push("/blog/search");
      }
    } else {
      if (searchQuery) {
        router.push(
          `/blog/search?q=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(categoryName)}`,
        );
      } else {
        router.push(
          `/blog/search?category=${encodeURIComponent(categoryName)}`,
        );
      }
    }
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      {/* TRIGGER BUTTON */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-border-custom bg-card text-main text-xs font-semibold hover:border-acc-blue/50 transition-all cursor-pointer shadow-xs gap-2"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Folder size={14} className="text-acc-blue shrink-0" />
          <span className="truncate">
            <span className="text-muted font-normal mr-1">Kategori:</span>
            <strong className="text-main font-bold">
              {selectedCategoryName}
            </strong>
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-muted shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-main" : ""}`}
        />
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-40 bg-card border border-border-custom rounded-2xl shadow-xl overflow-hidden animate-fade-in text-xs max-w-full">
          {/* SEARCH INPUT */}
          <div className="p-2.5 border-b border-border-custom/50 bg-sub-slate/50">
            <div className="relative flex items-center">
              <Search
                size={13}
                className="absolute left-2.5 text-muted pointer-events-none"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Cari kategori..."
                className="w-full bg-card rounded-lg pl-8 pr-7 py-1.5 text-xs text-main placeholder:text-muted border border-border-custom outline-none focus:ring-1 focus:ring-acc-blue"
              />
              {searchFilter && (
                <button
                  type="button"
                  onClick={() => setSearchFilter("")}
                  className="absolute right-2 text-muted hover:text-main p-0.5 cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* CATEGORIES LIST */}
          <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5 landing-scroller">
            {/* OPTION: SEMUA KATEGORI */}
            {(!searchFilter ||
              "semua kategori".includes(searchFilter.toLowerCase())) && (
              <button
                type="button"
                onClick={() => handleSelect("Semua Kategori")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                  selectedCategoryName === "Semua Kategori"
                    ? "bg-acc-blue/10 text-acc-blue font-bold"
                    : "text-main hover:bg-sub-slate font-medium"
                }`}
              >
                <span>
                  Semua Kategori {totalArticles ? `(${totalArticles})` : ""}
                </span>
                {selectedCategoryName === "Semua Kategori" && (
                  <Check size={14} className="text-acc-blue shrink-0" />
                )}
              </button>
            )}

            {/* DYNAMIC CATEGORY OPTIONS */}
            {filteredCategories.map((cat) => {
              const isSelected =
                selectedCategoryName.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleSelect(cat)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-acc-blue/10 text-acc-blue font-bold"
                      : "text-main hover:bg-sub-slate font-medium"
                  }`}
                >
                  <span className="truncate">{cat}</span>
                  {isSelected && (
                    <Check size={14} className="text-acc-blue shrink-0" />
                  )}
                </button>
              );
            })}

            {filteredCategories.length === 0 && searchFilter && (
              <div className="py-4 text-center text-muted text-[11px]">
                Kategori &quot;{searchFilter}&quot; tidak ditemukan.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
