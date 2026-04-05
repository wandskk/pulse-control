import { type NextRequest, NextResponse } from "next/server";
import { categoryCreateSchema } from "@/lib/validators/categories";
import { requireSessionWhenConfigured } from "@/lib/auth/require-session";
import { prisma } from "@/db/prisma";
import { findDeviceScoped } from "@/lib/server/devices";
import { toCategoryDto } from "@/lib/types";
import { readJsonBody, zodErrorMessage } from "@/lib/http/request";
import { logRouteError, jsonInternalError } from "@/lib/internal-error";

export async function GET(request: NextRequest) {
  const auth = await requireSessionWhenConfigured(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth.user?.userId ?? null;

  const deviceId = request.nextUrl.searchParams.get("deviceId");
  if (!deviceId?.trim()) {
    return NextResponse.json(
      { message: "Parâmetro deviceId é obrigatório" },
      { status: 400 },
    );
  }
  try {
    const device = await findDeviceScoped(deviceId, userId);
    if (!device) {
      return NextResponse.json({ message: "Dispositivo não encontrado" }, { status: 404 });
    }
    const list = await prisma.category.findMany({
      where: { deviceId, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return NextResponse.json({ data: list.map(toCategoryDto) });
  } catch (e) {
    logRouteError("categories:GET", e, { request, ids: { deviceId } });
    return jsonInternalError({ message: "Erro ao listar categorias" });
  }
}

export async function POST(request: Request) {
  const auth = await requireSessionWhenConfigured(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth.user?.userId ?? null;

  const raw = await readJsonBody(request);
  const parsed = categoryCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { message: zodErrorMessage(parsed.error) },
      { status: 400 },
    );
  }
  try {
    const device = await findDeviceScoped(parsed.data.deviceId, userId);
    if (!device) {
      return NextResponse.json({ message: "Dispositivo não encontrado" }, { status: 404 });
    }
    const last = await prisma.category.findFirst({
      where: { deviceId: parsed.data.deviceId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    const sortOrder = (last?.sortOrder ?? -1) + 1;
    const created = await prisma.category.create({
      data: {
        deviceId: parsed.data.deviceId,
        name: parsed.data.name,
        sortOrder,
      },
    });
    return NextResponse.json({ data: toCategoryDto(created) }, { status: 201 });
  } catch (e) {
    logRouteError("categories:POST", e, {
      request,
      ids: { deviceId: parsed.data.deviceId },
    });
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
    return jsonInternalError({ message: "Erro ao criar categoria" });
  }
}
