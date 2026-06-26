import { query } from "@/lib/staff/db";

/**
 * The check-in profile shape the agent stores under `state->'participant'` in the
 * shared `core.session_state` table. These are the ONLY fields the check-in agent
 * collects — there is intentionally no email/phone/college here.
 */
export type CheckedInParticipant = {
  user_address: string;
  name: string;
  team_id: string;
  team_name: string;
  participant_code: string;
  checked_in_at: string | null;
};

type Row = { user_address: string | null; participant: unknown };

function normalize(raw: unknown, userAddress: string): CheckedInParticipant | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Record<string, unknown>;
  const name = String(p.name ?? "").trim();
  const team_id = String(p.team_id ?? "").trim();
  const team_name = String(p.team_name ?? "").trim();
  const participant_code = String(p.participant_code ?? "").trim();
  // Mirror the agent's _normalize_participant: all four are required.
  if (!name || !team_id || !team_name || !participant_code) return null;
  const checkedInRaw = String(p.checked_in_at ?? "").trim();
  return {
    user_address: userAddress,
    name,
    team_id,
    team_name,
    participant_code,
    checked_in_at: checkedInRaw || null,
  };
}

/**
 * Read-only list of every checked-in participant from `core.session_state`.
 *
 * Scoping: when `DEVGATHERING_AGENT_ADDRESS` is set we filter to that agent's
 * rows (the safe production setting). When unset we fall back to a shape filter
 * (`state ? 'participant'`) plus the required-field check in `normalize`, so we
 * never surface another agent's rows that coincidentally use a `participant` key.
 *
 * NEVER writes — the agent's data is read-only here.
 */
export async function listCheckedInParticipants(): Promise<CheckedInParticipant[]> {
  const agentAddress = (process.env.DEVGATHERING_AGENT_ADDRESS ?? "").trim() || null;
  const rows = await query<Row>(
    `SELECT user_address, state->'participant' AS participant
       FROM core.session_state
      WHERE ($1::text IS NULL OR agent_address = $1)
        AND state ? 'participant'`,
    [agentAddress],
  );
  const out: CheckedInParticipant[] = [];
  for (const row of rows) {
    const p = normalize(row.participant, String(row.user_address ?? ""));
    if (p) out.push(p);
  }
  return out;
}
