import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifyPassword,
  createSessionToken,
  AUTH_COOKIE,
  SESSION_DURATION,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!verifyPassword(password)) {
      return NextResponse.json(
        { data: null, error: { message: "Invalid password", code: "INVALID_PASSWORD" } },
        { status: 401 }
      );
    }

    const token = createSessionToken();
    const cookieStore = await cookies();

    cookieStore.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION / 1000,
      path: "/",
    });

    return NextResponse.json({ data: { success: true }, error: null });
  } catch {
    return NextResponse.json(
      { data: null, error: { message: "Server error", code: "SERVER_ERROR" } },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE);

    return NextResponse.json({ data: { success: true }, error: null });
  } catch {
    return NextResponse.json(
      { data: null, error: { message: "Server error", code: "SERVER_ERROR" } },
      { status: 500 }
    );
  }
}
