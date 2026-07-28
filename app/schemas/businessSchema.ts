import { z } from 'zod'

export const businessSchema = z.object({
    name: z.string().trim().min(3, {
        message: 'El nombre debe tener al menos 3 caractéres'
    }).max(35, {
        message: 'El nombre debe tener menos de 35 caractéres'
    }),

    businessType: z.string().trim().min(5, {
        message: 'Ingresá un rubro'
    }).max(35, {
        message: 'El rubro debe tener menos de 35 caractéres'
    }),

    address: z.string().trim().max(50, {
        message: 'El domicilio debe tener menos de 50 caractéres'
    }).optional(),

    email: z.string().trim().email({
        message: 'Ingresá un correo válido'
    }),

    phone: z.string().trim().min(7, {
        message: 'El teléfono es demasiado corto'
    }),

    slug: z.string().trim().min(3, {
        message: 'El link debe tener al menos 3 caractéres'
    }).max(35, {
        message: 'El link debe tener menos de 35 caractéres'
    }).refine(s => !s.includes(' '), 'El link no debe contener espacios'),
})