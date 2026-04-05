import type { Device } from "@prisma/client";

export function toDeviceDto(d: Device) {
  return {
    id: d.id,
    name: d.name,
    phone: d.phone,
    description: d.description ?? null,
    isActive: d.isActive,
  };
}

export type DeviceDto = ReturnType<typeof toDeviceDto>;
