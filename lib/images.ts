// Resolución de imágenes de perfil (usuarios, negocios y empleados).
//
// El campo en la base puede tener tres formas:
//   1. URL absoluta de Cloudinary  → se usa tal cual (subidas nuevas)
//   2. nombre de archivo suelto    → legado servido por el backend desde disco
//   3. "user.png" / vacío          → sin imagen propia
//
// El default se sirve desde /public de Next y no desde el backend: la carpeta
// profile_images del contenedor es efímera, así que el fallback del backend
// puede no existir y devolver un error en vez de una imagen.

export const DEFAULT_AVATAR = "/user.png";

const DEFAULT_DB_VALUES = ["user.png", ""];

export function hasCustomImage(value?: string | null): boolean {
  if (!value) return false;
  return !DEFAULT_DB_VALUES.includes(value.trim());
}

/** URL de la imagen, o null si el registro no tiene una propia. */
export function resolveImageUrl(value?: string | null): string | null {
  if (!hasCustomImage(value)) return null;
  const image = value!.trim();
  if (/^https?:\/\//i.test(image)) return image;
  return `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/getprofilepic/${image}`;
}

/** Igual que resolveImageUrl pero siempre devuelve algo pintable. */
export function resolveAvatarUrl(value?: string | null): string {
  return resolveImageUrl(value) ?? DEFAULT_AVATAR;
}
