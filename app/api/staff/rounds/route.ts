import { NextResponse } from "next/server";
import { ensureScannerTables } from "@/lib/staff/schema";
import { getEventState, setCurrentRound } from "@/lib/staff/rounds";
import { getRole, requireAdmin } from "@/lib/staff/rbac";

/** GET current round — available to staff or admin (the scan UI shows it). */
export async function GET() {
  const role = await getRole();
  if (!role) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  await ensureScannerTables();
  const state = await getEventState();
  return NextResponse.json(state);
}

/** POST set/advance the current round — admin only. */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  await ensureScannerTables();

  const body = await req.json().catch(() => ({}));
  const round = String(body?.round ?? "").trim();
  if (!round) return NextResponse.json({ error: "Missing round" }, { status: 400 });

  const role = await getRole();
  const state = await setCurrentRound(round, role ?? "admin");
  return NextResponse.json(state);
}
