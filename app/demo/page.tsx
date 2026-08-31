import type { Metadata } from "next";
import DemoExperience from "@/components/demo/DemoExperience";

export const metadata: Metadata = {
  title: "Demo interactiva",
  description:
    "Probá SacaTurno sin crear una cuenta: reservá un turno en un negocio de ejemplo y mirá cómo le llega a la agenda. Configurá servicios, profesionales, sucursales y señas para que se parezca a tu negocio.",
  alternates: { canonical: "https://sacaturno.com.ar/demo" },
  openGraph: {
    title: "Demo interactiva | SacaTurno",
    description:
      "Reservá un turno en un negocio de ejemplo y mirá cómo le llega al panel del negocio. Sin cuenta y sin instalar nada.",
    url: "https://sacaturno.com.ar/demo",
    type: "website",
  },
};

export default function DemoPage() {
  return <DemoExperience />;
}
