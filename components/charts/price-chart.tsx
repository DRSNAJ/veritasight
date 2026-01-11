"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { createChart, IChartApi, ISeriesApi } from "lightweight-charts";
import type { Holding, StockData } from "@/lib/types";
import { useChartData } from "@/hooks/use-chart-data";
import { normalizeToBase100, getSeriesColor, getDateRange, formatChartDate } from "@/lib/chart-utils";
import { Card, Button, Spinner } from "@/components/ui";

interface PriceChartProps {
  holdings: Holding[];
  stocks: StockData[];
}

type TimeRange = "WTD" | "MTD" | "YTD";

export function PriceChart({ holdings, stocks }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<Map<string, ISeriesApi<"Line">>>(new Map());

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

  // Initialize visible symbols
  useEffect(() => {
    if (symbols.length > 0 && visibleSymbols.size === 0) {
      setVisibleSymbols(new Set(symbols.slice(0, 3)));
    }
  }, [symbols, visibleSymbols.size]);

  // Create chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 300,
      layout: {
        background: { color: "#1A1A1A" },
        textColor: "#A0A0A0",
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: "#2A2A2A" },
      },
      rightPriceScale: {
        borderColor: "#333333",
      },
      timeScale: {
        borderColor: "#333333",
      },
    });

    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current.clear();
    };
  }, []);

  // Update series data
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    // Remove old series
    for (const [symbol, series] of seriesRef.current) {
      if (!visibleSymbols.has(symbol)) {
        chart.removeSeries(series);
        seriesRef.current.delete(symbol);
      }
    }

    // Add/update visible series
    let colorIndex = 0;
    for (const symbol of visibleSymbols) {
      let seriesData = data[symbol] || [];

      if (normalize && seriesData.length > 0) {
        seriesData = normalizeToBase100(seriesData);
      }

      const formattedData = seriesData.map((d) => ({
        time: d.time as string,
        value: d.value,
      }));

      let series = seriesRef.current.get(symbol);
      if (!series) {
        series = chart.addLineSeries({
          color: getSeriesColor(colorIndex),
          lineWidth: 2,
          title: symbol,
        });
        seriesRef.current.set(symbol, series);
      }

      if (formattedData.length > 0) {
        series.setData(formattedData);
      }
      colorIndex++;
    }

    chart.timeScale().fitContent();
  }, [data, visibleSymbols, normalize]);

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
                className={`px-2 py-1 text-xs rounded ${
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
          return (
            <button
              key={symbol}
              onClick={() => toggleSymbol(symbol)}
              className={`px-2 py-1 text-xs rounded border transition-colors ${
                isVisible
                  ? "border-veritasight-blue bg-veritasight-blue/10 text-veritasight-blue"
                  : "border-border-subtle text-text-muted hover:border-border-prominent"
              }`}
              style={isVisible ? { borderColor: getSeriesColor(i) } : undefined}
            >
              {stock?.symbol || symbol}
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary/80 z-10">
            <Spinner />
          </div>
        )}
        <div ref={chartContainerRef} className="w-full" />
      </div>
    </Card>
  );
}
