import {z} from 'zod'

export const bookAppointmentSchema = z.object({

    email: z.string().email({
        message: 'Ingresá un correo válido'
    }), 
    phone: z.string().min(3, {
        message: 'El teléfono es muy corto'
    }).max(35, {
        message: 'El teléfono es muy largo'
    }),
    name: z.string().min(3, {
        message: 'El nombre debe tener al menos 3 caractéres'
    }).max(35, {
        message: 'El nombre debe tener menos de 35 caractéres'
    }),

})