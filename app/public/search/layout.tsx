import type { Metadata } from "next";
import LoggedInHeader from "@/components/LoggedInHeader";
import HeaderPublic from "@/components/HeaderPublic";
import styles from '@/app/css-modules/login.module.css'

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
        <div className={`${styles.publicBgImage} h-screen`}>
          <HeaderPublic/>
          {/* <LoggedInHeader/> */}
          {children}
        </div> 
      </>
  );
}
