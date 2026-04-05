import { commandColorSchema } from "@/lib/constants/command-colors";
import { z } from "zod";

export const commandCreateSchema = z.object({
  deviceId: z.string().min(1, "Dispositivo obrigatório"),
  title: z.string().trim().min(1, "Informe o título").max(120),
  message: z.string().min(1, "Informe o texto do comando").max(1600),
  color: commandColorSchema,
  /** `null` = sem categoria; omitido no JSON em alguns clientes */
  categoryId: z.union([z.string().min(1), z.null()]).optional(),
});

/** Formulário na UI (deviceId vem do contexto; categoryId "" = sem categoria) */
export const commandFormSchema = commandCreateSchema
  .omit({ deviceId: true })
  .extend({
    categoryId: z.string().optional(),
  });

export type CommandFormValues = z.infer<typeof commandFormSchema>;

export const commandPatchSchema = commandCreateSchema
  .omit({ deviceId: true })
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "Nenhum campo para atualizar",
  });

export type CommandCreateInput = z.infer<typeof commandCreateSchema>;
export type CommandPatchInput = z.infer<typeof commandPatchSchema>;
