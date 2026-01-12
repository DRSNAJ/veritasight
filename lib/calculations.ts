import type { StockData, Holding, ManualAsset, IndexData, AllocationSegment } from "./types";

export function calculateHoldingValue(shares: number, price: number): number {
  return shares * price;
}

export function calculateDayChange(shares: number, change: number): number {
  return shares * change;
}

export function calculateRelativePerformance(
  stockChangePercent: number,
  indexChangePercent: number
): number {
  return stockChangePercent - indexChangePercent;
}

export interface PortfolioTotals {
  equityValue: number;
  manualValue: number;
  totalValue: number;
  dayChange: number;
  dayChangePercent: number;
}

export function calculatePortfolioTotals(
  holdings: Holding[],
  stocks: StockData[],
  assets: ManualAsset[]
): PortfolioTotals {
  const stockMap = new Map(stocks.map((s) => [s.symbol, s]));

  let equityValue = 0;
  let previousEquityValue = 0;

  for (const holding of holdings) {
    const stock = stockMap.get(holding.symbol);
    if (stock) {
      const currentValue = holding.shares_held * stock.lasttradedprice;
      const previousValue = holding.shares_held * stock.previousclose;
      equityValue += currentValue;
      previousEquityValue += previousValue;
    }
  }

  const manualValue = assets.reduce((sum, a) => sum + a.value, 0);
  const totalValue = equityValue + manualValue;
  const dayChange = equityValue - previousEquityValue;
  const dayChangePercent = previousEquityValue > 0 ? (dayChange / previousEquityValue) * 100 : 0;

  return {
    equityValue,
    manualValue,
    totalValue,
    dayChange,
    dayChangePercent,
  };
}

// Color palette for allocation segments - distinct colors for visibility
const ALLOCATION_COLORS = [
  "#4C9FFF", // Blue
  "#10B981", // Green
  "#FFB800", // Amber
  "#F97316", // Orange
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#EF4444", // Red
  "#84CC16", // Lime
  "#F59E0B", // Yellow
  "#6366F1", // Indigo
  "#14B8A6", // Teal
  "#A855F7", // Violet
  "#22C55E", // Emerald
  "#FB923C", // Light Orange
  "#A0A0A0", // Gray
  "#666666", // Dark Gray
];

export function calculateAllocation(
  holdings: Holding[],
  stocks: StockData[],
  assets: ManualAsset[]
): AllocationSegment[] {
  const stockMap = new Map(stocks.map((s) => [s.symbol, s]));
  const segments: AllocationSegment[] = [];

  // Add equity holdings
  for (const holding of holdings) {
    const stock = stockMap.get(holding.symbol);
    if (stock) {
      const value = holding.shares_held * stock.lasttradedprice;
      segments.push({
        label: stock.symbol,
        value,
        percentage: 0, // calculated below
        color: "", // assigned after sorting
        type: "equity",
      });
    }
  }

  // Add manual assets grouped by type
  const assetsByType = new Map<string, number>();
  for (const asset of assets) {
    const current = assetsByType.get(asset.type) || 0;
    assetsByType.set(asset.type, current + asset.value);
  }

  for (const [type, value] of assetsByType) {
    segments.push({
      label: type,
      value,
      percentage: 0,
      color: "", // assigned after sorting
      type: "manual",
    });
  }

  // Sort by value (largest first)
  const sorted = segments.sort((a, b) => b.value - a.value);

  // Assign distinct colors after sorting
  for (let i = 0; i < sorted.length; i++) {
    sorted[i].color = ALLOCATION_COLORS[i % ALLOCATION_COLORS.length];
  }

  // Calculate percentages - ensures they sum to 100%
  const total = sorted.reduce((sum, s) => sum + s.value, 0);
  if (total > 0) {
    let percentageSum = 0;
    for (let i = 0; i < sorted.length; i++) {
      if (i === sorted.length - 1) {
        // Last segment gets remainder to ensure exact 100%
        sorted[i].percentage = 100 - percentageSum;
      } else {
        sorted[i].percentage = (sorted[i].value / total) * 100;
        percentageSum += sorted[i].percentage;
      }
    }
  }

  return sorted;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercentage(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function getVariant(value: number): "gain" | "loss" | "neutral" {
  if (value > 0) return "gain";
  if (value < 0) return "loss";
  return "neutral";
}

export function findIndex(indices: IndexData[], ticker: string): IndexData | undefined {
  return indices.find((i) => i.ticker === ticker);
}
