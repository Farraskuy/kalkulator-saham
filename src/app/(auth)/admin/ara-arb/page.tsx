"use client";

import React, { useEffect, useState } from "react";
import { Save, ShieldAlert, SlidersHorizontal, Info } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { AdminCrudHeader } from "@/features/admin/components/AdminCrudHeader";

export default function AdminAraArbPage() {
  const { showToast } = useToast();
  // Papan Utama, Ekonomi Baru, dan Pengembangan (3 rentang harga resmi BEI)
  const [araUtamaTier1, setAraUtamaTier1] = useState<number>(35); // Rp 50 - Rp 200
  const [arbUtamaTier1, setArbUtamaTier1] = useState<number>(15);

  const [araUtamaTier2, setAraUtamaTier2] = useState<number>(25); // Rp 200 - Rp 5.000
  const [arbUtamaTier2, setArbUtamaTier2] = useState<number>(15);

  const [araUtamaTier3, setAraUtamaTier3] = useState<number>(20); // > Rp 5.000
  const [arbUtamaTier3, setArbUtamaTier3] = useState<number>(15);

  // Papan Akselerasi & FCA
  const [araAkselerasi, setAraAkselerasi] = useState<number>(10);
  const [arbAkselerasi, setArbAkselerasi] = useState<number>(10);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/rules")
      .then((res) => res.json())
      .then((data) => {
        if (data.araArb) {
          const rules = data.araArb;
          if (rules.Utama_50_200?.[0]) {
            setAraUtamaTier1(rules.Utama_50_200[0].ara);
            setArbUtamaTier1(rules.Utama_50_200[0].arb);
          }
          if (rules.Utama_200_5000?.[0]) {
            setAraUtamaTier2(rules.Utama_200_5000[0].ara);
            setArbUtamaTier2(rules.Utama_200_5000[0].arb);
          } else if (rules.Utama?.[0]) {
            setAraUtamaTier2(rules.Utama[0].ara);
            setArbUtamaTier2(rules.Utama[0].arb);
          }
          if (rules.Utama_5000?.[0]) {
            setAraUtamaTier3(rules.Utama_5000[0].ara);
            setArbUtamaTier3(rules.Utama_5000[0].arb);
          }
          if (rules.Akselerasi?.[0]) {
            setAraAkselerasi(rules.Akselerasi[0].ara);
            setArbAkselerasi(rules.Akselerasi[0].arb);
          }
        }
      })
      .catch((err) => console.error("Failed to load ARA/ARB rules:", err));
  }, []);

  const handlePresetSimetris = () => {
    setAraUtamaTier1(35);
    setArbUtamaTier1(35);
    setAraUtamaTier2(25);
    setArbUtamaTier2(25);
    setAraUtamaTier3(20);
    setArbUtamaTier3(20);
    setAraAkselerasi(10);
    setArbAkselerasi(10);
    showToast(
      "Preset ARB Simetris resmi BEI telah diterapkan! Silakan klik Simpan.",
      "success",
    );
  };

  const handlePresetAsimetris = () => {
    setAraUtamaTier1(35);
    setArbUtamaTier1(15);
    setAraUtamaTier2(25);
    setArbUtamaTier2(15);
    setAraUtamaTier3(20);
    setArbUtamaTier3(15);
    setAraAkselerasi(10);
    setArbAkselerasi(10);
    showToast(
      "Preset ARB Asimetris 15% telah diterapkan! Silakan klik Simpan.",
      "success",
    );
  };

  const handleSaveRules = async () => {
    setSaving(true);
    try {
      const araArbData = {
        Utama_50_200: [
          {
            minPrice: 50,
            maxPrice: 200,
            ara: araUtamaTier1,
            arb: arbUtamaTier1,
          },
        ],
        Utama_200_5000: [
          {
            minPrice: 200,
            maxPrice: 5000,
            ara: araUtamaTier2,
            arb: arbUtamaTier2,
          },
        ],
        Utama_5000: [
          {
            minPrice: 5000,
            maxPrice: Infinity,
            ara: araUtamaTier3,
            arb: arbUtamaTier3,
          },
        ],
        Utama: [
          {
            minPrice: 1,
            maxPrice: Infinity,
            ara: araUtamaTier2,
            arb: arbUtamaTier2,
          },
        ],
        Akselerasi: [
          {
            minPrice: 1,
            maxPrice: Infinity,
            ara: araAkselerasi,
            arb: arbAkselerasi,
          },
        ],
      };

      const res = await fetch("/api/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ araArb: araArbData }),
      });

      if (res.ok) {
        showToast(
          "Seluruh rentang harga persentase ARA/ARB berhasil disimpan!",
          "success",
        );
      } else {
        showToast("Gagal menyimpan aturan ARA/ARB.", "error");
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
        title="Aturan ARA / ARB"
        description="Atur persentase Auto Rejection Atas (ARA) dan Auto Rejection Bawah (ARB) untuk masing-masing klasifikasi papan & rentang harga."
        icon={ShieldAlert}
      />

      <div className="bg-card rounded-3xl p-6 border border-border-custom space-y-6">
        <div>
          <h3 className="font-extrabold text-base tracking-tight pb-1 text-main flex items-center gap-2">
            <ShieldAlert size={18} className="text-acc-blue" />
            Pengaturan Persentase Batas Auto Rejection
          </h3>
          <p className="text-xs text-muted leading-relaxed">
            Sesuaikan persentase ARA dan ARB untuk setiap rentang harga dan
            papan pencatatan secara presisi.
          </p>
        </div>

        {/* SECTION 1: PAPAN UTAMA & PENGEMBANGAN */}
        <div className="space-y-4">
          <h4 className="font-extrabold text-xs text-muted uppercase tracking-wider">
            Papan Utama, Ekonomi Baru, &amp; Papan Pengembangan
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* TIER 1 */}
            <div className="bg-sub-slate p-4 rounded-2xl border border-border-custom/60 space-y-3">
              <div className="border-b border-border-custom/50 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-acc-blue block">
                  Rentang Tier 1
                </span>
                <strong className="text-xs font-extrabold text-main">
                  Rp 50 – Rp 200
                </strong>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted block">
                    ARA (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full bg-card rounded-xl px-3 py-2 text-xs text-main font-bold outline-none border border-border-custom focus:border-acc-blue"
                    value={araUtamaTier1}
                    onChange={(e) =>
                      setAraUtamaTier1(parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted block">
                    ARB (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full bg-card rounded-xl px-3 py-2 text-xs text-main font-bold outline-none border border-border-custom focus:border-acc-blue"
                    value={arbUtamaTier1}
                    onChange={(e) =>
                      setArbUtamaTier1(parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
              </div>
            </div>

            {/* TIER 2 */}
            <div className="bg-sub-slate p-4 rounded-2xl border border-border-custom/60 space-y-3">
              <div className="border-b border-border-custom/50 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-acc-blue block">
                  Rentang Tier 2
                </span>
                <strong className="text-xs font-extrabold text-main">
                  Rp 200 – Rp 5.000
                </strong>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted block">
                    ARA (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full bg-card rounded-xl px-3 py-2 text-xs text-main font-bold outline-none border border-border-custom focus:border-acc-blue"
                    value={araUtamaTier2}
                    onChange={(e) =>
                      setAraUtamaTier2(parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted block">
                    ARB (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full bg-card rounded-xl px-3 py-2 text-xs text-main font-bold outline-none border border-border-custom focus:border-acc-blue"
                    value={arbUtamaTier2}
                    onChange={(e) =>
                      setArbUtamaTier2(parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
              </div>
            </div>

            {/* TIER 3 */}
            <div className="bg-sub-slate p-4 rounded-2xl border border-border-custom/60 space-y-3">
              <div className="border-b border-border-custom/50 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-acc-blue block">
                  Rentang Tier 3
                </span>
                <strong className="text-xs font-extrabold text-main">
                  &gt; Rp 5.000
                </strong>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted block">
                    ARA (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full bg-card rounded-xl px-3 py-2 text-xs text-main font-bold outline-none border border-border-custom focus:border-acc-blue"
                    value={araUtamaTier3}
                    onChange={(e) =>
                      setAraUtamaTier3(parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted block">
                    ARB (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full bg-card rounded-xl px-3 py-2 text-xs text-main font-bold outline-none border border-border-custom focus:border-acc-blue"
                    value={arbUtamaTier3}
                    onChange={(e) =>
                      setArbUtamaTier3(parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: PAPAN AKSELERASI & FCA */}
        <div className="space-y-4 pt-2">
          <h4 className="font-extrabold text-xs text-muted uppercase tracking-wider">
            Papan Akselerasi &amp; Papan FCA
          </h4>

          <div className="bg-sub-slate p-4 rounded-2xl border border-border-custom/60 max-w-md space-y-3">
            <div className="border-b border-border-custom/50 pb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-acc-purple block">
                Ketentuan Khusus
              </span>
              <strong className="text-xs font-extrabold text-main">
                Papan Akselerasi &amp; FCA / Papan Pemantauan Khusus
              </strong>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted block">
                  ARA (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full bg-card rounded-xl px-3 py-2 text-xs text-main font-bold outline-none border border-border-custom focus:border-acc-blue"
                  value={araAkselerasi}
                  onChange={(e) =>
                    setAraAkselerasi(parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted block">
                  ARB (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full bg-card rounded-xl px-3 py-2 text-xs text-main font-bold outline-none border border-border-custom focus:border-acc-blue"
                  value={arbAkselerasi}
                  onChange={(e) =>
                    setArbAkselerasi(parseFloat(e.target.value) || 0)
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3">
          <button
            onClick={handleSaveRules}
            disabled={saving}
            className="flex items-center justify-center gap-2 bg-acc-blue hover:bg-acc-blue/90 text-white font-bold py-3 px-6 rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save size={16} />
            <span>
              {saving
                ? "Menyimpan Aturan..."
                : "Simpan Semua Persentase ARA/ARB"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
