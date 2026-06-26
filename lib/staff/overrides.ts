import { query } from "@/lib/staff/db";

/**
 * Admin overrides are a portal-local OVERLAY on the read-only check-in identity.
 * They are NEVER written back to `core.session_state`. Keyed by participant_code
 * (stable per user) so they survive name/team edits. Any null/absent field means
 * "use the check-in value".
 */
export type ParticipantOverride = {
  participant_code: string;
  team_id: string | null;
  team_name: string | null;
  name: string | null;
  notes: string | null;
  updated_at: string;
  updated_by: string | null;
};

export async function getOverrides(): Promise<Map<string, ParticipantOverride>> {
  const rows = await query<ParticipantOverride>(
    `SELECT participant_code, team_id, team_name, name, notes, updated_at, updated_by
       FROM public.scanner_participant_override`,
  );
  return new Map(rows.map((r) => [r.participant_code, r]));
}

export async function getOverride(participantCode: string): Promise<ParticipantOverride | null> {
  const code = (participantCode || "").trim();
  if (!code) return null;
  const rows = await query<ParticipantOverride>(
    `SELECT participant_code, team_id, team_name, name, notes, updated_at, updated_by
       FROM public.scanner_participant_override WHERE participant_code = $1 LIMIT 1`,
    [code],
  );
  return rows[0] ?? null;
}

export type OverridePatch = {
  team_id?: string | null;
  team_name?: string | null;
  name?: string | null;
  notes?: string | null;
};

/** Upsert an override. Empty strings are normalized to null (= clear the override). */
export async function upsertOverride(
  participantCode: string,
  patch: OverridePatch,
  by: string,
): Promise<ParticipantOverride> {
  const code = (participantCode || "").trim();
  if (!code) throw new Error("participant_code is required");
  const norm = (v: string | null | undefined) => {
    if (v === undefined || v === null) return null;
    const t = String(v).trim();
    return t.length ? t : null;
  };
  const rows = await query<ParticipantOverride>(
    `INSERT INTO public.scanner_participant_override
       (participant_code, team_id, team_name, name, notes, updated_at, updated_by)
     VALUES ($1, $2, $3, $4, $5, now(), $6)
     ON CONFLICT (participant_code) DO UPDATE
       SET team_id = EXCLUDED.team_id,
           team_name = EXCLUDED.team_name,
           name = EXCLUDED.name,
           notes = EXCLUDED.notes,
           updated_at = now(),
           updated_by = EXCLUDED.updated_by
     RETURNING participant_code, team_id, team_name, name, notes, updated_at, updated_by`,
    [code, norm(patch.team_id), norm(patch.team_name), norm(patch.name), norm(patch.notes), by],
  );
  return rows[0];
}
