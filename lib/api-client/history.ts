import type { ExecutionDto } from "@/lib/types";
import { apiFetch, parseJson } from "./http";

export async function fetchHistory(deviceId?: string): Promise<ExecutionDto[]> {
  const q =
    deviceId && deviceId.length > 0
      ? `?deviceId=${encodeURIComponent(deviceId)}`
      : "";
  const res = await apiFetch(`/api/history${q}`, { cache: "no-store" });
  const json = await parseJson<{ data: ExecutionDto[] }>(res);
  if (!res.ok) throw new Error(json.message ?? "Erro ao carregar histórico");
  return json.data ?? [];
}
