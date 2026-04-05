import { z } from "zod";

export const executeBodySchema = z.object({
  deviceId: z.string().min(1, "Dispositivo obrigatório"),
  commandId: z.string().min(1, "Comando obrigatório"),
});

export type ExecuteBody = z.infer<typeof executeBodySchema>;
