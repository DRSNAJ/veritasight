"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Holding, StockData } from "@/lib/types";
import { useChartData } from "@/hooks/use-chart-data";
import {
  transformToRechartsFormat,
  getSeriesColor,
  getDateRange,
  formatChartDate,
  formatXAxis,
  formatYAxis,
} from "@/lib/chart-utils";
import { Card, Button, Spinner } from "@/components/ui";

interface PriceChartProps {
  holdings: Holding[];
  stocks: StockData[];
}

type TimeRange = "WTD" | "MTD" | "YTD";

// Custom tooltip component with dark theme
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-tertiary border border-border-subtle rounded-lg p-3 shadow-lg">
      <p className="text-xs text-text-muted mb-2">{formatXAxis(label)}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center justify-between gap-4 text-xs">
          <span className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-text-secondary">{entry.name}</span>
          </span>
          <span className="font-mono text-text-primary">
            {typeof entry.value === "number" ? `LKR ${entry.value.toFixed(2)}` : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function PriceChart({ holdings, stocks }: PriceChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("MTD");
  const [normalize, setNormalize] = useState(false);
  const [visibleSymbols, setVisibleSymbols] = useState<Set<string>>(new Set());

  const symbols = useMemo(() => holdings.map((h) => h.symbol), [holdings]);
  const stockMap = useMemo(() => new Map(stocks.map((s) => [s.symbol, s])), [stocks]);

  const { from, to } = getDateRange(timeRange);
  const { data, loading } = useChartData(
    symbols,
    formatChartDate(from),
    formatChartDate(to)
  );

  // Initialize visible symbols (first 3 by default)
  useEffect(() => {
    if (symbols.length > 0 && visibleSymbols.size === 0) {
      setVisibleSymbols(new Set(symbols.slice(0, 3)));
    }
  }, [symbols, visibleSymbols.size]);

  // Transform data for Recharts
  const chartData = useMemo(() => {
    if (Object.keys(data).length === 0) return [];
    return transformToRechartsFormat(data, normalize);
  }, [data, normalize]);

  function toggleSymbol(symbol: string) {
    const newVisible = new Set(visibleSymbols);
    if (newVisible.has(symbol)) {
      newVisible.delete(symbol);
    } else {
      newVisible.add(symbol);
    }
    setVisibleSymbols(newVisible);
  }

  if (symbols.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Price Performance</h3>
        <div className="h-[300px] flex items-center justify-center text-text-muted">
          Add holdings to view price chart
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Price Performance</h3>
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            {(["WTD", "MTD", "YTD"] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2 py-1 text-xs rounded transition-colors duration-150 ${
                  timeRange === range
                    ? "bg-tertiary text-text-primary"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <Button
            variant={normalize ? "primary" : "ghost"}
            onClick={() => setNormalize(!normalize)}
            className="text-xs px-2 py-1"
          >
            Normalize
          </Button>
        </div>
      </div>

      {/* Symbol toggles */}
      <div className="flex flex-wrap gap-2 mb-4">
        {symbols.map((symbol, i) => {
          const stock = stockMap.get(symbol);
          const isVisible = visibleSymbols.has(symbol);
          const color = getSeriesColor(i);
          return (
            <button
              key={symbol}
              onClick={() => toggleSymbol(symbol)}
              className={`px-2 py-1 text-xs rounded border transition-all duration-150 ${
                isVisible
                  ? "bg-veritasight-blue/10 text-veritasight-blue"
                  : "border-border-subtle text-text-muted hover:border-border-prominent hover:text-text-secondary"
              }`}
              style={
                isVisible
                  ? { borderColor: color, color: color }
                  : undefined
              }
            >
              {stock?.symbol || symbol}
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary/80 z-10 rounded-lg">
            <Spinner />
          </div>
        )}
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              {Array.from(visibleSymbols).map((symbol, i) => (
                <linearGradient key={symbol} id={`gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getSeriesColor(i)} stopOpacity={0.1} />
                  <stop offset="95%" stopColor={getSeriesColor(i)} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>

            {/* Grid - horizontal only, Linear-style */}
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

            {/* Lines for visible symbols */}
            {Array.from(visibleSymbols).map((symbol, i) => (
              <Line
                key={symbol}
                type="monotone"
                dataKey={symbol}
                stroke={getSeriesColor(i)}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: getSeriesColor(i) }}
                animationDuration={300}
                animationEasing="ease-out"
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
