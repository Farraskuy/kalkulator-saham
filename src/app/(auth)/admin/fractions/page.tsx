"use client";

import React, { useEffect, useState } from "react";
import { Plus, Save, Trash2, Percent } from "lucide-react";
import { DEFAULT_FRACTION_RULES } from "@/features/calculators";
import type { FractionRule } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { AdminCrudHeader } from "@/features/admin/components/AdminCrudHeader";

export default function AdminFractionsPage() {
  const { showToast } = useToast();
  const [fractions, setFractions] = useState<FractionRule[]>(
    DEFAULT_FRACTION_RULES,
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/rules")
      .then((res) => res.json())
      .then((data) => {
        if (data.fractions && Array.isArray(data.fractions)) {
          setFractions(data.fractions);
        }
      })
      .catch((err) => console.error("Failed to load rules:", err));
  }, []);

  const handleSaveRules = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fractions }),
      });
      if (res.ok) {
        showToast("Aturan fraksi harga berhasil disimpan!", "success");
      } else {
        showToast("Gagal menyimpan aturan fraksi harga.", "error");
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
        title="Fraksi Harga BEI"
        description="Kelola tingkatan fraksi harga saham dan kelipatan perubahan harganya (tick size) di Bursa Efek Indonesia."
        icon={Percent}
      />

      <div className="bg-card rounded-3xl p-6 border border-border-custom">
        <div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className=" text-muted font-bold">
                  <th className="py-2.5">Harga Min (Rp)</th>
                  <th className="py-2.5">Harga Max (Rp)</th>
                  <th className="py-2.5">Tick Size (Rp)</th>
                  <th className="py-2.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom/50">
                {fractions.map((f, idx) => (
                  <tr key={idx} className="hover:bg-sub-slate/30 text-main">
                    <td className="py-2.5">
                      <input
                        type="number"
                        className="bg-page rounded-lg px-3 py-1.5 text-main font-semibold outline-none focus:border-acc-blue w-32"
                        value={f.minPrice}
                        onChange={(e) => {
                          const newFractions = [...fractions];
                          newFractions[idx].minPrice =
                            parseFloat(e.target.value) || 0;
                          setFractions(newFractions);
                        }}
                      />
                    </td>
                    <td className="py-2.5">
                      <input
                        type="text"
                        className="bg-page rounded-lg px-3 py-1.5 text-main font-semibold outline-none focus:border-acc-blue w-32"
                        value={
                          f.maxPrice === Infinity ? "Infinity" : f.maxPrice
                        }
                        onChange={(e) => {
                          const newFractions = [...fractions];
                          const val = e.target.value;
                          newFractions[idx].maxPrice =
                            val === "Infinity"
                              ? Infinity
                              : parseFloat(val) || 0;
                          setFractions(newFractions);
                        }}
                      />
                    </td>
                    <td className="py-2.5">
                      <input
                        type="number"
                        className="bg-page rounded-lg px-3 py-1.5 text-main font-semibold outline-none focus:border-acc-blue w-32"
                        value={f.tick}
                        onChange={(e) => {
                          const newFractions = [...fractions];
                          newFractions[idx].tick =
                            parseFloat(e.target.value) || 1;
                          setFractions(newFractions);
                        }}
                      />
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() =>
                          setFractions(fractions.filter((_, i) => i !== idx))
                        }
                        className="bg-sub-pink text-acc-pink w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer hover:bg-acc-pink hover:text-white transition-colors ml-auto"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-3 mt-6 border-t border-border-custom pt-5">
            <button
              onClick={() =>
                setFractions([
                  ...fractions,
                  { minPrice: 0, maxPrice: 0, tick: 1 },
                ])
              }
              className="flex items-center gap-1.5 bg-card hover:border-acc-blue hover:text-acc-blue text-main font-bold py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer"
            >
              <Plus size={14} /> <span>Tambah Baris Fraksi</span>
            </button>

            <button
              onClick={handleSaveRules}
              disabled={saving}
              className="flex items-center gap-1.5 bg-acc-blue hover:bg-acc-blue/90 text-white font-bold py-2 px-5 rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save size={14} />
              <span>{saving ? "Menyimpan..." : "Simpan Perubahan"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
