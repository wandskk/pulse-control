"use client";

import {
  History,
  LayoutGrid,
  Smartphone,
  Tags,
  UserCircle,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useAppSession } from "@/components/auth/session-context";
import { Card, CardContent } from "@/components/ui/card";
import { APP_SHELL_CONTAINER } from "@/lib/constants/layout";
import type { PulseHomeQuickItem } from "@/lib/types/dashboard";
import { cn } from "@/lib/utils";

export function PulseHome() {
  const session = useAppSession();
  const sessionUser =
    session?.authenticated && session?.user ? session.user : null;
  const showLogout = Boolean(
    session?.authRequired && session?.authenticated,
  );

  const items: PulseHomeQuickItem[] = useMemo(
    () => [
      {
        href: "/comandos",
        label: "Comandos",
        description: "Botões e envio de comandos",
        icon: LayoutGrid,
        show: true,
      },
      {
        href: "/categorias",
        label: "Categorias",
        description: "Grupos por número",
        icon: Tags,
        show: true,
      },
      {
        href: "/numeros",
        label: "Números",
        description: "Cadastrar linhas",
        icon: Smartphone,
        show: true,
      },
      {
        href: "/historico",
        label: "Histórico",
        description: "Envios anteriores",
        icon: History,
        show: true,
      },
      {
        href: "/profile",
        label: "Perfil",
        description: "Senha e conta",
        icon: UserCircle,
        show: showLogout,
      },
      {
        href: "/admin",
        label: "Contas",
        description: "Administração",
        icon: Users,
        show: sessionUser?.role === "ADMIN",
      },
    ],
    [showLogout, sessionUser?.role],
  );

  const visible = items.filter((i) => i.show);

  return (
    <div className="flex flex-1 flex-col">
      <main
        className={cn(
          APP_SHELL_CONTAINER,
          "flex-1 flex-col gap-5 py-4 pb-[max(2.5rem,env(safe-area-inset-bottom,0px))]",
        )}
      >
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Início
          </h1>
          <p className="text-sm text-muted-foreground">Acesso rápido</p>
        </div>
        <ul className="grid grid-cols-2 gap-3" aria-label="Acesso rápido">
          {visible.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <Card className="h-full border-border/80 transition-colors hover:bg-accent/40">
                    <CardContent className="flex flex-row items-center gap-3 p-4">
                      <Icon
                        className="size-9 shrink-0 text-primary"
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground">
                          {item.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
