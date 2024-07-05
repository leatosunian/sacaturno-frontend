import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import styles from "@/app/css-modules/home.module.css";
import { AuthProvider } from "../context/authContext";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Registrate | SacaTurno",
  description: "Aplicación de turnos online",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className={`${montserrat.className}`}>
        <AuthProvider>{children}</AuthProvider>
      </div>
    </>
  );
}
