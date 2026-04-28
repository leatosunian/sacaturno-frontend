import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Registrate gratis — SacaTurno",
  description: "Creá tu cuenta en SacaTurno y empezá a gestionar tus turnos online con 30 días de prueba gratuita.",
  robots: { index: false, follow: false },
};

export default function RegisterLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={montserrat.className}>
      {children}
    </div>
  );
}
