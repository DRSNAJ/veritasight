"use client";

import { useState } from "react";
import type { StockData, Holding } from "@/lib/types";
import { addHolding } from "@/lib/api";
import { Modal, Button, Input } from "@/components/ui";

interface AddHoldingModalProps {
  isOpen: boolean;
  onClose: () => void;
  stocks: StockData[];
  existingSymbols: Set<string>;
  onAdd: (holding: Holding) => void;
}

export function AddHoldingModal({
  isOpen,
  onClose,
  stocks,
  existingSymbols,
  onAdd,
}: AddHoldingModalProps) {
  const [symbol, setSymbol] = useState("");
  const [shares, setShares] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const availableStocks = stocks.filter((s) => !existingSymbols.has(s.symbol));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!symbol || !shares) {
      setError("Please fill all fields");
      return;
    }

    const sharesNum = parseInt(shares);
    if (isNaN(sharesNum) || sharesNum <= 0) {
      setError("Invalid number of shares");
      return;
    }

    setLoading(true);
    const result = await addHolding(symbol, sharesNum);
    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (result.data) {
      onAdd(result.data);
      setSymbol("");
      setShares("");
      onClose();
    }
  }

  function handleClose() {
    setSymbol("");
    setShares("");
    setError("");
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Holding">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-text-secondary mb-1">Symbol</label>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="w-full px-3 py-2 bg-secondary border border-border-subtle rounded-lg
              text-text-primary focus:outline-none focus:border-veritasight-blue"
          >
            <option value="">Select a stock</option>
            {availableStocks.map((stock) => (
              <option key={stock.symbol} value={stock.symbol}>
                {stock.symbol} - {stock.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1">Shares</label>
          <Input
            type="number"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            placeholder="0"
            min="1"
          />
        </div>

        {error && <p className="text-loss text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Add Holding
          </Button>
        </div>
      </form>
    </Modal>
  );
}
