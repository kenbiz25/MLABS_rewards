import { prisma } from "./db";
import type { Cycle } from "@prisma/client";

// A cycle is "live" when an admin has activated it (status OPEN) AND the
// current moment falls inside its scheduled window. This is what makes
// scheduling automatic: an admin can activate a cycle any time before its
// window starts, and it will open and close itself exactly on schedule with
// no further action. Multiple cycles can be activated/managed at once; if
// more than one window is somehow live at the same time, the most recently
// started one wins.
export async function getOpenCycle(): Promise<Cycle | null> {
  const now = new Date();
  const candidates = await prisma.cycle.findMany({
    where: {
      status: "OPEN",
      AND: [
        { OR: [{ opensAt: null }, { opensAt: { lte: now } }] },
        { OR: [{ closesAt: null }, { closesAt: { gte: now } }] },
      ],
    },
  });

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => (b.opensAt?.getTime() ?? -Infinity) - (a.opensAt?.getTime() ?? -Infinity));
  return candidates[0];
}

// The soonest cycle scheduled to open next (activated or still in draft),
// used to tell nominators when the next window starts once the current one
// has closed.
export async function getNextCycle(): Promise<Cycle | null> {
  const now = new Date();
  return prisma.cycle.findFirst({
    where: {
      status: { in: ["DRAFT", "OPEN"] },
      opensAt: { gt: now },
    },
    orderBy: { opensAt: "asc" },
  });
}
