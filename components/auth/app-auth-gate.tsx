"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SessionProvider } from "@/components/auth/session-context";
import { fetchAuthSession } from "@/lib/api-client/auth";
import type { AuthSessionInfo } from "@/lib/types/auth";

/**
 * Substitui redirect no layout do servidor (evita 404 / problemas RSC na Vercel).
 * APIs continuam a validar JWT.
 * Loading visual: overlay global (`apiFetch` em `/api/auth/session`).
 */
export function AppAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [allow, setAllow] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<AuthSessionInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const s = await fetchAuthSession();
        if (cancelled) return;
        if (!s.authRequired) {
          setSessionInfo(s);
          setAllow(true);
          setReady(true);
          return;
        }
        if (s.authenticated && s.user) {
          setSessionInfo(s);
          setAllow(true);
          setReady(true);
          return;
        }
        const from =
          pathname && pathname !== "/"
            ? `?from=${encodeURIComponent(pathname)}`
            : "";
        router.replace(`/login${from}`);
        setReady(true);
        setAllow(false);
      } catch {
        if (!cancelled) {
          router.replace(
            `/login?from=${encodeURIComponent(pathname || "/")}`,
          );
          setReady(true);
          setAllow(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="min-h-[40vh] flex-1" aria-hidden />
    );
  }
  if (!allow) {
    return null;
  }
  return (
    <SessionProvider value={sessionInfo}>{children}</SessionProvider>
  );
}
