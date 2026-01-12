"use client";

import { useMemo, useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Holding, StockData, IndexData } from "@/lib/types";
import { useChartData } from "@/hooks/use-chart-data";
import {
  normalizeToBase100,
  formatChartDate,
  getDateRange,
  formatXAxis,
  formatYAxis,
} from "@/lib/chart-utils";
import { Card, Spinner } from "@/components/ui";

interface PortfolioChartProps {
  holdings: Holding[];
  stocks: StockData[];
  indices: IndexData[];
}

// Custom tooltip with dark theme
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-tertiary border border-border-subtle rounded-lg p-3 shadow-lg">
      <p className="text-xs text-text-muted mb-2">{formatXAxis(label)}</p>
      <div className="space-y-1">
        {payload.map((entry: any, index: number) => {
          if (entry.value === null || entry.value === undefined) return null;
          return (
            <div key={index} className="flex items-center justify-between gap-4 text-xs">
              <span className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-text-secondary">{entry.name}</span>
              </span>
              <span className="font-mono text-text-primary">
                {typeof entry.value === "number" ? entry.value.toFixed(2) : entry.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PortfolioChart({ holdings, stocks }: PortfolioChartProps) {
  const symbols = useMemo(() => holdings.map((h) => h.symbol), [holdings]);
  const holdingsMap = useMemo(
    () => new Map(holdings.map((h) => [h.symbol, h.shares_held])),
    [holdings]
  );

  // Toggle state for indices
  const [visibleIndices, setVisibleIndices] = useState<Set<string>>(
    new Set(["aspi", "sl20"])
  );

  // Index historical data
  const [indexData, setIndexData] = useState<Record<string, { time: string; value: number }[]>>({});
  const [indexLoading, setIndexLoading] = useState(false);

  const { from, to } = getDateRange("YTD");
  const { data, loading } = useChartData(
    symbols,
    formatChartDate(from),
    formatChartDate(to)
  );

  // Fetch index historical data
  useEffect(() => {
    const dateRange = getDateRange("YTD");
    const fromDate = formatChartDate(dateRange.from);
    const toDate = formatChartDate(dateRange.to);

    setIndexLoading(true);
    fetch(`/api/indices/history?from=${fromDate}&to=${toDate}`)
      .then((res) => res.json())
      .then((result) => {
        setIndexData(result.data || {});
      })
      .catch((err) => {
        console.error("Failed to fetch index history:", err);
        setIndexData({});
      })
      .finally(() => {
        setIndexLoading(false);
      });
  }, []);

  // Calculate portfolio value over time and normalize to base 100
  const chartData = useMemo(() => {
    if (Object.keys(data).length === 0 && Object.keys(indexData).length === 0) return [];

    // Get all unique dates from stocks AND indices
    const allDates = new Set<string>();
    for (const series of Object.values(data)) {
      for (const point of series) {
        allDates.add(point.time);
      }
    }
    for (const series of Object.values(indexData)) {
      for (const point of series) {
        allDates.add(point.time);
      }
    }

    const sortedDates = Array.from(allDates).sort();

    // Calculate portfolio value for each date
    const portfolioValues: { time: string; value: number }[] = [];
    const aspiValues: { time: string; value: number }[] = [];
    const sl20Values: { time: string; value: number }[] = [];

    for (const date of sortedDates) {
      // Portfolio value
      let totalValue = 0;
      let hasData = false;

      for (const [symbol, series] of Object.entries(data)) {
        const point = series.find((p) => p.time === date);
        if (point) {
          const shares = holdingsMap.get(symbol) || 0;
          totalValue += shares * point.value;
          hasData = true;
        }
      }

      if (hasData) {
        portfolioValues.push({ time: date, value: totalValue });
      }

      // ASPI value
      if (indexData.aspi) {
        const aspiPoint = indexData.aspi.find((p) => p.time === date);
        if (aspiPoint) {
          aspiValues.push({ time: date, value: aspiPoint.value });
        }
      }

      // S&P SL20 value
      if (indexData.sl20) {
        const sl20Point = indexData.sl20.find((p) => p.time === date);
        if (sl20Point) {
          sl20Values.push({ time: date, value: sl20Point.value });
        }
      }
    }

    // Normalize each series independently to base 100
    const normalizedPortfolio = normalizeToBase100(portfolioValues);
    const normalizedAspi = normalizeToBase100(aspiValues);
    const normalizedSl20 = normalizeToBase100(sl20Values);

    // Create maps for easy lookup
    const portfolioMap = new Map(normalizedPortfolio.map((p) => [p.time, p.value]));
    const aspiMap = new Map(normalizedAspi.map((p) => [p.time, p.value]));
    const sl20Map = new Map(normalizedSl20.map((p) => [p.time, p.value]));

    // Combine into single chart data
    return sortedDates.map((date) => ({
      time: date,
      portfolio: portfolioMap.get(date) || null,
      aspi: aspiMap.get(date) || null,
      sl20: sl20Map.get(date) || null,
    })).filter((point) => point.portfolio !== null || point.aspi !== null || point.sl20 !== null);
  }, [data, indexData, holdingsMap]);

  if (symbols.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Portfolio Performance (YTD)
        </h3>
        <div className="h-[250px] flex items-center justify-center text-text-muted">
          Add holdings to view portfolio performance
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">
          Portfolio Performance (YTD)
        </h3>
        <span className="text-xs text-text-muted">Normalized to 100</span>
      </div>

      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary/80 z-10 rounded-lg">
            <Spinner />
          </div>
        )}
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4C9FFF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4C9FFF" stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* Grid - horizontal only */}
            <CartesianGrid
              strokeDasharray="0"
              stroke="#1A1A1A"
              vertical={false}
            />

            {/* Axes */}
            <XAxis
              dataKey="time"
              tickFormatter={formatXAxis}
              stroke="#666666"
              tick={{ fill: "#666666", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "#333333" }}
            />
            <YAxis
              domain={['auto', 'auto']}
              tickFormatter={formatYAxis}
              stroke="#666666"
              tick={{ fill: "#666666", fontSize: 11, fontFamily: "JetBrains Mono" }}
              tickLine={false}
              axisLine={{ stroke: "#333333" }}
            />

            {/* Tooltip */}
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#444444", strokeWidth: 1 }} />

            {/* Area */}
            <Area
              type="monotone"
              dataKey="portfolio"
              stroke="#4C9FFF"
              strokeWidth={2}
              fill="url(#portfolioGradient)"
              animationDuration={300}
              animationEasing="ease-out"
              name="Portfolio"
            />

            {/* Index lines */}
            {visibleIndices.has("aspi") && (
              <Line
                type="monotone"
                dataKey="aspi"
                stroke="#666666"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                name="ASPI"
                animationDuration={300}
                animationEasing="ease-out"
              />
            )}

            {visibleIndices.has("sl20") && (
              <Line
                type="monotone"
                dataKey="sl20"
                stroke="#999999"
                strokeWidth={1.5}
                strokeDasharray="2 2"
                dot={false}
                name="S&P SL20"
                animationDuration={300}
                animationEasing="ease-out"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs">
        {/* Portfolio (no toggle) */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-veritasight-blue" />
          <span className="text-text-secondary">Portfolio</span>
        </div>

        {/* ASPI toggle */}
        <label className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <input
            type="checkbox"
            checked={visibleIndices.has("aspi")}
            onChange={(e) => {
              const newSet = new Set(visibleIndices);
              e.target.checked ? newSet.add("aspi") : newSet.delete("aspi");
              setVisibleIndices(newSet);
            }}
            className="w-3 h-3 cursor-pointer"
          />
          <div className="w-3 h-0.5 border-t border-dashed border-[#666666]" />
          <span className="text-text-muted">ASPI</span>
        </label>

        {/* S&P SL20 toggle */}
        <label className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <input
            type="checkbox"
            checked={visibleIndices.has("sl20")}
            onChange={(e) => {
              const newSet = new Set(visibleIndices);
              e.target.checked ? newSet.add("sl20") : newSet.delete("sl20");
              setVisibleIndices(newSet);
            }}
            className="w-3 h-3 cursor-pointer"
          />
          <div className="w-3 h-0.5 border-t border-dotted border-[#999999]" />
          <span className="text-text-muted">S&P SL20</span>
        </label>
      </div>
    </Card>
  );
}
