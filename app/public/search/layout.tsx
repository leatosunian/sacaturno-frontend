import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buscar negocios con turnos online",
  description:
    "Buscá peluquerías, consultorios, estudios y más negocios en SacaTurno. Reservá tu turno online en segundos, sin llamadas ni esperas.",
  keywords: [
    "buscar turnos online",
    "reservar turno argentina",
    "peluquería turno online",
    "consultorio turno online",
    "turno sin llamadas",
  ],
  alternates: {
    canonical: "https://sacaturno.com.ar/public/search",
  },
  openGraph: {
    title: "Buscar negocios con turnos online | SacaTurno",
    description:
      "Buscá peluquerías, consultorios, estudios y más. Reservá tu turno online al instante.",
    url: "https://sacaturno.com.ar/public/search",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SacaTurno — Buscar turnos online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Buscar negocios con turnos online | SacaTurno",
    description:
      "Buscá peluquerías, consultorios, estudios y más. Reservá tu turno online al instante.",
    images: ["/og-image.png"],
  },
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <>
        <div className={`h-screen`}>
          {children}
        </div> 
      </>
  );
}
