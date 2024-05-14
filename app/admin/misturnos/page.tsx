import axiosReq from "@/config/axios";
import CalendarTurnos from "@/components/CalendarTurnos";
import { IAppointment } from "@/interfaces/appointment.interface";
import { cookies } from "next/headers";
import { IBusiness } from "@/interfaces/business.interface";
import { IService } from "@/interfaces/service.interface";
import warningImage from '@/public/warning.png'
import Image from "next/image";
import styles from '@/app/css-modules/CreateAppointmentModal.module.css'
import Link from "next/link";

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
      "Cache-Control": "no-store",
    },
  };

  const businessFetch = await axiosReq.get(
    `/business/get/${ownerID?.value}`,
    authHeader
  );
  const businessData: IBusiness = businessFetch.data;

  const appointmentsFetch = await axiosReq.get(
    `/appointment/get/${businessData._id}`,
    authHeader
  );

  const servicesFetch = await axiosReq.get(
    `/business/service/get/${businessData._id}`,
    authHeader
  );
  const services: IService[] = servicesFetch.data;
  return { appointments: appointmentsFetch.data, businessData, services };
};

const MisTurnos: React.FC = async () => {
  const data = await getAppointments();
  return (
    <>
      <div className="flex flex-col justify-center gap-10 md:flex-row">
        <div className="flex justify-center w-full h-full md:w-fit">
          {data.businessData.name && (
            <CalendarTurnos
              appointments={data.appointments}
              businessData={data.businessData}
              servicesData={data.services}
            />
          )}
          {data.appointments.length === 0 && (
            <div
              style={{ height: "calc(100vh - 64px)" }}
              className="flex flex-col items-center justify-center gap-6 px-4 text-center min-w-40 w-fit"
            >
              <Image alt="Warning" src={warningImage} width={90} />
              <span className="font-semibold sm:text-lg text-md md:text-xl">
                ¡Creá tu empresa para comenzar a cargar tus turnos!
              </span>
              <Link href="/admin/miempresa/create">
                <button className={styles.button} >Crear empresa</button>              
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MisTurnos;
