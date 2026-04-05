import { NextResponse } from "next/server";
import { executeBodySchema } from "@/lib/validators/execute";
import { isAuthConfigured } from "@/lib/auth/config";
import { getSessionFromRequestPlain } from "@/lib/auth/session";
import { readJsonBody, zodErrorMessage } from "@/lib/http/request";
import { logRouteError } from "@/lib/internal-error";
import { clientIpFromRequest, rateLimitAllow } from "@/lib/rate-limit";
import { executeCommandAndPersist } from "@/lib/server/executions/execute-command";

export async function POST(request: Request) {
  const raw = await readJsonBody(request);
  const parsed = executeBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false as const, message: zodErrorMessage(parsed.error) },
      { status: 400 },
    );
  }

  const ip = clientIpFromRequest(request);
  if (!rateLimitAllow(`execute:${ip}`, 30, 60_000)) {
    return NextResponse.json(
      {
        success: false as const,
        message: "Muitas execuções. Aguarde um minuto e tente de novo.",
      },
      { status: 429 },
    );
  }

  const { deviceId, commandId } = parsed.data;
  const session = await getSessionFromRequestPlain(request);

  if (isAuthConfigured() && !session) {
    return NextResponse.json(
      { success: false as const, message: "Não autorizado" },
      { status: 401 },
    );
  }

  const scopedUserId = session?.sub ?? null;
  const actorSub = session?.sub ?? null;

  try {
    const result = await executeCommandAndPersist({
      deviceId,
      commandId,
      scopedUserId,
      actorSub,
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          success: false as const,
          message:
            result.reason === "device_not_found"
              ? "Dispositivo não encontrado"
              : "Comando não encontrado",
        },
        { status: 404 },
      );
    }

    if (result.sendOk) {
      return NextResponse.json({
        success: true as const,
        executionId: result.executionId,
        provider: result.provider,
        providerMessageId: result.providerMessageId ?? undefined,
      });
    }

    const clientMessage =
      result.providerError?.includes("SMSDEV_KEY") || !result.apiKeyConfigured
        ? "Envio de comandos não configurado no servidor (defina SMSDEV_KEY)."
        : result.providerError?.trim()
          ? result.providerError.trim().slice(0, 400)
          : "Falha ao enviar comando";

    return NextResponse.json({
      success: false as const,
      message: clientMessage,
      executionId: result.executionId,
    });
  } catch (e) {
    logRouteError("execute:POST", e, {
      request,
      ids: { deviceId, commandId },
    });
    return NextResponse.json(
      {
        success: false as const,
        message: "Erro interno ao executar comando",
      },
      { status: 500 },
    );
  }
}
