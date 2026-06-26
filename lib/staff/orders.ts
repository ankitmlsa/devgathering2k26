import { query } from "@/lib/staff/db";
import { ensureScannerTables } from "@/lib/staff/schema";
import { getCurrentRound } from "@/lib/staff/rounds";
import { getTeamStatus } from "@/lib/staff/teams";
import { getOverride } from "@/lib/staff/overrides";

export type MealOrder = {
  verification_code: string;
  user_address: string;
  participant_name: string;
  team_id: string;
  team_name: string;
  participant_code: string;
  meal_slot: string;
  meal_label: string;
  qr_image_url: string | null;
  status: "pending" | "collected";
  collected_at: string | null;
  collected_by: string | null;
  created_at: string;
};

/**
 * `already_collected` is the legacy (per-QR) status, kept for backward-compatible
 * rendering. The round-aware flow uses `already_collected_round` and `eliminated`.
 */
export type VerifyStatus =
  | "collected"
  | "already_collected"
  | "already_collected_round"
  | "eliminated"
  | "not_found";

export type VerifyResult = {
  status: VerifyStatus;
  order: MealOrder | null;
  round: string | null;
};

const COLUMNS = `
  verification_code, user_address, participant_name, team_id, team_name,
  participant_code, meal_slot, meal_label, qr_image_url, status,
  collected_at, collected_by, created_at
`;

/**
 * A scanned QR encodes `<base>/v/<code>`. Accept either a raw code or the full
 * URL and return the bare verification code.
 */
export function parseVerificationCode(raw: string): string {
  const value = (raw || "").trim();
  if (!value) return "";
  const match = value.match(/\/v\/([^/?#\s]+)/i);
  if (match) return match[1];
  try {
    const url = new URL(value);
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments.length) return segments[segments.length - 1];
  } catch {
    // Not a URL — treat the whole thing as the code.
  }
  return value;
}

export async function getOrderByCode(code: string): Promise<MealOrder | null> {
  const verificationCode = (code || "").trim();
  if (!verificationCode) return null;
  const rows = await query<MealOrder>(
    `SELECT ${COLUMNS} FROM public.meal_orders WHERE verification_code = $1 LIMIT 1`,
    [verificationCode],
  );
  return rows[0] ?? null;
}

/**
 * Round- and elimination-aware meal collection. Strict ordering:
 *
 *   1. valid QR?            no  -> not_found             (no writes)
 *   2. team eliminated?     yes -> eliminated            (no ledger, no status flip)
 *   3. already this round?  yes -> already_collected_round (no status flip)
 *   4. eligible             -> ledger row + best-effort flip meal_orders.status
 *
 * The per-round rule "one meal per participant per round" is enforced by the
 * UNIQUE(participant_code, round_number) on `scanner_meal_collection` via an
 * atomic INSERT ... ON CONFLICT DO NOTHING RETURNING — concurrency-safe under
 * simultaneous double-scans. `public.meal_orders.status` is informational only
 * (kept consistent for the agent's mirror); the ledger is the authority.
 */
export async function collectMeal(rawCode: string, collectedBy: string): Promise<VerifyResult> {
  await ensureScannerTables();

  const verificationCode = parseVerificationCode(rawCode);
  if (!verificationCode) return { status: "not_found", order: null, round: null };

  // 1. Valid QR?
  const order = await getOrderByCode(verificationCode);
  if (!order) return { status: "not_found", order: null, round: null };

  // An admin override may move a participant to a different team; elimination
  // grouping must follow the override.
  const override = await getOverride(order.participant_code);
  const effectiveTeamId = (override?.team_id || order.team_id || "").trim();

  // 2. Team eliminated?
  const teamStatus = await getTeamStatus(effectiveTeamId);
  if (teamStatus?.eliminated) {
    return { status: "eliminated", order, round: null };
  }

  // 3 + 4. Atomic per-round claim.
  const round = await getCurrentRound();
  const claimed = await query<{ id: string }>(
    `INSERT INTO public.scanner_meal_collection
       (participant_code, team_id, round_number, verification_code, meal_slot, meal_label, collected_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (participant_code, round_number) DO NOTHING
     RETURNING id`,
    [
      order.participant_code,
      effectiveTeamId,
      round,
      order.verification_code,
      order.meal_slot,
      order.meal_label,
      collectedBy,
    ],
  );

  if (claimed.length === 0) {
    // Already collected for this round — do NOT flip meal_orders.status.
    return { status: "already_collected_round", order, round };
  }

  // 4. Eligible: best-effort flip the legacy order (no-op if already collected
  // from a prior round/scan; the ledger already authorized this round).
  const updated = await query<MealOrder>(
    `UPDATE public.meal_orders
        SET status = 'collected', collected_at = now(), collected_by = $2
      WHERE verification_code = $1 AND status = 'pending'
      RETURNING ${COLUMNS}`,
    [order.verification_code, collectedBy],
  );
  return { status: "collected", order: updated[0] ?? order, round };
}
