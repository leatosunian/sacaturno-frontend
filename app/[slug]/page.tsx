import axiosReq from "@/config/axios";
import { IBusiness } from "@/interfaces/business.interface";
import { IoIosAlert } from "react-icons/io";
import { LuCalendarClock } from "react-icons/lu";
import { Metadata } from "next";
import CalendarBookAppointment from "@/components/home/bookAppointments/CalendarBookAppointment";

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
  return {
    title: `${businessData.name} | SacaTurno`,
    description: "Aplicación de turnos online",
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
    const scheduleDays = scheduleDaysFetch.data.days;

    return { appointments: appointments.data, businessData, scheduleDays };
  }
  return { appointments: {}, businessData };
};

const BookAppointment: React.FC<propsComponent> = async ({ params }) => {
  const data = await getAppointments(params.slug);
  return (
    <>
      <div className="flex flex-col justify-center gap-10 md:flex-row">
        <div className="flex justify-center w-full h-full mt-16 md:w-fit">
          {data.appointments.length > 0 && (
            <CalendarBookAppointment
              appointments={data.appointments}
              businessData={data.businessData}
              scheduleDays={data.scheduleDays}
            />
          )}
          {data.appointments.length === 0 && data.businessData.name && (
            <div
              style={{ height: "calc(100vh - 64px)" }}
              className="flex flex-col items-center justify-center w-full gap-6"
            >
              <LuCalendarClock color="#dd4924" size={90} />
              <span className="sm:text-lg text-md md:text-xl">
                <b>{data.businessData.name} </b>no tiene turnos disponibles.
              </span>
            </div>
          )}
          {!data.businessData.name && (
            <div
              style={{ height: "calc(100vh - 64px)" }}
              className="flex flex-col items-center justify-center w-full gap-2"
            >
              <IoIosAlert size={100} color="#d7a954" />
              <span className="sm:text-lg text-md md:text-xl">
                La empresa
                <b> {params.slug} </b>no existe.
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BookAppointment;
