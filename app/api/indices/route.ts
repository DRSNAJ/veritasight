import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { IndexData } from "@/lib/types";

export async function GET() {
  try {
    // Get latest data for ASPI and S&P SL20
    const indices = await prisma.$queryRaw<IndexData[]>`
      SELECT DISTINCT ON (ticker)
        id,
        ticker,
        COALESCE(value, 0)::float as value,
        COALESCE(change, 0)::float as change,
        COALESCE(percentage, 0)::float as percentage,
        highvalue::float as highvalue,
        lowvalue::float as lowvalue
      FROM index_raw_data
      WHERE ticker IN ('aspi', 'sl20')
      ORDER BY ticker, "timeCreated" DESC
    `;

    return NextResponse.json({ data: indices, error: null });
  } catch (error) {
    console.error("Error fetching indices:", error);
    return NextResponse.json(
      { data: null, error: { message: "Failed to fetch indices", code: "DB_ERROR" } },
      { status: 500 }
    );
  }
}
