"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  Smartphone,
  Tags,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ConfirmDestructiveDialog } from "@/components/shared/confirm-destructive-dialog";
import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { InlineLoadingText } from "@/components/shared/inline-loading-text";
import { ListLoadingCenter } from "@/components/shared/list-loading-center";
import { PageHeaderRow } from "@/components/shared/page-header-row";
import { RowActionsMenuTrigger } from "@/components/shared/row-actions-menu-trigger";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { CategoryDto } from "@/lib/types";
import { APP_SHELL_CONTAINER } from "@/lib/constants/layout";
import {
  SELECT_CONTROL_CLASS,
  emptyStateCtaButtonProps,
  formDialogSubmitButtonClassName,
  pageHeaderAddIconButtonProps,
} from "@/lib/constants/ui";
import { formatPhoneBrDisplay } from "@/lib/utils/phone-br";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/utils/error-message";
import { useDevicesWithPersistedSelection } from "@/features/devices/hooks/use-devices-with-persisted-selection";
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from "@/lib/api-client";
import {
  categoryFormSchema,
  type CategoryFormValues,
} from "@/lib/validators/categories";

export function CategoriasPage() {
  const {
    devices,
    loadingDevices,
    selectedDeviceId,
    setSelectedDeviceId,
  } = useDevicesWithPersistedSelection();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryDto | null>(null);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: "" },
  });

  const loadCategories = useCallback(async () => {
    if (!selectedDeviceId) {
      setCategories([]);
      return;
    }
    setLoadingCategories(true);
    try {
      const data = await fetchCategories(selectedDeviceId);
      setCategories(data);
    } catch (e) {
      toast.error(getErrorMessage(e, "Erro ao carregar categorias"));
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (!dialogOpen) return;
    if (editing) {
      form.reset({ name: editing.name });
    } else {
      form.reset({ name: "" });
    }
  }, [dialogOpen, editing, form]);

  const openCreate = () => {
    if (!selectedDeviceId) {
      toast.message("Cadastre um número ou selecione um abaixo.");
      return;
    }
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (c: CategoryDto) => {
    setEditing(c);
    setDialogOpen(true);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (!selectedDeviceId) return;
    try {
      if (editing) {
        await updateCategory(editing.id, { name: values.name });
        toast.success("Categoria atualizada.");
      } else {
        await createCategory({ deviceId: selectedDeviceId, name: values.name });
        toast.success("Categoria criada.");
      }
      setDialogOpen(false);
      await loadCategories();
    } catch (e) {
      toast.error(getErrorMessage(e, "Erro ao salvar"));
    }
  });

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory(deleteTarget.id);
      toast.success("Categoria removida.");
      setDeleteTarget(null);
      await loadCategories();
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
          title="Categorias"
          description={
            selectedDeviceId
              ? "Selecione um número e organize categorias para os comandos."
              : "Cadastre um número e organize categorias para os comandos."
          }
          action={
            <Button
              type="button"
              {...pageHeaderAddIconButtonProps}
              disabled={!selectedDeviceId}
              onClick={openCreate}
              aria-label="Nova categoria"
            >
              <Plus className="size-4" aria-hidden />
            </Button>
          }
        />

        <section
          className="flex flex-col gap-3"
          aria-busy={loadingDevices}
          aria-label="Número para categorias"
        >
          <div
            className={cn(
              "flex flex-wrap items-center gap-2",
              selectedDeviceId ? "justify-between" : "justify-end",
            )}
          >
            {selectedDeviceId && devices.length > 0 ? (
              <h2 className="text-sm font-medium text-foreground">
                Número ativo
              </h2>
            ) : devices.length > 0 ? (
              <Link
                href="/numeros"
                className={cn(buttonVariants(emptyStateCtaButtonProps))}
              >
                Cadastrar número
              </Link>
            ) : null}
          </div>

          {loadingDevices ? (
            <InlineLoadingText />
          ) : devices.length === 0 ? (
            <EmptyStateCard
              icon={Smartphone}
              iconClassName="size-8"
              message="Nenhum número cadastrado."
              contentClassName="py-8"
              action={
                <Link
                  href="/numeros"
                  className={cn(
                    buttonVariants({ variant: "default", size: "sm" }),
                  )}
                >
                  Ir para números
                </Link>
              }
            />
          ) : (
            <select
              className={SELECT_CONTROL_CLASS}
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              aria-label="Selecionar número para categorias"
            >
              {devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} · {formatPhoneBrDisplay(d.phone)}
                </option>
              ))}
            </select>
          )}
        </section>

        {!loadingDevices && devices.length > 0 ? (
          <section
            className="flex flex-col gap-3 border-t border-border pt-5"
            aria-busy={loadingCategories}
            aria-label="Categorias deste número"
          >
            <h2 className="text-sm font-medium text-foreground md:text-base">
              Categorias deste número
            </h2>
            {!selectedDeviceId ? (
              <p className="text-sm text-muted-foreground">
                Selecione um número acima.
              </p>
            ) : loadingCategories ? (
              <ListLoadingCenter />
            ) : categories.length === 0 ? (
              <EmptyStateCard
                icon={Tags}
                message="Nenhuma categoria neste número."
                action={
                  <Button
                    type="button"
                    {...emptyStateCtaButtonProps}
                    onClick={openCreate}
                  >
                    Criar a primeira
                  </Button>
                }
              />
            ) : (
              <ul className="divide-y divide-border rounded-xl border border-border bg-card">
                {categories.map((c) => (
                  <li
                    key={c.id}
                    className="flex min-w-0 items-start gap-2 px-3 py-3 first:rounded-t-xl last:rounded-b-xl"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug">
                        {c.name}
                      </p>
                    </div>
                    <DropdownMenu>
                      <RowActionsMenuTrigger aria-label={`Ações: ${c.name}`}>
                        <MoreVertical className="size-4" aria-hidden />
                      </RowActionsMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={() => openEdit(c)}
                        >
                          <Pencil className="size-4" aria-hidden />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 text-destructive focus:text-destructive"
                          onClick={() => setDeleteTarget(c)}
                        >
                          <Trash2 className="size-4" aria-hidden />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[min(90dvh,calc(100vh-2rem))] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar categoria" : "Nova categoria"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={onSubmit}
            className="flex flex-none flex-col gap-4"
            noValidate
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="category-name">Nome</FieldLabel>
                <FieldContent>
                  <Input
                    id="category-name"
                    autoComplete="off"
                    placeholder="Ex.: Alarme, Portão"
                    {...form.register("name")}
                  />
                </FieldContent>
                <FieldError errors={[form.formState.errors.name]} />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button
                type="submit"
                variant="default"
                className={formDialogSubmitButtonClassName}
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Salvando…
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDestructiveDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Excluir categoria?"
        description={
          <>
            Os botões que usarem esta categoria ficarão sem categoria
            (continuam em Comandos). Esta ação não pode ser desfeita.
          </>
        }
        confirmLabel="Excluir"
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
