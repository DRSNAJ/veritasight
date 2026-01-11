import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
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
  } catch (error) {
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
