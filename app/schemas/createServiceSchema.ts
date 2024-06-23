import { z } from "zod";

export const createServiceSchema = z.object({
  name: z
    .string()
    .min(1, {
      message: "Ingresá el nombre del servicio",
    })
    .max(35, {
      message: "El nombre debe tener menos de 35 caractéres",
    }),

  price: z.coerce.number().gte(15, "Ingresá el precio del servivio"),

  description: z.string().max(140, {
    message: "La descripción debe tener menos de 140 caracteres",
  }),
});
