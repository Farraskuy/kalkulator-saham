'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Plus, Trash2, Edit, RefreshCw } from 'lucide-react';

interface ArticleData {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  type: string;
  author?: string;
  source?: string;
  createdAt: string;
}

export default function ManageArticlesPage() {
  const [items, setItems] = useState<ArticleData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadArticles = async () => {
    setLoading(true);
    try {
      // Fetch all articles & blogs unified
      const res = await fetch('/api/articles');
      if (res.ok) {
        const data = await res.json();
        setItems(data.articles || []);
      }
    } catch (err) {
      console.error('Failed to load articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus artikel ini?')) return;
    try {
      const res = await fetch(`/api/articles?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadArticles();
      } else {
        alert('Gagal menghapus artikel.');
      }
    } catch {
      alert('Terjadi kesalahan koneksi server.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold text-acc-blue uppercase tracking-widest">
            CMS Konten Saham
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-main mt-0.5 flex items-center gap-2">
            <BookOpen size={22} className="text-acc-blue" />
            Kelola Artikel &amp; Blog Saham
          </h2>
        </div>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 bg-acc-blue hover:bg-acc-blue/90 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer shadow-sm w-fit"
        >
          <Plus size={16} />
          <span>Tambah Artikel Baru</span>
        </Link>
      </div>

      {/* UNIFIED ARTICLES & BLOGS TABLE */}
      <div className="bg-card rounded-2xl border border-border-custom/50 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-xs text-muted font-semibold flex items-center justify-center gap-2">
            <RefreshCw size={16} className="animate-spin text-acc-blue" /> Memuat daftar artikel &amp; blog...
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted font-semibold">
            Belum ada artikel atau blog terdaftar. Silakan klik tombol &quot;Tambah Artikel Baru&quot;.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-sub-slate/50 text-muted font-bold border-b border-border-custom/40">
                  <th className="py-3.5 px-4">Judul Artikel</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4">Penulis / Sumber</th>
                  <th className="py-3.5 px-4">Tanggal Buat</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom/40 text-main">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-sub-slate/30">
                    <td className="py-3.5 px-4 font-bold max-w-xs truncate">{item.title}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded bg-sub-blue text-acc-blue font-extrabold text-[10px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-muted">{item.author || 'Tim Redaksi'}</td>
                    <td className="py-3.5 px-4 text-muted">
                      {new Date(item.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/articles/edit/${item.id}`}
                          className="p-1.5 rounded-lg text-acc-blue hover:bg-sub-blue transition-colors cursor-pointer"
                          title="Edit Artikel"
                        >
                          <Edit size={15} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg text-acc-pink hover:bg-sub-pink transition-colors cursor-pointer"
                          title="Hapus Artikel"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
