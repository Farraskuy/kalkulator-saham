export interface FractionRule {
  minPrice: number;
  maxPrice: number;
  tick: number;
}

export interface AraArbRule {
  board: string;
  ara: number;
  arb: number;
}

export interface AraArbResult {
  currentPrice: number;
  board: string;
  araPrice: number;
  arbPrice: number;
  araTicks: number;
  arbTicks: number;
  araPercentage: number;
  arbPercentage: number;
}

export interface AverageDownResult {
  initialPrice: number;
  initialLots: number;
  initialInvestment: number;
  newPrice: number;
  newLots: number;
  additionalInvestment: number;
  totalLots: number;
  totalShares: number;
  totalInvestment: number;
  averagePrice: number;
  targetAveragePrice?: number;
  requiredNewLots?: number;
  requiredNewInvestment?: number;
}

export interface PredictionResult {
  buyPrice: number;
  targetPrice: number;
  lots: number;
  shares: number;
  buyValue: number;
  sellValue: number;
  buyFee: number;
  sellFee: number;
  netProfitLoss: number;
  percentageProfitLoss: number;
  breakEvenPrice: number;
}

export interface CalculationHistoryItem {
  id: string;
  userId: string;
  calculatorType: 'ara-arb' | 'average' | 'prediction';
  title: string;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
  createdAt: string | Date;
}
