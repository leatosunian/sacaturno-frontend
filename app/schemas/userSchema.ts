import {z} from 'zod'

export const userSchema = z.object({
    name: z.string().min(3, {
        message: 'El nombre debe tener al menos 3 caractéres'
    }).max(35, {
        message: 'El nombre debe tener menos de 35 caractéres'
    }),
    email: z.string().email({
        message: 'Ingresá un correo válido'
    }),
    phone: z.coerce.number().gte(9, "El teléfono es demasiado corto"),
    
    /*password: z.string().min(6, {
        message: 'La contraseña debe tener al menos 6 caractéres'
    }).max(50, {
        message: 'La contraseña debe tener menos de 50 caractéres'
    }),*/
    birthdate: z.string().refine((date) => new Date(date).toString() !== 'Fecha inválida', {
        message: 'Ingresá tu fecha de nacimiento'
    }).transform((date) => new Date(date))
})