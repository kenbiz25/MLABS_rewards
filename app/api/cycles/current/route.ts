import { NextResponse } from "next/server";
import { getOpenCycle, getNextCycle } from "@/lib/cycles";

export async function GET() {
  const open = await getOpenCycle();

  if (open) {
    return NextResponse.json({
      open: true,
      cycle: { id: open.id, name: open.name, closesAt: open.closesAt },
    });
  }

  const next = await getNextCycle();
  return NextResponse.json({
    open: false,
    next: next ? { name: next.name, opensAt: next.opensAt } : null,
  });
}
