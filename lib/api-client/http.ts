/** Transporte compartilhado do cliente browser → API interna. */
export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const res = await fetch(input, {
    ...init,
    credentials: "same-origin",
  });
  if (res.status === 401 && typeof window !== "undefined") {
    window.location.assign("/login");
  }
  return res;
}

export async function parseJson<T>(res: Response): Promise<T & { message?: string }> {
  const text = await res.text();
  if (!text) return {} as T & { message?: string };
  try {
    return JSON.parse(text) as T & { message?: string };
  } catch {
    return {} as T & { message?: string };
  }
}
