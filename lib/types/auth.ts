import type { UserRole } from "@prisma/client";

/** Claims do JWT após `jwtVerify` */
export type SessionClaims = {
  sub: string;
  email: string;
  role: UserRole;
};

/** Usuário retornado por `/api/auth/session` (cliente) */
export type AuthSessionUser = {
  id: string;
  email: string;
  role: "ADMIN" | "USER";
};

export type AuthSessionInfo = {
  authRequired: boolean;
  authenticated: boolean;
  user: AuthSessionUser | null;
};

/** Linha da tabela em `/admin` */
export type AdminUserRow = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
};

/** Usuário após `requireSessionWhenConfigured` / `requireAdmin` (rotas API) */
export type AuthenticatedUser = {
  userId: string;
  email: string;
  role: UserRole;
};
