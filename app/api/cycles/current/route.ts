import { NextResponse } from "next/server";
import { getOpenCycle, getNextCycle } from "@/lib/cycles";

// No cookies()/headers() call here, so without this Next.js treats it as a
// static route and caches the response at build time - an admin opening or
// closing a cycle would never be reflected until the next deploy.
export const dynamic = "force-dynamic";

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
