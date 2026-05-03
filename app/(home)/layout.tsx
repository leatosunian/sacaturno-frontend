import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { AuthProvider } from "../context/authContext";

const montserrat = Montserrat({ subsets: ["latin"] });

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://sacaturno.com.ar/#organization",
      name: "SacaTurno",
      url: "https://sacaturno.com.ar",
      logo: {
        "@type": "ImageObject",
        url: "https://sacaturno.com.ar/icon.png",
      },
      description:
        "SacaTurno es la app de turnos online para negocios argentinos. Automatizá tus reservas y organizá tu agenda.",
    },
    {
      "@type": "WebSite",
      "@id": "https://sacaturno.com.ar/#website",
      url: "https://sacaturno.com.ar",
      name: "SacaTurno",
      publisher: { "@id": "https://sacaturno.com.ar/#organization" },
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://sacaturno.com.ar/#app",
      name: "SacaTurno",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "ARS",
        description: "30 días de prueba gratuita",
      },
      publisher: { "@id": "https://sacaturno.com.ar/#organization" },
    },
  ],
};

export const metadata: Metadata = {
  title: "Tu app de turnos online",
  description:
    "SacaTurno es la app de turnos online para negocios argentinos. Automatizá tus reservas, organizá tu agenda y dejá que tus clientes reserven solos, las 24 hs.",
  keywords: [
    "turnos online argentina",
    "sistema de turnos para negocios",
    "app de turnos",
    "agenda online negocios",
    "reservas automáticas",
    "turnos peluquería",
    "turnos consultorio",
    "gestión de agenda",
    "sacaturno",
  ],
  alternates: {
    canonical: "https://sacaturno.com.ar",
  },
  openGraph: {
    title: "SacaTurno | Tu app de turnos online",
    description:
      "Automatizá tus reservas, organizá tu agenda y dejá que tus clientes reserven solos, las 24 hs. Empezá gratis hoy.",
    url: "https://sacaturno.com.ar",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SacaTurno — Tu app de turnos online",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className={`${montserrat.className} `}>
        {children}
      </div>
    </>
  );
}
