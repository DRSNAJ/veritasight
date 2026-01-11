export interface ChartDataPoint {
  time: string; // YYYY-MM-DD format
  value: number;
}

export interface SeriesData {
  symbol: string;
  data: ChartDataPoint[];
  color: string;
}

export function normalizeToBase100(data: ChartDataPoint[]): ChartDataPoint[] {
  if (data.length === 0) return [];

  const baseValue = data[0].value;
  if (baseValue === 0) return data;

  return data.map((point) => ({
    time: point.time,
    value: (point.value / baseValue) * 100,
  }));
}

export function formatChartDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function getDateRange(range: "WTD" | "MTD" | "YTD"): { from: Date; to: Date } {
  const now = new Date();
  const to = now;
  let from: Date;

  switch (range) {
    case "WTD":
      from = new Date(now);
      from.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
      break;
    case "MTD":
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "YTD":
      from = new Date(now.getFullYear(), 0, 1);
      break;
  }

  return { from, to };
}

// Default colors for chart series
export const CHART_COLORS = [
  "#4C9FFF", // Veritasight Blue
  "#10B981", // Gain green
  "#FFB800", // Warning yellow
  "#EF4444", // Loss red
  "#A855F7", // Purple
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#EC4899", // Pink
];

export function getSeriesColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}
