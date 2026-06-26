import { NextResponse } from "next/server";
import {
  AUTH_COOKIE,
  AUTH_MAX_AGE_SECONDS,
  buildAuthCookie,
  computeToken,
  pinForRole,
  safeEqual,
  type Role,
} from "@/lib/staff/auth";

/**
 * Dual-PIN login. Tries the admin PIN first, then staff, with constant-time
 * comparison. Issues a role-bound cookie `{role}.{token}`. The response includes
 * the granted role so the client can redirect appropriately.
 */
export async function POST(req: Request) {
  const adminPin = pinForRole("admin");
  const staffPin = pinForRole("staff");
  if (!adminPin && !staffPin) {
    return NextResponse.json({ error: "Staff PINs are not configured" }, { status: 500 });
  }

  const body = await req.json().catch(() => ({}));
  const provided = String(body?.pin ?? "");

  let role: Role | null = null;
  if (adminPin && safeEqual(provided, adminPin)) {
    role = "admin";
  } else if (staffPin && safeEqual(provided, staffPin)) {
    role = "staff";
  }

  if (!role) {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  }

  const token = await computeToken(provided, role);
  const res = NextResponse.json({ ok: true, role });
  res.cookies.set(AUTH_COOKIE, buildAuthCookie(role, token), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_MAX_AGE_SECONDS,
  });
  return res;
}
