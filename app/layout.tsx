import { Montserrat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/authContext";
import { Toaster } from "@/components/ui/sonner"
import { IoCheckmarkCircle } from "react-icons/io5";
import type { Metadata } from "next";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://sacaturno.com.ar"),
  title: {
    default: "Tu app de turnos online",
    template: "%s | SacaTurno",
  },
  description:
    "SacaTurno es la app de turnos online para negocios argentinos. Gestioná tu agenda, recibí reservas automáticas y ahorrá tiempo desde el primer día.",
  keywords: [
    "turnos online",
    "reserva de turnos",
    "agenda online",
    "gestión de turnos",
    "turnos para negocios",
    "sacaturno",
  ],
  authors: [{ name: "SacaTurno" }],
  creator: "SacaTurno",
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://sacaturno.com.ar",
    siteName: "SacaTurno",
    title: "SacaTurno | Tu app de turnos online",
    description:
      "Gestioná tu agenda, recibí reservas automáticas y ahorrá tiempo desde el primer día.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SacaTurno — Tu app de turnos online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SacaTurno | Tu app de turnos online",
    description:
      "Gestioná tu agenda, recibí reservas automáticas y ahorrá tiempo desde el primer día.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${montserrat.className} `}>
        <AuthProvider>{children}</AuthProvider>
        <Toaster
          icons={{
            success: <IoCheckmarkCircle color="green" size={24} />
          }}
          style={{
            backgroundColor: 'white',
            paddingLeft: '10px',
          }}
          toastOptions={
            {
              classNames: {
                title: "text-base text-black font-medium ml-2  ",
                toast: "bg-white border pl-2 border-zinc-800 text-black shadow-lg",

              }
            }
          }
        />

      </body>
    </html>
  );
}
