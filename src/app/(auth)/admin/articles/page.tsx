'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Edit3,
  Eye,
  FilePenLine,
  FileText,
  LoaderCircle,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import type { ArticleData } from '@/types';

type ManagedArticle = ArticleData & {
  createdAt: string;
  updatedAt: string;
};

export default function ManageArticlesPage() {
  const [items, setItems] = useState<ManagedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'BLOG' | 'ARTICLE'>('ALL');
  const [deleteTarget, setDeleteTarget] = useState<ManagedArticle | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState('');

  const loadArticles = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const response = await fetch('/api/articles', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Daftar artikel gagal dimuat.');
      setItems(data.articles || []);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Daftar artikel gagal dimuat.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const filteredItems = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesQuery =
        !keyword ||
        item.title.toLowerCase().includes(keyword) ||
        item.category.toLowerCase().includes(keyword) ||
        item.author?.toLowerCase().includes(keyword);
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
      return matchesQuery && matchesStatus && matchesType;
    });
  }, [items, query, statusFilter, typeFilter]);

  const publishedCount = items.filter((item) => item.status === 'PUBLISHED').length;
  const draftCount = items.length - publishedCount;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/articles?id=${encodeURIComponent(deleteTarget.id)}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Artikel gagal dihapus.');
      setItems((current) => current.filter((item) => item.id !== deleteTarget.id));
      setNotice(`“${deleteTarget.title}” berhasil dihapus.`);
      setDeleteTarget(null);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Artikel gagal dihapus.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1280px] space-y-5 pb-10">
      <div className="flex flex-col gap-4 border-b border-border-custom pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-acc-blue">Manajemen konten</p>
          <h1 className="mt-0.5 text-xl font-bold tracking-tight text-main sm:text-2xl">Artikel &amp; blog</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">Tulis, review, publikasikan, dan kelola seluruh konten website dari satu tempat.</p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-acc-blue px-4 text-sm font-semibold text-white hover:bg-acc-blue/90"
        >
          <Plus size={17} /> Tulis artikel
        </Link>
      </div>

      {notice && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40">
          <span className="flex items-center gap-2"><CheckCircle2 size={17} /> {notice}</span>
          <button type="button" onClick={() => setNotice('')} aria-label="Tutup notifikasi"><X size={16} /></button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: 'Total konten', value: items.length, icon: BookOpen, color: 'text-acc-blue bg-sub-blue' },
          { label: 'Published', value: publishedCount, icon: Eye, color: 'text-emerald-600 bg-emerald-500/10' },
          { label: 'Draft', value: draftCount, icon: FilePenLine, color: 'text-amber-600 bg-amber-500/10' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="flex items-center gap-3 rounded-2xl border border-border-custom bg-card p-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}><Icon size={18} /></div>
            <div><p className="text-xs font-medium text-muted">{label}</p><p className="text-xl font-bold text-main">{value}</p></div>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-border-custom bg-card">
        <div className="flex flex-col gap-3 border-b border-border-custom p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative min-w-0 grow lg:max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-10 w-full rounded-xl border border-border-custom bg-page pl-10 pr-4 text-sm text-main outline-none focus:border-acc-blue focus:ring-2 focus:ring-acc-blue/10"
              placeholder="Cari judul, kategori, atau penulis..."
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
              className="h-10 rounded-xl border border-border-custom bg-card px-3 text-sm text-main outline-none focus:border-acc-blue"
              aria-label="Filter status"
            >
              <option value="ALL">Semua status</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as typeof typeFilter)}
              className="h-10 rounded-xl border border-border-custom bg-card px-3 text-sm text-main outline-none focus:border-acc-blue"
              aria-label="Filter jenis konten"
            >
              <option value="ALL">Semua jenis</option>
              <option value="BLOG">Blog</option>
              <option value="ARTICLE">Artikel</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-2 text-sm font-medium text-muted"><LoaderCircle size={18} className="animate-spin text-acc-blue" /> Memuat konten...</div>
        ) : loadError ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <p className="text-sm font-semibold text-rose-600">{loadError}</p>
            <button type="button" onClick={loadArticles} className="mt-3 rounded-xl border border-border-custom px-4 py-2 text-sm font-semibold text-main">Coba lagi</button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sub-slate text-muted"><FileText size={22} /></div>
            <h2 className="mt-3 text-sm font-bold text-main">Konten tidak ditemukan</h2>
            <p className="mt-1 text-sm text-muted">Ubah filter pencarian atau mulai menulis artikel baru.</p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-sub-slate/60 text-xs font-semibold text-muted">
                  <tr><th className="px-5 py-3">Konten</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Kategori</th><th className="px-4 py-3">Diperbarui</th><th className="px-5 py-3 text-right">Aksi</th></tr>
                </thead>
                <tbody className="divide-y divide-border-custom">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="transition-colors hover:bg-sub-slate/35">
                      <td className="max-w-md px-5 py-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sub-blue text-acc-blue"><FileText size={16} /></div>
                          <div className="min-w-0"><p className="truncate font-semibold text-main">{item.title}</p><p className="mt-1 truncate text-xs text-muted">/{item.slug} · {item.type === 'ARTICLE' ? 'Artikel' : 'Blog'}</p></div>
                        </div>
                      </td>
                      <td className="px-4 py-4"><StatusBadge status={item.status} /></td>
                      <td className="px-4 py-4 text-sm text-sub">{item.category}</td>
                      <td className="px-4 py-4 text-xs text-muted">{new Date(item.updatedAt || item.publishedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {item.status === 'PUBLISHED' && <Link href={`/blog/${item.slug}`} target="_blank" className="rounded-lg p-2 text-muted hover:bg-sub-slate hover:text-main" title="Lihat publik"><Eye size={16} /></Link>}
                          <Link href={`/admin/articles/edit/${item.id}`} className="rounded-lg p-2 text-acc-blue hover:bg-sub-blue" title="Edit"><Edit3 size={16} /></Link>
                          <button type="button" onClick={() => setDeleteTarget(item)} className="rounded-lg p-2 text-rose-600 hover:bg-rose-500/10" title="Hapus"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-border-custom md:hidden">
              {filteredItems.map((item) => (
                <article key={item.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-semibold leading-5 text-main">{item.title}</p><p className="mt-1 text-xs text-muted">{item.category} · {item.type === 'ARTICLE' ? 'Artikel' : 'Blog'}</p></div><StatusBadge status={item.status} /></div>
                  <p className="line-clamp-2 text-xs leading-5 text-muted">{item.excerpt}</p>
                  <div className="flex items-center justify-between border-t border-border-custom pt-3"><span className="text-[11px] text-muted">{new Date(item.updatedAt || item.publishedAt).toLocaleDateString('id-ID')}</span><div className="flex gap-1"><Link href={`/admin/articles/edit/${item.id}`} className="rounded-lg p-2 text-acc-blue hover:bg-sub-blue"><Edit3 size={16} /></Link><button type="button" onClick={() => setDeleteTarget(item)} className="rounded-lg p-2 text-rose-600 hover:bg-rose-500/10"><Trash2 size={16} /></button></div></div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      <p className="text-xs text-muted">Menampilkan {filteredItems.length} dari {items.length} konten.</p>

      {deleteTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-title">
          <div className="w-full max-w-md rounded-2xl border border-border-custom bg-card p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600"><Trash2 size={20} /></div>
            <h2 id="delete-title" className="mt-4 text-lg font-bold text-main">Hapus artikel?</h2>
            <p className="mt-2 text-sm leading-6 text-muted">“{deleteTarget.title}” akan dihapus permanen dan tidak lagi tersedia pada website.</p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" disabled={deleting} onClick={() => setDeleteTarget(null)} className="h-10 rounded-xl border border-border-custom px-4 text-sm font-semibold text-main">Batal</button>
              <button type="button" disabled={deleting} onClick={handleDelete} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white disabled:opacity-60">{deleting && <LoaderCircle size={16} className="animate-spin" />} Hapus permanen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: ArticleData['status'] }) {
  const published = status === 'PUBLISHED';
  return <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${published ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'}`}>{published ? 'Published' : 'Draft'}</span>;
}
