import axiosReq from "@/config/axios";
import { IBusiness } from "@/interfaces/business.interface";
import { IoIosAlert } from "react-icons/io";
import { LuCalendarClock } from "react-icons/lu";
import { Metadata } from "next";
import ListBookAppointment from "@/components/home/bookAppointments/ListBookAppointment";
import Footer from "@/components/home/Footer";
import HeaderPublic from "@/components/home/HeaderPublic";
import MercadoPagoResultModal from "@/components/payments/MercadoPagoResultModal";
import { notFound } from "next/navigation";
import { composeBranchAddress, resolveContactPhone } from "@/lib/utils";
import { resolveImageUrl } from "@/lib/images";
import { buildSocial } from "@/lib/seo";

interface propsComponent {
  params: {
    slug: string;
  };
}

// Esta ruta vive en la raiz, asi que se come cualquier path de un solo
// segmento. Sin este guard, un asset inexistente (/og-image.png) no da 404:
// el fetch al backend falla, Next renderiza el error boundary y lo devuelve
// con status 200 y content-type text/html. Un scraper pide una imagen, recibe
// 200 OK con 14 KB de HTML y no reintenta; Google lo cuenta como duplicado.
const FILE_EXTENSION = /\.[a-z0-9]{2,5}$/i;

// Archivos que Next sirve desde la raiz por convencion: no son slugs, pero
// tampoco los tiene que atender esta ruta.
const NEXT_ROOT_FILES = new Set([
  "favicon.ico",
  "icon.png",
  "apple-icon.png",
  "opengraph-image.png",
  "twitter-image.png",
  "manifest.json",
  "manifest.webmanifest",
  "robots.txt",
  "sitemap.xml",
]);

function isAssetRequest(slug: string): boolean {
  const name = slug.toLowerCase();
  return !NEXT_ROOT_FILES.has(name) && FILE_EXTENSION.test(name);
}

interface AddressBranch {
  street?: string;
  number?: string;
  city?: string;
  province?: string;
}

// Con sucursales cargadas, ellas son la fuente de verdad para la dirección:
// con una sola sucursal se usa su dirección puntual; con 2+ es ambiguo y se omite.
function resolveSingleLocation(business: AddressBranch, branches: AddressBranch[]): AddressBranch | null {
  if (branches.length === 0) return business;
  if (branches.length === 1) return branches[0];
  return null;
}

export async function generateMetadata({
  params,
}: propsComponent): Promise<Metadata> {
  const slug = params.slug.toLowerCase();
  // notFound() acá tira 500 en Next 13.4.8: el 404 real lo emite el componente.
  if (isAssetRequest(slug)) {
    return { title: "Archivo no encontrado", robots: { index: false, follow: false } };
  }

  const businessFetch = await axiosReq.get(`/business/getbyslug/${slug}`);
  const businessData: IBusiness = businessFetch.data;

  if (!businessData?.name ) {
    return {
      title: "Empresa no encontrada",
      robots: { index: false, follow: false },
    };
  }

  const branches = businessData._id
    ? await axiosReq.get(`/branch/public/list/${businessData._id}`).then((r) => r.data ?? []).catch(() => [])
    : [];
  const metadataLocation = resolveSingleLocation(businessData, branches);
  const displayAddress = metadataLocation ? composeBranchAddress(metadataLocation) : "";

  const title = `${businessData.name}`;
  const description = `Reservá un turno en ${businessData.name}${businessData.businessType ? ` — ${businessData.businessType}` : ""}${displayAddress ? `. Ubicados en ${displayAddress}` : ""}. Reservá online fácil y rápido con SacaTurno.`;

  return {
    title,
    description,
    ...buildSocial({
      title,
      description,
      path: `/${slug}`,
      imageAlt: `${businessData.name} — Reservá tu turno con SacaTurno`,
    }),
  };
}

const getAppointments = async (ID: string) => {
  const businessFetch = await axiosReq.get(`/business/getbyslug/${ID}`);
  const businessData: IBusiness = businessFetch.data;
  if (businessData._id) {
    const [appointments, scheduleDaysFetch, employeesRes, branchesRes] = await Promise.all([
      axiosReq.get(`/appointment/public/get/${businessData._id}`),
      axiosReq.get(`/schedule/get/${businessData._id}`),
      axiosReq.get(`/employee/public/list/${businessData._id}`).catch(() => ({ data: [] })),
      axiosReq.get(`/branch/public/list/${businessData._id}`).catch(() => ({ data: [] })),
    ]);
    const scheduleDays = scheduleDaysFetch?.data?.days ?? [];

    return {
      appointments: appointments.data ?? [],
      businessData,
      scheduleDays,
      employees: employeesRes.data ?? [],
      branches: branchesRes.data ?? [],
    };
  }
  return { appointments: [], businessData, scheduleDays: [], employees: [], branches: [] };
};

