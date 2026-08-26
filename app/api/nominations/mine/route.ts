import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { TraitKey } from "@/lib/traits";

// Scoped to the signed-in account's own email - never the moment/impact
// text of anyone else's submissions, and never reachable without a session.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const nominations = await prisma.nomination.findMany({
    where: { nominatorEmail: user.email },
    include: { cycle: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    nominations: nominations.map((n) => ({
      id: n.id,
      nomineeName: n.nomineeName,
      countryName: n.countryName,
      traits: JSON.parse(n.traits) as TraitKey[],
      cycleName: n.cycle.name,
      createdAt: n.createdAt.toISOString(),
    })),
  });
}
