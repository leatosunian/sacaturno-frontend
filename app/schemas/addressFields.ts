import { z } from 'zod'

// Domicilio opcional con la misma forma que el de las sucursales (branchSchema).
// Ahí calle y altura son obligatorias; acá el domicilio entero se puede omitir,
// pero si se carga una de las dos hay que cargar la otra.
export const optionalAddressFields = {
    street: z.string().trim()
        .max(70, { message: 'Máximo 70 caracteres' })
        .regex(/^\D*$/, { message: 'Sin números: la altura va en el campo de al lado' })
        .optional().or(z.literal('')),
    number: z.string().trim()
        .max(5, { message: 'Máximo 5 dígitos' })
        .regex(/^\d+$/, { message: 'Solo se permiten números' })
        .optional().or(z.literal('')),
    city: z.string().trim().max(50, { message: 'Máximo 50 caracteres' }).optional().or(z.literal('')),
    province: z.string().trim().max(50, { message: 'Máximo 50 caracteres' }).optional().or(z.literal('')),
}

// El domicilio es todo o nada: se puede omitir entero, pero apenas se toca
// cualquiera de sus campos (provincia incluida) hace falta el domicilio completo.
// Provincia queda opcional siempre: no hace falta para ubicar el local.
export const refineAddressGroup = (
    data: { street?: string; number?: string; city?: string; province?: string },
    ctx: z.RefinementCtx,
) => {
    const street = data.street?.trim()
    const number = data.number?.trim()
    const city = data.city?.trim()
    const province = data.province?.trim()

    if (!street && !number && !city && !province) return

    if (!street) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['street'], message: 'Completá la calle' })
    }
    if (!number) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['number'], message: 'Completá la altura' })
    }
    if (!city) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['city'], message: 'Completá la ciudad' })
    }
}
