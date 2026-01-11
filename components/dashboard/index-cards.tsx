"use client";

import type { IndexData } from "@/lib/types";
import { formatCurrency, formatPercentage, getVariant } from "@/lib/calculations";
import { Badge } from "@/components/ui";

interface IndexCardsProps {
  indices: IndexData[];
}

export function IndexCards({ indices }: IndexCardsProps) {
  const aspi = indices.find((i) => i.ticker === "ASPI");
  const spsl20 = indices.find((i) => i.ticker === "S&P SL20");

  return (
    <div className="flex items-center gap-8 text-text-secondary">
      {aspi && (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">ASPI</span>
          <span className="font-mono text-text-primary">
            {formatCurrency(aspi.value)}
          </span>
          <Badge variant={getVariant(aspi.percentage)} showArrow>
            {formatPercentage(aspi.percentage)}
          </Badge>
        </div>
      )}

      {aspi && spsl20 && (
        <div className="w-px h-6 bg-border-subtle" />
      )}

      {spsl20 && (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">S&P SL20</span>
          <span className="font-mono text-text-primary">
            {formatCurrency(spsl20.value)}
          </span>
          <Badge variant={getVariant(spsl20.percentage)} showArrow>
            {formatPercentage(spsl20.percentage)}
          </Badge>
        </div>
      )}
    </div>
  );
}
