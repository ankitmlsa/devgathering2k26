import { NextResponse } from "next/server";
import { getOrderByCode, parseVerificationCode } from "@/lib/staff/orders";

export async function GET(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  try {
    const order = await getOrderByCode(parseVerificationCode(code));
    if (!order) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (err) {
    console.error("[orders] lookup failed", err);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
