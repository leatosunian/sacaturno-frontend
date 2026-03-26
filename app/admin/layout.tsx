import type { Metadata } from "next";
import AdminHeader from "@/components/dashboard/AdminHeader";


export const metadata: Metadata = {
  title: "Panel de administración",
  description: "Gestioná tus turnos, tu empresa y tu agenda desde tu panel de administración en SacaTurno.",
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
          {/* <LoggedInHeader/> */}
          <AdminHeader/>
          {children}
        </div> 
      </>
  );
}
