import type { Metadata } from "next";
import LoggedInHeader from "@/components/dashboard/LoggedInHeader";

export const metadata: Metadata = {
  title: "Buscar empresa",
  description:
    "Buscá un negocio en SacaTurno y reservá tu turno online de forma rápida y sencilla.",
  robots: { index: false, follow: false },
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
