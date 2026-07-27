import { z } from "zod";

export const setPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, { message: "La contraseña debe tener al menos 6 caractéres" })
      .max(80, { message: "La contraseña debe tener menos de 80 caractéres" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
