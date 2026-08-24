import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cycleSchema } from "@/lib/schemas";
import { computeGlobalWindow, DEFAULT_WINDOW_DAYS } from "@/lib/schedule";
import { nextFyLabel } from "@/lib/fiscalYear";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cycles = await prisma.cycle.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { nominations: true } } },
  });

  return NextResponse.json({
    cycles: cycles.map((c) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      opensAt: c.opensAt,
      closesAt: c.closesAt,
      resultsPublishedAt: c.resultsPublishedAt,
      createdAt: c.createdAt,
      nominationCount: c._count.nominations,
    })),
    suggestedNextName: nextFyLabel(cycles[0]?.name ?? null),
  });
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = cycleSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cycle." }, { status: 400 });
  }

  const { opensAt, closesAt } = computeGlobalWindow(
    parsed.data.startDate,
    parsed.data.durationDays ?? DEFAULT_WINDOW_DAYS
  );

  const cycle = await prisma.cycle.create({
    data: { name: parsed.data.name, opensAt, closesAt },
  });

  return NextResponse.json({ cycle }, { status: 201 });
}
