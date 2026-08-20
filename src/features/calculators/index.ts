// Public API for features/calculators

// Services & Calculations
export {
  DEFAULT_FRACTION_RULES,
  DEFAULT_ARA_ARB_RULES,
  getTickSize,
  bulatkanBEI,
  bulatkanBEI as bulatkanHargaBEI,
  getAraArbPercentages,
  calculateAraArb,
  calculateAverage,
  calculateTargetAverageLots,
  kalkulasiTargetSaham,
} from "./services/calculations";

// Feature Types
export type {
  Board,
  AraArbRule,
  PurchaseRow,
  TargetPredictionInput,
} from "./services/calculations";

// Re-export common formatters for convenience within calculator feature if needed
export { formatIDR, formatNumber } from "@/lib/utils/formatters";
