import axiosReq from "@/config/axios";
import { IBusiness } from "@/interfaces/business.interface";
import { IoIosAlert } from "react-icons/io";
import { LuCalendarClock } from "react-icons/lu";
import { Metadata } from "next";
import ListBookAppointment from "@/components/home/bookAppointments/ListBookAppointment";
import Footer from "@/components/home/Footer";
import HeaderPublic from "@/components/home/HeaderPublic";
import MercadoPagoResultModal from "@/components/payments/MercadoPagoResultModal";
import { composeBranchAddress } from "@/lib/utils";

interface propsComponent {
  params: {
    slug: string;
  };
}

interface AddressBranch {
  street?: string;
  number?: string;
  city?: string;
}

// Con sucursales cargadas, ellas son la fuente de verdad para la dirección:
// con una sola sucursal se usa su dirección puntual; con 2+ es ambiguo y se omite.
function resolveSingleLocationAddress(address: string | undefined, branches: AddressBranch[]): string | null {
  if (branches.length === 0) return address || null;
  if (branches.length === 1) return composeBranchAddress(branches[0]) || null;
  return null;
}

export async function generateMetadata({
  params,
}: propsComponent): Promise<Metadata> {
  const slug = params.slug.toLowerCase();
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
  const displayAddress = resolveSingleLocationAddress(businessData.address, branches);

  const title = `${businessData.name}`;
  const description = `Reservá un turno en ${businessData.name}${businessData.businessType ? ` — ${businessData.businessType}` : ""}${displayAddress ? `. Ubicados en ${displayAddress}` : ""}. Reservá online fácil y rápido con SacaTurno.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://sacaturno.com.ar/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://sacaturno.com.ar/${slug}`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
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
  const data = await getAppointments(params.slug);
  const bookingsEnabled = data.businessData.bookingsEnabled !== false;

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000/api";
  const jsonLdAddress = resolveSingleLocationAddress(data.businessData.address, data.branches);

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
        ...(jsonLdAddress && {
          address: {
            "@type": "PostalAddress",
            streetAddress: jsonLdAddress,
            addressCountry: "AR",
          },
        }),
        ...(data.businessData.phone && {
          telephone: String(data.businessData.phone),
        }),
        ...(data.businessData.email && { email: data.businessData.email }),
        ...(data.businessData.image &&
          data.businessData.image !== "user.png" && {
            image: `${backendUrl}/user/getprofilepic/${data.businessData.image}`,
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
              {data.businessData.phone ? (
                <p className="text-sm md:text-base text-gray-600">
                  Podés contactarlos al <b>{data.businessData.phone}</b> para coordinar un turno.
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
