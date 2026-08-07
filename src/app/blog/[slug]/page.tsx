import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import DynamicDisclaimer from '@/components/layout/DynamicDisclaimer';
import AppLogo from '@/components/layout/AppLogo';
import TrackBlogView from '@/features/blog/components/TrackBlogView';
import { prisma } from '@/lib/db';
import { Calendar, ArrowLeft, User, Share2, Bookmark } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug },
  });

  if (!article) return { title: 'Artikel Tidak Ditemukan | HitungSaham.com' };

  return {
    title: `${article.title} | HitungSaham.com`,
    description: article.excerpt,
    keywords: [article.category, 'jurnal trading', 'saham bei', 'kalkulator saham'],
    openGraph: {
      title: `${article.title} | HitungSaham.com`,
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

export default async function LandingOneBlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
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
    <div className="flex flex-col min-h-screen bg-page text-main transition-colors duration-300">
      <TrackBlogView article={article} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full grow space-y-8">
        {/* Sleek, Well-Proportioned Back Button */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sub-slate hover:bg-sub-blue text-main hover:text-acc-blue text-xs font-bold transition-all w-fit cursor-pointer"
        >
          <ArrowLeft size={15} /> Kembali ke Blog &amp; Artikel
        </Link>

        {/* ARTICLE HEADER */}
        <header className="space-y-4 pb-4">
          <div className="flex items-center justify-between gap-4">
            <span className="inline-block px-3.5 py-1 rounded-full bg-slate-900 text-white dark:bg-white dark:text-black font-extrabold text-xs uppercase tracking-wider">
              {article.category}
            </span>
            <div className="flex items-center gap-3 text-xs text-muted">
              <button className="flex items-center gap-1.5 hover:text-main cursor-pointer">
                <Bookmark size={14} /> Simpan
              </button>
              <button className="flex items-center gap-1.5 hover:text-main cursor-pointer">
                <Share2 size={14} /> Bagikan
              </button>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-main leading-tight tracking-tight">
            {article.title}
          </h1>

          <div className="flex items-center gap-3 text-xs font-semibold text-muted pt-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-acc-blue/20 text-acc-blue flex items-center justify-center font-bold">
                <User size={13} />
              </div>
              <span className="font-bold text-main">{article.author || 'HitungSaham'}</span>
            </div>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar size={13} />
              {new Date(article.publishedAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
        </header>

        {/* HERO IMAGE */}
        <div className="relative w-full h-[320px] sm:h-[460px] rounded-2xl overflow-hidden bg-sub-slate">
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
          <div className="p-6 rounded-2xl bg-sub-slate/60 text-base font-semibold text-main leading-relaxed italic">
            {article.excerpt}
          </div>
        )}

        {/* ARTICLE BODY */}
        <article className="prose dark:prose-invert max-w-none text-main text-base leading-relaxed space-y-6 pt-2">
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </article>
      </main>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mb-8 mt-10">
        <div className="bg-[#18181b] text-white rounded-2xl p-8 sm:p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-6 space-y-3">
              <div className="flex items-center gap-2.5 font-black text-xl text-white">
                <AppLogo size={28} variant="white-icon" />
                <span>HitungSaham</span>
              </div>
              <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
                Platform personal berisi catatan jurnal trading, analisis pasar, serta kalkulator analisis saham BEI.
              </p>
            </div>

            <div className="md:col-span-6 grid grid-cols-2 gap-6 text-xs">
              <div>
                <div className="font-extrabold text-white uppercase tracking-wider mb-3 text-[11px]">Kalkulator Saham</div>
                <ul className="space-y-2 text-gray-400 font-semibold">
                  <li><Link href="/#ara-arb" className="hover:text-white transition-colors">Batas ARA / ARB</Link></li>
                  <li><Link href="/#avg-up-down" className="hover:text-white transition-colors">Average Up / Down</Link></li>
                  <li><Link href="/#prediction" className="hover:text-white transition-colors">Target Profit &amp; Loss</Link></li>
                  <li><Link href="/faq" className="hover:text-white transition-colors">Pertanyaan Umum (FAQ)</Link></li>
                </ul>
              </div>

              <div>
                <div className="font-extrabold text-white uppercase tracking-wider mb-3 text-[11px]">Jurnal &amp; Sistem</div>
                <ul className="space-y-2 text-gray-400 font-semibold">
                  <li><Link href="/blog" className="hover:text-white transition-colors">Catatan Jurnal </Link></li>
                  <li><Link href="/faq" className="hover:text-white transition-colors">Pusat Bantuan BEI</Link></li>
                  <li><Link href="/admin" className="hover:text-white transition-colors">Admin Panel CMS</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-400">
            <div>&copy; {new Date().getFullYear()} HitungSaham.com • Catatan  &amp; Alat Analisis Saham BEI</div>
            <div className="max-w-md text-center sm:text-right text-[10px]">
              <DynamicDisclaimer />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
