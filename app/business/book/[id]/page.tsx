import CalendarBookAppointment from "@/components/CalendarBookAppointment";
import axiosReq from "@/config/axios";
import { IAppointment } from "@/interfaces/appointment.interface";
import { IBusiness } from "@/interfaces/business.interface";
import { Metadata } from "next";
import { LuCalendarClock } from "react-icons/lu";

interface propsComponent {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: propsComponent): Promise<Metadata> {
  const id = params.id;
  const businessFetch = await axiosReq.get(`/business/getbyid/${id}`);
  const businessData: IBusiness = businessFetch.data;
  return {
    title: `${businessData.name} | SacaTurno`,
    description: "Aplicación de turnos online",
  };
}


const getAppointments = async (ID: string) => {
  const businessFetch = await axiosReq.get(`/business/getbyid/${ID}`);
  const businessData: IBusiness = businessFetch.data;
  const appointments = await axiosReq.get(
    `/appointment/get/${businessData._id}`
  );

  return { appointments: appointments.data, businessData };
};


const BookAppointment: React.FC<propsComponent> = async ({ params }) => {
  const data = await getAppointments(params.id);
  console.log(data);

  return (
    <>
      <div className="flex flex-col justify-center gap-10 md:flex-row">
        <div className="flex justify-center w-full h-full md:w-fit">
          {data.appointments.length > 0 && (
            <CalendarBookAppointment
              appointments={data.appointments}
              businessData={data.businessData}
            />
          )}
          {data.appointments.length === 0 && (
            <div style={{height:'calc(100vh - 64px)'}} className="flex flex-col items-center justify-center w-full gap-6">
              <LuCalendarClock color="#dd4924" size={90} />
              <span className="sm:text-lg text-md md:text-xl" ><b>{data.businessData.name} </b>no tiene turnos disponibles.</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BookAppointment;
