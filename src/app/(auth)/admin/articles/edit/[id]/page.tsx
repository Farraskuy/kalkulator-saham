'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, BookOpen, RefreshCw } from 'lucide-react';

export default function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    id: '',
    title: '',
    slug: '',
    category: 'Edukasi Saham',
    type: 'BLOG',
    excerpt: '',
    content: '',
    coverImage: '',
    author: 'Tim Redaksi',
    source: 'HitungSaham',
  });

  const [categoriesList, setCategoriesList] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategoriesList(data.categories || []))
      .catch(() => {});

    if (id) {
      fetch('/api/articles')
        .then((res) => res.json())
        .then((data) => {
          const found = (data.articles || []).find((a: { id: string }) => a.id === id);
          if (found) {
            setForm({
              id: found.id,
              title: found.title || '',
              slug: found.slug || '',
              category: found.category || 'Edukasi Saham',
              type: found.type || 'BLOG',
              excerpt: found.excerpt || '',
              content: found.content || '',
              coverImage: found.coverImage || '',
              author: found.author || 'Tim Redaksi',
              source: found.source || 'HitungSaham',
            });
          } else {
            alert('Artikel tidak ditemukan.');
            router.push('/admin/articles');
          }
        })
        .catch(() => {
          alert('Gagal memuat data artikel.');
        })
        .finally(() => setLoading(false));
    }
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.slug || !form.excerpt || !form.content) {
      alert('Mohon isi semua bidang formulir yang wajib.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/articles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push('/admin/articles');
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal memperbarui artikel.');
      }
    } catch {
      alert('Terjadi kesalahan koneksi server.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-muted font-semibold flex items-center justify-center gap-2">
        <RefreshCw size={18} className="animate-spin text-acc-blue" /> Memuat data artikel...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in pb-12">
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/articles"
          className="inline-flex items-center gap-2 text-xs font-bold text-muted hover:text-main transition-colors"
        >
          <ArrowLeft size={16} /> Kembali ke Kelola Artikel
        </Link>
      </div>

      <div className="bg-card rounded-2xl border border-border-custom/50 shadow-sm p-6 sm:p-8 text-main space-y-6">
        <div>
          <div className="text-[10px] font-bold text-acc-blue uppercase tracking-widest">
            CMS Konten Saham
          </div>
          <h1 className="text-xl sm:text-2xl font-black mt-1 flex items-center gap-2">
            <BookOpen size={22} className="text-acc-blue" />
            Edit Artikel / Blog
          </h1>
          <p className="text-xs text-muted mt-1">
            Ubah data artikel di bawah ini, lalu klik Simpan Perubahan.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-main block">
                Judul Artikel <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full bg-sub-slate/50 border border-border-custom/60 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-main outline-none focus:ring-1 focus:ring-acc-blue"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Judul artikel"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-main block">
                Slug URL <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full bg-sub-slate/50 border border-border-custom/60 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-main outline-none focus:ring-1 focus:ring-acc-blue"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="slug-url-artikel"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-main block">Kategori</label>
              <select
                className="w-full bg-sub-slate/50 border border-border-custom/60 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-main outline-none focus:ring-1 focus:ring-acc-blue"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {categoriesList.length > 0 ? (
                  categoriesList.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Catatan & Artikel">Catatan &amp; Artikel</option>
                    <option value="Edukasi Saham">Edukasi Saham</option>
                    <option value="Analisis Pasar">Analisis Pasar</option>
                    <option value="Tips & Trik">Tips &amp; Trik</option>
                    <option value="Pengalaman">Pengalaman</option>
                  </>
                )}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-main block">Penulis</label>
              <input
                type="text"
                className="w-full bg-sub-slate/50 border border-border-custom/60 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-main outline-none focus:ring-1 focus:ring-acc-blue"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-main block">Sumber / Publisher</label>
              <input
                type="text"
                className="w-full bg-sub-slate/50 border border-border-custom/60 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-main outline-none focus:ring-1 focus:ring-acc-blue"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-main block">URL Gambar Sampul (Cover Image)</label>
            <input
              type="text"
              className="w-full bg-sub-slate/50 border border-border-custom/60 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-main outline-none focus:ring-1 focus:ring-acc-blue"
              value={form.coverImage}
              onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
              placeholder="Contoh: /assets/images/img.png atau https://..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-main block">
              Ringkasan / Excerpt <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              className="w-full bg-sub-slate/50 border border-border-custom/60 rounded-xl p-3.5 text-xs text-main outline-none focus:ring-1 focus:ring-acc-blue resize-none"
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="Ringkasan singkat isi artikel"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-main block">
              Isi Konten Lengkap (Format Markdown) <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={12}
              className="w-full bg-sub-slate/50 border border-border-custom/60 rounded-xl p-3.5 text-xs text-main outline-none focus:ring-1 focus:ring-acc-blue font-mono"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Tuliskan isi artikel lengkap di sini..."
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border-custom/40">
            <Link
              href="/admin/articles"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-sub-slate text-muted hover:text-main transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-acc-blue text-white hover:bg-acc-blue/90 cursor-pointer shadow-md transition-all disabled:opacity-50"
            >
              <Save size={16} />
              <span>{submitting ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
