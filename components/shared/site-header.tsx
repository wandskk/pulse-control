"use client";

import {
  History,
  Home,
  LayoutGrid,
  LogOut,
  Menu,
  Smartphone,
  Tags,
  UserCircle,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  fetchAuthSession,
  logoutSession,
  type SessionUser,
} from "@/lib/api-client";
import { BRAND_LOGO_SRC } from "@/lib/constants/brand";
import { APP_SHELL_CONTAINER } from "@/lib/constants/layout";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    void fetchAuthSession().then((s) => {
      setShowLogout(s.authRequired && s.authenticated);
      setSessionUser(s.authenticated && s.user ? s.user : null);
    });
  }, []);

  const handleLogout = async () => {
    try {
      await logoutSession();
      window.location.href = "/login";
    } catch {
      toast.error("Não foi possível sair.");
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card py-2.5 shadow-sm">
      <div
        className={cn(
          APP_SHELL_CONTAINER,
          "flex-row items-center justify-between gap-3",
        )}
      >
        <Link
          href="/"
          className="relative block min-h-9 min-w-0 flex-1 py-0.5"
          aria-label="PulseControl — início"
        >
          <Image
            src={BRAND_LOGO_SRC}
            alt=""
            width={220}
            height={56}
            className="h-9 w-auto max-w-full object-contain object-left sm:h-10"
            priority
          />
        </Link>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="shrink-0"
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
          aria-controls="site-header-menu"
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="size-5" aria-hidden />
        </Button>
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetContent id="site-header-menu">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              {sessionUser?.email ? (
                <p className="text-xs font-normal text-muted-foreground">
                  {sessionUser.email}
                </p>
              ) : null}
            </SheetHeader>
            <SheetBody>
              <nav
                className="flex flex-col gap-1"
                aria-label="Conta e configurações"
              >
                <Link
                  href="/"
                  className={cn(
                    buttonVariants({
                      variant: "ghost",
                      size: "default",
                    }),
                    "h-11 justify-start gap-3 px-0",
                  )}
                  onClick={() => setMenuOpen(false)}
                >
                  <Home className="size-4 shrink-0" aria-hidden />
                  Início
                </Link>
                <Link
                  href="/comandos"
                  className={cn(
                    buttonVariants({
                      variant: "ghost",
                      size: "default",
                    }),
                    "h-11 justify-start gap-3 px-0",
                  )}
                  onClick={() => setMenuOpen(false)}
                >
                  <LayoutGrid className="size-4 shrink-0" aria-hidden />
                  Comandos
                </Link>
                <Link
                  href="/categorias"
                  className={cn(
                    buttonVariants({
                      variant: "ghost",
                      size: "default",
                    }),
                    "h-11 justify-start gap-3 px-0",
                  )}
                  onClick={() => setMenuOpen(false)}
                >
                  <Tags className="size-4 shrink-0" aria-hidden />
                  Categorias
                </Link>
                {showLogout ? (
                  <Link
                    href="/profile"
                    className={cn(
                      buttonVariants({
                        variant: "ghost",
                        size: "default",
                      }),
                      "h-11 justify-start gap-3 px-0",
                    )}
                    onClick={() => setMenuOpen(false)}
                  >
                    <UserCircle className="size-4 shrink-0" aria-hidden />
                    Perfil
                  </Link>
                ) : null}
                <Link
                  href="/numeros"
                  className={cn(
                    buttonVariants({
                      variant: "ghost",
                      size: "default",
                    }),
                    "h-11 justify-start gap-3 px-0",
                  )}
                  onClick={() => setMenuOpen(false)}
                >
                  <Smartphone className="size-4 shrink-0" aria-hidden />
                  Números
                </Link>
                <Link
                  href="/historico"
                  className={cn(
                    buttonVariants({
                      variant: "ghost",
                      size: "default",
                    }),
                    "h-11 justify-start gap-3 px-0",
                  )}
                  onClick={() => setMenuOpen(false)}
                >
                  <History className="size-4 shrink-0" aria-hidden />
                  Histórico
                </Link>
                {sessionUser?.role === "ADMIN" ? (
                  <Link
                    href="/admin"
                    className={cn(
                      buttonVariants({
                        variant: "ghost",
                        size: "default",
                      }),
                      "h-11 justify-start gap-3 px-0",
                    )}
                    onClick={() => setMenuOpen(false)}
                  >
                    <Users className="size-4 shrink-0" aria-hidden />
                    Contas
                  </Link>
                ) : null}
                {showLogout ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-11 justify-start gap-3 px-0 font-normal"
                    onClick={() => {
                      setMenuOpen(false);
                      void handleLogout();
                    }}
                  >
                    <LogOut className="size-4 shrink-0" aria-hidden />
                    Sair
                  </Button>
                ) : null}
              </nav>
            </SheetBody>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
