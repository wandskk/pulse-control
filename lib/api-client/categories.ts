import type { CategoryDto } from "@/lib/types";
import { apiFetch, parseJson } from "./http";

export async function fetchCategories(deviceId: string): Promise<CategoryDto[]> {
  const res = await apiFetch(
    `/api/categories?deviceId=${encodeURIComponent(deviceId)}`,
    { cache: "no-store" },
  );
  const json = await parseJson<{ data: CategoryDto[] }>(res);
  if (!res.ok) throw new Error(json.message ?? "Erro ao carregar categorias");
  return json.data ?? [];
}

export async function createCategory(
  body: Record<string, unknown>,
): Promise<CategoryDto> {
  const res = await apiFetch("/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await parseJson<{ data: CategoryDto }>(res);
  if (!res.ok) throw new Error(json.message ?? "Erro ao criar categoria");
  if (!json.data) throw new Error("Resposta inválida");
  return json.data;
}

export async function updateCategory(
  id: string,
  body: Record<string, unknown>,
): Promise<CategoryDto> {
  const res = await apiFetch(`/api/categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await parseJson<{ data: CategoryDto }>(res);
  if (!res.ok) throw new Error(json.message ?? "Erro ao atualizar categoria");
  if (!json.data) throw new Error("Resposta inválida");
  return json.data;
}

export async function deleteCategory(id: string): Promise<void> {
  const res = await apiFetch(`/api/categories/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const json = await parseJson<{ message?: string }>(res);
    throw new Error(json.message ?? "Erro ao remover categoria");
  }
}
