import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/db';
import type { FaqItemData } from '@/types';
import type { FractionRule } from '@/types';

/**
 * 1. Cached FAQs fetcher with Next.js Server Cache & Revalidation Tag
 */
export const getCachedFaqs = unstable_cache(
  async (): Promise<FaqItemData[]> => {
    try {
      const faqs = await prisma.faqItem.findMany({
        orderBy: { order: 'asc' },
      });
      return faqs || [];
    } catch (err) {
      console.error('Error fetching cached FAQs:', err);
      return [];
    }
  },
  ['faqs-list-cache'],
  {
    revalidate: 3600, // 1 hour cache TTL
    tags: ['faqs'],
  }
);

/**
 * 2. Cached Articles fetcher with Next.js Server Cache & Revalidation Tag
 */
export const getCachedArticles = unstable_cache(
  async () => {
    try {
      return await prisma.article.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' },
      });
    } catch (err) {
      console.error('Error fetching cached Articles:', err);
      return [];
    }
  },
  ['articles-list-cache'],
  {
    revalidate: 3600,
    tags: ['articles'],
  }
);

/**
 * 3. Cached Article by Slug fetcher
 */
export const getCachedArticleBySlug = (slug: string) =>
  unstable_cache(
    async () => {
      try {
        return await prisma.article.findFirst({
          where: { slug, status: 'PUBLISHED' },
        });
      } catch (err) {
        console.error(`Error fetching cached Article by slug [${slug}]:`, err);
        return null;
      }
    },
    [`article-slug-cache-${slug}`],
    {
      revalidate: 3600,
      tags: ['articles', `article-${slug}`],
    }
  )();

/**
 * 4. Cached Fraction Rules fetcher
 */
export const getCachedFractionRules = unstable_cache(
  async (): Promise<FractionRule[] | undefined> => {
    try {
      const rules = await prisma.fractionRule.findMany({
        orderBy: { minPrice: 'asc' },
      });
      return rules.length > 0 ? (rules as FractionRule[]) : undefined;
    } catch (err) {
      console.error('Error fetching cached fraction rules:', err);
      return undefined;
    }
  },
  ['fraction-rules-list-cache'],
  {
    revalidate: 3600,
    tags: ['fraction-rules'],
  }
);

/**
 * 5. Cached Tax Setting fetcher
 */
export const getCachedTaxSetting = unstable_cache(
  async (): Promise<number> => {
    try {
      const setting = await prisma.systemSetting.findUnique({
        where: { key: 'tax' },
      });
      return setting ? parseFloat(setting.value) || 0 : 0;
    } catch (err) {
      console.error('Error fetching cached tax setting:', err);
      return 0;
    }
  },
  ['tax-setting-cache'],
  {
    revalidate: 3600,
    tags: ['system-settings'],
  }
);

/**
 * 6. Cached Categories fetcher
 */
export const getCachedCategories = unstable_cache(
  async () => {
    try {
      return await prisma.category.findMany({
        orderBy: { order: 'asc' },
      });
    } catch (err) {
      console.error('Error fetching cached categories:', err);
      return [];
    }
  },
  ['categories-list-cache'],
  {
    revalidate: 3600,
    tags: ['categories'],
  }
);
