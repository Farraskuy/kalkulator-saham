import { FractionRule } from '@/types';
export type { FractionRule };

export type Board = 'Utama' | 'Pengembangan' | 'Akselerasi' | 'Watchlist';

export interface AraArbRule {
  board: Board;
  minPrice?: number;
  maxPrice?: number;
  ara: number;
  arb: number;
}

export const DEFAULT_FRACTION_RULES: FractionRule[] = [
  { minPrice: 1, maxPrice: 199, tick: 1 },
  { minPrice: 200, maxPrice: 499, tick: 2 },
  { minPrice: 500, maxPrice: 1999, tick: 5 },
  { minPrice: 2000, maxPrice: 4999, tick: 10 },
  { minPrice: 5000, maxPrice: Infinity, tick: 25 },
];

export const DEFAULT_ARA_ARB_RULES: Record<string, { ara: number; arb: number }[]> = {
  Utama: [
    { ara: 35, arb: 15 },
    { ara: 25, arb: 15 },
    { ara: 20, arb: 15 },
  ],
  Pengembangan: [
    { ara: 35, arb: 15 },
    { ara: 25, arb: 15 },
    { ara: 20, arb: 15 },
  ],
  Akselerasi: [{ ara: 10, arb: 10 }],
  Watchlist: [{ ara: 10, arb: 10 }],
};

export function getTickSize(price: number, rules: FractionRule[] = DEFAULT_FRACTION_RULES): number {
  if (price <= 0) return 1;
  const match = rules.find((r) => price >= r.minPrice && price <= r.maxPrice);
  if (match) return match.tick;
  if (price < 200) return 1;
  if (price < 500) return 2;
  if (price < 2000) return 5;
  if (price < 5000) return 10;
  return 25;
}

export function bulatkanHargaBEI(
  hargaExact: number,
  type: 'ceil' | 'floor' = 'ceil',
  rules: FractionRule[] = DEFAULT_FRACTION_RULES
): number {
  if (hargaExact <= 0) return 0;
  const tick = getTickSize(hargaExact, rules);
  if (type === 'ceil') {
    return Math.ceil(hargaExact / tick) * tick;
  } else {
    return Math.floor(hargaExact / tick) * tick;
  }
}

export function getAraArbPercentages(
  price: number,
  board: Board
): { araPercent: number; arbPercent: number; fixedAmount?: number } {
  if (board === 'Akselerasi' || board === 'Watchlist') {
    if (price <= 10) {
      return { araPercent: 0, arbPercent: 0, fixedAmount: 1 };
    }
    return { araPercent: 10, arbPercent: 10 };
  }
  if (price <= 200) {
    return { araPercent: 35, arbPercent: 15 };
  } else if (price <= 5000) {
    return { araPercent: 25, arbPercent: 15 };
  } else {
    return { araPercent: 20, arbPercent: 15 };
  }
}

export function calculateAraArb(
  previousPrice: number,
  board: Board,
  fractionRules: FractionRule[] = DEFAULT_FRACTION_RULES
) {
  if (previousPrice <= 0) {
    return {
      araLimitLabel: '0%',
      arbLimitLabel: '0%',
      ara: 0,
      arb: 0,
      araPercent: 0,
      arbPercent: 0,
      araRaw: 0,
      arbRaw: 0,
      araPercentMax: 0,
      arbPercentMax: 0,
    };
  }

  const { araPercent: araPercentMax, arbPercent: arbPercentMax, fixedAmount } = getAraArbPercentages(previousPrice, board);

  const araRaw = fixedAmount
    ? previousPrice + fixedAmount
    : previousPrice + previousPrice * (araPercentMax / 100);
  const arbRaw = fixedAmount
    ? Math.max(1, previousPrice - fixedAmount)
    : previousPrice - previousPrice * (arbPercentMax / 100);

  const ara = bulatkanHargaBEI(araRaw, 'floor', fractionRules);
  const arb = bulatkanHargaBEI(arbRaw, 'floor', fractionRules);

  const araPercentActual = ((ara - previousPrice) / previousPrice) * 100;
  const arbPercentActual = ((arb - previousPrice) / previousPrice) * 100;

  return {
    ara,
    arb,
    araPercent: araPercentActual,
    arbPercent: arbPercentActual,
    araRaw,
    arbRaw,
    araPercentMax,
    arbPercentMax,
    fixedAmount,
    araLimitLabel: fixedAmount ? 'Rp1' : String(araPercentMax) + '%',
    arbLimitLabel: fixedAmount ? 'Rp1' : String(arbPercentMax) + '%',
  };
}

