"use client";

import { useState } from "react";
import type { StockData, Holding, IndexData } from "@/lib/types";
import { calculateHoldingValue } from "@/lib/calculations";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableRowSkeleton,
  Button,
} from "@/components/ui";
import { HoldingsRow } from "./holdings-row";
import { AddHoldingModal } from "./add-holding-modal";

interface HoldingsTableProps {
  holdings: Holding[];
  stocks: StockData[];
  indices: IndexData[];
  loading: boolean;
  onHoldingsChange: (holdings: Holding[]) => void;
}

type SortKey = "value" | "change";

export function HoldingsTable({
  holdings,
  stocks,
  indices,
  loading,
  onHoldingsChange,
}: HoldingsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("value");
  const [showAddModal, setShowAddModal] = useState(false);

  const stockMap = new Map(stocks.map((s) => [s.symbol, s]));
  const existingSymbols = new Set(holdings.map((h) => h.symbol));

  // Sort holdings
  const sortedHoldings = [...holdings].sort((a, b) => {
    const stockA = stockMap.get(a.symbol);
    const stockB = stockMap.get(b.symbol);

    if (!stockA || !stockB) return 0;

    if (sortKey === "value") {
      const valueA = calculateHoldingValue(a.shares_held, stockA.lasttradedprice);
      const valueB = calculateHoldingValue(b.shares_held, stockB.lasttradedprice);
      return valueB - valueA;
    } else {
      return stockB.changepercentage - stockA.changepercentage;
    }
  });

  function handleUpdate(updated: Holding) {
    onHoldingsChange(
      holdings.map((h) => (h.symbol === updated.symbol ? updated : h))
    );
  }

  function handleDelete(symbol: string) {
    onHoldingsChange(holdings.filter((h) => h.symbol !== symbol));
  }

  function handleAdd(newHolding: Holding) {
    onHoldingsChange([...holdings, newHolding]);
  }

  return (
    <div className="bg-secondary border border-border-subtle rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border-subtle">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-text-primary">Holdings</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setSortKey("value")}
              className={`text-sm px-2 py-1 rounded ${
                sortKey === "value"
                  ? "bg-tertiary text-text-primary"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              By Value
            </button>
            <button
              onClick={() => setSortKey("change")}
              className={`text-sm px-2 py-1 rounded ${
                sortKey === "change"
                  ? "bg-tertiary text-text-primary"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              By Change
            </button>
          </div>
        </div>
        <Button onClick={() => setShowAddModal(true)}>+ Add Stock</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Name</TableHead>
            <TableHead numeric>Shares</TableHead>
            <TableHead numeric>LTP</TableHead>
            <TableHead numeric>Value</TableHead>
            <TableHead numeric>Day %</TableHead>
            <TableHead numeric>vs ASPI</TableHead>
            <TableHead numeric>vs S&P</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <>
              <TableRowSkeleton columns={9} />
              <TableRowSkeleton columns={9} />
              <TableRowSkeleton columns={9} />
            </>
          ) : sortedHoldings.length === 0 ? (
            <TableRow>
              <td colSpan={9} className="px-4 py-8 text-center text-text-muted">
                No holdings yet. Click &quot;Add Stock&quot; to get started.
              </td>
            </TableRow>
          ) : (
            sortedHoldings.map((holding) => (
              <HoldingsRow
                key={holding.symbol}
                holding={holding}
                stock={stockMap.get(holding.symbol) || null}
                indices={indices}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))
          )}
        </TableBody>
      </Table>

      <AddHoldingModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        stocks={stocks}
        existingSymbols={existingSymbols}
        onAdd={handleAdd}
      />
    </div>
  );
}
