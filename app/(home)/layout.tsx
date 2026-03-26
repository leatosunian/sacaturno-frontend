import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { AuthProvider } from "../context/authContext";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tu app de turnos online",
  description:
    "SacaTurno es la app de turnos online para negocios argentinos. Automatizá tus reservas, organizá tu agenda y dejá que tus clientes reserven solos, las 24 hs.",
  openGraph: {
    title: "SacaTurno | Tu app de turnos online",
    description:
      "Automatizá tus reservas, organizá tu agenda y dejá que tus clientes reserven solos, las 24 hs. Empezá gratis hoy.",
    url: "https://sacaturno.com.ar",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SacaTurno — Tu app de turnos online",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${montserrat.className} `}>
      {children}
    </div>
  );
}
