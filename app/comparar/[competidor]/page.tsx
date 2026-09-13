import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaCheck, FaMinus } from "react-icons/fa6";
import HeaderPublic from "@/components/home/HeaderPublic";
import Footer from "@/components/home/Footer";
import { COMPARISONS, getComparison } from "@/lib/comparisons";

interface propsComponent {
  params: {
    competidor: string;
  };
}

export function generateStaticParams() {
  return COMPARISONS.map((c) => ({ competidor: c.slug }));
}

export async function generateMetadata({
  params,
}: propsComponent): Promise<Metadata> {
  const comparison = getComparison(params.competidor.toLowerCase());

  if (!comparison) {
    return {
      title: "Comparativa no encontrada",
      robots: { index: false, follow: false },
    };
  }

  const url = `https://sacaturno.com.ar/comparar/${comparison.slug}`;

  return {
    title: comparison.metaTitle,
    description: comparison.metaDescription,
    keywords: [
      `sacaturno vs ${comparison.competitor.toLowerCase()}`,
      `alternativa a ${comparison.competitor.toLowerCase()}`,
      `${comparison.competitor.toLowerCase()} comisión`,
      "sistema de turnos argentina",
      "cobrar seña turnos",
    ],
    alternates: { canonical: url },
    openGraph: {
      title: comparison.metaTitle,
      description: comparison.metaDescription,
      url,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: comparison.metaTitle,
        },
      ],
    },
  };
}

const Comparar = ({ params }: propsComponent) => {
  const comparison = getComparison(params.competidor.toLowerCase());

  if (!comparison) notFound();

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: comparison.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

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
              Comparativa
            </span>
            <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
              {comparison.heading}
            </h1>
            <p className="max-w-2xl mb-6 text-base text-gray-500 md:text-lg">
              {comparison.subheading}
            </p>
            <p className="text-xs text-gray-400">
              Datos de {comparison.competitor} verificados el{" "}
              {comparison.verifiedAt} en{" "}
              <a
                href={comparison.sourceUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="underline transition-colors duration-200 ease-in-out hover:text-orange-600"
              >
                {comparison.sourceLabel}
              </a>
              . Si algo cambió, escribinos y lo corregimos.
            </p>
          </section>

          <section className="w-full max-w-4xl mt-14">
            <div className="overflow-hidden bg-white border border-gray-100 shadow-lg rounded-xl">
              <div className="hidden border-b border-gray-100 bg-gray-50 md:grid md:grid-cols-[1.2fr_1fr_1fr]">
                <span className="px-5 py-3 text-xs font-semibold text-gray-600"></span>
                <span className="px-5 py-3 text-xs font-semibold text-orange-600">
                  SacaTurno
                </span>
                <span className="px-5 py-3 text-xs font-semibold text-gray-600">
                  {comparison.competitor}
                </span>
              </div>

              {comparison.rows.map((row) => (
                <div
                  key={row.feature}
                  className="grid grid-cols-1 border-b border-gray-50 last:border-b-0 md:grid-cols-[1.2fr_1fr_1fr]"
                >
                  <span className="px-5 pt-4 pb-2 text-sm font-semibold text-gray-800 md:py-4 md:font-medium">
                    {row.feature}
                  </span>

                  <div
                    className={`flex flex-col gap-1 px-5 py-3 md:py-4 ${
                      row.advantage === "us" ? "bg-orange-50" : ""
                    }`}
                  >
                    <span className="text-xs font-semibold text-orange-600 md:hidden">
                      SacaTurno
                    </span>
                    <span className="text-sm text-gray-700">{row.us}</span>
                  </div>

                  <div
                    className={`flex flex-col gap-1 px-5 py-3 md:py-4 ${
                      row.advantage === "them" ? "bg-gray-100" : ""
                    }`}
                  >
                    <span className="text-xs font-semibold text-gray-500 md:hidden">
                      {comparison.competitor}
                    </span>
                    <span className="text-sm text-gray-700">{row.them}</span>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-3 text-xs text-gray-400">
              Las filas resaltadas en naranja son las que gana SacaTurno; las
              grises, las que gana {comparison.competitor}.
            </p>
          </section>

          <section className="w-full max-w-4xl mt-20">
            <h2 className="mb-2 text-3xl font-bold text-center text-gray-900 md:text-4xl">
              {comparison.example.title}
            </h2>
            <p className="max-w-2xl mx-auto mb-8 text-sm text-center text-gray-500">
              {comparison.example.intro}
            </p>

            <div className="flex flex-col gap-3">
              {comparison.example.lines.map((line) => (
                <div
                  key={line.label}
                  className={`flex flex-col gap-1 px-6 py-4 border rounded-xl md:flex-row md:items-center md:justify-between ${
                    line.highlight
                      ? "border-orange-600 bg-orange-50"
                      : "bg-white border-gray-100"
                  }`}
                >
                  <span className="text-sm font-medium text-gray-700">
                    {line.label}
                  </span>
                  <span
                    className={`text-lg font-bold ${
                      line.highlight ? "text-orange-600" : "text-gray-800"
                    }`}
                  >
                    {line.value}
                  </span>
                </div>
              ))}
            </div>

            <p className="max-w-2xl mx-auto mt-6 text-sm text-center text-gray-500">
              {comparison.example.conclusion}
            </p>
          </section>

          <section className="grid w-full max-w-4xl grid-cols-1 gap-6 mt-20 md:grid-cols-2">
            <div className="flex flex-col gap-4 p-8 bg-white border border-gray-100 shadow-lg rounded-xl">
              <h2 className="text-xl font-bold text-gray-900">
                {comparison.chooseThem.title}
              </h2>
              <ul className="flex flex-col gap-3">
                {comparison.chooseThem.points.map((point) => (
                  <li key={point} className="flex gap-3 text-sm text-gray-600">
                    <FaMinus size={12} className="mt-1 text-gray-400 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-4 p-8 bg-white border border-orange-600 shadow-lg rounded-xl">
              <h2 className="text-xl font-bold text-gray-900">
                {comparison.chooseUs.title}
              </h2>
              <ul className="flex flex-col gap-3">
                {comparison.chooseUs.points.map((point) => (
                  <li key={point} className="flex gap-3 text-sm text-gray-600">
                    <FaCheck size={12} className="mt-1 text-orange-600 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="w-full max-w-3xl mt-20">
            <h2 className="mb-8 text-3xl font-bold text-center text-gray-900 md:text-4xl">
              Preguntas frecuentes
            </h2>
            <div className="flex flex-col gap-4">
              {comparison.faq.map((item) => (
                <div
                  key={item.q}
                  className="flex flex-col gap-2 p-6 bg-white border border-gray-100 shadow-lg rounded-xl"
                >
                  <h3 className="text-sm font-semibold text-gray-800">
                    {item.q}
                  </h3>
                  <p className="text-sm text-gray-500">{item.a}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col items-center w-full max-w-3xl px-8 mt-20 mb-24 text-center bg-white border border-gray-100 shadow-lg py-14 rounded-xl">
            <h2 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">
              Probalo 15 días gratis
            </h2>
            <p className="max-w-xl mb-8 text-sm text-gray-500">
              Sin tarjeta y sin comisión sobre tus señas. Cargás tus servicios y
              tu página de reservas queda publicada hoy.
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

export default Comparar;
