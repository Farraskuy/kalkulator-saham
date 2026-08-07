'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Tag, Plus, Trash2, Edit, Save, RefreshCw, X } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  order: number;
  createdAt: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (res.ok) {
        setCategories(data.categories || []);
      } else {
        setError(data.error || 'Gagal memuat kategori');
      }
    } catch {
      setError('Terjadi kesalahan koneksi ke server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setError('');
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditClick = (cat: CategoryItem) => {
    setEditingId(cat.id);
    setName(cat.name);
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const isEdit = Boolean(editingId);
      const url = '/api/categories';
      const method = isEdit ? 'PUT' : 'POST';
      const payload = isEdit
        ? { id: editingId, name, order: 0 }
        : { name, order: categories.length + 1 };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(isEdit ? 'Kategori berhasil diperbarui!' : 'Kategori baru berhasil ditambahkan!');
        setIsModalOpen(false);
        resetForm();
        fetchCategories();
      } else {
        setError(data.error || 'Gagal menyimpan kategori');
      }
    } catch {
      setError('Terjadi kesalahan koneksi ke server');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kategori "${catName}"?`)) return;

    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(`Kategori "${catName}" berhasil dihapus.`);
        fetchCategories();
      } else {
        setError(data.error || 'Gagal menghapus kategori');
      }
    } catch {
      setError('Terjadi kesalahan koneksi ke server');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold text-acc-blue uppercase tracking-widest">
            CMS Konten Saham
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-main mt-0.5 flex items-center gap-2">
            <Tag size={22} className="text-acc-blue" />
            Kelola Kategori Artikel &amp; Blog
          </h2>
        </div>

        {/* BUTTON TO OPEN ADD CATEGORY MODAL */}
        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-acc-blue hover:bg-acc-blue/90 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer shadow-sm w-fit"
        >
          <Plus size={16} />
          <span>Tambah Kategori Baru</span>
        </button>
      </div>

      {/* ALERTS */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-bold animate-fade-in">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold animate-fade-in">
          {success}
        </div>
      )}

      {/* CATEGORIES TABLE (WITHOUT MANUAL ORDER COLUMN) */}
      <div className="bg-card rounded-2xl border border-border-custom/50 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-xs text-muted font-semibold flex items-center justify-center gap-2">
            <RefreshCw size={16} className="animate-spin text-acc-blue" /> Memuat daftar kategori...
          </div>
        ) : categories.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted font-semibold">
            Belum ada kategori terdaftar. Silakan klik tombol &quot;Tambah Kategori Baru&quot;.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-sub-slate/50 text-muted font-bold border-b border-border-custom/40">
                  <th className="py-3.5 px-4">Nama Kategori</th>
                  <th className="py-3.5 px-4">Slug URL</th>
                  <th className="py-3.5 px-4">Tanggal Buat</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom/40 text-main">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-sub-slate/30">
                    <td className="py-3.5 px-4 font-bold">{cat.name}</td>
                    <td className="py-3.5 px-4 text-muted font-mono text-[11px]">{cat.slug}</td>
                    <td className="py-3.5 px-4 text-muted">
                      {new Date(cat.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditClick(cat)}
                          className="p-1.5 rounded-lg text-acc-blue hover:bg-sub-blue transition-colors cursor-pointer"
                          title="Edit Kategori"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="p-1.5 rounded-lg text-acc-pink hover:bg-sub-pink transition-colors cursor-pointer"
                          title="Hapus Kategori"
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

      {/* MODAL FOR ADDING / EDITING CATEGORY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border-custom/50 shadow-2xl overflow-hidden text-main">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-custom/40">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Tag size={18} className="text-acc-blue" />
                <span>{editingId ? 'Edit Kategori' : 'Tambah Kategori Baru'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-muted hover:text-main transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-main block">
                  Nama Kategori <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Edukasi Saham, Analisis Pasar..."
                  className="w-full bg-sub-slate/50 border border-border-custom/60 rounded-xl px-3.5 py-2.5 text-xs text-main font-semibold outline-none focus:ring-1 focus:ring-acc-blue transition-all"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-border-custom/40">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-sub-slate text-muted hover:text-main transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-acc-blue text-white hover:bg-acc-blue/90 cursor-pointer shadow-xs transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <RefreshCw size={15} className="animate-spin" />
                  ) : (
                    <Save size={15} />
                  )}
                  <span>{submitting ? 'Menyimpan...' : 'Simpan Kategori'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
