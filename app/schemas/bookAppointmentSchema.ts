import {z} from 'zod'

export const bookAppointmentSchema = z.object({

    email: z.string().trim().email({
        message: 'Ingresá un correo válido'
    }).max(100, {
        message: 'El correo es muy largo'
    }),
    phone: z.string().trim()
        .regex(/^\d+$/, { message: 'Solo se permiten números sin símbolos' })
        .min(8, { message: 'El teléfono es muy corto' })
        .max(15, { message: 'El teléfono es muy largo' }),
    name: z.string().trim().min(3, {
        message: 'El nombre debe tener al menos 3 caractéres'
    }).max(35, {
        message: 'El nombre debe tener menos de 35 caractéres'
    }),

})