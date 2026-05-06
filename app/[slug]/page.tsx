import axiosReq from "@/config/axios";
import { IBusiness } from "@/interfaces/business.interface";
import { IoIosAlert } from "react-icons/io";
import { Metadata } from "next";
import ListBookAppointment from "@/components/home/bookAppointments/ListBookAppointment";
import Footer from "@/components/home/Footer";

interface propsComponent {
  params: {
    slug: string;
  };
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

  const title = `${businessData.name}`;
  const description = `Reservá un turno en ${businessData.name}${businessData.businessType ? ` — ${businessData.businessType}` : ""}${businessData.address ? `. Ubicados en ${businessData.address}` : ""}. Reservá online fácil y rápido con SacaTurno.`;

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
    const appointments = await axiosReq.get(
      `/appointment/public/get/${businessData._id}`
    );
    const scheduleDaysFetch = await axiosReq.get(
      `/schedule/get/${businessData._id}`,
    );
    const scheduleDays = scheduleDaysFetch?.data?.days ?? [];

    return { appointments: appointments.data ?? [], businessData, scheduleDays };
  }
  return { appointments: [], businessData, scheduleDays: [] };
};

const BookAppointment: React.FC<propsComponent> = async ({ params }) => {
  const data = await getAppointments(params.slug);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000/api";

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
        ...(data.businessData.address && {
          address: {
            "@type": "PostalAddress",
            streetAddress: data.businessData.address,
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
        makesOffer: {
          "@type": "Offer",
          url: `https://sacaturno.com.ar/${params.slug}`,
          description: "Reserva de turnos online",
        },
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
      <div className="flex flex-col justify-center gap-10 md:flex-row">
        <div className="flex justify-center w-full h-full mt-16 md:w-full">
          {/* <CalendarBookAppointment
              appointments={data.appointments}
              businessData={data.businessData}
              scheduleDays={data.scheduleDays}
            /> */}
          {data.businessData.name &&
            <ListBookAppointment
              appointments={data.appointments}
              businessData={data.businessData}
              scheduleDays={data.scheduleDays}
            />
          }
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
