import {z} from 'zod'
import { timeOptions } from '@/helpers/timeOptions'

export const businessSchema = z.object({
    name: z.string().min(3, {
        message: 'El nombre debe tener al menos 3 caractéres'
    }).max(35, {
        message: 'El nombre debe tener menos de 35 caractéres'
    }),

    businessType: z.string().min(5, {
        message: 'Ingresá un rubro'
    }).max(35, {
        message: 'El rubro debe tener menos de 35 caractéres'
    }),

    address: z.string().min(5, {
        message: 'Ingresá un domicilio'
    }).max(50, {
        message: 'El domicilio debe tener menos de 50 caractéres'
    }),

    email: z.string().email({
        message: 'Ingresá un correo válido'
    }),

    phone: z.coerce.number().gte(7, 'Ingresa un número válido'),

    appointmentDuration: z.string(),

    slug: z.string().min(3, {
        message: 'El link debe tener al menos 3 caractéres'
    }).max(35, {
        message: 'El link debe tener menos de 35 caractéres'
    }),

    dayStart: z.string(),

    dayEnd: z.string()

})