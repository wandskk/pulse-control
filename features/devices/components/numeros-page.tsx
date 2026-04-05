"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MoreVertical, Pencil, Plus, Smartphone, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { ConfirmDestructiveDialog } from "@/components/shared/confirm-destructive-dialog";
import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { ListLoadingCenter } from "@/components/shared/list-loading-center";
import { PageHeaderRow } from "@/components/shared/page-header-row";
import { RowActionsMenuTrigger } from "@/components/shared/row-actions-menu-trigger";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
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
import type { DeviceDto } from "@/lib/types";
import { deviceCreateSchema } from "@/lib/validators/devices";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/utils/error-message";
import {
  formatPhoneBrDisplay,
  normalizePhoneDigits,
} from "@/lib/utils/phone-br";
import {
  createDevice,
  deleteDevice,
  fetchDevices,
  updateDevice,
} from "@/lib/api-client";
import { APP_SHELL_CONTAINER } from "@/lib/constants/layout";
import {
  emptyStateCtaButtonProps,
  formDialogSubmitButtonClassName,
  pageHeaderAddIconButtonProps,
} from "@/lib/constants/ui";

export function NumerosPage() {
  const [devices, setDevices] = useState<DeviceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DeviceDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeviceDto | null>(null);

  const form = useForm({
    resolver: zodResolver(deviceCreateSchema),
    defaultValues: { name: "", phone: "", description: "" },
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchDevices();
      setDevices(data);
    } catch (e) {
      toast.error(getErrorMessage(e, "Erro ao carregar números"));
      setDevices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!dialogOpen) return;
    if (editing) {
      form.reset({
        name: editing.name,
        phone: normalizePhoneDigits(editing.phone),
        description: editing.description ?? "",
      });
    } else {
      form.reset({ name: "", phone: "", description: "" });
    }
  }, [dialogOpen, editing, form]);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (d: DeviceDto) => {
    setEditing(d);
    setDialogOpen(true);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (editing) {
        const desc = values.description?.trim();
        await updateDevice(editing.id, {
          name: values.name,
          phone: values.phone,
          description: desc ? desc : null,
        });
        toast.success("Número atualizado.");
      } else {
        await createDevice(values);
        toast.success("Número adicionado.");
      }
      setDialogOpen(false);
      await load();
    } catch (e) {
      toast.error(getErrorMessage(e, "Erro ao salvar"));
    }
  });

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDevice(deleteTarget.id);
      toast.success("Número removido.");
      setDeleteTarget(null);
      await load();
    } catch (e) {
      toast.error(getErrorMessage(e, "Erro ao remover"));
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <main
        className={cn(
          APP_SHELL_CONTAINER,
          "flex-1 flex-col gap-4 py-4 pb-[max(3rem,env(safe-area-inset-bottom,0px))]",
        )}
      >
        <PageHeaderRow
          title="Números cadastrados"
          description="Cadastre destinos e descrições. Use-os em Comandos."
          action={
            <Button
              type="button"
              {...pageHeaderAddIconButtonProps}
              onClick={openCreate}
              aria-label="Adicionar número"
            >
              <Plus className="size-4" aria-hidden />
            </Button>
          }
        />
        {loading ? (
          <ListLoadingCenter className="py-12" />
        ) : devices.length === 0 ? (
          <EmptyStateCard
            icon={Smartphone}
            message="Nenhum número cadastrado."
            action={
              <Button
                type="button"
                {...emptyStateCtaButtonProps}
                onClick={openCreate}
              >
                Cadastrar o primeiro
              </Button>
            }
          />
        ) : (
          <ul
            className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card text-sm shadow-sm ring-1 ring-foreground/5"
            aria-label="Números cadastrados para envio de comandos"
          >
            {devices.map((d) => (
              <li
                key={d.id}
                className="flex min-w-0 items-start gap-2 px-3 py-3.5 transition-colors hover:bg-muted/20 sm:px-4"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-medium leading-snug text-foreground">
                    {d.name}
                  </p>
                  <p className="wrap-break-word font-mono text-xs tabular-nums leading-snug text-muted-foreground">
                    {formatPhoneBrDisplay(d.phone)}
                  </p>
                  {d.description?.trim() ? (
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {d.description}
                    </p>
                  ) : null}
                </div>
                <DropdownMenu>
                  <RowActionsMenuTrigger aria-label={`Ações: ${d.name}`}>
                    <MoreVertical className="size-4" aria-hidden />
                  </RowActionsMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-40">
                    <DropdownMenuItem
                      className="gap-2"
                      onClick={() => openEdit(d)}
                    >
                      <Pencil className="size-4" aria-hidden />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      className="gap-2"
                      onClick={() => setDeleteTarget(d)}
                    >
                      <Trash2 className="size-4" aria-hidden />
                      Remover
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            ))}
          </ul>
        )}
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent showCloseButton className="sm:max-w-md">
          <DialogHeader className="shrink-0 space-y-1.5 pr-8 text-left">
            <DialogTitle>
              {editing ? "Editar número" : "Adicionar número"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={onSubmit}
            className="flex w-full min-w-0 flex-none flex-col gap-4"
          >
            <FieldGroup className="gap-4">
              <Field data-invalid={!!form.formState.errors.name}>
                <FieldLabel htmlFor="numeros-dev-name">Nome</FieldLabel>
                <FieldContent>
                  <Input
                    id="numeros-dev-name"
                    autoComplete="off"
                    className="h-11 min-h-11 py-2 text-base md:text-sm"
                    {...form.register("name")}
                  />
                </FieldContent>
                <FieldError errors={[form.formState.errors.name]} />
              </Field>
              <Field data-invalid={!!form.formState.errors.phone}>
                <FieldLabel htmlFor="numeros-dev-phone">Telefone</FieldLabel>
                <FieldContent>
                  <Controller
                    name="phone"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        id="numeros-dev-phone"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="(99) 99999-9999"
                        className="h-11 min-h-11 py-2 text-base tabular-nums md:text-sm"
                        value={formatPhoneBrDisplay(field.value ?? "")}
                        onChange={(e) => {
                          const digits = normalizePhoneDigits(
                            e.target.value,
                          ).slice(0, 11);
                          field.onChange(digits);
                        }}
                        onBlur={field.onBlur}
                        ref={field.ref}
                      />
                    )}
                  />
                </FieldContent>
                <FieldError errors={[form.formState.errors.phone]} />
              </Field>
              <Field data-invalid={!!form.formState.errors.description}>
                <FieldLabel htmlFor="numeros-dev-desc">
                  Descrição (opcional)
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="numeros-dev-desc"
                    className="h-11 min-h-11 py-2 text-base md:text-sm"
                    {...form.register("description")}
                  />
                </FieldContent>
                <FieldError errors={[form.formState.errors.description]} />
              </Field>
            </FieldGroup>
            <DialogFooter className="mt-2 shrink-0 sm:justify-end">
              <Button
                type="submit"
                variant="default"
                className={formDialogSubmitButtonClassName}
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Salvando…" : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDestructiveDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Remover número?"
        description={
          <>
            Os botões deste número serão apagados junto. Esta ação não pode ser
            desfeita.
          </>
        }
        confirmLabel="Remover"
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
