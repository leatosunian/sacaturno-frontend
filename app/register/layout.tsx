import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import styles from "@/app/css-modules/home.module.css";
import { AuthProvider } from "../context/authContext";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Registrate gratis",
  description: "Creá tu cuenta en SacaTurno y empezá a gestionar tus turnos online con 15 días de prueba gratuita.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className={`${montserrat.className}`}>
        {children}
      </div>
    </>
  );
}
