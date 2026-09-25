import { Metadata } from "next";
import Link from "next/link";
import { FaCheck, FaMinus } from "react-icons/fa6";
import HeaderPublic from "@/components/home/HeaderPublic";
import Footer from "@/components/home/Footer";

const PAGE_URL = "https://sacaturno.com.ar/senas-sin-comision";

const TITLE = "SacaTurno no cobra comisión sobre tus señas";
const DESCRIPTION =
  "Otras plataformas de turnos, además del abono mensual, te descuentan entre 1% y 5% de cada seña. SacaTurno no. Mirá cuánto dinero perdés en comisiones por mes y por año.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "turnos online sin comisión",
    "seña sin comisión",
    "comisión por seña turnos",
    "sistema de turnos con seña mercado pago",
    "app de turnos sin porcentaje",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    images: [{ url: "/og-sacaturno.png", width: 1200, height: 630, alt: TITLE }],
  },
};

const DEPOSIT = "$2.000";

const PLANS = [
  {
    title: "Otras plataformas",
    items: [
      { text: "Abono mensual del plan", included: true },
      { text: "Además, entre 1% y 5% de cada seña, según el plan", included: false },
      { text: "Cuantos más turnos tomás, más pagás", included: false },
    ],
    highlight: false,
  },
  {
    title: "SacaTurno",
    items: [
      { text: "Abono mensual del plan", included: true },
      { text: "0% de cada seña, en todos los planes", included: true },
      { text: "Pagás lo mismo tomes 30 o 300 turnos", included: true },
    ],
    highlight: true,
  },
];

const FEE_COLUMNS = ["Comisión de 5%", "Comisión de 3,5%", "Comisión de 1%"];

const LOSSES = [
  { turns: 30, deposits: "$60.000", fees: ["$3.000", "$2.100", "$600"] },
  { turns: 100, deposits: "$200.000", fees: ["$10.000", "$7.000", "$2.000"] },
  { turns: 250, deposits: "$500.000", fees: ["$25.000", "$17.500", "$5.000"] },
];

const FAQ = [
  {
    q: "¿SacaTurno cobra comisión sobre las señas?",
    a: "No. Pagás el abono mensual de tu plan y las señas se cobran con tu propia cuenta de Mercado Pago. SacaTurno no descuenta ningún porcentaje, en ningún plan.",
  },
  {
    q: "¿Entonces cómo cobra SacaTurno?",
    a: "Con el abono mensual del plan, igual que cualquier plataforma de turnos. Los planes arrancan en $9.990 por mes y tenés 15 días de prueba sin tarjeta.",
  },
  {
    q: "¿Mercado Pago cobra comisión?",
    a: "Sí. Mercado Pago aplica su propia comisión de procesamiento a cualquier cobro, uses la plataforma que uses. Lo que no existe con SacaTurno es un porcentaje extra encima de eso.",
  },
  {
    q: "¿Las otras plataformas cobran comisión en todos sus planes?",
    a: "No siempre. Algunas bajan o eliminan el porcentaje en sus planes más caros. Antes de elegir, fijate qué porcentaje tiene el plan que estás mirando y cuánto cuesta el plan que no lo tiene.",
  },
];

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

