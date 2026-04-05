import { NextResponse } from "next/server";
import { z } from "zod";
import { isAuthConfigured } from "@/lib/auth/config";
import { verifyPassword } from "@/lib/auth/password";
import { SESSION_COOKIE, signSessionToken } from "@/lib/auth/session";
import { readJsonBody, zodErrorMessage } from "@/lib/http/request";
import { logRouteError, jsonInternalError } from "@/lib/internal-error";
import { prisma } from "@/db/prisma";
import { clientIpFromRequest, rateLimitAllow } from "@/lib/rate-limit";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
});

export async function POST(request: Request) {
  if (!isAuthConfigured()) {
    return NextResponse.json(
      { message: "Autenticação não está habilitada no servidor (defina AUTH_SECRET)" },
      { status: 400 },
    );
  }

  const ip = clientIpFromRequest(request);
  if (!rateLimitAllow(`login:${ip}`, 15, 60_000)) {
    return NextResponse.json(
      { message: "Muitas tentativas. Aguarde um minuto." },
      { status: 429 },
    );
  }

  const raw = await readJsonBody(request);
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { message: zodErrorMessage(parsed.error) },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.trim().toLowerCase() },
    });
    if (!user) {
      return NextResponse.json(
        { message: "E-mail ou senha incorretos" },
        { status: 401 },
      );
    }

    const ok = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { message: "E-mail ou senha incorretos" },
        { status: 401 },
      );
    }

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
    logRouteError("auth/login", e, { request });
    return jsonInternalError({ message: "Erro ao iniciar sessão" });
  }
}
