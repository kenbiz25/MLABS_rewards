import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { serializeNomination } from "@/lib/serialize";
import { TRAIT_KEYS, type TraitKey } from "@/lib/traits";
import { getOpenCycle } from "@/lib/cycles";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = req.nextUrl.searchParams;
  const trait = params.get("trait");
  const country = params.get("country");
  const q = params.get("q")?.trim();
  const sort = params.get("sort") === "oldest" ? "asc" : "desc";
  let cycleId = params.get("cycleId");

  const cycles = await prisma.cycle.findMany({ orderBy: { createdAt: "desc" } });

  if (!cycleId) {
    const open = await getOpenCycle();
    cycleId = open?.id ?? cycles[0]?.id ?? null;
  }

  const where: Prisma.NominationWhereInput = {};
  if (cycleId && cycleId !== "all") where.cycleId = cycleId;
  if (country) where.countryCode = country;
  if (trait && TRAIT_KEYS.includes(trait as TraitKey)) {
    where.traits = { contains: `"${trait}"` };
  }
  if (q) {
    where.OR = [
      { nomineeName: { contains: q } },
      { nominatorName: { contains: q } },
    ];
  }

  const nominations = await prisma.nomination.findMany({
    where,
    orderBy: { createdAt: sort },
  });

  // Stats reflect the selected cycle scope only, independent of the
  // trait/country/search filters used to narrow the table below.
  const statsScope = await prisma.nomination.findMany({
    where: cycleId && cycleId !== "all" ? { cycleId } : {},
  });

  const byTrait: Record<TraitKey, number> = {
    PUT_PATIENTS_FIRST: 0,
    ADOPT_EXCELLENCE: 0,
    FOSTER_MUTUAL_ACCOUNTABILITY: 0,
    LEAD_WITH_INNOVATION: 0,
  };
  const countryCounts = new Map<string, { name: string; count: number }>();
  const nominatorEmails = new Set<string>();
  let multiTraitCount = 0;

  for (const n of statsScope) {
    const existing = countryCounts.get(n.countryCode);
    countryCounts.set(n.countryCode, {
      name: n.countryName,
      count: (existing?.count ?? 0) + 1,
    });
    nominatorEmails.add(n.nominatorEmail);

    const traits = JSON.parse(n.traits) as TraitKey[];
    for (const t of traits) byTrait[t] = (byTrait[t] ?? 0) + 1;
    if (traits.length > 1) multiTraitCount += 1;
  }

  const rankedCountries = Array.from(countryCounts.entries())
    .map(([code, v]) => ({ code, name: v.name, count: v.count }))
    .sort((a, b) => b.count - a.count);

  const currentCycle = cycleId && cycleId !== "all" ? cycles.find((c) => c.id === cycleId) ?? null : null;

  return NextResponse.json({
    nominations: nominations.map(serializeNomination),
    stats: {
      total: statsScope.length,
      countries: countryCounts.size,
      byTrait,
      multiTraitCount,
      uniqueNominators: nominatorEmails.size,
      mostActiveCountry: rankedCountries[0] ?? null,
      leastActiveCountry:
        rankedCountries.length > 1 ? rankedCountries[rankedCountries.length - 1] : null,
      currentCycle: currentCycle
        ? { name: currentCycle.name, opensAt: currentCycle.opensAt, closesAt: currentCycle.closesAt }
        : null,
    },
    cycles: cycles.map((c) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      opensAt: c.opensAt,
      closesAt: c.closesAt,
    })),
    selectedCycleId: cycleId,
  });
}
