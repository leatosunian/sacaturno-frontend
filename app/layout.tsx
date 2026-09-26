import { Montserrat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/authContext";
import { NavigationLoadingProvider } from "./context/navigationLoadingContext";
import { Toaster } from "@/components/ui/sonner"
import {
  IoCheckmarkCircle,
  IoCloseCircle,
  IoWarning,
  IoReloadOutline,
} from "react-icons/io5";
import RouteChangeLoader from "@/components/ui/RouteChangeLoader";
import type { Metadata } from "next";
import { SITE_URL, buildSocial } from "@/lib/seo";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
  verification: {
    google: "vak7ot_GPw6t-5UyFMLr_AiMdFLf5JY2FmGtPHQv7HI",
  },
  ...buildSocial({
    title: "SacaTurno | Tu app de turnos online",
    description:
      "Gestioná tu agenda, recibí reservas automáticas y ahorrá tiempo desde el primer día.",
    imageAlt: "SacaTurno — Tu app de turnos online",
    canonical: false,
  }),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${montserrat.className} `}>
        <NavigationLoadingProvider>
          <AuthProvider>
            {children}
            <RouteChangeLoader />
          </AuthProvider>
        </NavigationLoadingProvider>
        <Toaster
          position="top-center"
          visibleToasts={3}
          closeButton
          icons={{
            success: <IoCheckmarkCircle size={20} />,
            error: <IoCloseCircle size={20} />,
            warning: <IoWarning size={20} />,
            loading: <IoReloadOutline size={20} className="st-toast-spin" />,
          }}
          toastOptions={{
            classNames: {
              toast: "st-toast",
              title: "st-toast-title",
              description: "st-toast-description",
              icon: "st-toast-icon",
              closeButton: "st-toast-close",
            },
          }}
        />

      </body>
    </html>
  );
}
