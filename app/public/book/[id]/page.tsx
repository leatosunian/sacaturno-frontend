import CalendarBookAppointment from "@/components/CalendarBookAppointment";
import axiosReq from "@/config/axios";
import { IAppointment } from "@/interfaces/appointment.interface";
import { IBusiness } from "@/interfaces/business.interface";
import { cookies } from "next/headers";
import { GetServerSideProps } from 'next'
import { IService } from "@/interfaces/service.interface";

interface Props {
  appointments: IAppointment[];
  businessData: IBusiness;
  servicesData: IService[];
}

const getAppointments = async (ID: string) => {
  const businessFetch = await axiosReq.get(`/business/getbyid/${ID}`);
  const businessData: IBusiness = businessFetch.data;
  const appointments = await axiosReq.get(`/appointment/get/${businessData._id}`);
  return { appointments: appointments.data, businessData };
};

interface propsComponent {
  params: {
    id: string
  }
}

async function getServicesData() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("sacaturno_token");
    const ownerID = cookieStore.get("sacaturno_userID");
    const authHeader = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token?.value}`,
      },
    };
    const allServices = await axiosReq.get(
      `/business/service/get/user/${ownerID?.value}`,
      authHeader
    );
    return allServices.data;
  } catch (error) {
    const response_data = {
      _id: "",
      name: "",
      businessID: "",
      owner: "",
    };
    return { response_data };
  }
}

const BookAppointment: React.FC<propsComponent> = async ({params}) => {
  const data = await getAppointments(params.id);
  const services: IService[] = await getServicesData();
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
