import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Iniciar sesión — SacaTurno",
  description: "Iniciá sesión en tu cuenta de SacaTurno para gestionar tus turnos y tu agenda online.",
  robots: { index: false, follow: false },
};

export default function LoginLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={montserrat.className}>
      {children}
    </div>
  );
}
