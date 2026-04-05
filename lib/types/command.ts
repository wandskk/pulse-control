import type { Command } from "@prisma/client";

export function toCommandDto(c: Command) {
  return {
    id: c.id,
    deviceId: c.deviceId,
    categoryId: c.categoryId ?? null,
    title: c.title,
    message: c.message,
    color: c.color,
    sortOrder: c.sortOrder,
    isActive: c.isActive,
  };
}

export type CommandDto = ReturnType<typeof toCommandDto>;
