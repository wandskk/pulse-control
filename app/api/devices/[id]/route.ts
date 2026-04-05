import { NextResponse } from "next/server";
import { devicePatchSchema } from "@/lib/validators/devices";
import { requireSessionWhenConfigured } from "@/lib/auth/require-session";
import { prisma } from "@/db/prisma";
import { findDeviceScoped } from "@/lib/server/devices";
import { toDeviceDto } from "@/lib/types";
import { readJsonBody, zodErrorMessage } from "@/lib/http/request";
import { logRouteError, jsonInternalError } from "@/lib/internal-error";
import type { IdRouteContext } from "@/lib/types/app-router";

export async function PATCH(request: Request, context: IdRouteContext) {
  const auth = await requireSessionWhenConfigured(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth.user?.userId ?? null;

  const { id } = await context.params;
  const raw = await readJsonBody(request);
  const parsed = devicePatchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { message: zodErrorMessage(parsed.error) },
      { status: 400 },
    );
  }
  try {
    const existing = await findDeviceScoped(id, userId);
    if (!existing) {
      return NextResponse.json({ message: "Dispositivo não encontrado" }, { status: 404 });
    }
    const updated = await prisma.device.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json({ data: toDeviceDto(updated) });
  } catch (e) {
    logRouteError("devices:PATCH", e, { request, ids: { deviceId: id } });
    return jsonInternalError({ message: "Erro ao atualizar dispositivo" });
  }
}

export async function DELETE(request: Request, context: IdRouteContext) {
  const auth = await requireSessionWhenConfigured(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth.user?.userId ?? null;

  const { id } = await context.params;
  try {
    const existing = await findDeviceScoped(id, userId);
    if (!existing) {
      return NextResponse.json({ message: "Dispositivo não encontrado" }, { status: 404 });
    }
    await prisma.device.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    logRouteError("devices:DELETE", e, { request, ids: { deviceId: id } });
    return jsonInternalError({ message: "Erro ao remover dispositivo" });
  }
}