const BookAppointment: React.FC<propsComponent> = async ({ params }) => {
  if (isAssetRequest(params.slug)) notFound();

  const data = await getAppointments(params.slug);
  const bookingsEnabled = data.businessData.bookingsEnabled !== false;

  const jsonLdLocation = resolveSingleLocation(data.businessData, data.branches);
  const jsonLdStreet = jsonLdLocation
    ? [jsonLdLocation.street, jsonLdLocation.number].filter(Boolean).join(" ")
    : "";
  const contactPhone = resolveContactPhone(
    data.businessData.phone,
    data.branches.length === 1 ? data.branches[0] : null
  );

  const jsonLd = data.businessData.name
    ? {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: data.businessData.name,
        "@id": `https://sacaturno.com.ar/${params.slug}`,
        url: `https://sacaturno.com.ar/${params.slug}`,
        ...(data.businessData.businessType && {
          description: data.businessData.businessType,
        }),
        ...(jsonLdStreet && {
          address: {
            "@type": "PostalAddress",
            streetAddress: jsonLdStreet,
            ...(jsonLdLocation?.city && { addressLocality: jsonLdLocation.city }),
            ...(jsonLdLocation?.province && { addressRegion: jsonLdLocation.province }),
            addressCountry: "AR",
          },
        }),
        ...(contactPhone && {
          telephone: String(contactPhone),
        }),
        ...(data.businessData.email && { email: data.businessData.email }),
        ...(resolveImageUrl(data.businessData.image) && {
          image: resolveImageUrl(data.businessData.image)!,
        }),
        ...(bookingsEnabled && {
          makesOffer: {
            "@type": "Offer",
            url: `https://sacaturno.com.ar/${params.slug}`,
            description: "Reserva de turnos online",
          },
        }),
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <HeaderPublic />
      {/* Resultado del pago de la seña al volver del Checkout Pro de MP */}
      <MercadoPagoResultModal variant="deposit" />
      <div className="flex flex-col justify-center gap-10 md:flex-row">
        <div className="flex justify-center w-full h-full md:w-full">
          {/* <CalendarBookAppointment
              appointments={data.appointments}
              businessData={data.businessData}
              scheduleDays={data.scheduleDays}
            /> */}
          {data.businessData.name && bookingsEnabled &&
            <ListBookAppointment
              appointments={data.appointments}
              businessData={data.businessData}
              scheduleDays={data.scheduleDays}
              employees={data.employees}
              branches={data.branches}
            />
          }
          {data.businessData.name && !bookingsEnabled && (
            <div
              style={{ height: "calc(100vh - 64px)" }}
              className="flex flex-col items-center justify-center w-full gap-4 px-6 text-center"
            >
              <LuCalendarClock color="#dd4924" size={80} />
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                <span className="capitalize">{data.businessData.name}</span> no está aceptando reservas online por ahora
              </h2>
              {contactPhone ? (
                <p className="text-sm md:text-base text-gray-600">
                  Podés contactarlos al <b>{contactPhone}</b> para coordinar un turno.
                </p>
              ) : (
                <p className="text-sm md:text-base text-gray-600">
                  Volvé a intentarlo más tarde.
                </p>
              )}
            </div>
          )}
          {/* {data.appointments.length === 0 && data.businessData.name && (
            <div
              style={{ height: "calc(100vh - 64px)" }}
              className="flex flex-col items-center justify-center w-full gap-6"
            >
              <LuCalendarClock color="#dd4924" size={90} />
              <span className="sm:text-lg text-md md:text-xl">
                <b>{data.businessData.name} </b>no tiene turnos disponibles.
              </span>
            </div>
          )} */}
          {!data.businessData.name && (
            <div
              style={{ height: "calc(100vh - 64px)" }}
              className="flex flex-col items-center justify-center w-full gap-2"
            >
              <IoIosAlert size={100} color="#d7a954" />
              <span className="sm:text-lg text-md md:text-xl">
                La empresa
                <b className="capitalize"> {params.slug} </b>no existe.
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="hidden md:block">

      <Footer />
      </div>
    </>
  );
};

export default BookAppointment;
