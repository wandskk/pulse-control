import { NextResponse } from "next/server";
import { commandPatchSchema } from "@/lib/validators/commands";
import { requireSessionWhenConfigured } from "@/lib/auth/require-session";
import { prisma } from "@/db/prisma";
import { toCommandDto } from "@/lib/types";
import { readJsonBody, zodErrorMessage } from "@/lib/http/request";
import { logRouteError, jsonInternalError } from "@/lib/internal-error";
import type { IdRouteContext } from "@/lib/types/app-router";

export async function PATCH(request: Request, context: IdRouteContext) {
  const auth = await requireSessionWhenConfigured(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth.user?.userId ?? null;

  const { id } = await context.params;
  const raw = await readJsonBody(request);
  const parsed = commandPatchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { message: zodErrorMessage(parsed.error) },
      { status: 400 },
    );
  }
  try {
    const existing = await prisma.command.findFirst({
      where: {
        id,
        isActive: true,
        ...(userId !== null ? { device: { userId } } : {}),
      },
    });
    if (!existing) {
      return NextResponse.json({ message: "Comando não encontrado" }, { status: 404 });
    }

    if (parsed.data.categoryId !== undefined) {
      const next = parsed.data.categoryId;
      if (next !== null) {
        const cat = await prisma.category.findFirst({
          where: {
            id: next,
            deviceId: existing.deviceId,
            isActive: true,
          },
        });
        if (!cat) {
          return NextResponse.json(
            { message: "Categoria não encontrada neste número" },
            { status: 400 },
          );
        }
      }
    }

    const updated = await prisma.command.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json({ data: toCommandDto(updated) });
  } catch (e) {
    logRouteError("commands:PATCH", e, { request, ids: { commandId: id } });
    return jsonInternalError({ message: "Erro ao atualizar comando" });
  }
}

export async function DELETE(request: Request, context: IdRouteContext) {
  const auth = await requireSessionWhenConfigured(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth.user?.userId ?? null;

  const { id } = await context.params;
  try {
    const existing = await prisma.command.findFirst({
      where: {
        id,
        isActive: true,
        ...(userId !== null ? { device: { userId } } : {}),
      },
    });
    if (!existing) {
      return NextResponse.json({ message: "Comando não encontrado" }, { status: 404 });
    }
    await prisma.command.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    logRouteError("commands:DELETE", e, { request, ids: { commandId: id } });
    return jsonInternalError({ message: "Erro ao remover comando" });
  }
}
