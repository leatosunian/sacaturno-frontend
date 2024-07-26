import type { Metadata } from "next";

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
        <div className={`h-screen`}>
          {children}
        </div> 
      </>
  );
}
