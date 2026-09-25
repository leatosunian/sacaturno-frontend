import type { Metadata } from "next";

// Metadatos sociales (Open Graph / Twitter Card).
//
// Next NO fusiona `openGraph` entre layouts y páginas: el objeto del hijo
// reemplaza entero al del padre. Declarar `openGraph: { title, description,
// url }` en una página borra el `og:image`, `og:type`, `og:site_name` y
// `og:locale` del layout raíz, y el preview de WhatsApp queda con título y
// descripción pero sin imagen. Por eso toda página que defina metadatos
// sociales arma el objeto completo con estos helpers.
//
// Las URLs son absolutas a propósito: los scrapers de WhatsApp y Facebook no
// resuelven rutas relativas, y así el tag no depende de que `metadataBase`
// esté bien configurado en cada entorno.

export const SITE_URL = "https://sacaturno.com.ar";
export const SITE_NAME = "SacaTurno";

export const OG_IMAGE_URL = `${SITE_URL}/og-sacaturno.png`;
const DEFAULT_IMAGE_ALT = "SacaTurno — Tu app de turnos online";

type SocialInput = {
  title: string;
  description: string;
  url: string;
  imageAlt?: string;
};

export function buildOpenGraph({
  title,
  description,
  url,
  imageAlt,
}: SocialInput): Metadata["openGraph"] {
  return {
    type: "website",
    locale: "es_AR",
    siteName: SITE_NAME,
    title,
    description,
    url,
    images: [
      {
        url: OG_IMAGE_URL,
        secureUrl: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        type: "image/png",
        alt: imageAlt ?? DEFAULT_IMAGE_ALT,
      },
    ],
  };
}

export function buildTwitter({
  title,
  description,
  imageAlt,
}: Omit<SocialInput, "url">): Metadata["twitter"] {
  return {
    card: "summary_large_image",
    title,
    description,
    images: [{ url: OG_IMAGE_URL, alt: imageAlt ?? DEFAULT_IMAGE_ALT }],
  };
}

/** `openGraph` + `twitter` coherentes entre sí para una página. */
export function buildSocialMetadata(input: SocialInput): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: buildOpenGraph(input),
    twitter: buildTwitter(input),
  };
}
