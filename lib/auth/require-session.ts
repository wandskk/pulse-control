import { NextResponse } from "next/server";
import { isAuthConfigured } from "@/lib/auth/config";
import { getSessionFromRequestPlain } from "@/lib/auth/session";
import type { AuthenticatedUser } from "@/lib/types/auth";

export type { AuthenticatedUser } from "@/lib/types/auth";

/**
 * Com AUTH_SECRET definido, exige JWT válido.
 * Sem AUTH_SECRET (modo aberto legado), retorna `user: null`.
 */
export async function requireSessionWhenConfigured(
  request: Request,
): Promise<{ user: AuthenticatedUser } | { user: null } | NextResponse> {
  if (!isAuthConfigured()) {
    return { user: null };
  }
  const session = await getSessionFromRequestPlain(request);
  if (!session) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }
  return {
    user: {
      userId: session.sub,
      email: session.email,
      role: session.role,
    },
  };
}

export async function requireAdmin(
  request: Request,
): Promise<{ user: AuthenticatedUser } | NextResponse> {
  if (!isAuthConfigured()) {
    return NextResponse.json(
      { message: "Gerenciamento de contas exige AUTH_SECRET e login." },
      { status: 403 },
    );
  }
  const session = await getSessionFromRequestPlain(request);
  if (!session) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }
  if (session.role !== "ADMIN") {
    return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
  }
  return {
    user: {
      userId: session.sub,
      email: session.email,
      role: session.role,
    },
  };
}
