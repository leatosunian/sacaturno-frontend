import {z} from 'zod'

export const registerSchema = z.object({
    name: z.string().trim().min(2, {
        message: 'El nombre debe tener al menos 2 caractéres'
    }).max(50, {
        message: 'El nombre debe tener menos de 50 caractéres'
    }),
    surname: z.string().trim().min(2, {
        message: 'El apellido debe tener al menos 2 caractéres'
    }).max(50, {
        message: 'El apellido debe tener menos de 50 caractéres'
    }),
    email: z.string().trim().email({
        message: 'Ingresá un correo válido'
    }),
    phone: z.string().trim()
        .regex(/^\d+$/, { message: 'Solo se permiten números, sin el signo +' })
        .min(8, { message: 'El teléfono debe tener al menos 8 dígitos' })
        .max(15, { message: 'El teléfono debe tener menos de 15 dígitos' })
        .optional()
        .or(z.literal('')),
    password: z.string().min(6, {
        message: 'La contraseña debe tener al menos 6 caractéres'
    }).max(80, {
        message: 'La contraseña debe tener menos de 80 caractéres'
    }),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword']
})