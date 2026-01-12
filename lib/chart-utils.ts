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

// Recharts color palette
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

// NEW: Transform data from Record<string, ChartDataPoint[]> to Recharts format
export function transformToRechartsFormat(
  data: Record<string, ChartDataPoint[]>,
  normalize: boolean = false
): Array<Record<string, number | string>> {
  const dateMap = new Map<string, Record<string, number | string>>();

  // First pass: Normalize if needed
  const processedData: Record<string, ChartDataPoint[]> = {};
  for (const [symbol, points] of Object.entries(data)) {
    processedData[symbol] = normalize ? normalizeToBase100(points) : points;
  }

  // Second pass: Transform to Recharts format
  for (const [symbol, points] of Object.entries(processedData)) {
    for (const point of points) {
      if (!dateMap.has(point.time)) {
        dateMap.set(point.time, { time: point.time });
      }
      const entry = dateMap.get(point.time)!;
      entry[symbol] = point.value;
    }
  }

  return Array.from(dateMap.values()).sort((a, b) =>
    (a.time as string).localeCompare(b.time as string)
  );
}

// Format axis labels
export function formatXAxis(value: string): string {
  const date = new Date(value);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatYAxis(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(0);
}

// Format tooltip value with currency
export function formatTooltipValue(value: number, name: string): [string, string] {
  return [`LKR ${value.toFixed(2)}`, name];
}
