import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buscar empresa",
  description:
    "Buscá un negocio en SacaTurno y reservá tu turno online de forma rápida y sencilla.",
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
