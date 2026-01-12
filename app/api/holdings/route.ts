import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/726b9d45-7f22-41a6-a416-96ad6bd8fd32',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/holdings/route.ts:5',message:'GET holdings - checking database connection',data:{dbUrl:process.env.DATABASE_URL?.substring(0,20)+'...'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    // #region agent log
    try {
      const tableCheck = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('manual_assets', 'portfolio_holdings')`;
      fetch('http://127.0.0.1:7243/ingest/726b9d45-7f22-41a6-a416-96ad6bd8fd32',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/holdings/route.ts:8',message:'Table existence check',data:{tables:JSON.stringify(tableCheck)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    } catch (tableCheckError: any) {
      fetch('http://127.0.0.1:7243/ingest/726b9d45-7f22-41a6-a416-96ad6bd8fd32',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/holdings/route.ts:11',message:'Table check failed',data:{error:tableCheckError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    }
    // #endregion
    const holdings = await prisma.portfolio_holdings.findMany({
      orderBy: { created_at: "desc" },
    });

    const formatted = holdings.map((h) => ({
      id: h.id,
      symbol: h.symbol,
      shares_held: h.shares_held,
      created_at: h.created_at.toISOString(),
      updated_at: h.updated_at.toISOString(),
    }));

    return NextResponse.json({ data: formatted, error: null });
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/726b9d45-7f22-41a6-a416-96ad6bd8fd32',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/holdings/route.ts:20',message:'Error fetching holdings',data:{errorCode:error?.code,errorMessage:error?.message,errorMeta:JSON.stringify(error?.meta)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    console.error("Error fetching holdings:", error);
    return NextResponse.json(
      { data: null, error: { message: "Failed to fetch holdings", code: "DB_ERROR" } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { symbol, shares_held } = await request.json();

    if (!symbol || typeof shares_held !== "number") {
      return NextResponse.json(
        { data: null, error: { message: "Invalid input", code: "INVALID_INPUT" } },
        { status: 400 }
      );
    }

    const holding = await prisma.portfolio_holdings.create({
      data: { symbol: symbol.toUpperCase(), shares_held },
    });

    return NextResponse.json({
      data: {
        id: holding.id,
        symbol: holding.symbol,
        shares_held: holding.shares_held,
        created_at: holding.created_at.toISOString(),
        updated_at: holding.updated_at.toISOString(),
      },
      error: null,
    });
  } catch (error) {
    console.error("Error creating holding:", error);
    return NextResponse.json(
      { data: null, error: { message: "Failed to create holding", code: "DB_ERROR" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { symbol, shares_held } = await request.json();

    if (!symbol || typeof shares_held !== "number") {
      return NextResponse.json(
        { data: null, error: { message: "Invalid input", code: "INVALID_INPUT" } },
        { status: 400 }
      );
    }

    const holding = await prisma.portfolio_holdings.update({
      where: { symbol: symbol.toUpperCase() },
      data: { shares_held },
    });

    return NextResponse.json({
      data: {
        id: holding.id,
        symbol: holding.symbol,
        shares_held: holding.shares_held,
        created_at: holding.created_at.toISOString(),
        updated_at: holding.updated_at.toISOString(),
      },
      error: null,
    });
  } catch (error) {
    console.error("Error updating holding:", error);
    return NextResponse.json(
      { data: null, error: { message: "Failed to update holding", code: "DB_ERROR" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");

    if (!symbol) {
      return NextResponse.json(
        { data: null, error: { message: "Symbol required", code: "INVALID_INPUT" } },
        { status: 400 }
      );
    }

    await prisma.portfolio_holdings.delete({
      where: { symbol: symbol.toUpperCase() },
    });

    return NextResponse.json({ data: { success: true }, error: null });
  } catch (error) {
    console.error("Error deleting holding:", error);
    return NextResponse.json(
      { data: null, error: { message: "Failed to delete holding", code: "DB_ERROR" } },
      { status: 500 }
    );
  }
}
