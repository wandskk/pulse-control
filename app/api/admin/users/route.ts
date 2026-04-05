import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "@/lib/auth/password";
import { requireAdmin } from "@/lib/auth/require-session";
import { prisma } from "@/db/prisma";
import { readJsonBody, zodErrorMessage } from "@/lib/http/request";
import { logRouteError, jsonInternalError } from "@/lib/internal-error";

const createUserSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Senha com pelo menos 8 caracteres"),
  role: z.enum(["USER", "ADMIN"]).optional(),
});

function toUserPublic(u: {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
}) {
  return {
    id: u.id,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
  };
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const list = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, role: true, createdAt: true },
    });
    return NextResponse.json({ data: list.map(toUserPublic) });
  } catch (e) {
    logRouteError("admin/users:GET", e, { request });
    return jsonInternalError({ message: "Erro ao listar usuários" });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const raw = await readJsonBody(request);
  const parsed = createUserSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { message: zodErrorMessage(parsed.error) },
      { status: 400 },
    );
  }

  const email = parsed.data.email.trim().toLowerCase();

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { message: "Já existe uma conta com este e-mail" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const role = parsed.data.role ?? "USER";
    const created = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
      },
      select: { id: true, email: true, role: true, createdAt: true },
    });
    return NextResponse.json({ data: toUserPublic(created) }, { status: 201 });
  } catch (e) {
    logRouteError("admin/users:POST", e, { request });
    return jsonInternalError({ message: "Erro ao criar usuário" });
  }
}
