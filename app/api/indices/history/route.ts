import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface HistoryPoint {
  ticker: string;
  date: string;
  value: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    // Build date filter
    let dateFilter = "";
    const params: (string | Date)[] = [];

    if (from) {
      params.push(from);
      dateFilter += ` AND "timeCreated" >= $${params.length}::timestamp`;
    }
    if (to) {
      params.push(to);
      dateFilter += ` AND "timeCreated" <= $${params.length}::timestamp`;
    }

    // Query historical index data
    const history = await prisma.$queryRawUnsafe<HistoryPoint[]>(`
      SELECT
        ticker,
        DATE("timeCreated") as date,
        AVG(value)::float as value
      FROM index_raw_data
      WHERE ticker IN ('aspi', 'sl20')
        AND value IS NOT NULL
        ${dateFilter}
      GROUP BY ticker, DATE("timeCreated")
      ORDER BY ticker, date
    `, ...params);

    // Group by ticker
    const grouped: Record<string, { time: string; value: number }[]> = {};
    for (const point of history) {
      if (!grouped[point.ticker]) {
        grouped[point.ticker] = [];
      }
      grouped[point.ticker].push({
        time: point.date,
        value: point.value,
      });
    }

    return NextResponse.json({ data: grouped, error: null });
  } catch (error) {
    console.error("Error fetching index history:", error);
    return NextResponse.json(
      { data: null, error: { message: "Failed to fetch index history", code: "DB_ERROR" } },
      { status: 500 }
    );
  }
}
