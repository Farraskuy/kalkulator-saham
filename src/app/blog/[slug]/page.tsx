import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { ArrowLeft, Calendar, Calculator, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Footer from '@/components/layout/Footer';
import LandingHeader from '@/components/landing/LandingHeader';
import TrackBlogView from '@/features/blog/components/TrackBlogView';
import styles from '../blog-acme.module.css';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug },
  });

  if (!article) return { title: 'Artikel Tidak Ditemukan | HitungSaham Blog' };

  return {
    title: `${article.title} | HitungSaham Blog`,
    description: article.excerpt,
    keywords: [article.category, 'jurnal ', 'saham bei', 'kalkulator saham'],
    openGraph: {
      title: `${article.title} | HitungSaham Blog`,
      description: article.excerpt,
      url: `https://hitungsaham.com/blog/${article.slug}`,
      siteName: 'HitungSaham.com',
      locale: 'id_ID',
      type: 'article',
      publishedTime: new Date(article.publishedAt).toISOString(),
      authors: [article.author || 'HitungSaham'],
      images: [
        {
          url: article.coverImage || 'https://hitungsaham.com/assets/images/img.png',
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [article.coverImage || 'https://hitungsaham.com/assets/images/img.png'],
    },
    alternates: {
      canonical: `https://hitungsaham.com/blog/${article.slug}`,
    },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug },
  });

  if (!article) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt,
    image: [article.coverImage || 'https://hitungsaham.com/assets/images/img.png'],
    datePublished: new Date(article.publishedAt).toISOString(),
    author: {
      '@type': 'Person',
      name: article.author || 'HitungSaham',
    },
    publisher: {
      '@type': 'Organization',
      name: 'HitungSaham.com',
      url: 'https://hitungsaham.com',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://hitungsaham.com/blog/${article.slug}`,
    },
  };

  return (
    <div className={styles.page}>
      <TrackBlogView article={article} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* HEADER NAVBAR */}
      <LandingHeader />

      {/* ARTICLE CONTENT CONTAINER */}
      <main className="max-w-[1200px] w-full mx-auto px-5 sm:px-8 md:px-16 py-10 space-y-8 text-[#111210]">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#52534e] hover:text-[#111210] mb-2"
        >
          <ArrowLeft size={14} /> Kembali ke Blog &amp; Artikel
        </Link>

        {/* ARTICLE HEADER */}
        <header className="space-y-4 border-b border-black/10 pb-8">
          <span className="inline-block px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-[#e6e6e2] text-[#111210]">
            {article.category}
          </span>

          <h1 className="text-3xl sm:text-5xl font-bold text-[#111210] leading-tight tracking-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-[#82837e] pt-2">
            <span>Oleh <strong className="text-[#111210]">{article.author || 'HitungSaham'}</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar size={13} />
              {new Date(article.publishedAt).toLocaleDateString('id-ID', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </header>

        {/* HERO IMAGE */}
        <div className="relative w-full h-[320px] sm:h-[440px] rounded-2xl overflow-hidden bg-[#111210]">
          <Image
            src={article.coverImage || '/assets/images/img.png'}
            alt={article.title}
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* EXCERPT CALLOUT */}
        {article.excerpt && (
          <div className="p-6 bg-[#f2f2ef] border-l-4 border-[#111210] rounded-r-xl text-base font-medium text-[#333430] leading-relaxed italic">
            {article.excerpt}
          </div>
        )}

        {/* ARTICLE BODY */}
        <article className="prose max-w-none text-[#111210] text-base leading-relaxed space-y-6 pt-2">
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </article>

        {/* CALCULATOR PROMO FOOTER BOX */}
        <div className="mt-12 p-8 bg-[#111210] text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#a0a09c] flex items-center gap-1.5 mb-1">
              <Calculator size={14} /> HitungSaham Tools
            </div>
            <h3 className="text-xl font-bold text-white">Butuh Menghitung Average Down Saham Kamu?</h3>
            <p className="text-xs text-gray-300 mt-1 max-w-md">
              Gunakan kalkulator simulasi gratis kami untuk menghitung target harga rata-rata dan batas ARA/ARB BEI secara presisi.
            </p>
          </div>
          <Link href="/#calculator" className="bg-white text-[#111210] font-bold text-xs px-5 py-3 rounded-xl whitespace-nowrap hover:bg-gray-200 transition-colors">
            Buka Kalkulator <ChevronRight size={14} className="inline ml-1" />
          </Link>
        </div>
      </main>

      {/* UNIFIED ACME FOOTER */}
      <Footer variant="acme" />
    </div>
  );
}

