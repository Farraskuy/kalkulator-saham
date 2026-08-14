'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Shield,
  ShieldCheck,
  Edit3,
  Trash2,
  Eye,
  Lock,
  Plus,
  X,
  Layers,
} from 'lucide-react';
import AdminDataTable, { type AdminTableColumn } from '@/features/admin/components/AdminDataTable';
import {
  AdminCrudError,
  AdminCrudHeader,
  AdminCrudLoading,
  AdminCrudNotice,
  AdminCrudPage,
  AdminDeleteDialog,
  deleteActionClass,
  iconActionClass,
} from '@/features/admin/components/AdminCrudUi';
import { CMS_FEATURES, CMSFeature, DynamicRole } from '@/lib/rbac';

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<DynamicRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DynamicRole | null>(null);
  const [selectedRole, setSelectedRole] = useState<DynamicRole | null>(null);
  const [busy, setBusy] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPermissions, setFormPermissions] = useState<CMSFeature[]>([]);

  const loadRoles = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await fetch('/api/admin/roles');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Daftar role gagal dimuat.');
      setRoles(data.roles || []);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Daftar role gagal dimuat.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const columns = useMemo<AdminTableColumn<DynamicRole>[]>(
    () => [
      {
        id: 'name',
        label: 'Nama Role',
        getValue: (item) => item.name,
        render: (item) => {
          const isAdmin = item.id === 'ADMIN' || item.isProtected;
          return (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-main block">{item.name}</span>
                {isAdmin && (
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                    (Protected)
                  </span>
                )}
              </div>
              <span className="font-mono text-[10px] text-muted block uppercase tracking-wider">{item.id}</span>
            </div>
          );
        },
      },
      {
        id: 'permissions',
        label: 'Izin',
        getValue: (item) =>
          item.id === 'ADMIN' || item.isProtected ? CMS_FEATURES.length : item.permissions?.length || 0,
        render: (item) => {
          const isAdmin = item.id === 'ADMIN' || item.isProtected;
          const count = isAdmin ? CMS_FEATURES.length : item.permissions?.length || 0;
          return (
            <span className={`font-bold text-xs ${isAdmin ? 'text-emerald-700 dark:text-emerald-400' : 'text-main'}`}>
              {count}
            </span>
          );
        },
      },
      {
        id: 'description',
        label: 'Deskripsi',
        getValue: (item) => item.description || '-',
        render: (item) => (
          <span className="text-xs text-muted max-w-xs line-clamp-1 block">
            {item.description || '-'}
          </span>
        ),
      },
    ],
    []
  );

  // Handlers
  const handleOpenAdd = () => {
    setFormName('');
    setFormDesc('');
    setFormPermissions(['overview', 'articles']);
    setIsAddOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setBusy(true);
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          description: formDesc,
          permissions: formPermissions,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membuat role.');

      setNotice({ type: 'success', text: `Role "${formName}" berhasil dibuat.` });
      setIsAddOpen(false);
      loadRoles();
    } catch (err) {
      setNotice({ type: 'error', text: err instanceof Error ? err.message : 'Gagal membuat role.' });
    } finally {
      setBusy(false);
    }
  };

  const handleOpenDetail = (role: DynamicRole) => {
    setSelectedRole(role);
    setIsDetailOpen(true);
  };

  const handleOpenEdit = (role: DynamicRole) => {
    setSelectedRole(role);
    setFormName(role.name);
    setFormDesc(role.description || '');
    setFormPermissions(role.permissions || []);
    setIsEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    setBusy(true);
    try {
      const isAdmin = selectedRole.id === 'ADMIN' || selectedRole.isProtected;
      const res = await fetch(`/api/admin/roles/${selectedRole.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: isAdmin ? 'Administrator' : formName,
          description: formDesc,
          permissions: isAdmin ? CMS_FEATURES.map((f) => f.id) : formPermissions,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memperbarui role.');

      setNotice({ type: 'success', text: `Role "${selectedRole.name}" berhasil diperbarui.` });
      setIsEditOpen(false);
      loadRoles();
    } catch (err) {
      setNotice({ type: 'error', text: err instanceof Error ? err.message : 'Gagal memperbarui role.' });
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/roles/${deleteTarget.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus role.');

      setNotice({ type: 'success', text: `Role "${deleteTarget.name}" berhasil dihapus.` });
      setDeleteTarget(null);
      loadRoles();
    } catch (err) {
      setNotice({ type: 'error', text: err instanceof Error ? err.message : 'Gagal menghapus role.' });
    } finally {
      setBusy(false);
    }
  };

  const displayRoles = useMemo(() => {
    return roles.filter((r) => r.id !== 'USER');
  }, [roles]);

  return (
    <AdminCrudPage>
      <AdminCrudHeader
        title="Role &amp; Hak Akses"
        description="Kelola role kustom dan konfigurasi hak akses modul CMS per-role."
        onActionClick={handleOpenAdd}
        actionLabel="Tambah Role"
        icon={Shield}
      />

      {notice && (
        <AdminCrudNotice type={notice.type} onClose={() => setNotice(null)}>
          {notice.text}
        </AdminCrudNotice>
      )}

      {loading ? (
        <AdminCrudLoading label="Memuat daftar role..." />
      ) : loadError ? (
        <AdminCrudError message={loadError} onRetry={loadRoles} />
      ) : (
        <AdminDataTable
          title="Daftar Role"
          description={`${displayRoles.length} role CMS tersimpan.`}
          items={displayRoles}
          columns={columns}
          getKey={(item) => item.id}
          searchFields={(item) => [item.name, item.id, item.description || '']}
          searchPlaceholder="Cari nama role..."
          emptyText="Tidak ada role yang cocok."
          renderActions={(item) => {
            const isAdmin = item.id === 'ADMIN' || item.isProtected;
            return (
              <>
                <button
                  type="button"
                  onClick={() => handleOpenDetail(item)}
                  className={iconActionClass}
                  title="Lihat Detail &amp; Hak Akses"
                >
                  <Eye size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(item)}
                  className={iconActionClass}
                  title="Edit Role &amp; Hak Akses"
                >
                  <Edit3 size={16} />
                </button>
                {isAdmin ? (
                  <button
                    type="button"
                    disabled
                    className="p-2 text-muted/30 cursor-not-allowed inline-flex items-center justify-center rounded-lg"
                    title="Role Admin terproteksi oleh sistem dan tidak dapat dihapus."
                  >
                    <Lock size={15} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className={deleteActionClass}
                    title="Hapus Role"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </>
            );
          }}
        />
      )}

      {/* DETAIL MODAL (KONSISTEN 100% DENGAN TAMBAH & EDIT) */}
      {isDetailOpen && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity animate-in fade-in duration-200">
          <div className="bg-card text-main w-full max-w-lg rounded-2xl border border-border-custom shadow-2xl overflow-hidden flex flex-col relative max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-border-custom bg-sub-slate/30 shrink-0">
              <div className="flex items-center gap-2">
                <Eye size={18} className="text-acc-blue" />
                <h3 className="text-sm font-bold text-main">Detail Role: {selectedRole.name}</h3>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="text-muted hover:text-main p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto landing-scroller">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted block">Nama Role</label>
                <input
                  type="text"
                  disabled
                  value={selectedRole.name}
                  className="w-full bg-sub-slate rounded-xl px-3.5 py-2.5 text-xs text-main border border-border-custom cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted block">Deskripsi Role</label>
                <input
                  type="text"
                  disabled
                  value={selectedRole.description || '-'}
                  className="w-full bg-sub-slate rounded-xl px-3.5 py-2.5 text-xs text-main border border-border-custom cursor-not-allowed"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-border-custom">
                <label className="text-[11px] font-bold text-muted block">
                  Izin Hak Akses Fitur CMS:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 border border-border-custom rounded-2xl bg-sub-slate/20">
                  {CMS_FEATURES.map((feature) => {
                    const isGranted =
                      selectedRole.id === 'ADMIN' ||
                      selectedRole.isProtected ||
                      (selectedRole.permissions || []).includes(feature.id);

                    return (
                      <div
                        key={feature.id}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs transition-all ${
                          isGranted
                            ? 'bg-acc-blue/10 border-acc-blue/40 text-main font-semibold'
                            : 'bg-card border-border-custom text-muted/50 opacity-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          disabled
                          checked={isGranted}
                          className="h-3.5 w-3.5 rounded text-acc-blue focus:ring-acc-blue cursor-not-allowed shrink-0"
                        />
                        <span className="leading-tight">{feature.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-custom">
                <button
                  type="button"
                  onClick={() => setIsDetailOpen(false)}
                  className="px-5 py-2 rounded-xl bg-acc-blue hover:bg-acc-blue/90 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity animate-in fade-in duration-200">
          <div className="bg-card text-main w-full max-w-lg rounded-2xl border border-border-custom shadow-2xl overflow-hidden flex flex-col relative max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-border-custom bg-sub-slate/30 shrink-0">
              <div className="flex items-center gap-2">
                <Plus size={18} className="text-acc-blue" />
                <h3 className="text-sm font-bold text-main">Tambah Role Baru</h3>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-muted hover:text-main p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4 overflow-y-auto landing-scroller">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted block">Nama Role *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Moderator Konten, Analis Riset"
                  className="w-full bg-page rounded-xl px-3.5 py-2.5 text-xs text-main border border-border-custom outline-none focus:ring-1 focus:ring-acc-blue placeholder:text-muted"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted block">Deskripsi Role</label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="e.g. Bertanggung jawab mengelola dan menerbitkan artikel..."
                  className="w-full bg-page rounded-xl px-3.5 py-2.5 text-xs text-main border border-border-custom outline-none focus:ring-1 focus:ring-acc-blue placeholder:text-muted"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-border-custom">
                <label className="text-[11px] font-bold text-muted block">
                  Izin Hak Akses Fitur CMS:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 border border-border-custom rounded-2xl bg-sub-slate/20">
                  {CMS_FEATURES.map((feature) => {
                    const isSelected = formPermissions.includes(feature.id);
                    return (
                      <label
                        key={feature.id}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-acc-blue/10 border-acc-blue/40 text-main font-semibold'
                            : 'bg-card border-border-custom text-muted hover:bg-sub-slate'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            setFormPermissions((prev) =>
                              prev.includes(feature.id)
                                ? prev.filter((f) => f !== feature.id)
                                : [...prev, feature.id]
                            );
                          }}
                          className="h-3.5 w-3.5 rounded text-acc-blue focus:ring-acc-blue cursor-pointer shrink-0"
                        />
                        <span className="leading-tight">{feature.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-custom">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:bg-sub-slate hover:text-main cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="px-5 py-2 rounded-xl bg-acc-blue hover:bg-acc-blue/90 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {busy ? 'Menyimpan...' : 'Simpan Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditOpen && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity animate-in fade-in duration-200">
          <div className="bg-card text-main w-full max-w-lg rounded-2xl border border-border-custom shadow-2xl overflow-hidden flex flex-col relative max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-border-custom bg-sub-slate/30 shrink-0">
              <div className="flex items-center gap-2">
                <Edit3 size={18} className="text-acc-blue" />
                <h3 className="text-sm font-bold text-main">Edit Role: {selectedRole.name}</h3>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-muted hover:text-main p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-5 space-y-4 overflow-y-auto landing-scroller">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted block">
                  Nama Role {selectedRole.id === 'ADMIN' || selectedRole.isProtected ? '(Tetap / Protected)' : '*'}
                </label>
                <input
                  type="text"
                  required
                  disabled={selectedRole.id === 'ADMIN' || selectedRole.isProtected}
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs border border-border-custom outline-none ${
                    selectedRole.id === 'ADMIN' || selectedRole.isProtected
                      ? 'bg-sub-slate text-muted cursor-not-allowed'
                      : 'bg-page text-main focus:ring-1 focus:ring-acc-blue'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted block">Deskripsi Role</label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-page rounded-xl px-3.5 py-2.5 text-xs text-main border border-border-custom outline-none focus:ring-1 focus:ring-acc-blue"
                />
              </div>

              {selectedRole.id === 'ADMIN' || selectedRole.isProtected ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                  🛡️ Role Admin selalu memiliki akses penuh ke seluruh modul CMS secara otomatis.
                </div>
              ) : (
                <div className="space-y-2 pt-2 border-t border-border-custom">
                  <label className="text-[11px] font-bold text-muted block">
                    Izin Hak Akses Fitur CMS:
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 border border-border-custom rounded-2xl bg-sub-slate/20">
                    {CMS_FEATURES.map((feature) => {
                      const isSelected = formPermissions.includes(feature.id);
                      return (
                        <label
                          key={feature.id}
                          className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-acc-blue/10 border-acc-blue/40 text-main font-semibold'
                              : 'bg-card border-border-custom text-muted hover:bg-sub-slate'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setFormPermissions((prev) =>
                                prev.includes(feature.id)
                                  ? prev.filter((f) => f !== feature.id)
                                  : [...prev, feature.id]
                              );
                            }}
                            className="h-3.5 w-3.5 rounded text-acc-blue focus:ring-acc-blue cursor-pointer shrink-0"
                          />
                          <span className="leading-tight">{feature.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-custom">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:bg-sub-slate hover:text-main cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="px-5 py-2 rounded-xl bg-acc-blue hover:bg-acc-blue/90 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {busy ? 'Menyimpan...' : 'Perbarui Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE DIALOG */}
      {deleteTarget && (
        <AdminDeleteDialog
          title="Hapus role?"
          description={`Role “${deleteTarget.name}” akan dihapus permanen. Pengguna dengan role ini akan dialihkan ke role default.`}
          busy={busy}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </AdminCrudPage>
  );
}
