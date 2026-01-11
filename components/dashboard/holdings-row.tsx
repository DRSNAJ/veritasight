"use client";

import { useState } from "react";
import type { StockData, Holding, IndexData } from "@/lib/types";
import { updateHolding, deleteHolding } from "@/lib/api";
import {
  formatCurrency,
  formatPercentage,
  getVariant,
  calculateHoldingValue,
  calculateRelativePerformance,
  findIndex,
} from "@/lib/calculations";
import { TableRow, TableCell, Badge, Input, Button } from "@/components/ui";

interface HoldingsRowProps {
  holding: Holding;
  stock: StockData | null;
  indices: IndexData[];
  onUpdate: (holding: Holding) => void;
  onDelete: (symbol: string) => void;
}

export function HoldingsRow({
  holding,
  stock,
  indices,
  onUpdate,
  onDelete,
}: HoldingsRowProps) {
  const [editing, setEditing] = useState(false);
  const [shares, setShares] = useState(holding.shares_held.toString());
  const [loading, setLoading] = useState(false);

  if (!stock) {
    return (
      <TableRow>
        <TableCell className="text-text-primary font-medium">{holding.symbol}</TableCell>
        <TableCell>Stock data unavailable</TableCell>
        <TableCell numeric>{holding.shares_held}</TableCell>
        <TableCell numeric colSpan={8}>-</TableCell>
      </TableRow>
    );
  }

  const aspi = findIndex(indices, "ASPI");
  const spsl20 = findIndex(indices, "S&P SL20");

  const value = calculateHoldingValue(holding.shares_held, stock.lasttradedprice);
  const vsAspi = aspi ? calculateRelativePerformance(stock.changepercentage, aspi.percentage) : null;
  const vsSP = spsl20 ? calculateRelativePerformance(stock.changepercentage, spsl20.percentage) : null;

  async function handleSave() {
    const newShares = parseInt(shares);
    if (isNaN(newShares) || newShares < 0) {
      setShares(holding.shares_held.toString());
      setEditing(false);
      return;
    }

    setLoading(true);
    const result = await updateHolding(holding.symbol, newShares);
    setLoading(false);

    if (result.data) {
      onUpdate(result.data);
    }
    setEditing(false);
  }

  async function handleDelete() {
    if (!confirm(`Remove ${holding.symbol} from portfolio?`)) return;
    setLoading(true);
    await deleteHolding(holding.symbol);
    setLoading(false);
    onDelete(holding.symbol);
  }

  return (
    <TableRow>
      <TableCell className="text-veritasight-blue font-medium font-mono">
        {stock.symbol}
      </TableCell>
      <TableCell className="text-text-primary max-w-[150px] truncate">
        {stock.name}
      </TableCell>
      <TableCell numeric>
        {editing ? (
          <div className="flex items-center gap-2 justify-end">
            <Input
              type="number"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              className="w-20 text-right"
              autoFocus
              onBlur={handleSave}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="hover:text-veritasight-blue transition-colors"
            disabled={loading}
          >
            {holding.shares_held.toLocaleString()}
          </button>
        )}
      </TableCell>
      <TableCell numeric>{formatCurrency(stock.lasttradedprice)}</TableCell>
      <TableCell numeric className="text-text-primary font-medium">
        {formatCurrency(value)}
      </TableCell>
      <TableCell numeric>
        <Badge variant={getVariant(stock.changepercentage)} showArrow>
          {formatPercentage(stock.changepercentage)}
        </Badge>
      </TableCell>
      <TableCell numeric>
        {vsAspi !== null && (
          <span className={vsAspi >= 0 ? "text-gain" : "text-loss"}>
            {formatPercentage(vsAspi)}
          </span>
        )}
      </TableCell>
      <TableCell numeric>
        {vsSP !== null && (
          <span className={vsSP >= 0 ? "text-gain" : "text-loss"}>
            {formatPercentage(vsSP)}
          </span>
        )}
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          onClick={handleDelete}
          disabled={loading}
          className="text-text-muted hover:text-loss p-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </TableCell>
    </TableRow>
  );
}
