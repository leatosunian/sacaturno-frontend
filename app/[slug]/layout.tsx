import type { Metadata } from "next";
import HeaderPublicBlack from "@/components/HeaderPublicBlack";


export const metadata: Metadata = {
  title: "Sacar turno - SacaTurno",
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
          <HeaderPublicBlack/>
          {children}
        </div> 
      </>
  );
}
