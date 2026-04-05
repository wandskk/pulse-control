/**
 * Verificação de sessão JWT (HS256) com `jose` — compatível com Node e Edge (middleware Vercel).
 * Imports relativos apenas (sem `@/`) para o bundler do middleware.
 */
import { jwtVerify } from "jose";
import type { SessionClaims } from "../types/auth";
import { SESSION_COOKIE } from "../constants/session";

export { SESSION_COOKIE };
export { isAuthConfigured } from "./config";

export async function verifySessionToken(
  token: string,
): Promise<SessionClaims | null> {
  const s = process.env.AUTH_SECRET?.trim();
  if (!s || s.length < 16) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(s));
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
