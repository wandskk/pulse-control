import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { requireSessionWhenConfigured } from "@/lib/auth/require-session";
import { readJsonBody, zodErrorMessage } from "@/lib/http/request";
import { logRouteError, jsonInternalError } from "@/lib/internal-error";
import { prisma } from "@/db/prisma";
import { clientIpFromRequest, rateLimitAllow } from "@/lib/rate-limit";

const bodySchema = z.object({
  currentPassword: z.string().min(1, "Informe a senha atual"),
  newPassword: z.string().min(8, "Nova senha com pelo menos 8 caracteres"),
});

export async function POST(request: Request) {
  const auth = await requireSessionWhenConfigured(request);
  if (auth instanceof NextResponse) return auth;
  if (!auth.user) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  const ip = clientIpFromRequest(request);
  if (!rateLimitAllow(`change-password:${ip}`, 10, 60_000)) {
    return NextResponse.json(
      { message: "Muitas tentativas. Aguarde um minuto." },
      { status: 429 },
    );
  }

  const raw = await readJsonBody(request);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { message: zodErrorMessage(parsed.error) },
      { status: 400 },
    );
  }

  const { currentPassword, newPassword } = parsed.data;
  if (currentPassword === newPassword) {
    return NextResponse.json(
      { message: "A nova senha deve ser diferente da atual" },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.user.userId },
    });
    if (!user) {
      return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 });
    }

    const ok = await verifyPassword(currentPassword, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { message: "Senha atual incorreta" },
        { status: 401 },
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(newPassword) },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    logRouteError("auth/change-password", e, {
      request,
      ids: { userId: auth.user.userId },
    });
    return jsonInternalError({ message: "Erro ao atualizar senha" });
  }
}
