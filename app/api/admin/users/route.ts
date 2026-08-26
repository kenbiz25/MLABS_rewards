import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createUserSchema } from "@/lib/schemas";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json({
    users: users.map((u) => ({ id: u.id, name: u.name, email: u.email, isAdmin: u.isAdmin, createdAt: u.createdAt })),
  });
}

// Lets an admin pre-provision an account directly (e.g. a new admin who
// hasn't signed in with Microsoft yet) rather than only promoting existing
// users. The account still authenticates via Microsoft SSO - this just
// reserves the email and role ahead of that first sign-in.
export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = createUserSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid details." },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return NextResponse.json({ error: "That email is already registered." }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      isAdmin: parsed.data.isAdmin ?? false,
    },
  });

  return NextResponse.json(
    { user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin } },
    { status: 201 }
  );
}
