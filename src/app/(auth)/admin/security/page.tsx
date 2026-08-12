'use client';

import React, { useState } from 'react';
import { Save, Lock } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { AdminCrudHeader } from '@/features/admin/components/AdminCrudHeader';

export default function AdminSecurityPage() {
  const { showToast } = useToast();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (newPassword !== confirmPassword) {
      showToast('Konfirmasi password baru tidak cocok!', 'error');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Password admin berhasil diperbarui!', 'success');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(data.error || 'Gagal mengubah password.', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan jaringan.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <AdminCrudHeader title="Keamanan Akun" description="Ganti password keamanan Anda untuk membatasi akses Admin CMS." icon={Lock} />

      <div className="bg-card rounded-3xl p-6 border border-border-custom max-w-md">

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted block">Password Lama</label>
              <input
                type="password"
                className="w-full bg-page rounded-xl px-4 py-3 text-main font-semibold outline-none focus:border-acc-blue"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted block">Password Baru</label>
              <input
                type="password"
                className="w-full bg-page rounded-xl px-4 py-3 text-main font-semibold outline-none focus:border-acc-blue"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Minimal 6 karakter"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted block">Konfirmasi Password Baru</label>
              <input
                type="password"
                className="w-full bg-page rounded-xl px-4 py-3 text-main font-semibold outline-none focus:border-acc-blue"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-1.5 bg-acc-blue hover:bg-acc-blue/90 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50 mt-2"
            >
              <Save size={15} />
              <span>{saving ? 'Memperbarui...' : 'Perbarui Password Admin'}</span>
            </button>
          </form>
      </div>
    </div>
  );
}
