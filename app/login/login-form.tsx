"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { BRAND_LOGO_SRC } from "@/lib/constants/brand";
import { APP_SHELL_CONTAINER } from "@/lib/constants/layout";
import { formPrimarySubmitFullWidthClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [needsBootstrap, setNeedsBootstrap] = useState<boolean | null>(null);
  const [authRequired, setAuthRequired] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const [b, s] = await Promise.all([
          fetch("/api/auth/bootstrap", { cache: "no-store" }).then((r) =>
            r.json(),
          ) as Promise<{ needsBootstrap?: boolean }>,
          fetch("/api/auth/session", { cache: "no-store" }).then((r) =>
            r.json(),
          ) as Promise<{ authRequired?: boolean }>,
        ]);
        if (s.authRequired === false) {
          router.replace("/");
          return;
        }
        setNeedsBootstrap(Boolean(b.needsBootstrap));
        setAuthRequired(Boolean(s.authRequired));
      } catch {
        setNeedsBootstrap(false);
      }
    })();
  }, [router]);

  const onSubmitBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Preencha e-mail e senha.");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/auth/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const json = (await res.json()) as { message?: string };
      if (!res.ok) {
        toast.error(json.message ?? "Não foi possível criar o administrador.");
        return;
      }
      const dest = searchParams.get("from");
      router.push(dest && dest.startsWith("/") ? dest : "/");
      router.refresh();
    } catch {
      toast.error("Erro de rede.");
    } finally {
      setPending(false);
    }
  };

  const onSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Preencha e-mail e senha.");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const json = (await res.json()) as { message?: string };
      if (!res.ok) {
        toast.error(json.message ?? "Não foi possível entrar.");
        return;
      }
      const dest = searchParams.get("from");
      router.push(dest && dest.startsWith("/") ? dest : "/");
      router.refresh();
    } catch {
      toast.error("Erro de rede ao entrar.");
    } finally {
      setPending(false);
    }
  };

  if (needsBootstrap === null) {
    return (
      <div
        className={cn(
          APP_SHELL_CONTAINER,
          "min-h-[70vh] flex-col justify-center py-10",
        )}
      >
        <p className="text-center text-sm text-muted-foreground">Carregando…</p>
      </div>
    );
  }

  const isBootstrap = needsBootstrap && authRequired;

  return (
    <div
      className={cn(
        APP_SHELL_CONTAINER,
        "min-h-[70vh] flex-col justify-center py-10",
      )}
    >
      <div className="mb-8 flex flex-col items-center text-center">
        <Image
          src={BRAND_LOGO_SRC}
          alt="PulseControl"
          width={320}
          height={80}
          className="h-auto w-full max-w-[min(100%,280px)] object-contain"
          priority
        />
        <p className="mt-4 text-sm text-muted-foreground">
          {isBootstrap
            ? "Primeiro acesso — crie o administrador com o e-mail e senha definidos no servidor (BOOTSTRAP_*)."
            : "Entre com sua conta."}
        </p>
      </div>

      <form
        onSubmit={(e) =>
          void (isBootstrap ? onSubmitBootstrap(e) : onSubmitLogin(e))
        }
        className="rounded-xl border border-border bg-card p-5 shadow-sm"
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="login-email">E-mail</FieldLabel>
            <FieldContent>
              <Input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                disabled={pending}
                className="h-11"
              />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="login-password">Senha</FieldLabel>
            <FieldContent>
              <Input
                id="login-password"
                name="password"
                type="password"
                autoComplete={isBootstrap ? "new-password" : "current-password"}
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                disabled={pending}
                className="h-11"
              />
            </FieldContent>
          </Field>
        </FieldGroup>
        <Button
          type="submit"
          variant="default"
          className={formPrimarySubmitFullWidthClassName}
          disabled={pending}
        >
          {pending
            ? "Aguarde…"
            : isBootstrap
              ? "Criar administrador"
              : "Entrar"}
        </Button>
      </form>
    </div>
  );
}
