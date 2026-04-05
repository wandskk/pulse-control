import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/shared/site-header";
import { isAuthConfigured } from "@/lib/auth/config";
import { SESSION_COOKIE } from "@/lib/constants/session";

/**
 * Shell da área autenticada. Sem middleware no Edge (evita MIDDLEWARE_INVOCATION_FAILED na Vercel).
 * Com AUTH_SECRET, exige cookie de sessão antes de renderizar qualquer página em (app).
 */
export default async function AppShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (isAuthConfigured()) {
    const jar = await cookies();
    if (!jar.get(SESSION_COOKIE)?.value) {
      redirect("/login");
    }
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
