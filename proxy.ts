import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, verifyAuthCookie } from "@/lib/staff/auth";

// Next 16 renamed the `middleware` convention to `proxy` (runs on the nodejs
// runtime). This proxy ONLY gates the staff portal (`/staff` + `/api/staff`) —
// the public DevGathering site is never matched, so it is completely unaffected.
// Cheap cookie-role check here; every admin API route ALSO calls requireAdmin()
// as defense in depth.

const LOGIN_PATH = "/staff";
const SCAN_PATH = "/staff/scan";

// Admin-only areas (full dashboard + mutations).
const ADMIN_PREFIXES = [
  "/staff/participants",
  "/staff/meals",
  "/api/staff/participants",
  "/api/staff/meals",
];

// Auth endpoints must stay reachable while logged out (login / logout).
const PUBLIC_PREFIXES = ["/api/staff/auth"];

function startsWithPath(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api/");

  // Login / logout endpoints are always reachable.
  if (startsWithPath(pathname, PUBLIC_PREFIXES)) return NextResponse.next();

  const role = await verifyAuthCookie(req.cookies.get(AUTH_COOKIE)?.value);

  // Unauthenticated -> API 401, page redirect to the portal login.
  if (!role) {
    if (isApi) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    // The login page itself (`/staff`) must render for unauthenticated users.
    if (pathname === LOGIN_PATH) return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Authenticated but not admin trying to reach an admin area.
  if (startsWithPath(pathname, ADMIN_PREFIXES) && role !== "admin") {
    if (isApi) return NextResponse.json({ error: "admin only" }, { status: 403 });
    const url = req.nextUrl.clone();
    url.pathname = SCAN_PATH;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/staff/:path*", "/api/staff/:path*"],
};
