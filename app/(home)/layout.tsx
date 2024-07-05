import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { AuthProvider } from "../context/authContext";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SacaTurno | Tu app de turnos online",
  description: "Aplicación de turnos online",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${montserrat.className} `}>
      <AuthProvider>{children}</AuthProvider>
    </div>
  );
}
