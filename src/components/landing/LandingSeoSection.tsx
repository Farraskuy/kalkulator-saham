import React, { useEffect, useState } from "react";
import { Calculator, ShieldCheck, TrendingUp } from "lucide-react";
import { DEFAULT_FRACTION_RULES } from "@/features/calculators";
import type { FractionRule } from "@/types";

interface LandingSeoSectionProps {
  fractionRules?: FractionRule[];
}

function formatGroupLabel(min: number, max: number): string {
  if (max === Infinity || max >= 1000000) {
    return `≥ Rp ${min.toLocaleString("id-ID")}`;
  }
  if (min <= 1) {
    const top = max === 199 ? 200 : max;
    return `< Rp ${top.toLocaleString("id-ID")}`;
  }
  const top =
    max === 499
      ? 500
      : max === 1999
        ? 2000
        : max === 4999
          ? 5000
          : max;
  return `Rp ${min.toLocaleString("id-ID")} - Rp ${top.toLocaleString("id-ID")}`;
}

function formatMaxChange(min: number, tick: number): string {
  const multiplier = min < 200 ? 20 : 10;
  return `Rp ${(multiplier * tick).toLocaleString("id-ID")}`;
}

export default function LandingSeoSection({ fractionRules }: LandingSeoSectionProps) {
  const [dataFractions, setDataFractions] = useState<FractionRule[]>(
    fractionRules && fractionRules.length > 0 ? fractionRules : DEFAULT_FRACTION_RULES,
  );

  useEffect(() => {
    if (fractionRules && fractionRules.length > 0) {
      setDataFractions(fractionRules);
      return;
    }

    fetch("/api/rules")
      .then((res) => res.json())
      .then((data) => {
        if (data.fractions && Array.isArray(data.fractions) && data.fractions.length > 0) {
          setDataFractions(data.fractions);
        }
      })
      .catch(() => {});
  }, [fractionRules]);

  return (
    <section className="max-w-[1200px] mx-auto px-4 sm:px-8 md:px-16 pb-16 text-(--landing-text)" id="panduan">
      <div className="bg-(--landing-card) rounded-2xl -p-6 sm:p-10 space-y-12">
        {/* SECTION HEADER */}
        <div className="border-b border-(--landing-border) pb-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-(--landing-text)">
            Kalkulator Saham Online: <br /> Panduan Menghitung Profit, ARA/ARB, dan Average Down
          </h2>
          <p className="text-sm text-(--landing-muted) mt-2 max-w-3xl leading-relaxed">
            Investasi dan trading saham di Bursa Efek Indonesia (BEI/IDX) membutuhkan kalkulasi matematis yang disiplin dan presisi. HitungSaham menyediakan alat bantu simulasi finansial gratis yang dirancang khusus mengikuti regulasi pasar modal Indonesia.
          </p>
        </div>

        {/* 3 COLUMN FEATURE EXPLANATION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-5 rounded-xl bg-(--landing-soft) space-y-3">
            <div className="w-9 h-9 rounded-lg bg-(--landing-control) grid place-items-center text-(--landing-text)">
              <Calculator size={18} />
            </div>
            <h3 className="text-base font-bold text-(--landing-text)">1. Target Jual, Beli &amp; Fee</h3>
            <p className="text-xs text-(--landing-muted) leading-relaxed">
              Simulasikan estimasi keuntungan bersih (Net Profit) dan batas risiko cut loss dengan memasukkan harga beli, target jual, jumlah lot, serta estimasi fee sekuritas beli dan jual secara real-time.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-5 rounded-xl bg-(--landing-soft) space-y-3">
            <div className="w-9 h-9 rounded-lg bg-(--landing-control) grid place-items-center text-(--landing-text)">
              <ShieldCheck size={18} />
            </div>
            <h3 className="text-base font-bold text-(--landing-text)">2. Batas Auto Rejection (ARA/ARB)</h3>
            <p className="text-xs text-(--landing-muted) leading-relaxed">
              Ketahui harga maksimal Auto Rejection Atas (ARA) dan harga minimal Auto Rejection Bawah (ARB) untuk Papan Utama, Papan Pengembangan, Papan Akselerasi, serta Papan Pemantauan Khusus (FCA).
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-5 rounded-xl bg-(--landing-soft) space-y-3">
            <div className="w-9 h-9 rounded-lg bg-(--landing-control) grid place-items-center text-(--landing-text)">
              <TrendingUp size={18} />
            </div>
            <h3 className="text-base font-bold text-(--landing-text)">3. Simulasi Average Down &amp; Up</h3>
            <p className="text-xs text-(--landing-muted) leading-relaxed">
              Hitung harga rata-rata modal portofolio saat melakukan akumulasi beli bertahap (Average Up) atau menurunkan rata-rata modal saat koreksi harga (Average Down) secara akurat.
            </p>
          </div>
        </div>

        {/* TABEL FRAKSI HARGA RESMI BEI (DYNAMIC FROM DATABASE) */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-(--landing-text)">
            Aturan Fraksi Harga Saham Bursa Efek Indonesia (BEI)
          </h3>
          <p className="text-xs sm:text-sm text-(--landing-muted) leading-relaxed">
            Setiap pergerakan harga saham di BEI diatur dalam kelompok fraksi harga resmi. Kalkulator HitungSaham secara otomatis membulatkan hasil perhitungan ke fraksi harga resmi terdekat:
          </p>

          <div className="overflow-x-auto rounded-xl border border-(--landing-border)">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-(--landing-soft-strong) text-(--landing-text) border-b border-(--landing-border)">
                  <th className="py-3 px-4 font-semibold">Kelompok Harga Saham</th>
                  <th className="py-3 px-4 font-semibold">Fraksi Harga</th>
                  <th className="py-3 px-4 font-semibold">Maksimal Perubahan Per Transaksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--landing-border) text-(--landing-muted)">
                {dataFractions.map((rule, idx) => (
                  <tr key={idx} className="hover:bg-(--landing-soft)">
                    <td className="py-2.5 px-4 font-medium text-(--landing-text)">
                      {formatGroupLabel(rule.minPrice, rule.maxPrice)}
                    </td>
                    <td className="py-2.5 px-4">Rp {rule.tick.toLocaleString("id-ID")}</td>
                    <td className="py-2.5 px-4">{formatMaxChange(rule.minPrice, rule.tick)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
