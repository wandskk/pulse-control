"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  Smartphone,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { ConfirmDestructiveDialog } from "@/components/shared/confirm-destructive-dialog";
import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { InlineLoadingText } from "@/components/shared/inline-loading-text";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  COMMAND_COLOR_LABELS,
  COMMAND_COLOR_STYLES,
  COMMAND_COLORS,
  type CommandColor,
} from "@/lib/constants/command-colors";
import {
  commandFormSchema,
  type CommandFormValues,
} from "@/lib/validators/commands";
import type { CategoryDto, CommandDto } from "@/lib/types";
import { formatPhoneBrDisplay } from "@/lib/utils/phone-br";
import { APP_SHELL_CONTAINER } from "@/lib/constants/layout";
import { DEVICE_QUERY_PARAM } from "@/lib/constants/navigation";
import {
  SELECT_CONTROL_CLASS,
  SELECT_CONTROL_CLASS_TALL,
  emptyStateCtaButtonProps,
  formDialogSubmitButtonClassName,
  pageHeaderAddIconButtonProps,
} from "@/lib/constants/ui";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/utils/error-message";
import { buildIdToNameMap } from "@/lib/utils/maps";
import { useDevicesWithPersistedSelection } from "@/features/devices/hooks/use-devices-with-persisted-selection";
import {
  createCommand,
  deleteCommand,
  executeCommand,
  fetchCategories,
  fetchCommands,
  updateCommand,
} from "@/lib/api-client";

function isCommandColor(value: string): value is CommandColor {
  return (COMMAND_COLORS as readonly string[]).includes(value);
}

