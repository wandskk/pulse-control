import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "@/lib/auth/password";
import { SESSION_COOKIE, signSessionToken } from "@/lib/auth/session";
import { readJsonBody, zodErrorMessage } from "@/lib/http/request";
import { logRouteError, jsonInternalError } from "@/lib/internal-error";
import { prisma } from "@/db/prisma";
import { clientIpFromRequest, rateLimitAllow } from "@/lib/rate-limit";

const bootstrapSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Senha com pelo menos 8 caracteres"),
});

/** Indica se ainda não existe nenhum usuário (primeiro acesso). */
export async function GET() {
  try {
    const count = await prisma.user.count();
    return NextResponse.json({ needsBootstrap: count === 0 });
  } catch (e) {
    logRouteError("auth/bootstrap:GET", e);
    return jsonInternalError({ message: "Erro ao verificar estado" });
  }
}

/**
 * Cria o primeiro administrador quando o banco está vazio.
 * Exige BOOTSTRAP_ADMIN_EMAIL e BOOTSTRAP_ADMIN_PASSWORD no servidor iguais ao corpo da requisição.
 */
export async function POST(request: Request) {
  const ip = clientIpFromRequest(request);
  if (!rateLimitAllow(`bootstrap:${ip}`, 5, 60_000)) {
    return NextResponse.json(
      { message: "Muitas tentativas. Aguarde um minuto." },
      { status: 429 },
    );
  }

  try {
    const count = await prisma.user.count();
    if (count > 0) {
      return NextResponse.json(
        { message: "Contas já foram criadas. Use o login." },
        { status: 400 },
      );
    }

    const expectedEmail = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
    const expectedPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD;
    if (!expectedEmail || !expectedPassword) {
      return NextResponse.json(
        {
          message:
            "Configure BOOTSTRAP_ADMIN_EMAIL e BOOTSTRAP_ADMIN_PASSWORD no servidor ou execute o seed.",
        },
        { status: 503 },
      );
    }

    const raw = await readJsonBody(request);
    const parsed = bootstrapSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { message: zodErrorMessage(parsed.error) },
        { status: 400 },
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    if (email !== expectedEmail || parsed.data.password !== expectedPassword) {
      return NextResponse.json(
        { message: "Dados de bootstrap inválidos" },
        { status: 401 },
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "ADMIN",
      },
    });

    await prisma.device.updateMany({
      where: { userId: null },
      data: { userId: user.id },
    });

    const token = await signSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e) {
    logRouteError("auth/bootstrap:POST", e, { request });
    return jsonInternalError({ message: "Erro ao criar administrador" });
  }
}
