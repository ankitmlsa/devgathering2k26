import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE, verifyAuthCookie, type Role } from "@/lib/staff/auth";

/** Resolve the authenticated role from the request cookie (server-side). */
export async function getRole(): Promise<Role | null> {
  const store = await cookies();
  return verifyAuthCookie(store.get(AUTH_COOKIE)?.value);
}

/**
 * Guard for admin API routes. Returns a 403 `NextResponse` when the caller is
 * not an admin, else null. Use as defense-in-depth — never trust the proxy alone.
 *
 *   const denied = await requireAdmin();
 *   if (denied) return denied;
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const role = await getRole();
  if (role !== "admin") {
    return NextResponse.json({ error: "admin only" }, { status: 403 });
  }
  return null;
}

/** Guard for staff-or-admin API routes. Returns a 401 response when unauthenticated. */
export async function requireStaff(): Promise<NextResponse | null> {
  const role = await getRole();
  if (role !== "staff" && role !== "admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}
