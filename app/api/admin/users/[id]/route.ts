import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "@/lib/auth/password";
import { requireAdmin } from "@/lib/auth/require-session";
import { prisma } from "@/db/prisma";
import { readJsonBody, zodErrorMessage } from "@/lib/http/request";
import { logRouteError, jsonInternalError } from "@/lib/internal-error";
import type { IdRouteContext } from "@/lib/types/app-router";

const patchUserSchema = z.object({
  password: z.string().min(8, "Senha com pelo menos 8 caracteres").optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
});

export async function PATCH(request: Request, context: IdRouteContext) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await context.params;
  const raw = await readJsonBody(request);
  const parsed = patchUserSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { message: zodErrorMessage(parsed.error) },
      { status: 400 },
    );
  }

  if (!parsed.data.password && parsed.data.role === undefined) {
    return NextResponse.json(
      { message: "Informe nova senha ou papel" },
      { status: 400 },
    );
  }

  try {
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 });
    }

    const data: { passwordHash?: string; role?: "USER" | "ADMIN" } = {};
    if (parsed.data.password) {
      data.passwordHash = await hashPassword(parsed.data.password);
    }
    if (parsed.data.role !== undefined) {
      data.role = parsed.data.role;
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json({
      data: {
        id: updated.id,
        email: updated.email,
        role: updated.role,
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch (e) {
    logRouteError("admin/users:PATCH", e, { request, ids: { userId: id } });
    return jsonInternalError({ message: "Erro ao atualizar usuário" });
  }
}
