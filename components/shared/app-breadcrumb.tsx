"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_SHELL_CONTAINER } from "@/lib/constants/layout";
import { cn } from "@/lib/utils";

/** Rotas “em cima” de Números (fluxo: Início › Números › …). */
const UNDER_NUMEROS = new Set(["comandos", "categorias", "historico"]);

const SEGMENT_LABEL: Record<string, string> = {
  comandos: "Comandos",
  numeros: "Números",
  categorias: "Categorias",
  historico: "Histórico",
  profile: "Perfil",
  admin: "Administração",
};

type Crumb = { href: string; label: string; current: boolean };

function crumbsForPath(pathname: string): Crumb[] | null {
  if (!pathname || pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const first = segments[0];

  if (pathname === "/numeros") {
    return [{ href: "/numeros", label: "Números", current: true }];
  }

  if (UNDER_NUMEROS.has(first) && segments.length === 1) {
    const label = SEGMENT_LABEL[first] ?? first;
    return [
      { href: "/numeros", label: "Números", current: false },
      { href: pathname, label, current: true },
    ];
  }

  return segments.map((seg, i) => {
    const path = `/${segments.slice(0, i + 1).join("/")}`;
    const label = SEGMENT_LABEL[seg] ?? seg;
    const isLast = i === segments.length - 1;
    return { href: path, label, current: isLast };
  });
}

export function AppBreadcrumb() {
  const pathname = usePathname();
  const trail = crumbsForPath(pathname ?? "");
  if (!trail?.length) return null;

  return (
    <nav
      aria-label="Trilha de navegação"
      className={cn(APP_SHELL_CONTAINER, "shrink-0 pb-2 pt-1")}
    >
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs text-muted-foreground">
        <li className="min-w-0">
          <Link
            href="/"
            className="underline-offset-4 transition-colors hover:text-foreground"
          >
            Início
          </Link>
        </li>
        {trail.map((c, i) => (
          <li key={`${i}-${c.href}`} className="flex min-w-0 items-center gap-1">
            <ChevronRight className="size-3 shrink-0 opacity-50" aria-hidden />
            {c.current ? (
              <span
                className="truncate font-medium text-foreground"
                aria-current="page"
              >
                {c.label}
              </span>
            ) : (
              <Link
                href={c.href}
                className="truncate underline-offset-4 transition-colors hover:text-foreground"
              >
                {c.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
