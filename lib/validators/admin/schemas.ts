import { z } from "zod";

export const adminCreateUserFormSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  role: z.enum(["USER", "ADMIN"]),
});

export type AdminCreateUserFormValues = z.infer<typeof adminCreateUserFormSchema>;

export const adminResetPasswordFormSchema = z
  .object({
    newPassword: z.string().min(8, "Mínimo 8 caracteres"),
    confirmPassword: z.string().min(8, "Confirme a senha"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type AdminResetPasswordFormValues = z.infer<
  typeof adminResetPasswordFormSchema
>;