export function PulseComandosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    devices,
    loadingDevices,
    selectedDeviceId,
    setSelectedDeviceId,
  } = useDevicesWithPersistedSelection();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [commands, setCommands] = useState<CommandDto[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [loadingCommands, setLoadingCommands] = useState(false);

  const [commandDialogOpen, setCommandDialogOpen] = useState(false);
  const [editingCommand, setEditingCommand] = useState<CommandDto | null>(null);

  const [deleteCommandTarget, setDeleteCommandTarget] =
    useState<CommandDto | null>(null);

  const [executingCommandId, setExecutingCommandId] = useState<string | null>(
    null,
  );

  const categoryNameById = useMemo(
    () => buildIdToNameMap(categories),
    [categories],
  );

  const prevDeviceIdRef = useRef<string | null>(null);
  const deviceJustChangedRef = useRef(false);

  const deviceIdFromUrl = searchParams.get(DEVICE_QUERY_PARAM);

  useEffect(() => {
    if (loadingDevices || devices.length === 0) return;
    if (!deviceIdFromUrl) return;
    const exists = devices.some((d) => d.id === deviceIdFromUrl);
    if (!exists) {
      toast.error("Número não encontrado.");
      router.replace("/comandos", { scroll: false });
      return;
    }
    setSelectedDeviceId(deviceIdFromUrl);
    router.replace("/comandos", { scroll: false });
  }, [
    loadingDevices,
    devices,
    deviceIdFromUrl,
    setSelectedDeviceId,
    router,
  ]);

  const loadCategories = useCallback(async () => {
    if (!selectedDeviceId) {
      setCategories([]);
      return;
    }
    try {
      const data = await fetchCategories(selectedDeviceId);
      setCategories(data);
    } catch {
      setCategories([]);
    }
  }, [selectedDeviceId]);

  const loadCommands = useCallback(async () => {
    if (!selectedDeviceId) {
      setCommands([]);
      return;
    }
    setLoadingCommands(true);
    try {
      const data = await fetchCommands(
        selectedDeviceId,
        categoryFilter as "all" | "none" | string,
      );
      setCommands(data);
    } catch (e) {
      toast.error(getErrorMessage(e, "Erro ao carregar comandos"));
      setCommands([]);
    } finally {
      setLoadingCommands(false);
    }
  }, [selectedDeviceId, categoryFilter]);

  useEffect(() => {
    if (!selectedDeviceId) {
      prevDeviceIdRef.current = null;
      setCategories([]);
      setCommands([]);
      return;
    }

    const deviceChanged = prevDeviceIdRef.current !== selectedDeviceId;
    prevDeviceIdRef.current = selectedDeviceId;

    if (deviceChanged) {
      deviceJustChangedRef.current = true;
      setCategoryFilter("all");
    }

    let cancelled = false;

    void (async () => {
      setLoadingCommands(true);
      try {
        if (deviceChanged) {
          const [cats, cmds] = await Promise.all([
            fetchCategories(selectedDeviceId),
            fetchCommands(selectedDeviceId, "all"),
          ]);
          if (!cancelled) {
            setCategories(cats);
            setCommands(cmds);
          }
        } else {
          if (deviceJustChangedRef.current) {
            deviceJustChangedRef.current = false;
            setLoadingCommands(false);
            return;
          }
          const cmds = await fetchCommands(
            selectedDeviceId,
            categoryFilter as "all" | "none" | string,
          );
          if (!cancelled) setCommands(cmds);
        }
      } catch (e) {
        if (!cancelled) {
          toast.error(getErrorMessage(e, "Erro ao carregar comandos"));
          setCommands([]);
          if (deviceChanged) setCategories([]);
          deviceJustChangedRef.current = false;
        }
      } finally {
        if (!cancelled) setLoadingCommands(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedDeviceId, categoryFilter]);

  const commandForm = useForm<CommandFormValues>({
    resolver: zodResolver(commandFormSchema),
    defaultValues: {
      title: "",
      message: "",
      color: "blue",
      categoryId: "",
    },
  });

  useEffect(() => {
    if (!commandDialogOpen) return;
    if (editingCommand) {
      const c = editingCommand.color;
      commandForm.reset({
        title: editingCommand.title,
        message: editingCommand.message,
        color: isCommandColor(c) ? c : "blue",
        categoryId: editingCommand.categoryId ?? "",
      });
    } else {
      commandForm.reset({
        title: "",
        message: "",
        color: "blue",
        categoryId: "",
      });
    }
  }, [commandDialogOpen, editingCommand, commandForm]);

  const openCreateCommand = () => {
    if (!selectedDeviceId) {
      toast.message("Cadastre uma linha em Números ou selecione acima.");
      return;
    }
    setEditingCommand(null);
    setCommandDialogOpen(true);
  };

  const openEditCommand = (c: CommandDto) => {
    setEditingCommand(c);
    setCommandDialogOpen(true);
  };

  const onSubmitCommand = commandForm.handleSubmit(async (values) => {
    if (!selectedDeviceId) return;
    const categoryId = values.categoryId?.trim()
      ? values.categoryId.trim()
      : null;
    const payload = {
      title: values.title,
      message: values.message,
      color: values.color,
      categoryId,
    };
    try {
      if (editingCommand) {
        await updateCommand(editingCommand.id, payload);
        toast.success("Comando atualizado.");
      } else {
        await createCommand({ ...payload, deviceId: selectedDeviceId });
        toast.success("Comando criado.");
      }
      setCommandDialogOpen(false);
      await Promise.all([loadCategories(), loadCommands()]);
    } catch (e) {
      toast.error(getErrorMessage(e, "Erro ao salvar"));
    }
  });

  const confirmDeleteCommand = async () => {
    if (!deleteCommandTarget) return;
    try {
      await deleteCommand(deleteCommandTarget.id);
      toast.success("Comando removido.");
      setDeleteCommandTarget(null);
      await loadCommands();
    } catch (e) {
      toast.error(getErrorMessage(e, "Erro ao remover"));
    }
  };

  const runExecute = async (cmd: CommandDto) => {
    if (!selectedDeviceId) return;
    setExecutingCommandId(cmd.id);
    try {
      const result = await executeCommand(selectedDeviceId, cmd.id);
      if (result.success) {
        toast.success("Comando enviado com sucesso.");
      } else {
        toast.error(result.message);
      }
    } catch (e) {
      toast.error(getErrorMessage(e, "Erro ao enviar comando"));
    } finally {
      setExecutingCommandId(null);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <main
        className={cn(
          APP_SHELL_CONTAINER,
          "flex-1 flex-col gap-4 py-4 pb-[max(2.5rem,env(safe-area-inset-bottom,0px))]",
        )}
      >
        <header className="space-y-1 border-b border-border pb-4">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Comandos
          </h1>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Toque no cartão para enviar o comando.
          </p>
        </header>

        <section
          className="flex flex-col gap-2"
          aria-busy={loadingDevices}
          aria-label="Linha e atalhos"
        >
          {loadingDevices ? (
            <InlineLoadingText />
          ) : devices.length === 0 ? (
            <EmptyStateCard
              icon={Smartphone}
              iconClassName="size-8"
              message="Cadastre um número para enviar comandos."
              contentClassName="py-8"
              action={
                <Link
                  href="/numeros"
                  className={cn(buttonVariants(emptyStateCtaButtonProps))}
                >
                  Cadastrar número
                </Link>
              }
            />
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="comandos-device"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Linha (número)
                </label>
                <select
                  id="comandos-device"
                  className={SELECT_CONTROL_CLASS}
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  aria-label="Selecionar número"
                >
                  {devices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} · {formatPhoneBrDisplay(d.phone)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-xs">
                <Link
                  href="/numeros"
                  className="text-muted-foreground underline-offset-4 transition-colors hover:text-foreground"
                >
                  Números
                </Link>
                <Link
                  href="/categorias"
                  className="text-muted-foreground underline-offset-4 transition-colors hover:text-foreground"
                >
                  Categorias
                </Link>
              </div>
            </>
          )}
        </section>

        {!loadingDevices && devices.length > 0 ? (
          <section
            className="flex flex-col gap-3 border-t border-border pt-4"
            aria-busy={loadingCommands}
            aria-label="Lista de comandos"
          >
            {selectedDeviceId ? (
              <div className="flex flex-row items-center gap-2">
                <label htmlFor="cmd-filter-category" className="sr-only">
                  Filtrar por categoria
                </label>
                <select
                  id="cmd-filter-category"
                  className={cn(
                    SELECT_CONTROL_CLASS,
                    "min-h-10 min-w-0 flex-1",
                  )}
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  aria-label="Filtrar por categoria"
                >
                  <option value="all">Todas</option>
                  <option value="none">Sem categoria</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  {...pageHeaderAddIconButtonProps}
                  disabled={!selectedDeviceId}
                  onClick={openCreateCommand}
                  aria-label="Novo comando"
                >
                  <Plus className="size-4" aria-hidden />
                </Button>
              </div>
            ) : null}

            {!selectedDeviceId ? (
              <p className="text-sm text-muted-foreground">
                Escolha uma linha acima.
              </p>
            ) : loadingCommands ? (
              <InlineLoadingText />
            ) : commands.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {categoryFilter !== "all"
                  ? "Nada neste filtro. Troque o filtro ou crie um comando."
                  : "Nenhum comando ainda. Toque em + para criar."}
              </p>
            ) : (
              <ul
                className="grid grid-cols-2 gap-2 sm:gap-3"
                aria-label="Comandos"
              >
                {commands.map((cmd) => {
                  const color = isCommandColor(cmd.color) ? cmd.color : "blue";
                  const styles = COMMAND_COLOR_STYLES[color];
                  const isSending = executingCommandId === cmd.id;
                  const busy = executingCommandId !== null;
                  return (
                    <li key={cmd.id} className="min-h-0">
                      <DropdownMenu>
                        <div
                          className={cn(
                            "flex min-h-14 flex-row items-stretch overflow-hidden rounded-xl shadow-sm transition-[transform,box-shadow] ring-1 ring-inset ring-black/5 dark:ring-white/10",
                            styles.card,
                            busy && !isSending && "opacity-60",
                          )}
                        >
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void runExecute(cmd)}
                            className={cn(
                              "flex min-h-14 min-w-0 flex-1 touch-manipulation flex-col items-center justify-center gap-1 px-2.5 py-2.5 text-center outline-none transition active:scale-[0.98] disabled:pointer-events-none",
                              "text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                            )}
                            aria-label={`Enviar comando: ${cmd.title}`}
                            aria-busy={isSending}
                          >
                            {isSending ? (
                              <>
                                <Loader2
                                  className="size-5 shrink-0 animate-spin text-foreground"
                                  aria-hidden
                                />
                                <span className="text-[11px] font-medium leading-tight">
                                  Enviando…
                                </span>
                              </>
                            ) : (
                              <span className="flex min-h-0 w-full flex-col items-center justify-center gap-0.5 px-0.5">
                                <span className="line-clamp-3 text-[13px] font-semibold leading-tight">
                                  {cmd.title}
                                </span>
                                {cmd.categoryId &&
                                categoryNameById.get(cmd.categoryId) ? (
                                  <span className="line-clamp-1 w-full text-[10px] font-medium text-muted-foreground">
                                    {categoryNameById.get(cmd.categoryId)}
                                  </span>
                                ) : null}
                              </span>
                            )}
                          </button>
                          <div className="flex shrink-0 flex-col border-l border-black/10 bg-background/30 dark:border-white/10 dark:bg-black/10">
                            <DropdownMenuTrigger
                              disabled={busy}
                              className={cn(
                                buttonVariants({
                                  variant: "ghost",
                                  size: "icon",
                                }),
                                "h-full min-h-14 w-10 shrink-0 touch-manipulation rounded-none rounded-br-xl rounded-tr-xl disabled:opacity-40",
                              )}
                              aria-label={`Opções: ${cmd.title}`}
                            >
                              <MoreVertical className="size-4 opacity-80" />
                            </DropdownMenuTrigger>
                          </div>
                        </div>
                        <DropdownMenuContent align="end" className="min-w-40">
                          <DropdownMenuItem
                            onClick={() => openEditCommand(cmd)}
                            className="gap-2"
                          >
                            <Pencil className="size-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeleteCommandTarget(cmd)}
                            className="gap-2"
                          >
                            <Trash2 className="size-4" />
                            Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        ) : null}
      </main>

      <Dialog open={commandDialogOpen} onOpenChange={setCommandDialogOpen}>
        <DialogContent showCloseButton className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCommand ? "Editar comando" : "Novo comando"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={onSubmitCommand}
            className="flex w-full min-w-0 flex-none flex-col gap-4"
          >
            <FieldGroup>
              <Field data-invalid={!!commandForm.formState.errors.title}>
                <FieldLabel htmlFor="cmd-title">Título</FieldLabel>
                <FieldContent>
                  <Input id="cmd-title" {...commandForm.register("title")} />
                </FieldContent>
                <FieldError errors={[commandForm.formState.errors.title]} />
              </Field>
              <Field data-invalid={!!commandForm.formState.errors.message}>
                <FieldLabel htmlFor="cmd-msg">Texto do comando</FieldLabel>
                <FieldContent>
                  <Textarea
                    id="cmd-msg"
                    rows={3}
                    className="min-h-20 resize-y"
                    {...commandForm.register("message")}
                  />
                </FieldContent>
                <FieldError errors={[commandForm.formState.errors.message]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="cmd-category">
                  Categoria (opcional)
                </FieldLabel>
                <FieldContent>
                  <Controller
                    name="categoryId"
                    control={commandForm.control}
                    render={({ field }) => (
                      <select
                        id="cmd-category"
                        className={SELECT_CONTROL_CLASS_TALL}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        ref={field.ref}
                      >
                        <option value="">Sem categoria</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </FieldContent>
              </Field>
              <Field data-invalid={!!commandForm.formState.errors.color}>
                <FieldLabel htmlFor="cmd-color">Cor</FieldLabel>
                <FieldContent>
                  <Controller
                    name="color"
                    control={commandForm.control}
                    render={({ field }) => (
                      <select
                        id="cmd-color"
                        className={SELECT_CONTROL_CLASS_TALL}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        ref={field.ref}
                      >
                        {COMMAND_COLORS.map((c) => (
                          <option key={c} value={c}>
                            {COMMAND_COLOR_LABELS[c]}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </FieldContent>
                <FieldError errors={[commandForm.formState.errors.color]} />
              </Field>
            </FieldGroup>
            <DialogFooter className="sm:justify-end">
              <Button
                type="submit"
                variant="default"
                className={formDialogSubmitButtonClassName}
                disabled={commandForm.formState.isSubmitting}
              >
                {commandForm.formState.isSubmitting ? "Salvando…" : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDestructiveDialog
        open={!!deleteCommandTarget}
        onOpenChange={(o) => !o && setDeleteCommandTarget(null)}
        title="Remover comando?"
        description="Será excluído permanentemente."
        confirmLabel="Remover"
        onConfirm={() => void confirmDeleteCommand()}
      />
    </div>
  );
}
