import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/staff/rbac";
import { type SlotInfo } from "@/lib/staff/dashboard";
import { MEAL_SLOTS } from "@/lib/staff/meal-slots";
import { mealMatrix } from "../route";

function csvCell(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function cellLabel(info: SlotInfo): string {
  if (info.state === "collected") {
    const when = info.collected_at ? ` ${new Date(info.collected_at).toISOString()}` : "";
    const by = info.collected_by ? ` by ${info.collected_by}` : "";
    return `Collected${when}${by}`;
  }
  return info.state === "ordered" ? "Ordered" : "—";
}

/** CSV export of the per-slot meal-collection matrix, honoring active filters. */
export async function GET(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const { rows } = await mealMatrix(searchParams);

  const header = ["Team ID", "Team", "Participant", ...MEAL_SLOTS.map((s) => s.label)];
  const lines = [header.map(csvCell).join(",")];
  for (const r of rows) {
    lines.push(
      [r.team_id, r.team_name, r.participant_name, ...MEAL_SLOTS.map((s) => cellLabel(r.slots[s.id]))]
        .map(csvCell)
        .join(","),
    );
  }

  return new NextResponse(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="meal-collection.csv"`,
    },
  });
}
