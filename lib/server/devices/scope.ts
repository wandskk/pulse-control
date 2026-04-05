import type { Device } from "@prisma/client";
import { prisma } from "@/db/prisma";
import { deviceWhereScoped } from "./where";

export async function findDeviceScoped(
  deviceId: string,
  scopedUserId: string | null,
  options?: { activeOnly?: boolean },
): Promise<Device | null> {
  const activeOnly = options?.activeOnly ?? true;
  return prisma.device.findFirst({
    where: deviceWhereScoped(deviceId, scopedUserId, activeOnly),
  });
}
