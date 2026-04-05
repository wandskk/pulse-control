import { z } from "zod";

export const categoryCreateSchema = z.object({
  deviceId: z.string().min(1, "Número obrigatório"),
  name: z.string().trim().min(1, "Informe o nome").max(80),
});

export const categoryPatchSchema = z
  .object({
    name: z.string().trim().min(1, "Informe o nome").max(80),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "Nenhum campo para atualizar",
  });

/** Formulário de criar/editar categoria na UI */
export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(80),
});

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryPatchInput = z.infer<typeof categoryPatchSchema>;
export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
