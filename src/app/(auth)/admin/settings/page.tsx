'use client';

import React, { useEffect, useState } from 'react';
import { Save, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { AdminCrudHeader } from '@/features/admin/components/AdminCrudHeader';

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [siteDescription, setSiteDescription] = useState('');
  const [terms, setTerms] = useState('');
  const [shareDisclaimer, setShareDisclaimer] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.siteDescription) setSiteDescription(data.siteDescription);
        if (data.terms) setTerms(data.terms);
        if (data.shareDisclaimer) setShareDisclaimer(data.shareDisclaimer);
      })
      .catch((err) => console.error('Failed to load settings:', err));
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteDescription, terms, shareDisclaimer }),
      });

      if (res.ok) {
        showToast('Pengaturan Website, SEO & Disclaimer berhasil diperbarui!', 'success');
      } else {
        showToast('Gagal menyimpan pengaturan.', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan jaringan.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <AdminCrudHeader
        title="Pengaturan Web & SEO"
        description="Kelola deskripsi platform global (SEO & Footer) serta teks disclaimer yang ditampilkan di website."
        icon={FileText}
      />

      <div className="bg-card rounded-3xl p-6 border border-border-custom max-w-3xl">
        <form onSubmit={handleSaveSettings} className="space-y-5">
          {/* Global SEO & Platform Description Textarea */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-muted block">
                Deskripsi Global Website (SEO Google / Mesin Pencari &amp; Footer)
              </label>
            </div>
            <textarea
              className="w-full bg-page rounded-xl px-4 py-3 text-main font-semibold outline-none focus:border-acc-blue text-xs"
              rows={3}
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              placeholder="Platform personal berisi kalkulator simulasi matematis saham serta artikel & blog opini pribadi."
              style={{ resize: 'vertical' }}
            />
            <p className="text-[10px] text-muted leading-relaxed pt-0.5">
              Teks deskripsi ini digunakan sebagai <strong>Meta Description SEO</strong> di Google / mesin pencari, kartu preview link media sosial (OpenGraph / Twitter), dan profil platform di bawah logo footer.
            </p>
          </div>

          {/* Terms & Conditions Textarea */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted block">Teks Syarat & Ketentuan (Disclaimer Footer)</label>
            <textarea
              className="w-full bg-page rounded-xl px-4 py-3 text-main font-semibold outline-none focus:border-acc-blue text-xs"
              rows={6}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              required
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Share Disclaimer Textarea */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted block">Teks Disclaimer Hasil Share Gambar (Watermark)</label>
            <textarea
              className="w-full bg-page rounded-xl px-4 py-3 text-main font-semibold outline-none focus:border-acc-blue text-xs"
              rows={4}
              value={shareDisclaimer}
              onChange={(e) => setShareDisclaimer(e.target.value)}
              required
              style={{ resize: 'vertical' }}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-1.5 bg-acc-blue hover:bg-acc-blue/90 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save size={15} />
            <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan Web'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
