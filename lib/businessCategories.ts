// Taxonomía de rubros de SacaTurno.
// Fuente de verdad única para categorías (rubro) y especialidades.
// Se almacena en el negocio como:
//   - businessCategory: código estable de la categoría (ej. "estetica")
//   - businessType:     etiqueta de la especialidad (ej. "Barbería") o texto libre si "Otro"
// El código es puro (sin dependencias de React) para poder importarse en cualquier lado.

export interface BusinessCategoryDef {
  /** Código estable, se persiste en businessCategory. Nunca cambiarlo una vez publicado. */
  code: string;
  /** Etiqueta completa para mostrar. */
  label: string;
  /** Etiqueta corta para el botón de selección. */
  short: string;
  /** Especialidades sugeridas (se guardan como businessType). */
  specialties: string[];
}

/** Valor centinela para la opción "Otro" (especialidad con texto libre). */
export const OTHER_SPECIALTY = "__otro__";

export const BUSINESS_CATEGORIES: BusinessCategoryDef[] = [
  {
    code: "estetica",
    label: "Estética y belleza",
    short: "Estética",
    specialties: [
      "Peluquería",
      "Barbería",
      "Salón de belleza",
      "Manicura y uñas",
      "Depilación",
      "Cejas y pestañas",
      "Cosmetología facial",
      "Spa",
      "Masajes",
      "Maquillaje",
      "Podología",
      "Tatuajes y piercing",
    ],
  },
  {
    code: "salud",
    label: "Salud",
    short: "Salud",
    specialties: [
      "Consultorio médico",
      "Odontología",
      "Kinesiología",
      "Psicología",
      "Nutrición",
      "Oftalmología",
      "Fonoaudiología",
      "Fisioterapia",
      "Medicina alternativa",
    ],
  },
  {
    code: "bienestar",
    label: "Bienestar y fitness",
    short: "Fitness",
    specialties: [
      "Gimnasio",
      "Personal trainer",
      "Pilates",
      "Yoga",
      "Crossfit",
      "Entrenamiento deportivo",
    ],
  },
  {
    code: "mascotas",
    label: "Mascotas",
    short: "Mascotas",
    specialties: ["Veterinaria", "Peluquería canina", "Adiestramiento"],
  },
  {
    code: "servicios",
    label: "Servicios profesionales",
    short: "Servicios",
    specialties: [
      "Profesional independiente",
      "Estudio contable",
      "Estudio jurídico",
      "Fotografía",
      "Consultoría",
      "Taller mecánico",
      "Reparaciones",
    ],
  },
  {
    code: "educacion",
    label: "Educación",
    short: "Educación",
    specialties: [
      "Clases particulares",
      "Clases de música",
      "Idiomas",
      "Apoyo escolar",
    ],
  },
  {
    code: "otros",
    label: "Otros",
    short: "Otros",
    specialties: [],
  },
];

const CATEGORY_BY_CODE = new Map(BUSINESS_CATEGORIES.map((c) => [c.code, c]));

export const getCategoryDef = (code?: string | null): BusinessCategoryDef | undefined =>
  code ? CATEGORY_BY_CODE.get(code) : undefined;

/** Etiqueta de categoría para mostrar. Devuelve "Sin categoría" si no matchea. */
export const getCategoryLabel = (code?: string | null): string =>
  getCategoryDef(code)?.label ?? "Sin categoría";

/**
 * Intenta deducir el código de categoría a partir de una etiqueta de especialidad
 * (ej. negocios antiguos que sólo tienen businessType de texto libre).
 * Devuelve undefined si no encuentra coincidencia.
 */
export const inferCategoryCode = (typeLabel?: string | null): string | undefined => {
  if (!typeLabel) return undefined;
  const needle = typeLabel.trim().toLowerCase();
  if (!needle) return undefined;
  for (const cat of BUSINESS_CATEGORIES) {
    if (cat.specialties.some((s) => s.toLowerCase() === needle)) return cat.code;
  }
  return undefined;
};

/** True si la etiqueta pertenece a las especialidades sugeridas de la categoría. */
export const isKnownSpecialty = (categoryCode: string, typeLabel?: string | null): boolean => {
  const cat = getCategoryDef(categoryCode);
  if (!cat || !typeLabel) return false;
  const needle = typeLabel.trim().toLowerCase();
  return cat.specialties.some((s) => s.toLowerCase() === needle);
};
