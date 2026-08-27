import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { winnerSchema } from "@/lib/schemas";
import { serializeWinner } from "@/lib/serialize";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const winners = await prisma.cycleWinner.findMany({
    where: { cycleId: params.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ winners: winners.map(serializeWinner) });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = winnerSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Enter a nominee name, Core Traits, and a justification." },
      { status: 400 }
    );
  }

  const winner = await prisma.cycleWinner.create({
    data: {
      cycleId: params.id,
      nomineeName: parsed.data.nomineeName,
      traits: JSON.stringify(parsed.data.traits),
      justification: parsed.data.justification,
    },
  });
  return NextResponse.json({ winner: serializeWinner(winner) }, { status: 201 });
}
