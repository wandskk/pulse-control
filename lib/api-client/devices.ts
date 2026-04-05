import type { DeviceDto } from "@/lib/types";
import { apiFetch, parseJson } from "./http";

export async function fetchDevices(): Promise<DeviceDto[]> {
  const res = await apiFetch("/api/devices", { cache: "no-store" });
  const json = await parseJson<{ data: DeviceDto[] }>(res);
  if (!res.ok) throw new Error(json.message ?? "Erro ao carregar números");
  return json.data ?? [];
}

export async function createDevice(
  body: Record<string, unknown>,
): Promise<DeviceDto> {
  const res = await apiFetch("/api/devices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await parseJson<{ data: DeviceDto }>(res);
  if (!res.ok) throw new Error(json.message ?? "Erro ao criar número");
  if (!json.data) throw new Error("Resposta inválida");
  return json.data;
}

export async function updateDevice(
  id: string,
  body: Record<string, unknown>,
): Promise<DeviceDto> {
  const res = await apiFetch(`/api/devices/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await parseJson<{ data: DeviceDto }>(res);
  if (!res.ok) throw new Error(json.message ?? "Erro ao atualizar número");
  if (!json.data) throw new Error("Resposta inválida");
  return json.data;
}

export async function deleteDevice(id: string): Promise<void> {
  const res = await apiFetch(`/api/devices/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const json = await parseJson<{ message?: string }>(res);
    throw new Error(json.message ?? "Erro ao remover número");
  }
}
