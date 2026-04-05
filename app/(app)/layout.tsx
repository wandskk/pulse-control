import { AppAuthGate } from "@/components/auth/app-auth-gate";
import { AppBreadcrumb } from "@/components/shared/app-breadcrumb";
import { SiteHeader } from "@/components/shared/site-header";

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
        <AppBreadcrumb />
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </AppAuthGate>
  );
}
