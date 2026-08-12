'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Edit3, Tag, Trash2 } from 'lucide-react';
import AdminDataTable, { type AdminTableColumn } from '@/features/admin/components/AdminDataTable';
import { AdminCrudError, AdminCrudHeader, AdminCrudLoading, AdminCrudNotice, AdminCrudPage, AdminDeleteDialog, deleteActionClass, iconActionClass } from '@/features/admin/components/AdminCrudUi';

type CategoryItem = { id: string; name: string; slug: string; order: number; createdAt: string };

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<CategoryItem[]>([]); const [loading, setLoading] = useState(true); const [loadError, setLoadError] = useState(''); const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null); const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null); const [deleting, setDeleting] = useState(false);
  const loadItems = useCallback(async () => { setLoading(true); setLoadError(''); try { const response = await fetch('/api/categories'); const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Daftar kategori gagal dimuat.'); setItems(data.categories || []); } catch (error) { setLoadError(error instanceof Error ? error.message : 'Daftar kategori gagal dimuat.'); } finally { setLoading(false); } }, []);
  useEffect(() => { loadItems(); }, [loadItems]);
  const columns = useMemo<AdminTableColumn<CategoryItem>[]>(() => [
    { id: 'order', label: 'Urutan', getValue: (item) => item.order, render: (item) => <span className="font-semibold text-acc-blue">#{item.order}</span>, className: 'w-24' },
    { id: 'name', label: 'Nama kategori', getValue: (item) => item.name, render: (item) => <span className="font-semibold text-main">{item.name}</span> },
    { id: 'slug', label: 'Slug URL', getValue: (item) => item.slug, render: (item) => <span className="font-mono text-xs text-muted">{item.slug}</span> },
    { id: 'createdAt', label: 'Dibuat', getValue: (item) => new Date(item.createdAt), render: (item) => <span className="whitespace-nowrap text-xs text-muted">{new Date(item.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span> },
  ], []);
  const confirmDelete = async () => { if (!deleteTarget) return; setDeleting(true); try { const response = await fetch(`/api/categories?id=${encodeURIComponent(deleteTarget.id)}`, { method: 'DELETE' }); const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Kategori gagal dihapus.'); setItems((current) => current.filter((item) => item.id !== deleteTarget.id)); setNotice({ type: 'success', text: `Kategori “${deleteTarget.name}” berhasil dihapus.` }); setDeleteTarget(null); } catch (error) { setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Kategori gagal dihapus.' }); } finally { setDeleting(false); } };
  return <AdminCrudPage><AdminCrudHeader title="Kategori Artikel" description="Kelola nama, slug URL, dan urutan kategori konten." actionHref="/admin/categories/new" actionLabel="Tambah kategori" icon={Tag} />{notice && <AdminCrudNotice type={notice.type} onClose={() => setNotice(null)}>{notice.text}</AdminCrudNotice>}{loading ? <AdminCrudLoading label="Memuat daftar kategori..." /> : loadError ? <AdminCrudError message={loadError} onRetry={loadItems} /> : <AdminDataTable title="Daftar kategori" description={`${items.length} kategori tersimpan di CMS.`} items={items} columns={columns} getKey={(item) => item.id} searchFields={(item) => [item.name, item.slug]} searchPlaceholder="Cari nama atau slug kategori..." emptyText="Tidak ada kategori yang cocok." renderActions={(item) => <><Link href={`/admin/categories/edit/${item.id}`} className={iconActionClass} title="Edit kategori"><Edit3 size={16} /></Link><button type="button" onClick={() => setDeleteTarget(item)} className={deleteActionClass} title="Hapus kategori"><Trash2 size={16} /></button></>} />}{deleteTarget && <AdminDeleteDialog title="Hapus kategori?" description={`Kategori “${deleteTarget.name}” akan dihapus permanen.`} busy={deleting} onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete} />}</AdminCrudPage>;
}
