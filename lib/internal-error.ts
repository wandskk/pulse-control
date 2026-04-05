import { NextResponse } from "next/server";
import type { RouteErrorLogOptions } from "@/lib/types/internal";

export type { RouteErrorLogOptions } from "@/lib/types/internal";

const requestIdByRequest = new WeakMap<Request, string>();

/**
 * ID estável por instância de Request (headers ou UUID) para correlacionar logs.
 */
function getRequestIdForLog(request: Request): string {
  const cached = requestIdByRequest.get(request);
  if (cached) return cached;
  const fromHeader =
    request.headers.get("x-request-id")?.trim() ||
    request.headers.get("x-vercel-id")?.trim()?.slice(0, 40);
  const id = fromHeader || crypto.randomUUID();
  requestIdByRequest.set(request, id);
  return id;
}

function sanitizeIds(
  ids: Record<string, string | undefined>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(ids)) {
    if (v == null || v === "") continue;
    out[k] = v.length > 80 ? `${v.slice(0, 77)}...` : v;
  }
  return out;
}

/**
 * Registra erro sem expor detalhes ao cliente. Em produção, não envia stack ao log JSON.
 */
export function logRouteError(
  route: string,
  error: unknown,
  options?: RouteErrorLogOptions,
): void {
  const msg = error instanceof Error ? error.message : String(error);
  const requestId = options?.request
    ? getRequestIdForLog(options.request)
    : undefined;
  const method = options?.method ?? options?.request?.method;

  const prismaCode =
    error &&
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string"
      ? (error as { code: string }).code
      : undefined;

  const payload: Record<string, unknown> = {
    scope: "pulse-control",
    route,
    ...(requestId ? { requestId } : {}),
    ...(method ? { method } : {}),
    ...(options?.ids && Object.keys(sanitizeIds(options.ids)).length > 0
      ? { ids: sanitizeIds(options.ids) }
      : {}),
    ...(prismaCode ? { prismaCode } : {}),
    message: msg,
  };

  if (process.env.NODE_ENV === "development" && error instanceof Error) {
    payload.stack = error.stack;
  }

  console.error(JSON.stringify(payload));
}

export function jsonInternalError(
  body: Record<string, unknown> = { message: "Erro interno do servidor" },
): NextResponse {
  return NextResponse.json(body, { status: 500 });
}
