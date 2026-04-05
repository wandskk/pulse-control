import { NextResponse } from "next/server";
import { categoryPatchSchema } from "@/lib/validators/categories";
import { requireSessionWhenConfigured } from "@/lib/auth/require-session";
import { prisma } from "@/db/prisma";
import { toCategoryDto } from "@/lib/types";
import { readJsonBody, zodErrorMessage } from "@/lib/http/request";
import { logRouteError, jsonInternalError } from "@/lib/internal-error";
import type { IdRouteContext } from "@/lib/types/app-router";

export async function PATCH(request: Request, context: IdRouteContext) {
  const auth = await requireSessionWhenConfigured(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth.user?.userId ?? null;

  const { id } = await context.params;
  const raw = await readJsonBody(request);
  const parsed = categoryPatchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { message: zodErrorMessage(parsed.error) },
      { status: 400 },
    );
  }
  try {
    const existing = await prisma.category.findFirst({
      where: {
        id,
        isActive: true,
        ...(userId !== null ? { device: { userId } } : {}),
      },
    });
    if (!existing) {
      return NextResponse.json({ message: "Categoria não encontrada" }, { status: 404 });
    }
    const updated = await prisma.category.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json({ data: toCategoryDto(updated) });
  } catch (e) {
    logRouteError("categories:PATCH", e, { request, ids: { categoryId: id } });
    if (
      e &&
      typeof e === "object" &&
      "code" in e &&
      (e as { code?: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { message: "Já existe uma categoria com esse nome neste número." },
        { status: 409 },
      );
    }
    return jsonInternalError({ message: "Erro ao atualizar categoria" });
  }
}

export async function DELETE(request: Request, context: IdRouteContext) {
  const auth = await requireSessionWhenConfigured(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth.user?.userId ?? null;

  const { id } = await context.params;
  try {
    const existing = await prisma.category.findFirst({
      where: {
        id,
        isActive: true,
        ...(userId !== null ? { device: { userId } } : {}),
      },
    });
    if (!existing) {
      return NextResponse.json({ message: "Categoria não encontrada" }, { status: 404 });
    }
    await prisma.category.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    logRouteError("categories:DELETE", e, { request, ids: { categoryId: id } });
    return jsonInternalError({ message: "Erro ao remover categoria" });
  }
}
