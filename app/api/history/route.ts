import { type NextRequest, NextResponse } from "next/server";
import { requireSessionWhenConfigured } from "@/lib/auth/require-session";
import { prisma } from "@/db/prisma";
import { toExecutionDto } from "@/lib/types";
import { logRouteError, jsonInternalError } from "@/lib/internal-error";

const MAX = 100;

export async function GET(request: NextRequest) {
  const auth = await requireSessionWhenConfigured(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth.user?.userId ?? null;

  const deviceId = request.nextUrl.searchParams.get("deviceId")?.trim();

  try {
    const list = await prisma.execution.findMany({
      where: {
        ...(userId !== null ? { device: { userId } } : {}),
        ...(deviceId && deviceId.length > 0 ? { deviceId } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: MAX,
      include: {
        device: { select: { name: true } },
        command: { select: { title: true } },
      },
    });

    return NextResponse.json({
      data: list.map((row) => toExecutionDto(row)),
    });
  } catch (e) {
    logRouteError("history:GET", e, {
      request,
      ...(deviceId ? { ids: { deviceId } } : {}),
    });
    return jsonInternalError({ message: "Erro ao listar histórico" });
  }
}
