import { SiteHeader } from "@/components/shared/site-header";
import { AppAuthGate } from "@/components/auth/app-auth-gate";

/**
 * Área autenticada: gate no cliente (sem cookies/redirect no servidor — compatível Vercel).
 */
export default function AppShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppAuthGate>
      <div className="flex min-h-full flex-1 flex-col">
        <SiteHeader />
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </AppAuthGate>
  );
}
