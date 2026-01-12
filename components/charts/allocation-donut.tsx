"use client";

import { useMemo } from "react";
import type { StockData, Holding, ManualAsset } from "@/lib/types";
import { calculateAllocation, formatCurrency } from "@/lib/calculations";
import { Card } from "@/components/ui";

interface AllocationDonutProps {
  holdings: Holding[];
  stocks: StockData[];
  assets: ManualAsset[];
}

export function AllocationDonut({ holdings, stocks, assets }: AllocationDonutProps) {
  const segments = useMemo(
    () => calculateAllocation(holdings, stocks, assets),
    [holdings, stocks, assets]
  );

  const total = segments.reduce((sum, s) => sum + s.value, 0);

  if (segments.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Allocation</h3>
        <div className="flex items-center justify-center h-48 text-text-muted">
          No assets to display
        </div>
      </Card>
    );
  }

  // Calculate SVG paths for donut
  const size = 160;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let cumulativePercent = 0;
  const paths = segments.map((segment) => {
    const percent = segment.percentage / 100;
    const offset = circumference * (1 - cumulativePercent);
    const dashLength = circumference * percent;
    const gapLength = circumference - dashLength;
    cumulativePercent += percent;

    return {
      ...segment,
      offset,
      dashLength,
      gapLength,
    };
  });

  return (
    <Card>
      <h3 className="text-lg font-semibold text-text-primary mb-4">Allocation</h3>

      <div className="flex flex-col items-center">
        {/* SVG Donut */}
        <div className="relative">
          <svg width={size} height={size} className="transform -rotate-90">
            {paths.map((path, i) => (
              <circle
                key={i}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={path.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${path.dashLength} ${path.gapLength}`}
                strokeDashoffset={path.offset}
                className="transition-all duration-300"
              />
            ))}
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-text-muted">Total</span>
            <span className="text-sm font-mono font-medium text-text-primary">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 w-full space-y-2">
          {segments.slice(0, 8).map((segment, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-text-secondary truncate max-w-[100px]">
                  {segment.label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-text-muted">
                  {segment.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
          {segments.length > 8 && (
            <div className="text-xs text-text-muted text-center pt-1">
              +{segments.length - 8} more
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
