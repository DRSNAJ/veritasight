import type {
  StockData,
  IndexData,
  Holding,
  ManualAsset,
  AssetType,
  ApiResponse,
} from "./types";

const API_BASE = "/api";

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    return await res.json();
  } catch {
    return { data: null, error: { message: "Network error", code: "NETWORK_ERROR" } };
  }
}

// Stocks (read-only)
export async function getStocks(): Promise<ApiResponse<StockData[]>> {
  return fetchApi("/stocks");
}

// Indices (read-only)
export async function getIndices(): Promise<ApiResponse<IndexData[]>> {
  return fetchApi("/indices");
}

// Holdings (CRUD)
export async function getHoldings(): Promise<ApiResponse<Holding[]>> {
  return fetchApi("/holdings");
}

export async function addHolding(
  symbol: string,
  shares_held: number
): Promise<ApiResponse<Holding>> {
  return fetchApi("/holdings", {
    method: "POST",
    body: JSON.stringify({ symbol, shares_held }),
  });
}

export async function updateHolding(
  symbol: string,
  shares_held: number
): Promise<ApiResponse<Holding>> {
  return fetchApi("/holdings", {
    method: "PATCH",
    body: JSON.stringify({ symbol, shares_held }),
  });
}

export async function deleteHolding(symbol: string): Promise<ApiResponse<{ success: boolean }>> {
  return fetchApi(`/holdings?symbol=${encodeURIComponent(symbol)}`, {
    method: "DELETE",
  });
}

// Manual Assets (CRUD)
export async function getAssets(): Promise<ApiResponse<ManualAsset[]>> {
  return fetchApi("/assets");
}

export async function addAsset(
  name: string,
  type: AssetType,
  value: number,
  notes?: string
): Promise<ApiResponse<ManualAsset>> {
  return fetchApi("/assets", {
    method: "POST",
    body: JSON.stringify({ name, type, value, notes }),
  });
}

export async function updateAsset(
  id: number,
  updates: Partial<{ name: string; type: AssetType; value: number; notes: string | null }>
): Promise<ApiResponse<ManualAsset>> {
  return fetchApi("/assets", {
    method: "PATCH",
    body: JSON.stringify({ id, ...updates }),
  });
}

export async function deleteAsset(id: number): Promise<ApiResponse<{ success: boolean }>> {
  return fetchApi(`/assets?id=${id}`, {
    method: "DELETE",
  });
}
