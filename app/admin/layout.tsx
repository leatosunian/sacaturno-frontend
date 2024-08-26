import type { Metadata } from "next";
import AdminHeader from "@/components/dashboard/AdminHeader";


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
          {/* <LoggedInHeader/> */}
          <AdminHeader/>
          {children}
        </div> 
      </>
  );
}
