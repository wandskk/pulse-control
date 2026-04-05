import { SignJWT } from "jose";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants/session";
import type { SessionClaims, UserRole } from "@/lib/types/auth";
import { verifySessionToken } from "./edge-session";
import { getJwtSecret } from "./jwt-secret";

export { SESSION_COOKIE } from "@/lib/constants/session";
export type { SessionClaims } from "@/lib/types/auth";
export { verifySessionToken };

export async function signSessionToken(claims: {
  userId: string;
  email: string;
  role: UserRole;
}): Promise<string> {
  return new SignJWT({
    email: claims.email,
    role: claims.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function getSessionFromRequest(
  request: NextRequest,
): Promise<SessionClaims | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function getSessionFromRequestPlain(
  request: Request,
): Promise<SessionClaims | null> {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`),
  );
  const raw = match?.[1];
  if (!raw) return null;
  let token: string;
  try {
    token = decodeURIComponent(raw);
  } catch {
    token = raw;
  }
  return verifySessionToken(token);
}
