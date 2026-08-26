import { NextRequest, NextResponse } from "next/server";
import {
  MICROSOFT_AUTHORIZE_URL,
  MICROSOFT_SCOPES,
  OAUTH_COOKIE_MAX_AGE_SECONDS,
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
  generateOAuthState,
  generatePkcePair,
  microsoftRedirectUri,
} from "@/lib/microsoftOAuth";

export async function GET(req: NextRequest) {
  if (!process.env.AZURE_AD_CLIENT_ID) {
    return NextResponse.json({ error: "Microsoft sign-in isn't configured." }, { status: 500 });
  }

  const state = generateOAuthState();
  const { verifier, challenge } = generatePkcePair();

  const authorizeUrl = new URL(MICROSOFT_AUTHORIZE_URL);
  authorizeUrl.searchParams.set("client_id", process.env.AZURE_AD_CLIENT_ID);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("redirect_uri", microsoftRedirectUri(req.nextUrl.origin));
  authorizeUrl.searchParams.set("response_mode", "query");
  authorizeUrl.searchParams.set("scope", MICROSOFT_SCOPES);
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("code_challenge", challenge);
  authorizeUrl.searchParams.set("code_challenge_method", "S256");

  const res = NextResponse.redirect(authorizeUrl);
  const cookieOpts = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: OAUTH_COOKIE_MAX_AGE_SECONDS,
  };
  res.cookies.set(OAUTH_STATE_COOKIE, state, cookieOpts);
  res.cookies.set(OAUTH_VERIFIER_COOKIE, verifier, cookieOpts);
  return res;
}
