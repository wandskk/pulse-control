import type { Category } from "@prisma/client";

export function toCategoryDto(c: Category) {
  return {
    id: c.id,
    deviceId: c.deviceId,
    name: c.name,
    sortOrder: c.sortOrder,
    isActive: c.isActive,
  };
}

export type CategoryDto = ReturnType<typeof toCategoryDto>;
