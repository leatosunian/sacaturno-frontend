import type { Metadata } from "next";
import LoggedInHeader from "@/components/dashboard/LoggedInHeader";

export const metadata: Metadata = {
  title: "Buscar empresa | SacaTurno",
  description: "Aplicación de turnos online",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <>
        <div className="h-screen">
          <LoggedInHeader/>
          {children}
        </div> 
      </>
  );
}
