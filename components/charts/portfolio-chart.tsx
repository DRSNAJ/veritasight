"use client";

import { useEffect, useRef, useMemo } from "react";
import { createChart, IChartApi } from "lightweight-charts";
import type { Holding, StockData, IndexData } from "@/lib/types";
import { useChartData } from "@/hooks/use-chart-data";
import { normalizeToBase100, formatChartDate, getDateRange } from "@/lib/chart-utils";
import { Card, Spinner } from "@/components/ui";

interface PortfolioChartProps {
  holdings: Holding[];
  stocks: StockData[];
  indices: IndexData[];
}

export function PortfolioChart({ holdings, stocks }: PortfolioChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const symbols = useMemo(() => holdings.map((h) => h.symbol), [holdings]);
  const holdingsMap = useMemo(
    () => new Map(holdings.map((h) => [h.symbol, h.shares_held])),
    [holdings]
  );

  const { from, to } = getDateRange("YTD");
  const { data, loading } = useChartData(
    symbols,
    formatChartDate(from),
    formatChartDate(to)
  );

  // Calculate portfolio value over time
  const portfolioData = useMemo(() => {
    if (Object.keys(data).length === 0) return [];

    // Get all unique dates
    const allDates = new Set<string>();
    for (const series of Object.values(data)) {
      for (const point of series) {
        allDates.add(point.time);
      }
    }

    const sortedDates = Array.from(allDates).sort();

    // Calculate portfolio value for each date
    const portfolioValues: { time: string; value: number }[] = [];

    for (const date of sortedDates) {
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
    }

    return normalizeToBase100(portfolioValues);
  }, [data, holdingsMap]);

  // Create and update chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 250,
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
    };
  }, []);

  // Update chart data when portfolioData changes
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || portfolioData.length === 0) return;

    // Remove existing series and add new one
    const series = chart.addLineSeries({
      color: "#4C9FFF",
      lineWidth: 2,
      title: "Portfolio",
    });

    series.setData(
      portfolioData.map((d) => ({
        time: d.time as string,
        value: d.value,
      }))
    );

    chart.timeScale().fitContent();

    return () => {
      chart.removeSeries(series);
    };
  }, [portfolioData]);

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
          <div className="absolute inset-0 flex items-center justify-center bg-secondary/80 z-10">
            <Spinner />
          </div>
        )}
        <div ref={chartContainerRef} className="w-full" />
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-veritasight-blue" />
          <span className="text-text-secondary">Portfolio</span>
        </div>
      </div>
    </Card>
  );
}
