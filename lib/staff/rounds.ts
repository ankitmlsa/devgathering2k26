import { query } from "@/lib/staff/db";

/** Allowed competition round labels, in order. Admin advances through these. */
export const ROUND_LABELS = ["1", "2", "Final"] as const;
export type RoundLabel = (typeof ROUND_LABELS)[number];

export type EventState = {
  current_round: string;
  updated_at: string;
  updated_by: string | null;
};

/** Read the admin-controlled current round (singleton row id=1). */
export async function getCurrentRound(): Promise<string> {
  const rows = await query<{ current_round: string }>(
    "SELECT current_round FROM public.scanner_event_state WHERE id = 1 LIMIT 1",
  );
  return rows[0]?.current_round ?? "1";
}

export async function getEventState(): Promise<EventState> {
  const rows = await query<EventState>(
    "SELECT current_round, updated_at, updated_by FROM public.scanner_event_state WHERE id = 1 LIMIT 1",
  );
  return rows[0] ?? { current_round: "1", updated_at: new Date(0).toISOString(), updated_by: null };
}

/** Set the global current round. Admin-only (enforced at the route). */
export async function setCurrentRound(round: string, by: string): Promise<EventState> {
  const value = (round || "").trim() || "1";
  const rows = await query<EventState>(
    `INSERT INTO public.scanner_event_state (id, current_round, updated_at, updated_by)
     VALUES (1, $1, now(), $2)
     ON CONFLICT (id) DO UPDATE
       SET current_round = EXCLUDED.current_round,
           updated_at = now(),
           updated_by = EXCLUDED.updated_by
     RETURNING current_round, updated_at, updated_by`,
    [value, by],
  );
  return rows[0];
}
