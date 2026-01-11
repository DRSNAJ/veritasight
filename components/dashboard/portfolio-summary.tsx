"use client";

import type { PortfolioTotals } from "@/lib/calculations";
import { formatCurrency, formatPercentage, getVariant } from "@/lib/calculations";
import { Badge } from "@/components/ui";

interface PortfolioSummaryProps {
  totals: PortfolioTotals;
}

export function PortfolioSummary({ totals }: PortfolioSummaryProps) {
  return (
    <div className="flex items-baseline gap-6">
      <div>
        <p className="text-sm text-text-muted mb-1">Total Portfolio</p>
        <p className="text-3xl font-bold font-mono text-text-primary">
          LKR {formatCurrency(totals.totalValue)}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant={getVariant(totals.dayChange)} showArrow>
          {formatPercentage(totals.dayChangePercent)}
        </Badge>
        <span className="text-sm font-mono text-text-secondary">
          {totals.dayChange >= 0 ? "+" : ""}
          {formatCurrency(totals.dayChange)}
        </span>
      </div>

      <div className="ml-auto flex gap-6 text-sm text-text-secondary">
        <div>
          <span className="text-text-muted">Equity: </span>
          <span className="font-mono">LKR {formatCurrency(totals.equityValue)}</span>
        </div>
        <div>
          <span className="text-text-muted">Other: </span>
          <span className="font-mono">LKR {formatCurrency(totals.manualValue)}</span>
        </div>
      </div>
    </div>
  );
}
