import { z } from "zod";

export const createServiceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Ingresá el nombre del servicio" })
    .max(35, { message: "El nombre debe tener menos de 35 caractéres" }),

  price: z.coerce.number().gte(15, "Ingresá el precio del servicio"),

  description: z.string().trim().max(140, {
    message: "La descripción debe tener menos de 140 caracteres",
  }),

  duration: z.coerce
    .number()
    .int("La duración debe ser un número entero")
    .positive("La duración debe ser mayor a 0")
    .optional(),

  depositAmount: z.coerce
    .number()
    .min(0, "El monto de seña no puede ser negativo")
    .optional()
    .default(0),
});
