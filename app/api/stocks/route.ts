import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { StockData } from "@/lib/types";

export async function GET() {
  try {
    // Get latest data for each symbol using a subquery approach
    const stocks = await prisma.$queryRaw<StockData[]>`
      SELECT DISTINCT ON (symbol)
        id,
        symbol,
        name,
        COALESCE(lasttradedprice, 0)::float as lasttradedprice,
        COALESCE(previousclose, 0)::float as previousclose,
        COALESCE(change, 0)::float as change,
        COALESCE(changepercentage, 0)::float as changepercentage,
        marketcap::float as marketcap,
        wtdhiprice::float as wtdhiprice,
        mtdhiprice::float as mtdhiprice,
        ytdhiprice::float as ytdhiprice,
        wtdlowprice::float as wtdlowprice,
        mtdlowprice::float as mtdlowprice,
        ytdlowprice::float as ytdlowprice,
        tdysharevolume::float as tdysharevolume,
        timecreated::text as timecreated
      FROM ticker_raw_data
      WHERE symbol IS NOT NULL
      ORDER BY symbol, timecreated DESC
    `;

    return NextResponse.json({ data: stocks, error: null });
  } catch (error) {
    console.error("Error fetching stocks:", error);
    return NextResponse.json(
      { data: null, error: { message: "Failed to fetch stocks", code: "DB_ERROR" } },
      { status: 500 }
    );
  }
}
