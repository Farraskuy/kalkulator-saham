import type { Metadata } from "next";
import {
  getCachedFaqs,
  getCachedAraArbRules,
  getCachedFractionRules,
  getCachedTaxSetting,
  getCachedSiteDescription,
} from "@/lib/cached-data";
import LandingView from "@/components/landing/LandingView";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const description = await getCachedSiteDescription();
  const title =
    "Kalkulator Saham BEI: Hitung Target Profit, ARA ARB & Average Down | HitungSaham";
  const desc =
    description ||
    "Kalkulator saham online gratis & terlengkap untuk investor & trader BEI. Hitung simulasi target profit, batas ARA & ARB otomatis, average down, serta fee broker secara akurat.";

  return {
    title,
    description: desc,
    alternates: {
      canonical: "https://hitungsaham.com",
    },
    openGraph: {
      title,
      description: desc,
      url: "https://hitungsaham.com",
      siteName: "HitungSaham",
      locale: "id_ID",
      type: "website",
      images: [
        {
          url: "https://hitungsaham.com/opengraph-image.png",
          width: 1200,
          height: 630,
          alt: "HitungSaham - Kalkulator Saham BEI",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: ["https://hitungsaham.com/opengraph-image.png"],
    },
  };
}

export default async function HomePage() {
  const [fractionRules, araArbRules, tax, faqs] = await Promise.all([
    getCachedFractionRules(),
    getCachedAraArbRules(),
    getCachedTaxSetting(),
    getCachedFaqs(),
  ]);

  const faqJsonLd =
    faqs && faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <>
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <LandingView
        fractionRules={fractionRules}
        araArbRules={araArbRules}
        tax={tax}
        faqs={faqs}
      />
    </>
  );
}

