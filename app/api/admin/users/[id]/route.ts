import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateUserRoleSchema } from "@/lib/schemas";

// Grants or revokes admin capability. Guards against locking everyone out
// by refusing to demote the last remaining admin.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = updateUserRoleSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update." }, { status: 400 });
  }

  if (!parsed.data.isAdmin) {
    const adminCount = await prisma.user.count({ where: { isAdmin: true } });
    const target = await prisma.user.findUnique({ where: { id: params.id } });
    if (target?.isAdmin && adminCount <= 1) {
      return NextResponse.json(
        { error: "Can't remove the last remaining admin." },
        { status: 400 }
      );
    }
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data: { isAdmin: parsed.data.isAdmin },
  });

  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
}

// Revokes an account (e.g. someone who's left the organization) - deletes
// the User row and any active sessions, signing them out everywhere
// immediately. Their past nominations stay intact (linked by email, not a
// foreign key), and if they ever sign in with Microsoft again a fresh
// non-admin account is auto-provisioned, same as any first sign-in.
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (admin.id === params.id) {
    return NextResponse.json({ error: "You can't delete your own account." }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target) return NextResponse.json({ error: "That account no longer exists." }, { status: 404 });

  if (target.isAdmin) {
    const adminCount = await prisma.user.count({ where: { isAdmin: true } });
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: "Can't remove the last remaining admin." },
        { status: 400 }
      );
    }
  }

  await prisma.$transaction([
    prisma.session.deleteMany({ where: { userId: params.id } }),
    prisma.user.delete({ where: { id: params.id } }),
  ]);

  return NextResponse.json({ ok: true });
}
