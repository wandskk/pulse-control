"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  getGlobalLoadingActive,
  subscribeGlobalLoading,
} from "@/lib/global-loading/store";

function subscribe(onChange: () => void) {
  return subscribeGlobalLoading(onChange);
}

function getSnapshot() {
  return getGlobalLoadingActive();
}

function getServerSnapshot() {
  return false;
}

/**
 * Overlay com fundo desfocado e spinner nas cores da marca.
 * Ativado automaticamente por `apiFetch` (exceto rotas em `excluded-paths`).
 */
export function GlobalLoadingOverlay() {
  const active = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/45 backdrop-blur-md"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">A carregar…</span>
      <div
        className="pointer-events-none flex flex-col items-center gap-3 rounded-2xl border border-border/70 bg-card/85 px-10 py-8 shadow-xl ring-1 ring-foreground/10"
        aria-hidden
      >
        <div
          className="size-12 animate-spin rounded-full border-[3px] border-muted/80 border-t-primary border-r-accent motion-reduce:animate-none motion-reduce:border-primary/40"
          style={{ animationDuration: "0.85s" }}
        />
        <p className="text-xs font-medium text-muted-foreground">A carregar…</p>
      </div>
    </div>
  );
}
