import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { forgotPasswordSchema } from "@/lib/schemas";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rateLimit";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  if (!rateLimit(`forgot-password:${ip}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in a few minutes." },
      { status: 429 }
    );
  }

  const parsed = forgotPasswordSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  // Always respond the same way whether or not the account exists, so this
  // endpoint can't be used to enumerate registered emails.
  const genericResponse = NextResponse.json({
    ok: true,
    message: "If an account exists for that email, we've sent a reset link.",
  });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return genericResponse;

  const token = randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
  });

  const origin = process.env.APP_URL ?? req.nextUrl.origin;
  const resetUrl = `${origin}/reset-password?token=${token}`;

  await sendPasswordResetEmail(user.email, resetUrl);

  return genericResponse;
}
