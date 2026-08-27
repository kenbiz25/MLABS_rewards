import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { TraitKey } from "@/lib/traits";

// Public: winners are shown to everyone once an admin has explicitly
// published results for a cycle - not merely once it closes. Draft winner
// lists an admin is still curating stay invisible until published.
//
// No cookies()/headers() call here, so without this Next.js treats it as a
// static route and caches the response at build time - publishing results
// would never actually show up until the next deploy.
export const dynamic = "force-dynamic";

export async function GET() {
  const cycles = await prisma.cycle.findMany({
    where: { resultsPublishedAt: { not: null } },
    include: { winners: { orderBy: { createdAt: "asc" } } },
    orderBy: [{ resultsPublishedAt: "desc" }],
  });

  return NextResponse.json({
    cycles: cycles.map((c) => ({
      cycleId: c.id,
      cycleName: c.name,
      closesAt: c.closesAt,
      resultsPublishedAt: c.resultsPublishedAt,
      winners: c.winners.map((w) => ({
        nomineeName: w.nomineeName,
        traits: JSON.parse(w.traits) as TraitKey[],
      })),
    })),
  });
}
