import { NextResponse } from "next/server";
import { deviceCreateSchema } from "@/lib/validators/devices";
import { requireSessionWhenConfigured } from "@/lib/auth/require-session";
import { prisma } from "@/db/prisma";
import { toDeviceDto } from "@/lib/types";
import { readJsonBody, zodErrorMessage } from "@/lib/http/request";
import { logRouteError, jsonInternalError } from "@/lib/internal-error";

export async function GET(request: Request) {
  const auth = await requireSessionWhenConfigured(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const list = await prisma.device.findMany({
      where: auth.user
        ? { userId: auth.user.userId, isActive: true }
        : { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: list.map(toDeviceDto) });
  } catch (e) {
    logRouteError("devices:GET", e, { request });
    return jsonInternalError({ message: "Erro ao listar dispositivos" });
  }
}

export async function POST(request: Request) {
  const auth = await requireSessionWhenConfigured(request);
  if (auth instanceof NextResponse) return auth;

  const raw = await readJsonBody(request);
  const parsed = deviceCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { message: zodErrorMessage(parsed.error) },
      { status: 400 },
    );
  }
  try {
    const created = await prisma.device.create({
      data: {
        ...parsed.data,
        userId: auth.user?.userId ?? null,
      },
    });
    return NextResponse.json({ data: toDeviceDto(created) }, { status: 201 });
  } catch (e) {
    logRouteError("devices:POST", e, { request });
    return jsonInternalError({ message: "Erro ao criar dispositivo" });
  }
}
