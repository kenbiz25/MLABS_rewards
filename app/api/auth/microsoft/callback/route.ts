import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/auth";
import {
  MICROSOFT_TOKEN_URL,
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
  microsoftRedirectUri,
} from "@/lib/microsoftOAuth";

const ALLOWED_EMAIL_DOMAINS = ["medtroniclabs.org", "medtronic.com"];

function signInFailed(req: NextRequest, message: string): NextResponse {
  const res = NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(message)}`, req.url));
  res.cookies.delete(OAUTH_STATE_COOKIE);
  res.cookies.delete(OAUTH_VERIFIER_COOKIE);
  return res;
}

export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const providerError = searchParams.get("error_description") || searchParams.get("error");
  if (providerError) {
    console.error("Microsoft OAuth provider error:", providerError);
    return signInFailed(req, "Microsoft sign-in was cancelled or failed.");
  }

  const expectedState = req.cookies.get(OAUTH_STATE_COOKIE)?.value;
  const verifier = req.cookies.get(OAUTH_VERIFIER_COOKIE)?.value;
  if (!code || !state || !verifier || state !== expectedState) {
    console.error("OAuth state/verifier mismatch", { hasCode: !!code, hasState: !!state, hasVerifier: !!verifier, stateMatch: state === expectedState });
    return signInFailed(req, "Sign-in couldn't be verified - please try again.");
  }

  const tokenRes = await fetch(MICROSOFT_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.AZURE_AD_CLIENT_ID ?? "",
      client_secret: process.env.AZURE_AD_CLIENT_SECRET ?? "",
      grant_type: "authorization_code",
      code,
      redirect_uri: microsoftRedirectUri(origin),
      code_verifier: verifier,
    }),
  });
  if (!tokenRes.ok) {
    const body = await tokenRes.text();
    console.error("Microsoft token exchange failed:", tokenRes.status, body);
    return signInFailed(req, "Microsoft sign-in failed - please try again.");
  }
  const tokens: { access_token?: string } = await tokenRes.json();
  if (!tokens.access_token) {
    console.error("No access_token in token response:", tokens);
    return signInFailed(req, "Microsoft sign-in failed - please try again.");
  }

  const profileRes = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!profileRes.ok) {
    const body = await profileRes.text();
    console.error("Microsoft Graph profile fetch failed:", profileRes.status, body);
    return signInFailed(req, "Couldn't read your Microsoft profile - please try again.");
  }
  const profile: { mail?: string; userPrincipalName?: string; displayName?: string } = await profileRes.json();
  const email = (profile.mail || profile.userPrincipalName || "").trim().toLowerCase();
  if (!email) {
    console.error("No email on Microsoft profile:", profile);
    return signInFailed(req, "Your Microsoft account has no email on file.");
  }

  const emailDomain = email.split("@")[1] ?? "";
  if (!ALLOWED_EMAIL_DOMAINS.includes(emailDomain)) {
    console.error("Rejected sign-in from disallowed domain:", email);
    return signInFailed(req, "This app is only available to Medtronic LABS and Medtronic accounts.");
  }

  const name = profile.displayName?.trim() || email;

  const user = await prisma.user.upsert({
    where: { email },
    update: { name },
    create: { name, email, isAdmin: false },
  });

  const session = await createSession(user.id);
  const res = NextResponse.redirect(new URL(user.isAdmin ? "/admin/nominations" : "/me", req.url));
  res.cookies.set(SESSION_COOKIE, session.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  res.cookies.delete(OAUTH_STATE_COOKIE);
  res.cookies.delete(OAUTH_VERIFIER_COOKIE);
  return res;
}
