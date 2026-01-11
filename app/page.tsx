"use client";

import { useState, useEffect, useCallback } from "react";
import type { StockData, IndexData, Holding, ManualAsset } from "@/lib/types";
import { getStocks, getIndices, getHoldings, getAssets } from "@/lib/api";
import { calculatePortfolioTotals } from "@/lib/calculations";
import { Spinner, Button } from "@/components/ui";
import { IndexCards } from "@/components/dashboard/index-cards";
import { PortfolioSummary } from "@/components/dashboard/portfolio-summary";
import { HoldingsTable } from "@/components/dashboard/holdings-table";
import { ManualAssetsTable } from "@/components/dashboard/manual-assets-table";
import { AllocationDonut } from "@/components/charts/allocation-donut";
import { PriceChart } from "@/components/charts/price-chart";
import { PortfolioChart } from "@/components/charts/portfolio-chart";

export default function Dashboard() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [indices, setIndices] = useState<IndexData[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [assets, setAssets] = useState<ManualAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");

    const [stocksRes, indicesRes, holdingsRes, assetsRes] = await Promise.all([
      getStocks(),
      getIndices(),
      getHoldings(),
      getAssets(),
    ]);

    if (stocksRes.error || indicesRes.error) {
      setError("Failed to load market data");
    }

    setStocks(stocksRes.data || []);
    setIndices(indicesRes.data || []);
    setHoldings(holdingsRes.data || []);
    setAssets(assetsRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    window.location.href = "/login";
  }

  const totals = calculatePortfolioTotals(holdings, stocks, assets);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">VeritaSight</h1>
          <p className="text-sm text-text-muted mt-1">
            Sri Lankan Equities Dashboard
          </p>
        </div>
        <div className="flex items-center gap-6">
          <IndexCards indices={indices} />
          <Button variant="ghost" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-loss/10 border border-loss rounded-lg text-loss">
          {error}
        </div>
      )}

      {/* Portfolio Summary */}
      <section className="mb-8">
        <PortfolioSummary totals={totals} />
      </section>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Holdings Table - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <HoldingsTable
            holdings={holdings}
            stocks={stocks}
            indices={indices}
            loading={loading}
            onHoldingsChange={setHoldings}
          />

          <ManualAssetsTable
            assets={assets}
            loading={loading}
            onAssetsChange={setAssets}
          />
        </div>

        {/* Allocation Chart - Takes 1 column */}
        <div className="space-y-6">
          <AllocationDonut
            holdings={holdings}
            stocks={stocks}
            assets={assets}
          />
          <PortfolioChart
            holdings={holdings}
            stocks={stocks}
            indices={indices}
          />
        </div>
      </div>

      {/* Charts Section */}
      <section className="mt-6">
        <PriceChart holdings={holdings} stocks={stocks} />
      </section>
    </main>
  );
}
