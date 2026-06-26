import { query } from "@/lib/staff/db";

export type TeamStatus = {
  team_id: string;
  eliminated: boolean;
  eliminated_round: string | null;
  eliminated_at: string | null;
  updated_at: string;
  updated_by: string | null;
};

/** Single team's status, or null if no row (team is active by default). */
export async function getTeamStatus(teamId: string): Promise<TeamStatus | null> {
  const id = (teamId || "").trim();
  if (!id) return null;
  const rows = await query<TeamStatus>(
    `SELECT team_id, eliminated, eliminated_round, eliminated_at, updated_at, updated_by
       FROM public.scanner_team_status WHERE team_id = $1 LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

/** All team statuses keyed by team_id (for the dashboard join). */
export async function getTeamStatuses(): Promise<Map<string, TeamStatus>> {
  const rows = await query<TeamStatus>(
    `SELECT team_id, eliminated, eliminated_round, eliminated_at, updated_at, updated_by
       FROM public.scanner_team_status`,
  );
  return new Map(rows.map((r) => [r.team_id, r]));
}

/**
 * Mark a team eliminated or restore it. Restoring clears the elimination round
 * and timestamp. Upsert keyed by team_id; last write wins, stamped with the actor.
 */
export async function setTeamEliminated(
  teamId: string,
  eliminated: boolean,
  round: string | null,
  by: string,
): Promise<TeamStatus> {
  const id = (teamId || "").trim();
  if (!id) throw new Error("team_id is required");
  const rows = await query<TeamStatus>(
    `INSERT INTO public.scanner_team_status
       (team_id, eliminated, eliminated_round, eliminated_at, updated_at, updated_by)
     VALUES ($1, $2, $3, CASE WHEN $2 THEN now() ELSE NULL END, now(), $4)
     ON CONFLICT (team_id) DO UPDATE
       SET eliminated = EXCLUDED.eliminated,
           eliminated_round = CASE WHEN EXCLUDED.eliminated THEN EXCLUDED.eliminated_round ELSE NULL END,
           eliminated_at = CASE WHEN EXCLUDED.eliminated THEN now() ELSE NULL END,
           updated_at = now(),
           updated_by = EXCLUDED.updated_by
     RETURNING team_id, eliminated, eliminated_round, eliminated_at, updated_at, updated_by`,
    [id, eliminated, eliminated ? round : null, by],
  );
  return rows[0];
}
