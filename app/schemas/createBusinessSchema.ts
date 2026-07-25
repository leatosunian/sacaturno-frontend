import {z} from 'zod'

export const createBusinessSchema = z.object({
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

    address: z.string().trim().optional(),

    phone: z.coerce.number({ required_error: 'El teléfono es obligatorio', invalid_type_error: 'Ingresá un número válido' }).min(10000000, 'Ingresá un número de al menos 8 dígitos'),

    email: z.string().trim().email({
        message: 'Ingresá un correo válido'
    }),

    slug: z.string().trim().min(3, {
        message: 'El link debe tener al menos 3 caractéres'
    }).max(35, {
        message: 'El link debe tener menos de 35 caractéres'
    }).refine(s => !s.includes(' '), 'El link no debe contener espacios'),

    appointmentDuration: z.string(),

    dayStart: z.string(),

    dayEnd: z.string()

})