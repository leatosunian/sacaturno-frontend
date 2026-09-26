import type { Metadata } from "next";
import { buildSocial } from "@/lib/seo";

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
  ...buildSocial({
    title: "Buscar negocios con turnos online | SacaTurno",
    description:
      "Buscá peluquerías, consultorios, estudios y más. Reservá tu turno online al instante.",
    path: "/public/search",
    imageAlt: "SacaTurno — Buscar turnos online",
  }),
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
