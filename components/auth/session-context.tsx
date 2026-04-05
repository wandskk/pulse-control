"use client";

import { createContext, useContext } from "react";
import type { AuthSessionInfo } from "@/lib/types/auth";

const SessionContext = createContext<AuthSessionInfo | null>(null);

export function SessionProvider({
  value,
  children,
}: {
  value: AuthSessionInfo | null;
  children: React.ReactNode;
}) {
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

/** Sessão após `fetchAuthSession` no `AppAuthGate` (área autenticada). */
export function useAppSession(): AuthSessionInfo | null {
  return useContext(SessionContext);
}
