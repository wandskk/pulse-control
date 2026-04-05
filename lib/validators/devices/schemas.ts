import { normalizePhoneDigits } from "@/lib/utils/phone-br";
import { z } from "zod";

export const deviceCreateSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(120),
  phone: z
    .string()
    .transform(normalizePhoneDigits)
    .pipe(
      z
        .string()
        .min(10, "Telefone muito curto")
        .max(15, "Telefone muito longo"),
    ),
  description: z
    .string()
    .trim()
    .max(500)
    .transform((t) => (t.length === 0 ? undefined : t)),
});

/** PATCH: descrição vazia vira `null` no Prisma (limpa o campo). `undefined` omitiria o update. */
export const devicePatchSchema = deviceCreateSchema
  .omit({ description: true })
  .extend({
    description: z
      .union([
        z.null(),
        z
          .string()
          .trim()
          .max(500)
          .transform((t) => (t.length === 0 ? null : t)),
      ])
      .optional(),
  })
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "Nenhum campo para atualizar",
  });

export type DeviceCreateInput = z.infer<typeof deviceCreateSchema>;
export type DevicePatchInput = z.infer<typeof devicePatchSchema>;
