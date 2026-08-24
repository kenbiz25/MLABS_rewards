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
