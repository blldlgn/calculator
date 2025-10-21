export type EstimateRequest = {
  keywords: string[];
  targetCpc: number; // TL
  estimatedMonthlyClicks: number;
  conversionRatePct: number; // 0-100
  targetRoas: number; // x multiplier
  campaignMonths: number; // 1-12
};

export type MonthlyBreakdown = {
  month: number;
  spend: number; // TL
  revenue: number; // TL
};

export type EstimateResponse = {
  totalSpend: number;
  totalRevenue: number;
  roiPct: number;
  estimatedCpc: number;
  estimatedCpm: number;
  monthlyBreakdown: MonthlyBreakdown[];
  usedApi: boolean;
  notes?: string;
};
