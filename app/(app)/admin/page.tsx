"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchAdminUsers,
  fetchAuthSession,
  createAdminUser,
  patchAdminUser,
  type AdminUserRow,
} from "@/lib/api-client";
import { APP_SHELL_CONTAINER } from "@/lib/constants/layout";
import { formDialogSubmitButtonClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/utils/error-message";
import {
  adminCreateUserFormSchema,
  adminResetPasswordFormSchema,
  type AdminCreateUserFormValues,
  type AdminResetPasswordFormValues,
} from "@/lib/validators/admin";

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [passwordUser, setPasswordUser] = useState<AdminUserRow | null>(null);
  const [allowed, setAllowed] = useState(false);

  const form = useForm<AdminCreateUserFormValues>({
    resolver: zodResolver(adminCreateUserFormSchema),
    defaultValues: { email: "", password: "", role: "USER" },
  });

  const resetForm = useForm<AdminResetPasswordFormValues>({
    resolver: zodResolver(adminResetPasswordFormSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const session = await fetchAuthSession();
      if (!session.authRequired || session.user?.role !== "ADMIN") {
        toast.error("Acesso restrito a administradores.");
        router.replace("/");
        return;
      }
      setAllowed(true);
      const list = await fetchAdminUsers();
      setUsers(list);
    } catch (e) {
      toast.error(getErrorMessage(e, "Erro ao carregar"));
      router.replace("/");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const onCreate = form.handleSubmit(async (values) => {
    try {
      await createAdminUser(values);
      toast.success("Conta criada.");
      setDialogOpen(false);
      form.reset({ email: "", password: "", role: "USER" });
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao criar");
    }
  });

  const onResetPassword = resetForm.handleSubmit(async (values) => {
    if (!passwordUser) return;
    try {
      await patchAdminUser(passwordUser.id, { password: values.newPassword });
      toast.success("Senha atualizada para esta conta.");
      setPasswordUser(null);
      resetForm.reset({ newPassword: "", confirmPassword: "" });
    } catch (e) {
      toast.error(getErrorMessage(e, "Erro ao salvar"));
    }
  });

  if (loading && !allowed) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!allowed) return null;

  return (
    <div className={cn(APP_SHELL_CONTAINER, "flex-col gap-6 py-4 pb-12")}>
      <div className="flex flex-col gap-3 border-b border-border pb-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            Contas e permissões
          </h1>
          <p className="text-xs text-muted-foreground">
            Cada conta vê apenas seus números e botões na página inicial.
          </p>
        </div>
        <Button
          type="button"
          variant="default"
          className="w-full gap-2 sm:w-auto sm:self-start"
          onClick={() => setDialogOpen(true)}
        >
          <UserPlus className="size-4" />
          Nova conta
        </Button>
      </div>

      <section aria-label="Usuários cadastrados">
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum usuário além do administrador.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border bg-card">
            {users.map((u) => (
              <li
                key={u.id}
                className="flex flex-col gap-2 px-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-medium">{u.email}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {u.role === "ADMIN" ? "Administrador" : "Usuário"}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1 self-start sm:self-center"
                  onClick={() => {
                    setPasswordUser(u);
                    resetForm.reset({ newPassword: "", confirmPassword: "" });
                  }}
                >
                  <KeyRound className="size-3.5" aria-hidden />
                  Nova senha
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova conta</DialogTitle>
            <DialogDescription>
              A pessoa poderá entrar com este e-mail e senha e gerenciar seus
              próprios números e botões.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => void onCreate(e)} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="nu-email">E-mail</FieldLabel>
                <FieldContent>
                  <Input
                    id="nu-email"
                    type="email"
                    autoComplete="off"
                    {...form.register("email")}
                  />
                  <FieldError>{form.formState.errors.email?.message}</FieldError>
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="nu-password">Senha</FieldLabel>
                <FieldContent>
                  <Input
                    id="nu-password"
                    type="password"
                    autoComplete="new-password"
                    {...form.register("password")}
                  />
                  <FieldError>
                    {form.formState.errors.password?.message}
                  </FieldError>
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel>Tipo</FieldLabel>
                <FieldContent>
                  <Select
                    value={form.watch("role")}
                    onValueChange={(v) =>
                      form.setValue("role", v as "USER" | "ADMIN")
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">Usuário</SelectItem>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>
            </FieldGroup>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="default"
                className={formDialogSubmitButtonClassName}
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Salvando…" : "Criar conta"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={passwordUser !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPasswordUser(null);
            resetForm.reset({ newPassword: "", confirmPassword: "" });
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova senha</DialogTitle>
            <DialogDescription>
              Defina uma nova senha para{" "}
              <span className="font-medium text-foreground">
                {passwordUser?.email}
              </span>
              . O usuário usará essa senha no próximo login.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => void onResetPassword(e)} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="adm-new-pw">Nova senha</FieldLabel>
                <FieldContent>
                  <Input
                    id="adm-new-pw"
                    type="password"
                    autoComplete="new-password"
                    {...resetForm.register("newPassword")}
                  />
                  <FieldError>
                    {resetForm.formState.errors.newPassword?.message}
                  </FieldError>
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="adm-conf-pw">Confirmar</FieldLabel>
                <FieldContent>
                  <Input
                    id="adm-conf-pw"
                    type="password"
                    autoComplete="new-password"
                    {...resetForm.register("confirmPassword")}
                  />
                  <FieldError>
                    {resetForm.formState.errors.confirmPassword?.message}
                  </FieldError>
                </FieldContent>
              </Field>
            </FieldGroup>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPasswordUser(null);
                  resetForm.reset({ newPassword: "", confirmPassword: "" });
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="default"
                className={formDialogSubmitButtonClassName}
                disabled={resetForm.formState.isSubmitting}
              >
                {resetForm.formState.isSubmitting ? "Salvando…" : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
