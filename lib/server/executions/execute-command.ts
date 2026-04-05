import { prisma } from "@/db/prisma";
import type { ExecuteCommandPersistResult } from "@/lib/types/execute";
import { sendSmsViaSmsDev } from "@/lib/services/sms/smsdev";
import { findDeviceScoped } from "@/lib/server/devices";

const PROVIDER = "smsdev";

export async function executeCommandAndPersist(params: {
  deviceId: string;
  commandId: string;
  /** Mesma regra das outras rotas: sub do usuário ou null no modo aberto */
  scopedUserId: string | null;
  actorSub: string | null;
}): Promise<ExecuteCommandPersistResult> {
  const { deviceId, commandId, scopedUserId, actorSub } = params;

  const device = await findDeviceScoped(deviceId, scopedUserId);
  if (!device) {
    return { ok: false, reason: "device_not_found" };
  }

  const command = await prisma.command.findFirst({
    where: { id: commandId, deviceId, isActive: true },
  });
  if (!command) {
    return { ok: false, reason: "command_not_found" };
  }

  const apiKey = process.env.SMSDEV_KEY?.trim();
  const dryRun =
    process.env.NODE_ENV === "development" &&
    process.env.SMSDEV_DRY_RUN === "true";

  let sendOk: boolean;
  let providerMessageId: string | null;
  let providerError: string | null;

  if (dryRun) {
    sendOk = true;
    providerMessageId = "dry-run";
    providerError = null;
  } else if (!apiKey) {
    sendOk = false;
    providerMessageId = null;
    providerError = "SMSDEV_KEY não configurada no servidor";
  } else {
    const result = await sendSmsViaSmsDev({
      apiKey,
      number: device.phone,
      message: command.message,
    });
    if (result.ok) {
      sendOk = true;
      providerMessageId = result.providerMessageId;
      providerError = null;
    } else {
      sendOk = false;
      providerMessageId = null;
      providerError = result.error;
    }
  }

  const execution = await prisma.execution.create({
    data: {
      deviceId,
      commandId,
      phone: device.phone,
      message: command.message,
      provider: PROVIDER,
      providerMessageId,
      status: sendOk ? "success" : "failed",
      errorMessage: providerError ? providerError.slice(0, 500) : null,
      actorSub,
    },
  });

  return {
    ok: true,
    sendOk,
    executionId: execution.id,
    provider: PROVIDER,
    providerMessageId,
    providerError,
    apiKeyConfigured: Boolean(apiKey),
  };
}
