import { SignJWT, jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import type { UserRole } from "@prisma/client";
import { SESSION_COOKIE } from "@/lib/constants/session";
import type { SessionClaims } from "@/lib/types/auth";

export { SESSION_COOKIE } from "@/lib/constants/session";
export type { SessionClaims } from "@/lib/types/auth";

function getSecret(): Uint8Array {
  const s = process.env.AUTH_SECRET?.trim();
  if (!s || s.length < 16) {
    throw new Error("AUTH_SECRET deve ter pelo menos 16 caracteres");
  }
  return new TextEncoder().encode(s);
}

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
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const sub = payload.sub;
    const email = payload.email;
    const role = payload.role;
    if (!sub || typeof sub !== "string") return null;
    if (!email || typeof email !== "string") return null;
    if (role !== "ADMIN" && role !== "USER") return null;
    return { sub, email, role };
  } catch {
    return null;
  }
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
