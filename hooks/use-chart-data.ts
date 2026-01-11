"use client";

import { useState, useEffect } from "react";
import type { ChartDataPoint } from "@/lib/chart-utils";

interface UseChartDataResult {
  data: Record<string, ChartDataPoint[]>;
  loading: boolean;
  error: string | null;
}

export function useChartData(
  symbols: string[],
  from?: string,
  to?: string
): UseChartDataResult {
  const [data, setData] = useState<Record<string, ChartDataPoint[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (symbols.length === 0) {
      setData({});
      setLoading(false);
      return;
    }

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("symbols", symbols.join(","));
        if (from) params.set("from", from);
        if (to) params.set("to", to);

        const res = await fetch(`/api/stocks/history?${params}`);
        const result = await res.json();

        if (result.error) {
          setError(result.error.message);
        } else {
          setData(result.data || {});
        }
      } catch {
        setError("Failed to fetch chart data");
      }

      setLoading(false);
    }

    fetchData();
  }, [symbols.join(","), from, to]);

  return { data, loading, error };
}
