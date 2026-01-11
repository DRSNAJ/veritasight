import { cookies } from "next/headers";

export const AUTH_COOKIE = "veritasight-auth";
export const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export function verifyPassword(password: string): boolean {
  return password === process.env.AUTH_PASSWORD;
}

export function createSessionToken(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE);
  return !!token?.value;
}
