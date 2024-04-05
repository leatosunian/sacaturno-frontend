/*import axiosReq from "@/config/axios";
import { IAppointment } from "@/interfaces/appointment.interface";
import { IBusiness } from "@/interfaces/business.interface";
import { cookies } from "next/headers";
import { GetServerSideProps } from 'next'
import PublicCalendarBookAppointment from "@/components/PublicCalendarBookAppointment";

interface Props {
  appointments: IAppointment[];
  businessData: IBusiness;
}

/*export const getServerSideProps: GetServerSideProps = async (context) => {
  const { params } = context
  

  // Make the data available to the page component
  return {
    props: {
      params,
    },
  }
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

const BookAppointment: React.FC<propsComponent> = async (paramss) => {
  const {params} = paramss  
  const data = await getAppointments(params.id);
  return (
    <>
      <div className="flex flex-col justify-center gap-10 md:flex-row">
        <div className="flex justify-center w-full h-full md:w-fit">
          { data.appointments.length > 0 &&
          <PublicCalendarBookAppointment
            appointments={data.appointments}
            businessData={data.businessData}
          />}
        </div>
      </div>
    </>
  );
};

export default BookAppointment;*/