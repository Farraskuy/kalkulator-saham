'use client';

import { useEffect } from 'react';
import { addRecentlyViewedBlog } from '../utils/blogStorage';

interface TrackBlogViewProps {
  article: {
    slug: string;
    title: string;
    category: string;
    coverImage?: string | null;
    publishedAt: string | Date;
  };
}

export default function TrackBlogView({ article }: TrackBlogViewProps) {
  useEffect(() => {
    if (article && article.slug) {
      addRecentlyViewedBlog({
        slug: article.slug,
        title: article.title,
        category: article.category,
        coverImage: article.coverImage,
        publishedAt:
          typeof article.publishedAt === 'string'
            ? article.publishedAt
            : article.publishedAt.toISOString(),
      });
    }
  }, [article]);

  return null;
}
