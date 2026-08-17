import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface AddressLike {
  street?: string
  number?: string
  city?: string
  province?: string
}

export function composeBranchAddress(branch: AddressLike): string {
  const line1 = [branch.street, branch.number].filter(Boolean).join(" ")
  return [line1, branch.city].filter(Boolean).join(", ")
}

// A diferencia de la dirección, el teléfono del negocio no se oculta cuando hay
// sucursales: es el contacto por defecto y una sucursal sólo lo pisa si cargó
// uno propio.
export function resolveContactPhone(
  businessPhone?: number | null,
  branch?: { phone?: number | null } | null,
): number | null {
  return branch?.phone || businessPhone || null
}
