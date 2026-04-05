import { type NextRequest, NextResponse } from "next/server";
import { commandCreateSchema } from "@/lib/validators/commands";
import { requireSessionWhenConfigured } from "@/lib/auth/require-session";
import { prisma } from "@/db/prisma";
import { findDeviceScoped } from "@/lib/server/devices";
import { toCommandDto } from "@/lib/types";
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
    const category = request.nextUrl.searchParams.get("category")?.trim() ?? "";
    const where =
      category === "" || category === "all"
        ? { deviceId, isActive: true as const }
        : category === "none"
          ? { deviceId, isActive: true as const, categoryId: null }
          : { deviceId, isActive: true as const, categoryId: category };

    const list = await prisma.command.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return NextResponse.json({ data: list.map(toCommandDto) });
  } catch (e) {
    logRouteError("commands:GET", e, { request, ids: { deviceId } });
    return jsonInternalError({ message: "Erro ao listar comandos" });
  }
}

export async function POST(request: Request) {
  const auth = await requireSessionWhenConfigured(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth.user?.userId ?? null;

  const raw = await readJsonBody(request);
  const parsed = commandCreateSchema.safeParse(raw);
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

    const categoryId = parsed.data.categoryId ?? null;
    if (categoryId !== null) {
      const cat = await prisma.category.findFirst({
        where: {
          id: categoryId,
          deviceId: parsed.data.deviceId,
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

    const last = await prisma.command.findFirst({
      where: { deviceId: parsed.data.deviceId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    const sortOrder = (last?.sortOrder ?? -1) + 1;
    const created = await prisma.command.create({
      data: {
        deviceId: parsed.data.deviceId,
        title: parsed.data.title,
        message: parsed.data.message,
        color: parsed.data.color,
        categoryId,
        sortOrder,
      },
    });
    return NextResponse.json({ data: toCommandDto(created) }, { status: 201 });
  } catch (e) {
    logRouteError("commands:POST", e, {
      request,
      ids: { deviceId: parsed.data.deviceId },
    });
    return jsonInternalError({ message: "Erro ao criar comando" });
  }
}
