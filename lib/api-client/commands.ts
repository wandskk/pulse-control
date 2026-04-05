import type { CommandDto } from "@/lib/types";
import { apiFetch, parseJson } from "./http";

export async function fetchCommands(
  deviceId: string,
  category: "all" | "none" | string = "all",
): Promise<CommandDto[]> {
  const params = new URLSearchParams({ deviceId });
  if (category !== "all") {
    params.set("category", category);
  }
  const res = await apiFetch(`/api/commands?${params.toString()}`, {
    cache: "no-store",
  });
  const json = await parseJson<{ data: CommandDto[] }>(res);
  if (!res.ok) throw new Error(json.message ?? "Erro ao carregar botões");
  return json.data ?? [];
}

export async function createCommand(
  body: Record<string, unknown>,
): Promise<CommandDto> {
  const res = await apiFetch("/api/commands", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await parseJson<{ data: CommandDto }>(res);
  if (!res.ok) throw new Error(json.message ?? "Erro ao criar botão");
  if (!json.data) throw new Error("Resposta inválida");
  return json.data;
}

export async function updateCommand(
  id: string,
  body: Record<string, unknown>,
): Promise<CommandDto> {
  const res = await apiFetch(`/api/commands/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await parseJson<{ data: CommandDto }>(res);
  if (!res.ok) throw new Error(json.message ?? "Erro ao atualizar botão");
  if (!json.data) throw new Error("Resposta inválida");
  return json.data;
}

export async function deleteCommand(id: string): Promise<void> {
  const res = await apiFetch(`/api/commands/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const json = await parseJson<{ message?: string }>(res);
    throw new Error(json.message ?? "Erro ao remover botão");
  }
}
