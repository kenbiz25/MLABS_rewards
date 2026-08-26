import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Public: powers the nominee dropdown on the nomination form. Anyone who's
// ever signed in (via Microsoft) is a potential nominee - only names are
// exposed, never emails.
//
// No cookies()/headers() call here, so without this Next.js would treat it
// as a static route and cache the list at build time - newly signed-in
// employees would never show up until the next deploy.
export const dynamic = "force-dynamic";

export async function GET() {
  const users = await prisma.user.findMany({
    select: { name: true },
    orderBy: { name: "asc" },
  });

  const names = Array.from(new Set(users.map((u) => u.name))).sort((a, b) => a.localeCompare(b));

  return NextResponse.json({ names });
}
