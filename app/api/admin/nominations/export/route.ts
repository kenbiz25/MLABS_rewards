import { NextRequest, NextResponse } from "next/server";
import { format } from "date-fns";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { toCsv } from "@/lib/csv";
import { traitLabel, TRAIT_KEYS, type TraitKey } from "@/lib/traits";
import type { Prisma } from "@prisma/client";

const COLUMNS = [
  "Nominee",
  "Country",
  "Core traits",
  "Nominated by",
  "Nominator email",
  "Cycle",
  "The moment",
  "The impact",
  "Submitted",
];

export async function GET(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = req.nextUrl.searchParams;
  const cycleId = params.get("cycleId");
  const trait = params.get("trait");
  const country = params.get("country");
  const q = params.get("q")?.trim();

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
    include: { cycle: true },
    orderBy: { createdAt: "desc" },
  });

  const rows = nominations.map((n) => ({
    Nominee: n.nomineeName,
    Country: n.countryName,
    "Core traits": (JSON.parse(n.traits) as TraitKey[]).map(traitLabel).join("; "),
    "Nominated by": n.nominatorName,
    "Nominator email": n.nominatorEmail,
    Cycle: n.cycle.name,
    "The moment": n.momentText,
    "The impact": n.impactText,
    Submitted: format(n.createdAt, "yyyy-MM-dd HH:mm"),
  }));

  const csv = toCsv(rows, COLUMNS);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="nominations-${format(new Date(), "yyyy-MM-dd")}.csv"`,
    },
  });
}
