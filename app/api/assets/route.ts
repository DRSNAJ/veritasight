import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { AssetType } from "@/lib/types";

const VALID_TYPES: AssetType[] = ["FD", "BOND", "CASH", "OTHER"];

export async function GET() {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/726b9d45-7f22-41a6-a416-96ad6bd8fd32',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/assets/route.ts:8',message:'GET assets - checking database connection',data:{dbUrl:process.env.DATABASE_URL?.substring(0,20)+'...'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    // #region agent log
    try {
      const tableCheck = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('manual_assets', 'portfolio_holdings')`;
      fetch('http://127.0.0.1:7243/ingest/726b9d45-7f22-41a6-a416-96ad6bd8fd32',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/assets/route.ts:11',message:'Table existence check',data:{tables:JSON.stringify(tableCheck)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    } catch (tableCheckError: any) {
      fetch('http://127.0.0.1:7243/ingest/726b9d45-7f22-41a6-a416-96ad6bd8fd32',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/assets/route.ts:14',message:'Table check failed',data:{error:tableCheckError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    }
    // #endregion
    const assets = await prisma.manual_assets.findMany({
      orderBy: { created_at: "desc" },
    });

    const formatted = assets.map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type as AssetType,
      value: Number(a.value),
      notes: a.notes,
      created_at: a.created_at.toISOString(),
      updated_at: a.updated_at.toISOString(),
    }));

    return NextResponse.json({ data: formatted, error: null });
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/726b9d45-7f22-41a6-a416-96ad6bd8fd32',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/assets/route.ts:25',message:'Error fetching assets',data:{errorCode:error?.code,errorMessage:error?.message,errorMeta:JSON.stringify(error?.meta)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    console.error("Error fetching assets:", error);
    return NextResponse.json(
      { data: null, error: { message: "Failed to fetch assets", code: "DB_ERROR" } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, type, value, notes } = await request.json();

    if (!name || !VALID_TYPES.includes(type) || typeof value !== "number") {
      return NextResponse.json(
        { data: null, error: { message: "Invalid input", code: "INVALID_INPUT" } },
        { status: 400 }
      );
    }

    const asset = await prisma.manual_assets.create({
      data: { name, type, value, notes: notes || null },
    });

    return NextResponse.json({
      data: {
        id: asset.id,
        name: asset.name,
        type: asset.type as AssetType,
        value: Number(asset.value),
        notes: asset.notes,
        created_at: asset.created_at.toISOString(),
        updated_at: asset.updated_at.toISOString(),
      },
      error: null,
    });
  } catch (error) {
    console.error("Error creating asset:", error);
    return NextResponse.json(
      { data: null, error: { message: "Failed to create asset", code: "DB_ERROR" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, name, type, value, notes } = await request.json();

    if (!id) {
      return NextResponse.json(
        { data: null, error: { message: "ID required", code: "INVALID_INPUT" } },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined && VALID_TYPES.includes(type)) updateData.type = type;
    if (value !== undefined) updateData.value = value;
    if (notes !== undefined) updateData.notes = notes;

    const asset = await prisma.manual_assets.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      data: {
        id: asset.id,
        name: asset.name,
        type: asset.type as AssetType,
        value: Number(asset.value),
        notes: asset.notes,
        created_at: asset.created_at.toISOString(),
        updated_at: asset.updated_at.toISOString(),
      },
      error: null,
    });
  } catch (error) {
    console.error("Error updating asset:", error);
    return NextResponse.json(
      { data: null, error: { message: "Failed to update asset", code: "DB_ERROR" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { data: null, error: { message: "ID required", code: "INVALID_INPUT" } },
        { status: 400 }
      );
    }

    await prisma.manual_assets.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ data: { success: true }, error: null });
  } catch (error) {
    console.error("Error deleting asset:", error);
    return NextResponse.json(
      { data: null, error: { message: "Failed to delete asset", code: "DB_ERROR" } },
      { status: 500 }
    );
  }
}
