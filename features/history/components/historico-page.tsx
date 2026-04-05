"use client";

import { History, Loader2, RefreshCw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fetchDevices, fetchHistory } from "@/lib/api-client";
import { APP_SHELL_CONTAINER } from "@/lib/constants/layout";
import {
  SELECT_CONTROL_CLASS,
  pageHeaderAddIconButtonProps,
} from "@/lib/constants/ui";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/utils/error-message";
import type { DeviceDto, ExecutionDto } from "@/lib/types";
import { formatPhoneBrDisplay } from "@/lib/utils/phone-br";
import { SELECTED_DEVICE_STORAGE_KEY } from "@/lib/storage/selected-device";
import { DEVICE_QUERY_PARAM } from "@/lib/constants/navigation";

export function HistoricoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deviceIdFromUrl = searchParams.get(DEVICE_QUERY_PARAM);

  const [devices, setDevices] = useState<DeviceDto[]>([]);
  const [history, setHistory] = useState<ExecutionDto[]>([]);
  /** `undefined` = ainda não sincronizado com o número da home / lista. */
  const [filterDeviceId, setFilterDeviceId] = useState<string | undefined>(
    undefined,
  );
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const firstFilterEffectRef = useRef(false);

  const loadInitial = useCallback(async () => {
    setLoadingDevices(true);
    setLoadingHistory(true);
    try {
      const [devs, hist] = await Promise.all([
        fetchDevices(),
        fetchHistory(undefined),
      ]);
      setDevices(devs);
      setHistory(hist);
    } catch (e) {
      toast.error(getErrorMessage(e, "Erro ao carregar"));
      setDevices([]);
      setHistory([]);
    } finally {
      setLoadingDevices(false);
      setLoadingHistory(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    if (filterDeviceId === undefined) return;
    setLoadingHistory(true);
    try {
      const data = await fetchHistory(filterDeviceId.trim() || undefined);
      setHistory(data);
    } catch (e) {
      toast.error(getErrorMessage(e, "Erro ao carregar histórico"));
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, [filterDeviceId]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    if (loadingDevices) return;
    if (devices.length === 0) {
      setFilterDeviceId("");
      return;
    }
    setFilterDeviceId((prev) => {
      if (prev === "") return "";
      if (prev && devices.some((d) => d.id === prev)) return prev;
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(SELECTED_DEVICE_STORAGE_KEY);
        if (saved && devices.some((d) => d.id === saved)) return saved;
      }
      return devices[0].id;
    });
  }, [devices, loadingDevices]);

  useEffect(() => {
    if (loadingDevices || devices.length === 0) return;
    if (!deviceIdFromUrl) return;
    const exists = devices.some((d) => d.id === deviceIdFromUrl);
    if (!exists) {
      toast.error("Número não encontrado.");
      router.replace("/historico", { scroll: false });
      return;
    }
    setFilterDeviceId(deviceIdFromUrl);
    router.replace("/historico", { scroll: false });
  }, [loadingDevices, devices, deviceIdFromUrl, router]);

  useEffect(() => {
    if (filterDeviceId === undefined) return;
    if (!firstFilterEffectRef.current) {
      firstFilterEffectRef.current = true;
      if (filterDeviceId === "") return;
    }
    void loadHistory();
  }, [filterDeviceId, loadHistory]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <main
        className={cn(APP_SHELL_CONTAINER, "flex-1 flex-col gap-4 py-4 pb-12")}
      >
        <div className="border-b border-border pb-4">
          <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <History className="size-5 text-primary" aria-hidden />
            Histórico de envios
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Registros de comandos enviados pelo app (sucesso ou falha).
          </p>
        </div>

        <div className="flex flex-row items-center gap-2">
          <label htmlFor="hist-filter" className="sr-only">
            Filtrar por número
          </label>
          <select
            id="hist-filter"
            className={cn(
              SELECT_CONTROL_CLASS,
              "min-w-0 flex-1 px-2 sm:min-w-32 sm:flex-none",
            )}
            value={filterDeviceId ?? ""}
            onChange={(e) => setFilterDeviceId(e.target.value)}
            disabled={loadingDevices || filterDeviceId === undefined}
            aria-label="Filtrar histórico por número"
          >
            <option value="">Todos os números</option>
            {devices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} · {formatPhoneBrDisplay(d.phone)}
              </option>
            ))}
          </select>
          <Button
            type="button"
            {...pageHeaderAddIconButtonProps}
            disabled={
              loadingHistory || filterDeviceId === undefined || loadingDevices
            }
            onClick={() => void loadHistory()}
            aria-label="Atualizar lista"
          >
            {loadingHistory ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <RefreshCw className="size-4" aria-hidden />
            )}
          </Button>
        </div>

        {loadingDevices ||
        (filterDeviceId === undefined && devices.length > 0) ||
        (loadingHistory && history.length === 0) ? (
          <div className="min-h-8" aria-hidden />
        ) : history.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center">
            Nenhum envio ainda. Envie um comando e registre aqui.
          </p>
        ) : (
          <ul className="flex flex-col gap-2" aria-label="Lista de envios">
            {history.map((row) => {
              const ok = row.status === "success";
              const when = new Date(row.createdAt).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <li key={row.id}>
                  <Card
                    className={
                      ok ? "border-primary/30" : "border-destructive/30"
                    }
                  >
                    <CardContent className="flex flex-col gap-1.5 p-3 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium text-foreground">
                          {row.commandTitle ?? "Comando"}
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            ok
                              ? "border-primary/50 text-primary"
                              : "border-destructive/50 text-destructive"
                          }
                        >
                          {ok ? "Enviado" : "Falhou"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {row.deviceName ?? "Dispositivo"} · {when}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground break-all">
                        → {formatPhoneBrDisplay(row.phone)}: {row.message}
                      </p>
                      {row.actorSub ? (
                        <p className="text-xs text-muted-foreground">
                          Sessão: {row.actorSub}
                        </p>
                      ) : null}
                      {!ok && row.errorMessage ? (
                        <p className="text-xs text-destructive">
                          {row.errorMessage}
                        </p>
                      ) : null}
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
