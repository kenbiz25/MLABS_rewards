import { randomBytes, createHash } from "crypto";

// "common" allows both work/school (Azure AD) and personal Microsoft
// accounts to sign in — set AZURE_AD_TENANT_ID to a specific tenant ID to
// restrict sign-in to one organization instead.
const TENANT = process.env.AZURE_AD_TENANT_ID || "common";
const AUTHORITY = `https://login.microsoftonline.com/${TENANT}`;

export const MICROSOFT_AUTHORIZE_URL = `${AUTHORITY}/oauth2/v2.0/authorize`;
export const MICROSOFT_TOKEN_URL = `${AUTHORITY}/oauth2/v2.0/token`;
export const MICROSOFT_SCOPES = "openid profile email User.Read";

// Short-lived cookies that only need to survive the redirect out to
// Microsoft and back — not the long-lived session cookie.
export const OAUTH_STATE_COOKIE = "ms_oauth_state";
export const OAUTH_VERIFIER_COOKIE = "ms_oauth_verifier";
export const OAUTH_COOKIE_MAX_AGE_SECONDS = 60 * 10;

export function microsoftRedirectUri(requestOrigin: string): string {
  const base = process.env.APP_URL || requestOrigin;
  return `${base}/api/auth/microsoft/callback`;
}

export function generatePkcePair(): { verifier: string; challenge: string } {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

export function generateOAuthState(): string {
  return randomBytes(16).toString("hex");
}
