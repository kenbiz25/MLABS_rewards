import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TRAITS, type TraitKey } from "@/lib/traits";
import { wordFrequency } from "@/lib/words";

export async function GET(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cycleId = req.nextUrl.searchParams.get("cycleId");

  const cycles = await prisma.cycle.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { nominations: true } } },
  });

  const trend = cycles.map((c) => ({
    cycleId: c.id,
    cycleName: c.name,
    count: c._count.nominations,
  }));

  const scopeNominations = await prisma.nomination.findMany({
    where: cycleId && cycleId !== "all" ? { cycleId } : {},
  });

  const traitCounts: Record<string, number> = {};
  for (const t of TRAITS) traitCounts[t.key] = 0;
  for (const n of scopeNominations) {
    const traits = JSON.parse(n.traits) as TraitKey[];
    for (const t of traits) traitCounts[t] = (traitCounts[t] ?? 0) + 1;
  }

  const traitBreakdown = TRAITS.map((t) => ({
    key: t.key,
    label: t.label,
    accent: t.accent,
    count: traitCounts[t.key] ?? 0,
  }));

  const words = wordFrequency(
    scopeNominations.flatMap((n) => [n.momentText, n.impactText]),
    20
  );

  return NextResponse.json({ trend, traitBreakdown, wordFrequency: words });
}
