import type { Metadata } from "next";
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
          {children}
        </div> 
      </>
  );
}
