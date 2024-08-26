import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import styles from "@/app/css-modules/home.module.css";
import { AuthProvider } from "../context/authContext";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SacaTurno",
  description: "IT-related blog for devs",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className={`${montserrat.className}`}>
        <AuthProvider >{children}</AuthProvider>
      </div>
    </>
  );
}
