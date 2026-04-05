/**
 * Só para o middleware (Edge Runtime na Vercel): sem `jose`, sem alias `@/`,
 * sem dependências que o bundler Edge rejeite. Verifica HS256 com Web Crypto.
 */
import type { SessionClaims } from "../types/auth";
import { SESSION_COOKIE } from "../constants/session";
import { getJwtSecret } from "./jwt-secret";

export { SESSION_COOKIE };

export function isAuthConfigured(): boolean {
  return Boolean(process.env.AUTH_SECRET?.trim());
}

function base64UrlToBytes(s: string): Uint8Array {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  const b64 = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/**
 * Verifica JWT HS256 emitido por `signSessionToken` (jose) — mesmo formato compacto.
 */
export async function verifySessionToken(
  token: string,
): Promise<SessionClaims | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [hB64, pB64, sigB64] = parts;
    const signed = `${hB64}.${pB64}`;
    const secret = new Uint8Array(getJwtSecret());
    const key = await crypto.subtle.importKey(
      "raw",
      secret,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const sig = new Uint8Array(base64UrlToBytes(sigB64));
    const data = new TextEncoder().encode(signed);
    const ok = await crypto.subtle.verify("HMAC", key, sig, data);
    if (!ok) return null;

    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(pB64)),
    ) as {
      sub?: unknown;
      email?: unknown;
      role?: unknown;
      exp?: unknown;
    };

    if (typeof payload.exp === "number" && payload.exp * 1000 < Date.now()) {
      return null;
    }

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