const SenasSinComision = () => {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <div id="top">
        <HeaderPublic />

        <main className="flex flex-col items-center w-full px-6 pt-28 md:px-12 md:pt-32 lg:px-20">
          <section className="flex flex-col items-center w-full max-w-4xl text-center">
            <span className="px-4 py-1.5 mb-4 text-sm font-medium rounded-full text-orange-600 bg-orange-50">
              0% de comisión por seña
            </span>
            <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
              Tu seña es toda tuya
            </h1>
            <p className="max-w-2xl text-base text-gray-500 md:text-lg">
              Como cualquier plataforma de turnos, SacaTurno cobra un abono
              mensual por el plan. La diferencia es que otras plataformas, además,
              te descuentan un porcentaje de cada seña que cobrás. SacaTurno no.
            </p>
          </section>

          <section className="grid w-full max-w-4xl grid-cols-1 gap-6 mt-16 md:grid-cols-2">
            {PLANS.map((plan) => (
              <div
                key={plan.title}
                className={`flex flex-col gap-4 p-8 bg-white border shadow-lg rounded-xl ${
                  plan.highlight ? "border-orange-600" : "border-gray-100"
                }`}
              >
                <h2
                  className={`text-xl font-bold ${
                    plan.highlight ? "text-orange-600" : "text-gray-900"
                  }`}
                >
                  {plan.title}
                </h2>
                <ul className="flex flex-col gap-3">
                  {plan.items.map((item) => (
                    <li key={item.text} className="flex gap-3 text-sm text-gray-600">
                      {item.included ? (
                        <FaCheck size={12} className="mt-1 text-orange-600 shrink-0" />
                      ) : (
                        <FaMinus size={12} className="mt-1 text-gray-400 shrink-0" />
                      )}
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <section className="w-full max-w-4xl mt-20">
            <h2 className="mb-2 text-3xl font-bold text-center text-gray-900 md:text-4xl">
              Cuánto perdés en comisiones
            </h2>
            <p className="max-w-2xl mx-auto mb-8 text-sm text-center text-gray-500">
              Ejemplo con una seña de {DEPOSIT} por turno. Esto es lo que se
              descuenta cada mes de tus señas, aparte del abono del plan.
            </p>

            <div className="overflow-hidden bg-white border border-gray-100 shadow-lg rounded-xl">
              <div className="hidden border-b border-gray-100 bg-gray-50 md:grid md:grid-cols-[1.3fr_1fr_1fr_1fr_1fr]">
                <span className="px-5 py-3 text-xs font-semibold text-gray-600">
                  Turnos con seña por mes
                </span>
                {FEE_COLUMNS.map((column) => (
                  <span key={column} className="px-5 py-3 text-xs font-semibold text-gray-600">
                    {column}
                  </span>
                ))}
                <span className="px-5 py-3 text-xs font-semibold text-orange-600">
                  SacaTurno
                </span>
              </div>

              {LOSSES.map((row) => (
                <div
                  key={row.turns}
                  className="grid grid-cols-2 border-b border-gray-50 last:border-b-0 md:grid-cols-[1.3fr_1fr_1fr_1fr_1fr]"
                >
                  <div className="flex flex-col col-span-2 px-5 pt-4 pb-2 md:col-span-1 md:py-4">
                    <span className="text-sm font-semibold text-gray-800">
                      {row.turns} turnos
                    </span>
                    <span className="text-xs text-gray-400">
                      {row.deposits} en señas
                    </span>
                  </div>

                  {row.fees.map((fee, i) => (
                    <div key={FEE_COLUMNS[i]} className="flex flex-col gap-0.5 px-5 py-3 md:py-4">
                      <span className="text-xs font-semibold text-gray-500 md:hidden">
                        {FEE_COLUMNS[i]}
                      </span>
                      <span className="text-sm text-gray-700">-{fee}</span>
                    </div>
                  ))}

                  <div className="flex flex-col gap-0.5 px-5 py-3 bg-orange-50 md:py-4">
                    <span className="text-xs font-semibold text-orange-600 md:hidden">
                      SacaTurno
                    </span>
                    <span className="text-sm font-bold text-orange-600">$0</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-1 px-6 py-5 mt-4 border border-orange-600 bg-orange-50 rounded-xl md:flex-row md:items-center md:justify-between">
              <span className="text-sm font-medium text-gray-700">
                En un año, con 100 turnos por mes y 5% de comisión
              </span>
              <span className="text-lg font-bold text-orange-600">
                $120.000 que no llegan a tu cuenta
              </span>
            </div>

            <p className="mt-3 text-xs text-gray-400">
              Porcentajes que cobran hoy plataformas de turnos en Argentina, según
              el plan. Mercado Pago cobra aparte su propia comisión de
              procesamiento, en cualquier plataforma.
            </p>
          </section>

          <section className="w-full max-w-3xl mt-20">
            <h2 className="mb-8 text-3xl font-bold text-center text-gray-900 md:text-4xl">
              Preguntas frecuentes
            </h2>
            <div className="flex flex-col gap-4">
              {FAQ.map((item) => (
                <div
                  key={item.q}
                  className="flex flex-col gap-2 p-6 bg-white border border-gray-100 shadow-lg rounded-xl"
                >
                  <h3 className="text-sm font-semibold text-gray-800">{item.q}</h3>
                  <p className="text-sm text-gray-500">{item.a}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col items-center w-full max-w-3xl px-8 mt-20 mb-24 text-center bg-white border border-gray-100 shadow-lg py-14 rounded-xl">
            <h2 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">
              Quedate con toda tu seña
            </h2>
            <p className="max-w-xl mb-8 text-sm text-gray-500">
              Probá SacaTurno 15 días sin tarjeta. 0% de comisión sobre tus señas
              en todos los planes.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="px-6 py-3 text-sm font-semibold text-white transition-all duration-300 ease-in-out bg-orange-600 rounded-lg hover:bg-orange-700"
              >
                Empezar gratis
              </Link>
              <Link
                href="/demo"
                className="px-6 py-3 text-sm font-semibold text-orange-600 transition-all duration-300 ease-in-out border border-orange-600 rounded-lg hover:bg-orange-600 hover:text-white"
              >
                Ver la demo
              </Link>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default SenasSinComision;
