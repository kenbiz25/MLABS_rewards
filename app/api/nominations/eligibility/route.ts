import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getOpenCycle } from "@/lib/cycles";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { nominatorEmailSchema } from "@/lib/schemas";

const bodySchema = z.object({
  nominatorEmail: nominatorEmailSchema,
});

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  if (!rateLimit(`eligibility:${ip}`, 30, 60 * 60 * 1000)) {
    return NextResponse.json({ eligible: false, reason: "rate_limited" }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ eligible: false, reason: "invalid" }, { status: 400 });
  }

  const cycle = await getOpenCycle();
  if (!cycle) {
    return NextResponse.json({ eligible: false, reason: "closed" });
  }

  const existing = await prisma.nomination.findUnique({
    where: {
      cycleId_nominatorEmail: {
        cycleId: cycle.id,
        nominatorEmail: parsed.data.nominatorEmail,
      },
    },
  });

  if (existing) {
    return NextResponse.json({ eligible: false, reason: "duplicate" });
  }

  return NextResponse.json({ eligible: true });
}
