'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Edit3,
  Trash2,
  Eye,
  Lock,
  X,
  User as UserIcon,
  FileText,
  Mail,
  Calendar,
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
import { DynamicRole, CMSFeature, DEFAULT_DYNAMIC_ROLES } from '@/lib/rbac';

interface UserItem {
  id: string;
  email: string;
  name: string;
  role: string;
  accountType: 'ADMIN_CMS' | 'USER_REGISTERED';
  isProtected: boolean;
  image?: string | null;
  createdAt: string;
  calculationCount: number;
  permissions: CMSFeature[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<DynamicRole[]>(DEFAULT_DYNAMIC_ROLES);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [busy, setBusy] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<string>('EDITOR');

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [usersRes, rolesRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/roles'),
      ]);

      if (!usersRes.ok) {
        const errData = await usersRes.json();
        throw new Error(errData.error || 'Daftar pengguna gagal dimuat.');
      }

      const usersData = await usersRes.json();
      setUsers(usersData.users || []);

      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        if (rolesData.roles) setRoles(rolesData.roles);
      }
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Daftar pengguna gagal dimuat.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const columns = useMemo<AdminTableColumn<UserItem>[]>(
    () => [
      {
        id: 'user',
        label: 'Pengguna',
        getValue: (item) => `${item.name} ${item.email}`,
        render: (item) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {item.name ? item.name[0].toUpperCase() : item.email[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <span className="font-bold text-main block truncate">{item.name}</span>
              <span className="text-muted text-[11px] block truncate">{item.email}</span>
            </div>
          </div>
        ),
      },
      {
        id: 'role',
        label: 'Role',
        getValue: (item) => item.role,
        render: (item) => {
          const isAdmin = item.role === 'ADMIN' || item.isProtected;
          const matchedRole = roles.find((r) => r.id.toLowerCase() === item.role.toLowerCase());
          const roleName = matchedRole ? matchedRole.name : item.role;

          return isAdmin ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
              <ShieldCheck size={11} /> ADMIN (PROTECTED)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
              {roleName.toUpperCase()}
            </span>
          );
        },
      },
      {
        id: 'accountType',
        label: 'Tipe Akun',
        getValue: (item) => (item.accountType === 'ADMIN_CMS' ? 'CMS Login' : 'Google OAuth'),
        render: (item) => (
          <span className="text-xs text-muted font-medium">
            {item.accountType === 'ADMIN_CMS' ? 'Akses Login CMS' : 'Google OAuth / Terdaftar'}
          </span>
        ),
      },
      {
        id: 'createdAt',
        label: 'Terdaftar',
        getValue: (item) => new Date(item.createdAt),
        render: (item) => (
          <span className="whitespace-nowrap text-xs text-muted">
            {new Date(item.createdAt).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        ),
      },
    ],
    [roles]
  );

  const assignableRoles = useMemo(() => {
    return roles.filter((r) => r.id !== 'USER');
  }, [roles]);

  // Handlers
  const handleOpenAdd = () => {
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole(assignableRoles[0]?.id || 'CONTENT_MANAGER');
    setIsAddOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail.trim()) return;

    setBusy(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          password: formPassword,
          role: formRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menambahkan pengguna.');

      setNotice({ type: 'success', text: data.message || `Pengguna "${formEmail}" berhasil ditambahkan.` });
      setIsAddOpen(false);
      loadData();
    } catch (err) {
      setNotice({ type: 'error', text: err instanceof Error ? err.message : 'Gagal menambahkan pengguna.' });
    } finally {
      setBusy(false);
    }
  };

  const handleOpenDetail = (user: UserItem) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
  };

  const handleOpenEdit = (user: UserItem) => {
    setSelectedUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormPassword('');
    setIsEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          role: formRole,
          password: formPassword || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memperbarui pengguna.');

      setNotice({ type: 'success', text: 'Data pengguna berhasil diperbarui.' });
      setIsEditOpen(false);
      loadData();
    } catch (err) {
      setNotice({ type: 'error', text: err instanceof Error ? err.message : 'Gagal memperbarui pengguna.' });
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteTarget.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus pengguna.');

      setNotice({ type: 'success', text: `Pengguna “${deleteTarget.email}” berhasil dihapus.` });
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      setNotice({ type: 'error', text: err instanceof Error ? err.message : 'Gagal menghapus pengguna.' });
    } finally {
      setBusy(false);
    }
  };

  const [userTab, setUserTab] = useState<'cms' | 'public'>('cms');

  const cmsUsers = useMemo(() => {
    return users.filter(
      (u) => u.accountType === 'ADMIN_CMS' || u.role === 'ADMIN' || u.role !== 'USER'
    );
  }, [users]);

  const publicUsers = useMemo(() => {
    return users.filter(
      (u) => u.accountType !== 'ADMIN_CMS' && u.role === 'USER'
    );
  }, [users]);

  const activeUserList = userTab === 'cms' ? cmsUsers : publicUsers;

  return (
    <AdminCrudPage>
      <AdminCrudHeader
        title="Manajemen Pengguna"
        description="Kelola akun staf CMS, penugasan role, dan pengguna publik terdaftar."
        onActionClick={handleOpenAdd}
        actionLabel="Tambah Pengguna"
        icon={Users}
      />

      {notice && (
        <AdminCrudNotice type={notice.type} onClose={() => setNotice(null)}>
          {notice.text}
        </AdminCrudNotice>
      )}

      {/* TABS: PENGGUNA CMS VS PENGGUNA PUBLIK */}
      <div className="flex items-center gap-2 border-b border-border-custom pb-3 mb-5">
        <button
          type="button"
          onClick={() => setUserTab('cms')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            userTab === 'cms'
              ? 'bg-acc-blue text-white shadow-xs'
              : 'bg-sub-slate/60 text-muted hover:bg-sub-slate hover:text-main'
          }`}
        >
          <ShieldCheck size={14} />
          <span>Pengguna CMS &amp; Staf ({cmsUsers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setUserTab('public')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            userTab === 'public'
              ? 'bg-acc-blue text-white shadow-xs'
              : 'bg-sub-slate/60 text-muted hover:bg-sub-slate hover:text-main'
          }`}
        >
          <UserIcon size={14} />
          <span>Pengguna Publik ({publicUsers.length})</span>
        </button>
      </div>

      {loading ? (
        <AdminCrudLoading label="Memuat daftar pengguna..." />
      ) : loadError ? (
        <AdminCrudError message={loadError} onRetry={loadData} />
      ) : (
        <AdminDataTable
          title={userTab === 'cms' ? 'Daftar Pengguna CMS' : 'Daftar Pengguna Publik'}
          description={
            userTab === 'cms'
              ? `${cmsUsers.length} staf & pengelola CMS tersimpan.`
              : `${publicUsers.length} pengguna publik terdaftar via Google OAuth.`
          }
          items={activeUserList}
          columns={columns}
          getKey={(item) => item.id}
          searchFields={(item) => [item.name, item.email, item.role]}
          searchPlaceholder="Cari nama atau email pengguna..."
          emptyText={
            userTab === 'cms'
              ? 'Tidak ada pengguna CMS yang cocok.'
              : 'Tidak ada pengguna publik yang cocok.'
          }
          renderActions={(item) => {
            const isAdmin = item.role === 'ADMIN' || item.isProtected;
            return (
              <>
                <button
                  type="button"
                  onClick={() => handleOpenDetail(item)}
                  className={iconActionClass}
                  title="Lihat Detail Pengguna"
                >
                  <Eye size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(item)}
                  className={iconActionClass}
                  title="Edit Pengguna"
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
                    title="Hapus Pengguna"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </>
            );
          }}
        />
      )}

      {/* DETAIL MODAL (DIPISAH) */}
      {isDetailOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity animate-in fade-in duration-200">
          <div className="bg-card text-main w-full max-w-md rounded-2xl border border-border-custom shadow-2xl overflow-hidden flex flex-col relative max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-border-custom bg-sub-slate/30 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-acc-blue/10 text-acc-blue">
                  <UserIcon size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-main">Detail Pengguna</h3>
                  <span className="text-xs text-muted">{selectedUser.email}</span>
                </div>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="text-muted hover:text-main p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto landing-scroller">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-xl bg-sub-slate/40 border border-border-custom text-xs">
                  <span className="text-muted font-medium">Nama Lengkap</span>
                  <strong className="text-main font-bold">{selectedUser.name}</strong>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-sub-slate/40 border border-border-custom text-xs">
                  <span className="text-muted font-medium">Role</span>
                  <span className="font-bold text-indigo-700 dark:text-indigo-400">{selectedUser.role}</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-sub-slate/40 border border-border-custom text-xs">
                  <span className="text-muted font-medium">Tipe Akun</span>
                  <span className="font-medium text-main">
                    {selectedUser.accountType === 'ADMIN_CMS' ? 'Akses Login CMS (Password)' : 'Google OAuth Terdaftar'}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-sub-slate/40 border border-border-custom text-xs">
                  <span className="text-muted font-medium">Tanggal Dibuat</span>
                  <span className="font-medium text-main">
                    {new Date(selectedUser.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border-custom bg-sub-slate/30 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:bg-sub-slate hover:text-main cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity animate-in fade-in duration-200">
          <div className="bg-card text-main w-full max-w-md rounded-2xl border border-border-custom shadow-2xl overflow-hidden flex flex-col relative">
            <div className="flex items-center justify-between p-5 border-b border-border-custom bg-sub-slate/30 shrink-0">
              <div className="flex items-center gap-2">
                <UserPlus size={18} className="text-acc-blue" />
                <h3 className="text-sm font-bold text-main">Tambah Pengguna Baru</h3>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-muted hover:text-main p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted block">Nama Lengkap</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Budi Santoso"
                  className="w-full bg-page rounded-xl px-3.5 py-2.5 text-xs text-main border border-border-custom outline-none focus:ring-1 focus:ring-acc-blue placeholder:text-muted"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted block">Email Pengguna *</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="staf@hitungsaham.com"
                  className="w-full bg-page rounded-xl px-3.5 py-2.5 text-xs text-main border border-border-custom outline-none focus:ring-1 focus:ring-acc-blue placeholder:text-muted"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted block">Pilihan Role *</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full bg-page rounded-xl px-3.5 py-2.5 text-xs text-main border border-border-custom outline-none focus:ring-1 focus:ring-acc-blue cursor-pointer"
                >
                  {assignableRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} {r.isProtected ? '(Protected Admin)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {formRole !== 'USER' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted block">Password Login CMS *</label>
                  <input
                    type="password"
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full bg-page rounded-xl px-3.5 py-2.5 text-xs text-main border border-border-custom outline-none focus:ring-1 focus:ring-acc-blue placeholder:text-muted"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border-custom">
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
                  {busy ? 'Menyimpan...' : 'Tambah Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity animate-in fade-in duration-200">
          <div className="bg-card text-main w-full max-w-md rounded-2xl border border-border-custom shadow-2xl overflow-hidden flex flex-col relative">
            <div className="flex items-center justify-between p-5 border-b border-border-custom bg-sub-slate/30 shrink-0">
              <div className="flex items-center gap-2">
                <Edit3 size={18} className="text-acc-blue" />
                <h3 className="text-sm font-bold text-main">Edit Pengguna</h3>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-muted hover:text-main p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted block">Email (Tetap)</label>
                <input
                  type="email"
                  disabled
                  value={formEmail}
                  className="w-full bg-sub-slate rounded-xl px-3.5 py-2.5 text-xs text-muted border border-border-custom cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted block">Nama Lengkap</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-page rounded-xl px-3.5 py-2.5 text-xs text-main border border-border-custom outline-none focus:ring-1 focus:ring-acc-blue"
                />
              </div>

              {selectedUser.role !== 'ADMIN' && !selectedUser.isProtected && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted block">Pilihan Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full bg-page rounded-xl px-3.5 py-2.5 text-xs text-main border border-border-custom outline-none focus:ring-1 focus:ring-acc-blue cursor-pointer"
                  >
                    {assignableRoles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} {r.isProtected ? '(Protected Admin)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted block">
                  Ubah Password Login CMS (Opsional)
                </label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Kosongkan jika tidak ingin mengubah password"
                  className="w-full bg-page rounded-xl px-3.5 py-2.5 text-xs text-main border border-border-custom outline-none focus:ring-1 focus:ring-acc-blue placeholder:text-muted"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border-custom">
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
                  {busy ? 'Menyimpan...' : 'Perbarui Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE DIALOG */}
      {deleteTarget && (
        <AdminDeleteDialog
          title="Hapus pengguna?"
          description={`Pengguna “${deleteTarget.email}” akan dihapus permanen dari sistem.`}
          busy={busy}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </AdminCrudPage>
  );
}
