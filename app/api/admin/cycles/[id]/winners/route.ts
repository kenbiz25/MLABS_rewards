import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { winnerSchema } from "@/lib/schemas";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const winners = await prisma.cycleWinner.findMany({
    where: { cycleId: params.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ winners });
}

// One winner per Core Trait category per cycle - the unique constraint on
// [cycleId, trait] is the source of truth for that.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = winnerSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Enter a nominee name and category." },
      { status: 400 }
    );
  }

  try {
    const winner = await prisma.cycleWinner.create({
      data: { cycleId: params.id, nomineeName: parsed.data.nomineeName, trait: parsed.data.trait },
    });
    return NextResponse.json({ winner }, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { error: "This cycle already has a winner for that category - remove it first." },
        { status: 409 }
      );
    }
    throw err;
  }
}
