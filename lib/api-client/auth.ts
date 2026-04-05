import { apiFetch, parseJson } from "./http";
import type {
  AdminUserRow,
  AuthSessionInfo,
  AuthSessionUser,
} from "@/lib/types/auth";

/** Alias legado do cliente — mesmo que `AuthSessionUser`. */
export type SessionUser = AuthSessionUser;
export type { AdminUserRow, AuthSessionInfo } from "@/lib/types/auth";

export async function fetchAuthSession(): Promise<AuthSessionInfo> {
  const res = await apiFetch("/api/auth/session", {
    cache: "no-store",
  });
  const json = await parseJson<
    AuthSessionInfo & { user?: AuthSessionUser | null }
  >(res);
  if (!res.ok) {
    return { authRequired: false, authenticated: true, user: null };
  }
  return {
    authRequired: Boolean(json.authRequired),
    authenticated: Boolean(json.authenticated),
    user: json.user ?? null,
  };
}

export async function fetchAdminUsers(): Promise<AdminUserRow[]> {
  const res = await apiFetch("/api/admin/users", { cache: "no-store" });
  const json = await parseJson<{ data: AdminUserRow[] }>(res);
  if (!res.ok) throw new Error(json.message ?? "Erro ao listar contas");
  return json.data ?? [];
}

export async function createAdminUser(body: {
  email: string;
  password: string;
  role: "USER" | "ADMIN";
}): Promise<AdminUserRow> {
  const res = await apiFetch("/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await parseJson<{ data: AdminUserRow }>(res);
  if (!res.ok) throw new Error(json.message ?? "Erro ao criar conta");
  if (!json.data) throw new Error("Resposta inválida");
  return json.data;
}

export async function patchAdminUser(
  id: string,
  body: { password?: string; role?: "USER" | "ADMIN" },
): Promise<AdminUserRow> {
  const res = await apiFetch(`/api/admin/users/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await parseJson<{ data: AdminUserRow }>(res);
  if (!res.ok) throw new Error(json.message ?? "Erro ao atualizar usuário");
  if (!json.data) throw new Error("Resposta inválida");
  return json.data;
}

export async function changeOwnPassword(body: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  const res = await apiFetch("/api/auth/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await parseJson<{ message?: string }>(res);
  if (!res.ok) throw new Error(json.message ?? "Erro ao alterar senha");
}

export async function logoutSession(): Promise<void> {
  await apiFetch("/api/auth/logout", { method: "POST" });
}
