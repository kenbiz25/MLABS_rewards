import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Admin-only, for correcting test/mistaken submissions - not exposed anywhere
// a nominator or nominee could reach.
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.nomination.delete({ where: { id: params.id } }).catch(() => undefined);

  return NextResponse.json({ ok: true });
}
