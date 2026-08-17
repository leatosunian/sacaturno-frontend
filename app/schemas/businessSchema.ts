import { z } from 'zod'
import { optionalAddressFields, refineAddressGroup } from './addressFields'

export const businessSchema = z.object({
    name: z.string().trim().min(3, {
        message: 'El nombre debe tener al menos 3 caractéres'
    }).max(35, {
        message: 'El nombre debe tener menos de 35 caractéres'
    }),

    // Opcional en edición: negocios antiguos sin categoría clasificable no quedan
    // bloqueados para guardar otros cambios. Obligatorio al crear (createBusinessSchema).
    businessCategory: z.string().trim().optional(),

    businessType: z.string().trim().min(2, {
        message: 'Elegí o especificá una especialidad'
    }).max(35, {
        message: 'La especialidad debe tener menos de 35 caractéres'
    }),

    ...optionalAddressFields,

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

    cancellationWindowHours: z.coerce.number().optional(),
}).superRefine(refineAddressGroup)