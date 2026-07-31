import {z} from 'zod'

export const createBusinessSchema = z.object({
    name: z.string().trim().min(3, {
        message: 'El nombre debe tener al menos 3 caractéres'
    }).max(35, {
        message: 'El nombre debe tener menos de 35 caractéres'
    }),

    businessCategory: z.string().trim().min(1, {
        message: 'Elegí un rubro'
    }),

    businessType: z.string().trim().min(2, {
        message: 'Elegí o especificá una especialidad'
    }).max(35, {
        message: 'La especialidad debe tener menos de 35 caractéres'
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