import {z} from 'zod'

export const passwordRecoverySchema = z.object({

    email: z.string().trim().email({
        message: 'Ingresá un correo válido'
    }),
    
})