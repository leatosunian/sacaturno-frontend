import axiosReq from "@/config/axios";
import { NextPage } from "next";
import CalendarTurnos from "@/components/CalendarTurnos";
import { IAppointment } from "@/interfaces/appointment.interface";
import { useAuth } from "@/hooks/useAuth";
import AppointmentModal from "../../../components/AppointmentModal";
import { cookies } from "next/headers";
import { IBusiness } from "@/interfaces/business.interface";

interface Props {
  appointments: IAppointment[];
  businessData: IBusiness;
}

const getAppointments = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get("sacaturno_token");
  const ownerID = cookieStore.get("sacaturno_userID");
  const authHeader = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token?.value}`,
      'Cache-Control': 'no-store'
    },
  };

  const businessFetch = await axiosReq.get(
    `/business/get/${ownerID?.value}`,
    authHeader
  );
  const businessData: IBusiness = businessFetch.data;
  const appointments = await axiosReq.get(
    `/appointment/get/${businessData._id}`,
    authHeader
  );
  return { appointments: appointments.data, businessData };
};

const MisTurnos: React.FC<Props> = async () => {
  const data = await getAppointments();

  return (
    <>
      <div className="flex flex-col justify-center gap-10 md:flex-row">
        <div className="flex justify-center w-full h-full md:w-fit">
          <CalendarTurnos
            appointments={data.appointments}
            businessData={data.businessData}
          />
        </div>
      </div>
    </>
  );
};

export default MisTurnos;
