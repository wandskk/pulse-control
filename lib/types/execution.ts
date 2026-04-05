import type { Execution } from "@prisma/client";

export function toExecutionDto(
  e: Execution & {
    device?: { name: string } | null;
    command?: { title: string } | null;
  },
) {
  return {
    id: e.id,
    deviceId: e.deviceId,
    commandId: e.commandId,
    deviceName: e.device?.name ?? null,
    commandTitle: e.command?.title ?? null,
    phone: e.phone,
    message: e.message,
    status: e.status,
    provider: e.provider,
    providerMessageId: e.providerMessageId,
    errorMessage: e.errorMessage,
    actorSub: e.actorSub ?? null,
    createdAt: e.createdAt.toISOString(),
  };
}

export type ExecutionDto = ReturnType<typeof toExecutionDto>;
