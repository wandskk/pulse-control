import { apiFetch, parseJson } from "./http";
import type { ExecuteResponse } from "@/lib/types/execute";

export type { ExecuteResponse } from "@/lib/types/execute";

export async function executeCommand(
  deviceId: string,
  commandId: string,
): Promise<ExecuteResponse> {
  const res = await apiFetch("/api/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deviceId, commandId }),
  });
  const json = await parseJson<ExecuteResponse & { message?: string }>(res);

  if (res.status === 400 || res.status === 404) {
    throw new Error(
      typeof json.message === "string" ? json.message : "Requisição inválida",
    );
  }

  if (res.status === 429) {
    throw new Error(
      typeof json.message === "string"
        ? json.message
        : "Muitas tentativas. Aguarde.",
    );
  }

  if (!res.ok) {
    throw new Error(
      typeof json.message === "string"
        ? json.message
        : "Erro ao executar comando",
    );
  }

  if (!json || typeof json !== "object" || !("success" in json)) {
    throw new Error("Resposta inválida do servidor");
  }

  return json as ExecuteResponse;
}
