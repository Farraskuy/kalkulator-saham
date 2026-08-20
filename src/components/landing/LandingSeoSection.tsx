import React from "react";
import { Calculator, ShieldCheck, TrendingUp, Layers } from "lucide-react";

export default function LandingSeoSection() {
  return (
    <section className="max-w-[1200px] mx-auto px-4 sm:px-8 md:px-16 pb-16 text-(--landing-text)" id="panduan">
      <div className="bg-(--landing-card) rounded-2xl -p-6 sm:p-10 border border-(--landing-border) space-y-12">
        {/* SECTION HEADER */}
        <div className="border-b border-(--landing-border) pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-(--landing-soft-strong) text-xs font-semibold text-(--landing-text) mb-3">
            <Layers size={14} /> Panduan &amp; Rumus Saham BEI
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-(--landing-text)">
            Kalkulator Saham Online: Panduan Menghitung Profit, ARA/ARB, dan Average Down
          </h2>
          <p className="text-sm text-(--landing-muted) mt-2 max-w-3xl leading-relaxed">
            Investasi dan trading saham di Bursa Efek Indonesia (BEI/IDX) membutuhkan kalkulasi matematis yang disiplin dan presisi. HitungSaham menyediakan alat bantu simulasi finansial gratis yang dirancang khusus mengikuti regulasi pasar modal Indonesia.
          </p>
        </div>

        {/* 3 COLUMN FEATURE EXPLANATION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-5 rounded-xl bg-(--landing-soft) border border-(--landing-border) space-y-3">
            <div className="w-9 h-9 rounded-lg bg-(--landing-control) grid place-items-center text-(--landing-text)">
              <Calculator size={18} />
            </div>
            <h3 className="text-base font-bold text-(--landing-text)">1. Target Jual, Beli &amp; Fee</h3>
            <p className="text-xs text-(--landing-muted) leading-relaxed">
              Simulasikan estimasi keuntungan bersih (Net Profit) dan batas risiko cut loss dengan memasukkan harga beli, target jual, jumlah lot, serta estimasi fee sekuritas beli dan jual secara real-time.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-5 rounded-xl bg-(--landing-soft) border border-(--landing-border) space-y-3">
            <div className="w-9 h-9 rounded-lg bg-(--landing-control) grid place-items-center text-(--landing-text)">
              <ShieldCheck size={18} />
            </div>
            <h3 className="text-base font-bold text-(--landing-text)">2. Batas Auto Rejection (ARA/ARB)</h3>
            <p className="text-xs text-(--landing-muted) leading-relaxed">
              Ketahui harga maksimal Auto Rejection Atas (ARA) dan harga minimal Auto Rejection Bawah (ARB) untuk Papan Utama, Papan Pengembangan, Papan Akselerasi, serta Papan Pemantauan Khusus (FCA).
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-5 rounded-xl bg-(--landing-soft) border border-(--landing-border) space-y-3">
            <div className="w-9 h-9 rounded-lg bg-(--landing-control) grid place-items-center text-(--landing-text)">
              <TrendingUp size={18} />
            </div>
            <h3 className="text-base font-bold text-(--landing-text)">3. Simulasi Average Down &amp; Up</h3>
            <p className="text-xs text-(--landing-muted) leading-relaxed">
              Hitung harga rata-rata modal portofolio saat melakukan akumulasi beli bertahap (Average Up) atau menurunkan rata-rata modal saat koreksi harga (Average Down) secara akurat.
            </p>
          </div>
        </div>

        {/* TABEL FRAKSI HARGA RESMI BEI */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-(--landing-text)">
            Aturan Fraksi Harga Saham Bursa Efek Indonesia (BEI)
          </h3>
          <p className="text-xs sm:text-sm text-(--landing-muted) leading-relaxed">
            Setiap pergerakan harga saham di BEI diatur dalam 5 kelompok fraksi harga resmi. Kalkulator HitungSaham secara otomatis membulatkan hasil perhitungan ke tick fraksi resmi terkeat:
          </p>

          <div className="overflow-x-auto rounded-xl border border-(--landing-border)">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-(--landing-soft-strong) text-(--landing-text) border-b border-(--landing-border)">
                  <th className="py-3 px-4 font-semibold">Kelompok Harga Saham</th>
                  <th className="py-3 px-4 font-semibold">Fraksi Harga (Tick)</th>
                  <th className="py-3 px-4 font-semibold">Maksimal Perubahan Per Transaksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--landing-border) text-(--landing-muted)">
                <tr className="hover:bg-(--landing-soft)">
                  <td className="py-2.5 px-4 font-medium text-(--landing-text)">&lt; Rp 200</td>
                  <td className="py-2.5 px-4">Rp 1</td>
                  <td className="py-2.5 px-4">Rp 20 (20 ticks)</td>
                </tr>
                <tr className="hover:bg-(--landing-soft)">
                  <td className="py-2.5 px-4 font-medium text-(--landing-text)">Rp 200 - Rp 500</td>
                  <td className="py-2.5 px-4">Rp 2</td>
                  <td className="py-2.5 px-4">Rp 20 (10 ticks)</td>
                </tr>
                <tr className="hover:bg-(--landing-soft)">
                  <td className="py-2.5 px-4 font-medium text-(--landing-text)">Rp 500 - Rp 2.000</td>
                  <td className="py-2.5 px-4">Rp 5</td>
                  <td className="py-2.5 px-4">Rp 50 (10 ticks)</td>
                </tr>
                <tr className="hover:bg-(--landing-soft)">
                  <td className="py-2.5 px-4 font-medium text-(--landing-text)">Rp 2.000 - Rp 5.000</td>
                  <td className="py-2.5 px-4">Rp 10</td>
                  <td className="py-2.5 px-4">Rp 100 (10 ticks)</td>
                </tr>
                <tr className="hover:bg-(--landing-soft)">
                  <td className="py-2.5 px-4 font-medium text-(--landing-text)">&ge; Rp 5.000</td>
                  <td className="py-2.5 px-4">Rp 25</td>
                  <td className="py-2.5 px-4">Rp 250 (10 ticks)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
