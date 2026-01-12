import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface HistoryPoint {
  symbol: string;
  date: string;
  price: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get("symbols");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!symbolsParam) {
      return NextResponse.json(
        { data: null, error: { message: "Symbols required", code: "INVALID_INPUT" } },
        { status: 400 }
      );
    }

    const symbols = symbolsParam.split(",");

    // Build date filter
    let dateFilter = "";
    const params: (string | Date)[] = [];

    if (from) {
      params.push(from);
      // $1 is used for symbols array, so date params start at $2
      dateFilter += ` AND timecreated >= $${params.length + 1}::timestamp`;
    }
    if (to) {
      params.push(to);
      // $1 is used for symbols array, so date params start at $2
      dateFilter += ` AND timecreated <= $${params.length + 1}::timestamp`;
    }

    // Query historical data
    const history = await prisma.$queryRawUnsafe<HistoryPoint[]>(`
      SELECT
        symbol,
        DATE(timecreated) as date,
        AVG(lasttradedprice)::float as price
      FROM ticker_raw_data
      WHERE symbol = ANY($1)
        AND lasttradedprice IS NOT NULL
        ${dateFilter}
      GROUP BY symbol, DATE(timecreated)
      ORDER BY symbol, date
    `, symbols, ...params);

    // Group by symbol
    const grouped: Record<string, { time: string; value: number }[]> = {};
    for (const point of history) {
      if (!grouped[point.symbol]) {
        grouped[point.symbol] = [];
      }
      grouped[point.symbol].push({
        time: point.date,
        value: point.price,
      });
    }

    return NextResponse.json({ data: grouped, error: null });
  } catch (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json(
      { data: null, error: { message: "Failed to fetch history", code: "DB_ERROR" } },
      { status: 500 }
    );
  }
}
