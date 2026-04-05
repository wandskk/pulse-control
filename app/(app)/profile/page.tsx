"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  changeOwnPassword,
  fetchAuthSession,
} from "@/lib/api-client";
import { APP_SHELL_CONTAINER } from "@/lib/constants/layout";
import { formPrimarySubmitFullWidthClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/utils/error-message";
import {
  passwordFormSchema,
  type PasswordFormValues,
} from "@/lib/validators/profile";

export default function ProfilePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const checkSession = useCallback(async () => {
    const s = await fetchAuthSession();
    if (!s.authRequired) {
      router.replace("/");
      return;
    }
    if (!s.authenticated || !s.user) {
      router.replace("/login?from=/profile");
      return;
    }
    setEmail(s.user.email);
    setReady(true);
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- inicialização assíncrona da sessão no mount
    void checkSession();
  }, [checkSession]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await changeOwnPassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success("Senha atualizada.");
      form.reset({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (e) {
      toast.error(getErrorMessage(e, "Erro ao salvar"));
    }
  });

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn(APP_SHELL_CONTAINER, "flex-col gap-6 py-4 pb-12")}>
      <div className="border-b border-border pb-4">
        <h1 className="text-lg font-semibold tracking-tight">Perfil</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          E-mail: <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      <section aria-labelledby="pwd-heading">
        <h2 id="pwd-heading" className="mb-3 text-sm font-medium">
          Alterar senha
        </h2>
        <form
          onSubmit={(e) => void onSubmit(e)}
          className="rounded-xl border border-border bg-card p-5 shadow-sm"
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="cur-pw">Senha atual</FieldLabel>
              <FieldContent>
                <Input
                  id="cur-pw"
                  type="password"
                  autoComplete="current-password"
                  {...form.register("currentPassword")}
                />
                <FieldError>
                  {form.formState.errors.currentPassword?.message}
                </FieldError>
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="new-pw">Nova senha</FieldLabel>
              <FieldContent>
                <Input
                  id="new-pw"
                  type="password"
                  autoComplete="new-password"
                  {...form.register("newPassword")}
                />
                <FieldError>
                  {form.formState.errors.newPassword?.message}
                </FieldError>
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="conf-pw">Confirmar nova senha</FieldLabel>
              <FieldContent>
                <Input
                  id="conf-pw"
                  type="password"
                  autoComplete="new-password"
                  {...form.register("confirmNewPassword")}
                />
                <FieldError>
                  {form.formState.errors.confirmNewPassword?.message}
                </FieldError>
              </FieldContent>
            </Field>
          </FieldGroup>
          <Button
            type="submit"
            variant="default"
            className={formPrimarySubmitFullWidthClassName}
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Salvando…" : "Atualizar senha"}
          </Button>
        </form>
      </section>
    </div>
  );
}
