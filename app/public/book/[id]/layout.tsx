import type { Metadata } from "next";
import LoggedInHeader from "@/components/LoggedInHeader";
import HeaderPublicBg from "@/components/HeaderPublicBg";
import { Montserrat } from "next/font/google";
import styles from "@/app/css-modules/home.module.css"

const montserrat = Montserrat({ subsets: ["latin"] });

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
        <div className={` h-screen ${montserrat.className} ${styles.backgroundImage}`}>
          <HeaderPublicBg/>
          {children}
        </div> 
      </>
  );
}
