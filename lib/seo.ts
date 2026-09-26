import type { Metadata } from "next";

// Host canonico del sitio. El apex sirve todo directo (no redirige a www),
// verificado contra produccion, asi que el canonico es el apex.
export const SITE_URL = "https://sacaturno.com.ar";
export const SITE_NAME = "SacaTurno";

export const OG_IMAGE = {
  path: "/og-sacaturno.png",
  width: 1200,
  height: 630,
} as const;

export function absoluteUrl(path: string = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  return new URL(path.startsWith("/") ? path : `/${path}`, SITE_URL).toString();
}

interface SocialInput {
  title: string;
  description: string;
  /** Ruta relativa al host, ej "/demo". Por defecto la home. */
  path?: string;
  /** Texto alternativo de la imagen social. Por defecto, el titulo. */
  imageAlt?: string;
  /** Sumar el canonical de alternates al mismo path. Por defecto si. */
  canonical?: boolean;
}

type SocialMetadata = Pick<Metadata, "alternates" | "openGraph" | "twitter">;

// Next NO fusiona openGraph entre layouts y paginas: el objeto del hijo
// reemplaza entero al del padre. Por eso este helper devuelve siempre el
// bloque social completo (type, locale, siteName, url, imagen incluidos),
// y toda pagina que declare openGraph tiene que usarlo.
export function buildSocial({
  title,
  description,
  path = "/",
  imageAlt,
  canonical = true,
}: SocialInput): SocialMetadata {
  const url = absoluteUrl(path);
  const images = [
    {
      url: absoluteUrl(OG_IMAGE.path),
      width: OG_IMAGE.width,
      height: OG_IMAGE.height,
      alt: imageAlt ?? title,
    },
  ];

  return {
    ...(canonical ? { alternates: { canonical: url } } : {}),
    openGraph: {
      type: "website",
      locale: "es_AR",
      siteName: SITE_NAME,
      url,
      title,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl(OG_IMAGE.path)],
    },
  };
}
