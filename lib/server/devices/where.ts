import type { Prisma } from "@prisma/client";

/**
 * Filtro Prisma para dispositivo acessível no contexto da API:
 * - com `scopedUserId`: só dispositivos daquele usuário (auth ligada)
 * - com `null`: modo legado / aberto — qualquer dispositivo ativo com o id
 */
export function deviceWhereScoped(
  deviceId: string,
  scopedUserId: string | null,
  activeOnly = true,
): Prisma.DeviceWhereInput {
  return {
    id: deviceId,
    ...(activeOnly ? { isActive: true } : {}),
    ...(scopedUserId !== null ? { userId: scopedUserId } : {}),
  };
}
