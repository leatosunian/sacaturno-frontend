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

// Para mostrar alcanza con calle, altura y ciudad; para que Maps caiga en el
// local exacto hace falta también la provincia y el país (hay calles y ciudades
// homónimas en varias provincias).
export function composeMapsQuery(branch: AddressLike): string {
  const line1 = [branch.street, branch.number].filter(Boolean).join(" ")
  if (!line1) return ""
  return [line1, branch.city, branch.province, "Argentina"].filter(Boolean).join(", ")
}

export function buildMapsUrl(branch: AddressLike): string | null {
  const query = composeMapsQuery(branch)
  return query
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
    : null
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
