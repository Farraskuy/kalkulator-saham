"use client";

import React, { useEffect, useState } from "react";
import { Save, Coins } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { AdminCrudHeader } from "@/features/admin/components/AdminCrudHeader";

export default function AdminTaxesPage() {
  const { showToast } = useToast();
  const [taxSetting, setTaxSetting] = useState<number>(0.0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.tax !== undefined) setTaxSetting(parseFloat(data.tax) || 0.0);
      })
      .catch((err) => console.error("Failed to load tax setting:", err));
  }, []);

  const handleSaveTax = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tax: taxSetting }),
      });

      if (res.ok) {
        showToast("Tarif pajak transaksi berhasil diperbarui!", "success");
      } else {
        showToast("Gagal menyimpan tarif pajak.", "error");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <AdminCrudHeader
        title="Pajak Transaksi"
        description="Kelola persentase tarif pajak transaksi global yang diterapkan pada simulasi kalkulator saham."
        icon={Coins}
      />

      <div className="bg-card rounded-3xl p-6 border border-border-custom max-w-2xl">
        <form onSubmit={handleSaveTax} className="space-y-5">
          <div className="bg-sub-slate p-5 rounded-2xl space-y-3">
            <h4 className="font-extrabold text-xs text-main tracking-wide">
              Pengaturan Pajak Transaksi Global
            </h4>
            <p className="text-[11px] text-muted leading-relaxed">
              Tarif pajak ini secara otomatis akan ditambahkan pada simulasi
              biaya pembelian (buy) dan dikurangkan pada simulasi hasil
              penjualan (sell) di seluruh kalkulator saham publik.
            </p>

            <div className="space-y-1.5 pt-2 max-w-[220px]">
              <label className="text-[10px] font-bold text-muted block">
                Tarif Pajak (%)
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  className="w-full bg-card rounded-xl px-3 py-2 text-main font-semibold outline-none border border-border-custom focus:border-acc-blue text-xs pr-8"
                  value={taxSetting}
                  onChange={(e) =>
                    setTaxSetting(parseFloat(e.target.value) || 0.0)
                  }
                />
                <span className="absolute right-3 text-xs font-bold text-muted pointer-events-none">
                  %
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-1.5 bg-acc-blue hover:bg-acc-blue/90 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save size={15} />
            <span>{saving ? "Menyimpan..." : "Simpan Pengaturan Pajak"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
