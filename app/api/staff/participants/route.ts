import { NextResponse } from "next/server";
import { buildDashboard, groupByTeam } from "@/lib/staff/dashboard";
import { requireAdmin } from "@/lib/staff/rbac";

export type MemberView = {
  participant_code: string;
  user_address: string;
  participant_name: string;
  raw_participant_name: string;
  raw_team_id: string;
  raw_team_name: string;
  overridden: boolean;
  notes: string | null;
  checked_in_at: string | null;
  qr_status: "ordered" | "no_order";
  collected_count: number;
};

export type TeamView = {
  team_id: string;
  team_name: string;
  eliminated: boolean;
  eliminated_round: string | null;
  member_count: number;
  members: MemberView[];
};

export async function GET(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const eliminatedFilter = searchParams.get("eliminated") ?? "all"; // all | eliminated | active
  const dir = searchParams.get("dir") === "desc" ? "desc" : "asc";
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 15) || 15));

  const { currentRound, participants } = await buildDashboard();
  let teams: TeamView[] = groupByTeam(participants).map((g) => ({
    team_id: g.team_id,
    team_name: g.team_name,
    eliminated: g.eliminated,
    eliminated_round: g.eliminated_round,
    member_count: g.members.length,
    members: g.members.map((m) => ({
      participant_code: m.participant_code,
      user_address: m.user_address,
      participant_name: m.participant_name,
      raw_participant_name: m.raw_participant_name,
      raw_team_id: m.raw_team_id,
      raw_team_name: m.raw_team_name,
      overridden: m.overridden,
      notes: m.notes,
      checked_in_at: m.checked_in_at,
      qr_status: m.has_order ? "ordered" : "no_order",
      collected_count: m.collected_count,
    })),
  }));

  if (q) {
    teams = teams.filter(
      (t) =>
        t.team_id.toLowerCase().includes(q) ||
        t.team_name.toLowerCase().includes(q) ||
        t.members.some((m) => m.participant_name.toLowerCase().includes(q)),
    );
  }
  if (eliminatedFilter === "eliminated") teams = teams.filter((t) => t.eliminated);
  else if (eliminatedFilter === "active") teams = teams.filter((t) => !t.eliminated);

  teams.sort((a, b) => {
    const cmp = a.team_id.localeCompare(b.team_id, undefined, { numeric: true, sensitivity: "base" });
    return dir === "desc" ? -cmp : cmp;
  });

  const total = teams.length;
  const totalParticipants = participants.length;
  const start = (page - 1) * pageSize;
  const pageTeams = teams.slice(start, start + pageSize);

  return NextResponse.json({
    teams: pageTeams,
    total,
    totalParticipants,
    page,
    pageSize,
    currentRound,
  });
}
