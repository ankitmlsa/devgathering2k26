import { NextResponse } from "next/server";
import { collectMeal } from "@/lib/staff/orders";
import { getRole } from "@/lib/staff/rbac";

export async function POST(req: Request) {
  const role = await getRole();
  if (!role) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const raw = String(body?.code ?? body?.url ?? "");
  if (!raw.trim()) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  // "who approved" — role + optional free-text operator label from the Scan page.
  const staffName = String(body?.staff_name ?? "").trim();
  const collectedBy = staffName ? `${role}:${staffName}` : role;

  try {
    const result = await collectMeal(raw, collectedBy);
    const httpStatus = result.status === "not_found" ? 404 : 200;
    return NextResponse.json(result, { status: httpStatus });
  } catch (err) {
    console.error("[verify] failed", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
