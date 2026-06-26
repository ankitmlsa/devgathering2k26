export const AUTH_COOKIE = "dg_staff_auth";
export const AUTH_MAX_AGE_SECONDS = 60 * 60 * 12; // 12h staff shift

export type Role = "staff" | "admin";

/**
 * Derive an opaque session token from a PIN, bound to the role so a token issued
 * for one role can never be replayed as another (and we never store the PIN
 * itself). The role is part of the hashed material, not a plaintext claim.
 */
export async function computeToken(pin: string, role: Role): Promise<string> {
  const data = new TextEncoder().encode(`devgathering-staff:${role}:${pin}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** The configured PIN for a role, or null when that role is not enabled. */
export function pinForRole(role: Role): string | null {
  const pin = role === "admin" ? process.env.SCANNER_ADMIN_PIN : process.env.SCANNER_STAFF_PIN;
  return pin && pin.length > 0 ? pin : null;
}

/** Expected cookie token for a role, or null when the role's PIN is unset. */
export async function tokenForRole(role: Role): Promise<string | null> {
  const pin = pinForRole(role);
  if (!pin) return null;
  return computeToken(pin, role);
}

/** Build the cookie value `{role}.{token}`. */
export function buildAuthCookie(role: Role, token: string): string {
  return `${role}.${token}`;
}

/** Split a `{role}.{token}` cookie value; returns null parts when malformed. */
export function parseAuthCookie(raw: string | undefined): { role: Role | null; token: string } {
  const value = (raw ?? "").trim();
  const dot = value.indexOf(".");
  if (dot <= 0) return { role: null, token: "" };
  const role = value.slice(0, dot);
  const token = value.slice(dot + 1);
  if (role !== "staff" && role !== "admin") return { role: null, token: "" };
  return { role, token };
}

/**
 * Verify the auth cookie and return the authenticated role, or null. The claimed
 * role is verified by recomputing the expected token FOR THAT ROLE and comparing
 * constant-time, so a tampered `admin.<staff-hex>` fails (the staff digest never
 * equals the admin-role digest).
 */
export async function verifyAuthCookie(raw: string | undefined): Promise<Role | null> {
  const { role, token } = parseAuthCookie(raw);
  if (!role || !token) return null;
  const expected = await tokenForRole(role);
  if (!expected) return null;
  return safeEqual(token, expected) ? role : null;
}

/** Length-safe string comparison to avoid trivial timing leaks on the PIN. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
