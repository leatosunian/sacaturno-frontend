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
    phone: z.string().min(7, {
        message: 'El teléfono es demasiado corto'
    }).optional(),
    
    /*acceptPolicy: z.coerce.boolean().refine(bool => bool == true, {
        message: 'You must agree to our terms and conditions'
    })
    
    
    /*password: z.string().min(6, {
        message: 'La contraseña debe tener al menos 6 caractéres'
    }).max(50, {
        message: 'La contraseña debe tener menos de 50 caractéres'
    }),*/

})