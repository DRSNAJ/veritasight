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
        color: "#4C9FFF",
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

  const typeColors: Record<string, string> = {
    FD: "#10B981",
    BOND: "#FFB800",
    CASH: "#A0A0A0",
    OTHER: "#666666",
  };

  for (const [type, value] of assetsByType) {
    segments.push({
      label: type,
      value,
      percentage: 0,
      color: typeColors[type] || "#666666",
      type: "manual",
    });
  }

  // Calculate percentages
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  for (const segment of segments) {
    segment.percentage = total > 0 ? (segment.value / total) * 100 : 0;
  }

  return segments.sort((a, b) => b.value - a.value);
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
