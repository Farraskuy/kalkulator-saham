import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import Footer from "@/components/layout/Footer";
import LandingHeader from "@/components/landing/LandingHeader";
import { getCachedArticles, getCachedCategories } from "@/lib/cached-data";
import { ArticleData } from "@/types";
import LandingBlogFilter from "@/features/blog/components/LandingBlogFilter";

export const metadata: Metadata = {
  title: "Blog & Catatan Artikel Pribadi | HitungSaham.com",
  description:
    "Artikel personal, catatan opini pribadi pengelola, dan kalkulator simulasi matematis saham.",
  keywords: [
    "blog saham",
    "artikel pribadi",
    "catatan opini saham",
    "average down saham",
    "kalkulator saham",
  ],
  openGraph: {
    title: "Blog & Catatan Artikel Pribadi | HitungSaham.com",
    description:
      "Artikel personal, catatan opini pribadi pengelola, dan kalkulator simulasi matematis saham.",
    url: "https://hitungsaham.com/blog",
    siteName: "HitungSaham.com",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog & Catatan Artikel Pribadi | HitungSaham.com",
    description:
      "Artikel personal, catatan opini pribadi pengelola, dan kalkulator simulasi matematis saham.",
  },
  alternates: {
    canonical: "https://hitungsaham.com/blog",
  },
};

const BLOG_PAGE_SIZE = 6;

