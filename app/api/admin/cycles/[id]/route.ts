import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cycleUpdateSchema } from "@/lib/schemas";
import { computeGlobalWindow, DEFAULT_WINDOW_DAYS } from "@/lib/schedule";

// Cycles are managed independently - activating, closing, or rescheduling
// one has no effect on any other cycle. Several cycles (e.g. a closed
// quarter and an upcoming one) can be scheduled or live at once.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = cycleUpdateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update." }, { status: 400 });
  }

  const data: Prisma.CycleUpdateInput = {};
  if (parsed.data.name) data.name = parsed.data.name;
  if (parsed.data.status) data.status = parsed.data.status;
  if (parsed.data.resultsPublished !== undefined) {
    data.resultsPublishedAt = parsed.data.resultsPublished ? new Date() : null;
  }
  if (parsed.data.startDate) {
    const { opensAt, closesAt } = computeGlobalWindow(
      parsed.data.startDate,
      parsed.data.durationDays ?? DEFAULT_WINDOW_DAYS
    );
    data.opensAt = opensAt;
    data.closesAt = closesAt;
  }

  const cycle = await prisma.cycle.update({ where: { id: params.id }, data });
  return NextResponse.json({ cycle });
}
