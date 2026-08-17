import { z } from 'zod'

export const branchSchema = z.object({
    name: z.string().trim()
        .min(2, { message: 'Mínimo 2 caracteres' })
        .max(50, { message: 'Máximo 50 caracteres' }),
    street: z.string().trim()
        .min(2, { message: 'Mínimo 2 caracteres' })
        .max(70, { message: 'Máximo 70 caracteres' })
        .regex(/^\D*$/, { message: 'Sin números: la altura va en el campo de al lado' }),
    number: z.string().trim()
        .min(1, { message: 'La altura es obligatoria' })
        .max(5, { message: 'Máximo 5 dígitos' })
        .regex(/^\d+$/, { message: 'Solo se permiten números' }),
    city: z.string().trim().max(50, { message: 'Máximo 50 caracteres' }).optional().or(z.literal('')),
    province: z.string().trim().max(50, { message: 'Máximo 50 caracteres' }).optional().or(z.literal('')),
    // Opcional: sin teléfono propio, la sucursal usa el del negocio como contacto.
    phone: z.string().trim()
        .min(8, { message: 'Mínimo 8 dígitos' })
        .max(15, { message: 'Máximo 15 dígitos' })
        .regex(/^\d+$/, { message: 'Solo números, sin el signo +' })
        .optional().or(z.literal('')),
    email: z.string().trim().email({ message: 'Ingresá un correo válido' }).optional().or(z.literal('')),
})

export type BranchFormData = z.infer<typeof branchSchema>
