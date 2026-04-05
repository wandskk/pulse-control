/**
 * Rate limit em memória (processo único). Em deploy multi-instância na Vercel,
 * considere Redis/Upstash (docs/04-security.md — pós-MVP).
 */
const buckets = new Map<string, number[]>();

export function rateLimitAllow(
  key: string,
  max: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  const prev = buckets.get(key) ?? [];
  const recent = prev.filter((t) => t > windowStart);
  if (recent.length >= max) {
    buckets.set(key, recent);
    return false;
  }
  recent.push(now);
  buckets.set(key, recent);
  return true;
}

export function clientIpFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip");
  if (real?.trim()) return real.trim();
  return "unknown";
}
