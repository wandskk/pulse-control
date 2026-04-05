/** Transporte compartilhado do cliente browser → API interna. */
import { GLOBAL_LOADING_EXCLUDED_API_PATHS } from "@/lib/global-loading/excluded-paths";
import {
  beginGlobalLoading,
  endGlobalLoading,
} from "@/lib/global-loading/store";

function resolveRequestPath(input: RequestInfo | URL): string {
  if (typeof input === "string") {
    const s = input.trim();
    if (s.startsWith("/")) {
      return s.split("?")[0] ?? s;
    }
    try {
      return new URL(s).pathname;
    } catch {
      return s;
    }
  }
  if (input instanceof URL) return input.pathname;
  return new URL(input.url).pathname;
}

function shouldTrackGlobalLoading(input: RequestInfo | URL): boolean {
  if (typeof window === "undefined") return false;
  const path = resolveRequestPath(input);
  if (GLOBAL_LOADING_EXCLUDED_API_PATHS.has(path)) return false;
  return true;
}

export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const track = shouldTrackGlobalLoading(input);
  if (track) beginGlobalLoading();
  try {
    const res = await fetch(input, {
      ...init,
      credentials: "same-origin",
    });
    if (res.status === 401 && typeof window !== "undefined") {
      window.location.assign("/login");
    }
    return res;
  } finally {
    if (track) endGlobalLoading();
  }
}

export async function parseJson<T>(
  res: Response,
): Promise<T & { message?: string }> {
  const text = await res.text();
  if (!text) return {} as T & { message?: string };
  try {
    return JSON.parse(text) as T & { message?: string };
  } catch {
    return {} as T & { message?: string };
  }
}
