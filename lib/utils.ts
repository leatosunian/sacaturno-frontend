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
