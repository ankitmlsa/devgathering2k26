/**
 * Shared design tokens for the staff portal, lifted straight from the public
 * DevGathering site (see components/Header.tsx, FAQ.tsx, etc.) so the portal
 * reads as the same product: soft pastel surfaces, Syne display + DM Sans body,
 * and the blue → orange → green → pink → amber accent family.
 *
 * Pure constants only — safe to import from client components.
 */

/** Soft pastel fills used for pills, washes, and active states. */
export const PASTEL = {
  blue: "#CFE8FF",
  yellow: "#FFE9A8",
  green: "#D7F5D0",
  pink: "#FFD6E8",
} as const;

/** Saturated accents for text, borders, and icons. */
export const ACCENT = {
  blue: "#5BA4E6",
  orange: "#E8916E",
  green: "#4CAF50",
  pink: "#D85C8A",
  amber: "#C89A2A",
} as const;

/** Semantic accents reused across status badges and result cards. */
export const SEMANTIC = {
  success: ACCENT.green,
  warning: ACCENT.amber,
  danger: "#E05570",
  info: ACCENT.blue,
} as const;

export const FONT_DISPLAY = "'Syne', sans-serif";
export const FONT_BODY = "'DM Sans', sans-serif";

/** Brand gradient — matches the Header "Register" CTA. */
export const BRAND_GRADIENT = "linear-gradient(135deg, #5BA4E6, #3f8fd4)";

/** Tiny class-name joiner. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/* ── Reusable Tailwind class recipes (light theme) ── */

/** White surface card with a hairline border and soft drop shadow. */
export const CARD =
  "rounded-2xl border border-black/[0.06] bg-white shadow-[0_2px_14px_rgba(0,0,0,0.05)]";

/** Text input / textarea. */
export const FIELD =
  "w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-[#2d2d2d] outline-none transition placeholder:text-[#bbb] focus:border-[#5BA4E6] focus:ring-4 focus:ring-[#5BA4E6]/15";

/** Native select styled to match FIELD. */
export const SELECT =
  "rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-[#2d2d2d] outline-none transition focus:border-[#5BA4E6] focus:ring-4 focus:ring-[#5BA4E6]/15";

/** Primary, brand-gradient action button. */
export const PRIMARY_BTN =
  "inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-[0_3px_14px_rgba(91,164,230,0.38)] transition hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

/** Quiet, outlined secondary button. */
export const GHOST_BTN =
  "inline-flex items-center justify-center gap-1.5 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-[#555] transition hover:border-black/20 hover:text-[#1a1a1a] disabled:opacity-50";
