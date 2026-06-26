import { NextResponse } from "next/server";
import { ensureScannerTables } from "@/lib/staff/schema";
import { upsertOverride } from "@/lib/staff/overrides";
import { getRole, requireAdmin } from "@/lib/staff/rbac";

/**
 * Upsert an admin override for a participant. This is a portal-local overlay —
 * it is NEVER written back to the check-in agent's `core.session_state`.
 */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  await ensureScannerTables();

  const body = await req.json().catch(() => ({}));
  const participantCode = String(body?.participant_code ?? "").trim();
  if (!participantCode) {
    return NextResponse.json({ error: "Missing participant_code" }, { status: 400 });
  }

  const role = await getRole();
  const override = await upsertOverride(
    participantCode,
    {
      name: body?.name,
      team_id: body?.team_id,
      team_name: body?.team_name,
      notes: body?.notes,
    },
    role ?? "admin",
  );
  return NextResponse.json({ ok: true, override });
}
