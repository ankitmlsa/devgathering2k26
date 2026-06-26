import { NextResponse } from "next/server";
import { buildDashboard, type SlotInfo } from "@/lib/staff/dashboard";
import { MEAL_SLOTS } from "@/lib/staff/meal-slots";
import { requireAdmin } from "@/lib/staff/rbac";

export type MealMatrixRow = {
  participant_code: string;
  team_id: string;
  team_name: string;
  participant_name: string;
  // Per-slot info incl. when (and by whom) it was collected.
  slots: Record<string, SlotInfo>;
  collected_count: number;
};

/** Filter + sort meal-matrix rows. Shared by GET and the CSV export. */
export async function mealMatrix(searchParams: URLSearchParams) {
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const collectedFilter = searchParams.get("collected") ?? "all"; // all | any | none
  const dir = searchParams.get("dir") === "desc" ? "desc" : "asc";

  const { participants, currentRound } = await buildDashboard();
  let rows: MealMatrixRow[] = participants.map((p) => {
    const slots: Record<string, SlotInfo> = {};
    for (const s of MEAL_SLOTS) {
      slots[s.id] = p.slots[s.id] ?? { state: "none", collected_at: null, collected_by: null };
    }
    return {
      participant_code: p.participant_code,
      team_id: p.team_id,
      team_name: p.team_name,
      participant_name: p.participant_name,
      slots,
      collected_count: p.collected_count,
    };
  });

  if (q) {
    rows = rows.filter(
      (r) =>
        r.team_id.toLowerCase().includes(q) ||
        r.team_name.toLowerCase().includes(q) ||
        r.participant_name.toLowerCase().includes(q),
    );
  }
  if (collectedFilter === "any") rows = rows.filter((r) => r.collected_count > 0);
  else if (collectedFilter === "none") rows = rows.filter((r) => r.collected_count === 0);

  rows.sort((a, b) => {
    const cmp =
      a.team_id.localeCompare(b.team_id, undefined, { numeric: true, sensitivity: "base" }) ||
      a.participant_name.localeCompare(b.participant_name, undefined, { sensitivity: "base" });
    return dir === "desc" ? -cmp : cmp;
  });

  return { rows, currentRound };
}

export async function GET(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const { rows, currentRound } = await mealMatrix(searchParams);

  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const pageSize = Math.min(200, Math.max(1, Number(searchParams.get("pageSize") ?? 25) || 25));
  const total = rows.length;
  const start = (page - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);

  return NextResponse.json({
    rows: pageRows,
    total,
    page,
    pageSize,
    currentRound,
    slots: MEAL_SLOTS,
  });
}
