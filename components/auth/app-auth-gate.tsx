"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { fetchAuthSession } from "@/lib/api-client/auth";
import { InlineLoadingText } from "@/components/shared/inline-loading-text";

/**
 * Substitui redirect no layout do servidor (evita 404 / problemas RSC na Vercel).
 * APIs continuam a validar JWT.
 */
export function AppAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [allow, setAllow] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const s = await fetchAuthSession();
        if (cancelled) return;
        if (!s.authRequired) {
          setAllow(true);
          setReady(true);
          return;
        }
        if (s.authenticated && s.user) {
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
      <div className="flex min-h-[40vh] flex-1 items-center justify-center p-6">
        <InlineLoadingText />
      </div>
    );
  }
  if (!allow) {
    return null;
  }
  return <>{children}</>;
}
