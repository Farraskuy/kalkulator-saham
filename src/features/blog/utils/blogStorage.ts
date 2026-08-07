export interface RecentlyViewedBlog {
  slug: string;
  title: string;
  category: string;
  coverImage?: string | null;
  publishedAt: string;
  timestamp: number;
}

const SEARCH_HISTORY_KEY = 'hitungsaham_blog_search_history';
const RECENT_VIEWED_KEY = 'hitungsaham_recent_blogs';

// SEARCH HISTORY UTILS
export function getSearchHistory(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(SEARCH_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addSearchHistory(query: string): string[] {
  if (typeof window === 'undefined' || !query.trim()) return getSearchHistory();
  try {
    const history = getSearchHistory().filter(
      (q) => q.toLowerCase() !== query.trim().toLowerCase()
    );
    const updated = [query.trim(), ...history].slice(0, 6);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function removeSearchHistoryItem(query: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const updated = getSearchHistory().filter(
      (q) => q.toLowerCase() !== query.trim().toLowerCase()
    );
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearSearchHistory(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
    return [];
  } catch {
    return [];
  }
}

// RECENTLY VIEWED BLOGS UTILS
export function getRecentlyViewedBlogs(): RecentlyViewedBlog[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(RECENT_VIEWED_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewedBlog(blog: {
  slug: string;
  title: string;
  category: string;
  coverImage?: string | null;
  publishedAt: string;
}): RecentlyViewedBlog[] {
  if (typeof window === 'undefined' || !blog.slug) return getRecentlyViewedBlogs();
  try {
    const current = getRecentlyViewedBlogs().filter((b) => b.slug !== blog.slug);
    const newItem: RecentlyViewedBlog = {
      ...blog,
      timestamp: Date.now(),
    };
    const updated = [newItem, ...current].slice(0, 10);
    localStorage.setItem(RECENT_VIEWED_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}
