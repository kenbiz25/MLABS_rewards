import { cookies } from "next/headers";
import { prisma } from "./db";

export const SESSION_COOKIE = "session";
// Long-lived, sliding session: signing in should feel persistent (like any
// normal app), not a repeated 8-hour chore. As long as the account is used
// at least once within this window, getSessionUserId() below pushes the
// expiry forward again — an active user is never logged out mid-use.
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
const SESSION_REFRESH_THRESHOLD_MS = 1000 * 60 * 60 * 24; // refresh once expiry is <29 days out

export async function createSession(userId: string): Promise<{ id: string; expiresAt: Date }> {
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  const session = await prisma.session.create({
    data: { userId, expiresAt },
  });
  return { id: session.id, expiresAt };
}

export async function getSessionUserId(sessionId: string | undefined | null): Promise<string | null> {
  if (!sessionId) return null;
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) return null;

  const now = Date.now();
  if (session.expiresAt.getTime() < now) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => undefined);
    return null;
  }

  // Sliding expiration: any valid use of the session extends it back out
  // to the full window, so a regularly-used account effectively never
  // expires. Only skipped when already fresh, to avoid a write on every
  // single request.
  const msRemaining = session.expiresAt.getTime() - now;
  if (msRemaining < SESSION_MAX_AGE_SECONDS * 1000 - SESSION_REFRESH_THRESHOLD_MS) {
    await prisma.session
      .update({
        where: { id: sessionId },
        data: { expiresAt: new Date(now + SESSION_MAX_AGE_SECONDS * 1000) },
      })
      .catch(() => undefined);
  }

  return session.userId;
}

export async function destroySession(sessionId: string | undefined | null): Promise<void> {
  if (!sessionId) return;
  await prisma.session.delete({ where: { id: sessionId } }).catch(() => undefined);
}

// Server Components and Route Handlers only (reads the request-scoped cookie
// jar). Returns any signed-in account — admin or employee.
export async function getCurrentUser() {
  const sessionId = cookies().get(SESSION_COOKIE)?.value;
  const userId = await getSessionUserId(sessionId);
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}

// Same session lookup, but only returns the account if it has admin
// capability — every existing admin-only route/page keeps working by
// calling this exactly as before.
export async function getCurrentAdmin() {
  const user = await getCurrentUser();
  return user?.isAdmin ? user : null;
}
