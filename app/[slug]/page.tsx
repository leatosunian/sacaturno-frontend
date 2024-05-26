import CalendarBookAppointment from "@/components/CalendarBookAppointment";
import axiosReq from "@/config/axios";
import { IAppointment } from "@/interfaces/appointment.interface";
import { IBusiness } from "@/interfaces/business.interface";
import { IService } from "@/interfaces/service.interface";


const getAppointments = async (ID: string) => {
  const businessFetch = await axiosReq.get(`/business/getbyslug/${ID}`);
  const businessData: IBusiness = businessFetch.data;
  const appointments = await axiosReq.get(`/appointment/get/${businessData._id}`);
  return { appointments: appointments.data, businessData };
};

interface propsComponent {
  params: {
    slug: string
  }
}

const BookAppointment: React.FC<propsComponent> = async ({params}) => {
  console.log(params);
  
  const data = await getAppointments(params.slug);
  return (
    <>
      <div className="flex flex-col justify-center gap-10 md:flex-row">
        <div className="flex justify-center w-full h-full mt-16 md:w-fit">
          { data.appointments.length > 0 &&
          <CalendarBookAppointment
            appointments={data.appointments}
            businessData={data.businessData}
          />}
        </div> 
      </div>
    </>
  );
};

export default BookAppointment;
