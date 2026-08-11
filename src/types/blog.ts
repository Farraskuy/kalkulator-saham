export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  order: number;
}

export interface ArticleData {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  type: string;
  status: 'DRAFT' | 'PUBLISHED';
  coverImage?: string | null;
  author?: string | null;
  source?: string | null;
  publishedAt: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
