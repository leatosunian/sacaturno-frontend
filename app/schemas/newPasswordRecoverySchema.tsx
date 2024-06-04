import {z} from 'zod'

export const newPasswordRecoverySchema = z.object({
    password: z.string().min(6, {
        message: 'La contraseña debe tener al menos 6 caractéres'
    }).max(50, {
        message: 'La contraseña debe tener menos de 50 caractéres'
    }),

    confirmPassword: z.string().min(6, {
        message: 'La contraseña debe tener al menos 6 caractéres'
    }).max(50, {
        message: 'La contraseña debe tener menos de 50 caractéres'
    })
    
})