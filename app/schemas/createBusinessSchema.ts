import {z} from 'zod'
import { optionalAddressFields, refineAddressGroup } from './addressFields'

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

    ...optionalAddressFields,

    // Obligatorio siempre: si el usuario entró con Google nunca cargó un teléfono,
    // así que este es el único momento en que el negocio queda con uno de contacto.
    phone: z.coerce.number({ required_error: 'El teléfono es obligatorio', invalid_type_error: 'Ingresá un número válido' }).min(10000000, 'Ingresá un teléfono de al menos 8 dígitos'),

    email: z.string().trim().email({
        message: 'Ingresá un correo válido'
    }),

    slug: z.string().trim().min(3, {
        message: 'El link debe tener al menos 3 caractéres'
    }).max(35, {
        message: 'El link debe tener menos de 35 caractéres'
    }).refine(s => !s.includes(' '), 'El link no debe contener espacios'),

    cancellationWindowHours: z.coerce.number({
        required_error: 'Elegí una política de cancelación',
        invalid_type_error: 'Elegí una política de cancelación'
    }),

    appointmentDuration: z.string(),

    dayStart: z.string(),

    dayEnd: z.string()

}).superRefine(refineAddressGroup)