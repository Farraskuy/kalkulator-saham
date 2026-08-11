import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import Footer from '@/components/layout/Footer';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingTwoBlogFilter from '@/features/blog/components/LandingTwoBlogFilter';
import { getCachedArticles, getCachedCategories } from '@/lib/cached-data';
import { ArticleData } from '@/types';
import styles from './blog-acme.module.css';

export const metadata: Metadata = {
  title: 'Blog & Catatan Artikel Pribadi | HitungSaham.com',
  description: 'Artikel personal, catatan opini pribadi pengelola, dan kalkulator simulasi matematis saham.',
  keywords: ['blog saham', 'artikel pribadi', 'catatan opini saham', 'average down saham', 'kalkulator saham'],
  openGraph: {
    title: 'Blog & Catatan Artikel Pribadi | HitungSaham.com',
    description: 'Artikel personal, catatan opini pribadi pengelola, dan kalkulator simulasi matematis saham.',
    url: 'https://hitungsaham.com/blog',
    siteName: 'HitungSaham.com',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog & Catatan Artikel Pribadi | HitungSaham.com',
    description: 'Artikel personal, catatan opini pribadi pengelola, dan kalkulator simulasi matematis saham.',
  },
  alternates: {
    canonical: 'https://hitungsaham.com/blog',
  },
};

export default async function PersonalBlogPage() {
  const [articles, categories] = await Promise.all([
    getCachedArticles(),
    getCachedCategories(),
  ]);

  const mainHeadline = articles[0] || null;
  const secondaryPosts = articles.slice(1, 3);

  // JSON-LD Structured Data Schema for Search Engines
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'HitungSaham Blog & Catatan Artikel Pribadi',
    description: 'Kumpulan artikel opini pribadi pengelola dan simulasi matematis saham.',
    url: 'https://hitungsaham.com/blog',
    blogPost: articles.map((art: ArticleData) => ({
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
    <div className={styles.page}>
      {/* Inject Structured JSON-LD Schema for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HEADER NAVBAR */}
      <LandingHeader />

      {/* HERO SECTION HEADER */}
      <section className={styles.hero}>
        <p className={styles.breadcrumb}>HitungSaham / Blog &amp; Artikel Pribadi</p>

        <div className={styles.heroContentGrid}>
          <div className={styles.heroLeft}>
            <h1>Blog &amp;<br />Artikel Pribadi</h1>
          </div>
          <div className={styles.heroRightCopy}>
            Kumpulan artikel personal, catatan opini pengelola, serta alat bantu simulasi perhitungan matematis saham secara rasional dan terukur.
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <main className={styles.container}>
        {articles.length === 0 ? (
          /* EMPTY STATE FOR BLOG */
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-8">
            <div className="space-y-1.5 max-w-md">
              <h2 className="text-2xl font-bold text-[#111210]">Belum Ada Artikel Dipublikasikan</h2>
              <p className="text-xs text-[#52534e] leading-relaxed">
                Saat ini belum ada artikel blog pribadi yang dipublikasikan di database. Silakan kembali lagi nanti.
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
            <section className={styles.heroGrid}>
              {/* Main Highlighted Post */}
              {mainHeadline && (
                <Link href={`/blog/${mainHeadline.slug}`} className={styles.mainPostCard}>
                  <div className={styles.mainPostImage}>
                    <Image
                      src={mainHeadline.coverImage || '/assets/images/img.png'}
                      alt={mainHeadline.title}
                      fill
                      priority
                    />
                  </div>
                  <div className={styles.mainPostContent}>
                    <span className={styles.tagPill}>{mainHeadline.category}</span>
                    <h2 className={styles.mainPostTitle}>{mainHeadline.title}</h2>
                    <p className={styles.mainPostExcerpt}>{mainHeadline.excerpt}</p>
                    <div className={styles.metaInfo}>
                      Oleh {mainHeadline.author || 'HitungSaham'} • {new Date(mainHeadline.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </Link>
              )}

              {/* Secondary Stacked Posts */}
              <div className={styles.secondaryColumn}>
                {secondaryPosts.map((post: ArticleData) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className={styles.secondaryCard}>
                    <div className={styles.secondaryImage}>
                      <Image
                        src={post.coverImage || '/assets/images/img.png'}
                        alt={post.title}
                        fill
                      />
                    </div>
                    <div className={styles.secondaryContent}>
                      <span className={styles.tagPill}>{post.category}</span>
                      <h3 className={styles.secondaryTitle}>{post.title}</h3>
                      <p className={styles.secondaryExcerpt}>{post.excerpt}</p>
                      <div className={styles.metaInfo}>
                        {new Date(post.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* INTERACTIVE DYNAMIC BLOG FILTER CLIENT (ACME THEME) */}
            <Suspense fallback={null}>
              <LandingTwoBlogFilter
                initialArticles={articles}
                categories={categories}
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