export interface PurchaseRow {
  id?: string;
  price: number;
  lot: number;
}

export function calculateAverage(rows: PurchaseRow[]) {
  const valid = rows.filter((r) => r.price > 0 && r.lot > 0);
  const totalLot = valid.reduce((acc, r) => acc + r.lot, 0);
  const totalLembar = totalLot * 100;
  const totalInvestment = valid.reduce((acc, r) => acc + r.price * r.lot * 100, 0);
  const avgPrice = totalLembar > 0 ? totalInvestment / totalLembar : 0;

  return {
    totalLot,
    totalLembar,
    totalInvestment,
    avgPrice: Math.round(avgPrice),
    avgPriceExact: avgPrice,
    rowCount: valid.length,
  };
}

export interface TargetPredictionInput {
  hargaBeli: number;
  lot: number;
  feeBeli: number;
  feeJual: number;
  targetUntungRp: number;
  targetRugiRp: number;
  pajak?: number;
}

export function kalkulasiTargetSaham(
  input: TargetPredictionInput,
  fractionRules: FractionRule[] = DEFAULT_FRACTION_RULES
) {
  const { hargaBeli, lot, feeBeli, feeJual, targetUntungRp, targetRugiRp, pajak = 0 } = input;

  const pctFeeBeli = feeBeli / 100;
  const pctFeeJual = feeJual / 100;
  const pctPajak = pajak / 100;

  const totalLembar = lot * 100;
  const totalModal = hargaBeli * totalLembar * (1 + pctFeeBeli + pctPajak);
  const pengaliJual = totalLembar * (1 - pctFeeJual - pctPajak);

  if (pengaliJual <= 0 || totalLembar <= 0 || hargaBeli <= 0) {
    return {
      rincian: { totalLembar: 0, totalModal: 0 },
      skenarioUntung: { hargaExact: 0, hargaBEI: 0, persentase: '0.00', labaBersihReal: 0 },
      skenarioRugi: { hargaExact: 0, hargaBEI: 0, persentase: '0.00', rugiBersihReal: 0 },
    };
  }

  const hargaUntungExact = (totalModal + targetUntungRp) / pengaliJual;
  const hargaUntungBEI = bulatkanHargaBEI(hargaUntungExact, 'ceil', fractionRules);
  const pctProfitMax = ((hargaUntungBEI - hargaBeli) / hargaBeli) * 100;
  const labaBersihReal = hargaUntungBEI * pengaliJual - totalModal;

  const hargaRugiExact = (totalModal - targetRugiRp) / pengaliJual;
  const hargaRugiBEI = bulatkanHargaBEI(hargaRugiExact, 'ceil', fractionRules);
  const pctLossMax = ((hargaBeli - hargaRugiBEI) / hargaBeli) * 100;
  const rugiBersihReal = totalModal - hargaRugiBEI * pengaliJual;

  return {
    rincian: {
      totalLembar,
      totalModal,
    },
    skenarioUntung: {
      hargaExact: hargaUntungExact,
      hargaBEI: hargaUntungBEI,
      persentase: pctProfitMax.toFixed(2),
      labaBersihReal: labaBersihReal,
    },
    skenarioRugi: {
      hargaExact: hargaRugiExact,
      hargaBEI: hargaRugiBEI,
      persentase: pctLossMax.toFixed(2),
      rugiBersihReal: rugiBersihReal,
    },
  };
}

export function formatIDR(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}
