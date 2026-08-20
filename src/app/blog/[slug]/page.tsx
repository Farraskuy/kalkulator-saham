import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ArrowLeft, Calendar, Calculator, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Footer from "@/components/layout/Footer";
import LandingHeader from "@/components/landing/LandingHeader";
import TrackBlogView from "@/features/blog/components/TrackBlogView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug },
  });

  if (!article) return { title: "Artikel Tidak Ditemukan | HitungSaham Blog" };

  return {
    title: `${article.title} | HitungSaham Blog`,
    description: article.excerpt,
    keywords: [article.category, "jurnal ", "saham bei", "kalkulator saham"],
    openGraph: {
      title: `${article.title} | HitungSaham Blog`,
      description: article.excerpt,
      url: `https://hitungsaham.com/blog/${article.slug}`,
      siteName: "HitungSaham.com",
      locale: "id_ID",
      type: "article",
      publishedTime: new Date(article.publishedAt).toISOString(),
      authors: [article.author || "HitungSaham"],
      images: [
        {
          url:
            article.coverImage ||
            "https://hitungsaham.com/assets/images/img.png",
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [
        article.coverImage || "https://hitungsaham.com/assets/images/img.png",
      ],
    },
    alternates: {
      canonical: `https://hitungsaham.com/blog/${article.slug}`,
    },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug },
  });

  if (!article) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    image: [
      article.coverImage || "https://hitungsaham.com/assets/images/img.png",
    ],
    datePublished: new Date(article.publishedAt).toISOString(),
    author: {
      "@type": "Person",
      name: article.author || "HitungSaham",
    },
    publisher: {
      "@type": "Organization",
      name: "HitungSaham.com",
      url: "https://hitungsaham.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://hitungsaham.com/blog/${article.slug}`,
    },
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden text-(--landing-text) bg-(--landing-bg) font-sans">
      <TrackBlogView article={article} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* HEADER NAVBAR */}
      <LandingHeader />

      {/* ARTICLE CONTENT CONTAINER */}
      <main className="max-w-[1200px] w-full mx-auto px-5 sm:px-8 md:px-16 py-10 space-y-8 text-main">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-main mb-2"
        >
          <ArrowLeft size={14} /> Kembali ke Blog &amp; Artikel
        </Link>

        {/* ARTICLE HEADER */}
        <header className="space-y-4 border-b border-border-custom pb-8">
          <span className="inline-block px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-sub-slate text-main">
            {article.category}
          </span>

          <h1 className="text-3xl sm:text-5xl font-bold text-main leading-tight tracking-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-muted pt-2">
            <span>
              Oleh{" "}
              <strong className="text-main">
                {article.author || "HitungSaham"}
              </strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar size={13} />
              {new Date(article.publishedAt).toLocaleDateString("id-ID", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </header>

        {/* HERO IMAGE */}
        <div className="relative w-full h-[320px] sm:h-[440px] rounded-2xl overflow-hidden bg-[#111210]">
          <Image
            src={article.coverImage || "/assets/images/img.png"}
            alt={article.title}
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* EXCERPT CALLOUT */}
        {article.excerpt && (
          <div className="p-6 bg-card border-l-4 border-main rounded-r-xl text-base font-medium text-main leading-relaxed italic">
            {article.excerpt}
          </div>
        )}

        {/* ARTICLE BODY */}
        <article className="prose max-w-none space-y-6 pt-2 text-base leading-relaxed text-main prose-headings:text-main prose-p:text-main prose-strong:text-main prose-li:text-main prose-blockquote:text-main prose-code:text-main prose-a:text-acc-blue">
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </article>

        {/* CALCULATOR PROMO FOOTER BOX */}
        <div className="mt-12 flex flex-col items-center justify-between gap-6 rounded-2xl border border-white/10 bg-slate-900 p-8 text-white sm:flex-row">
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-300">
              <Calculator size={14} /> HitungSaham Tools
            </div>
            <h3 className="text-xl font-bold text-white">
              Butuh Menghitung Average Down Saham Kamu?
            </h3>
            <p className="text-xs text-gray-300 mt-1 max-w-md">
              Gunakan kalkulator simulasi gratis kami untuk menghitung target
              harga rata-rata dan batas ARA/ARB BEI secara presisi.
            </p>
          </div>
          <Link
            href="/#calculator"
            className="whitespace-nowrap rounded-xl bg-white px-5 py-3 text-xs font-bold text-slate-950 transition-colors hover:bg-slate-200"
          >
            Buka Kalkulator <ChevronRight size={14} className="inline ml-1" />
          </Link>
        </div>
      </main>

      {/* UNIFIED ACME FOOTER */}
      <Footer variant="acme" />
    </div>
  );
}