export default async function PersonalBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const [articles, categories] = await Promise.all([
    getCachedArticles(),
    getCachedCategories(),
  ]);

  const mainHeadline = articles[0] || null;
  const secondaryPosts = articles.slice(1, 3);
  const listingArticles = articles.slice(3);
  const totalPages = Math.max(
    1,
    Math.ceil(listingArticles.length / BLOG_PAGE_SIZE),
  );
  const requestedPage = Number.parseInt(pageParam || "1", 10);
  const currentPage = Number.isFinite(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), totalPages)
    : 1;
  const paginatedArticles = listingArticles.slice(
    (currentPage - 1) * BLOG_PAGE_SIZE,
    currentPage * BLOG_PAGE_SIZE,
  );

  // JSON-LD Structured Data Schema for Search Engines
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "HitungSaham Blog & Catatan Artikel Pribadi",
    description:
      "Kumpulan artikel opini pribadi pengelola dan simulasi matematis saham.",
    url: "https://hitungsaham.com/blog",
    blogPost: articles.map((art: ArticleData) => ({
      "@type": "BlogPosting",
      headline: art.title,
      description: art.excerpt,
      url: `https://hitungsaham.com/blog/${art.slug}`,
      datePublished: new Date(art.publishedAt).toISOString(),
      author: {
        "@type": "Person",
        name: art.author || "HitungSaham",
      },
    })),
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden text-(--landing-text) bg-(--landing-bg) font-sans">
      {/* Inject Structured JSON-LD Schema for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HEADER NAVBAR */}
      <LandingHeader />

      {/* HERO SECTION HEADER */}
      <section className="py-[48px] px-5 sm:px-8 md:px-16 max-w-[1200px] mx-auto pb-6">
        <p className="m-0 mb-4 text-xs sm:text-[13px] font-medium text-(--landing-muted) underline underline-offset-[3px]">
          HitungSaham / Blog &amp; Artikel Pribadi
        </p>

        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-[36px] items-end">
          <div>
            <h1 className="m-0 text-(--landing-text) text-[34px] sm:text-[clamp(34px,3.8vw,56px)] leading-[1.1] tracking-[-2px] font-bold">
              Blog &amp;
              <br />
              Artikel Pribadi
            </h1>
          </div>
          <div className="mt-1.5 text-(--landing-muted) text-sm leading-[1.65] font-normal">
            Kumpulan artikel personal, catatan opini pengelola, serta alat bantu
            simulasi perhitungan matematis saham secara rasional dan terukur.
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <main className="max-w-[1200px] mx-auto px-5 sm:px-8 md:px-16 pb-[72px]">
        {articles.length === 0 ? (
          /* EMPTY STATE FOR BLOG */
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-8">
            <div className="space-y-1.5 max-w-md">
              <h2 className="text-2xl font-bold text-main">
                Belum Ada Artikel Dipublikasikan
              </h2>
              <p className="text-xs text-muted leading-relaxed">
                Saat ini belum ada artikel blog pribadi yang dipublikasikan di
                database. Silakan kembali lagi nanti.
              </p>
            </div>
            <Link
              href="/"
              className="px-6 py-2.5 rounded-full bg-[#111210] text-white text-xs font-bold hover:bg-black transition-colors inline-flex items-center gap-2"
            >
              <span>Kembali ke Kalkulator Saham</span>
            </Link>
          </div>
        ) : (
          <>
            {/* HERO FEATURED POST GRID */}
            <section className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-[28px] mb-12">
              {/* Main Highlighted Post */}
              {mainHeadline && (
                <Link
                  href={`/blog/${mainHeadline.slug}`}
                  className="group bg-(--landing-card) rounded-2xl overflow-hidden no-underline text-inherit flex flex-col transition-all duration-200 "
                >
                  <div className="relative w-full h-[280px] bg-(--landing-inverse-bg) overflow-hidden">
                    <Image
                      src={mainHeadline.coverImage || "/assets/images/img.png"}
                      alt={mainHeadline.title}
                      fill
                      priority
                      className="object-cover transition-transform duration-300 "
                    />
                  </div>
                  <div className="p-[28px] flex flex-col gap-3 grow">
                    <span className="inline-block px-[10px] py-[4px] rounded-md text-[11px] font-bold uppercase tracking-[0.5px] bg-(--landing-soft-strong) text-(--landing-text) w-fit">
                      {mainHeadline.category}
                    </span>
                    <h2 className="m-0 text-[22px] font-bold text-(--landing-text) leading-[1.3] tracking-[-0.5px]">
                      {mainHeadline.title}
                    </h2>
                    <p className="m-0 text-xs sm:text-[13px] leading-[1.6] text-(--landing-muted)">
                      {mainHeadline.excerpt}
                    </p>
                    <div className="text-xs font-medium text-(--landing-faint) mt-auto pt-3">
                      Oleh {mainHeadline.author || "HitungSaham"} •{" "}
                      {new Date(mainHeadline.publishedAt).toLocaleDateString(
                        "id-ID",
                        { day: "numeric", month: "long", year: "numeric" },
                      )}
                    </div>
                  </div>
                </Link>
              )}

              {/* Secondary Stacked Posts */}
              <div className="flex flex-col gap-[24px]">
                {secondaryPosts.map((post: ArticleData) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="bg-(--landing-card) rounded-[14px] p-4 sm:p-5 no-underline text-inherit flex flex-col sm:flex-row gap-3.5 sm:gap-[16px] transition-all duration-200 hover:bg-(--landing-soft)"
                  >
                    <div className="relative w-full sm:w-[110px] h-[160px] sm:h-[110px] rounded-lg overflow-hidden shrink-0 bg-(--landing-inverse-bg)">
                      <Image
                        src={post.coverImage || "/assets/images/img.png"}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col justify-center gap-[6px] min-w-0">
                      <span className="inline-block px-[10px] py-[4px] rounded-md text-[11px] font-bold uppercase tracking-[0.5px] bg-(--landing-soft-strong) text-(--landing-text) w-fit">
                        {post.category}
                      </span>
                      <h3 className="m-0 text-[15px] font-bold text-(--landing-text) leading-[1.35] break-words">
                        {post.title}
                      </h3>
                      <p className="m-0 text-xs text-(--landing-muted) line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                      <div className="text-xs font-medium text-(--landing-faint) mt-auto pt-2 sm:pt-3">
                        {new Date(post.publishedAt).toLocaleDateString(
                          "id-ID",
                          { day: "numeric", month: "short", year: "numeric" },
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* INTERACTIVE DYNAMIC BLOG FILTER CLIENT (ACME THEME) */}
            <Suspense fallback={null}>
              <LandingBlogFilter
                allArticles={articles}
                articles={paginatedArticles}
                categories={categories}
                currentPage={currentPage}
                totalPages={totalPages}
                totalArticles={listingArticles.length}
              />
            </Suspense>
          </>
        )}
      </main>

      {/* UNIFIED ACME FOOTER */}
      <Footer variant="acme" />
    </div>
  );
}
