/** Segredo JWT (HS256) — partilhado entre assinatura (Node) e verificação no middleware (Edge). */
export function getJwtSecret(): Uint8Array {
  const s = process.env.AUTH_SECRET?.trim();
  if (!s || s.length < 16) {
    throw new Error("AUTH_SECRET deve ter pelo menos 16 caracteres");
  }
  return new TextEncoder().encode(s);
}
