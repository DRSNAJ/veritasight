// Stock data from ticker_raw_data table
export interface StockData {
  id: number;
  symbol: string;
  name: string;
  lasttradedprice: number;
  previousclose: number;
  change: number;
  changepercentage: number;
  marketcap: number | null;
  wtdhiprice: number | null;
  mtdhiprice: number | null;
  ytdhiprice: number | null;
  wtdlowprice: number | null;
  mtdlowprice: number | null;
  ytdlowprice: number | null;
  tdysharevolume: number | null;
  timecreated: string;
}

// Index data from index_raw_data table
export interface IndexData {
  id: number;
  ticker: string;
  value: number;
  change: number;
  percentage: number;
  highvalue: number | null;
  lowvalue: number | null;
}

// Portfolio holding (user data)
export interface Holding {
  id: number;
  symbol: string;
  shares_held: number;
  created_at: string;
  updated_at: string;
}

// Manual asset types
export type AssetType = "FD" | "BOND" | "CASH" | "OTHER";

// Manual asset (user data)
export interface ManualAsset {
  id: number;
  name: string;
  type: AssetType;
  value: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Combined holding with stock data for display
export interface HoldingWithStock extends Holding {
  stock: StockData | null;
  holdingValue: number;
  dayChange: number;
  dayChangePercent: number;
}

// API response wrapper
export interface ApiResponse<T> {
  data: T | null;
  error: { message: string; code: string } | null;
}

// Allocation segment for donut chart
export interface AllocationSegment {
  label: string;
  value: number;
  percentage: number;
  color: string;
  type: "equity" | "manual";
}
