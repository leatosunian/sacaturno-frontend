import type { Metadata } from "next";
import LoggedInHeader from "@/components/dashboard/LoggedInHeader";


export const metadata: Metadata = {
  title: "Mis turnos - SacaTurno",
  description: "IT-related blog for devs",
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
