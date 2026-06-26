import { NextResponse } from "next/server";
import { ensureScannerTables } from "@/lib/staff/schema";
import { setTeamEliminated } from "@/lib/staff/teams";
import { getCurrentRound } from "@/lib/staff/rounds";
import { getRole, requireAdmin } from "@/lib/staff/rbac";

/** Mark a team eliminated or restore it. Admin only. */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  await ensureScannerTables();

  const body = await req.json().catch(() => ({}));
  const teamId = String(body?.team_id ?? "").trim();
  const eliminated = Boolean(body?.eliminated);
  if (!teamId) return NextResponse.json({ error: "Missing team_id" }, { status: 400 });

  // When eliminating, stamp the round it happened in (explicit override allowed).
  const round = eliminated
    ? String(body?.round ?? "").trim() || (await getCurrentRound())
    : null;
  const role = await getRole();

  const status = await setTeamEliminated(teamId, eliminated, round, role ?? "admin");
  return NextResponse.json({ ok: true, status });
}
