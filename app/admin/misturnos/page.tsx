import axiosReq from "@/config/axios";
import CalendarTurnos from "@/components/CalendarTurnos";
import { IAppointment } from "@/interfaces/appointment.interface";
import { cookies } from "next/headers";
import { IBusiness } from "@/interfaces/business.interface";
import { IService } from "@/interfaces/service.interface";
import warningImage from "@/public/warning.png";
import Image from "next/image";
import styles from "@/app/css-modules/CreateAppointmentModal.module.css";
import Link from "next/link";
import dayjs from "dayjs";
import ISubscription from "@/interfaces/subscription.interface";
import { IoIosAlert } from "react-icons/io";

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

async function getSubscriptionData() {
  const cookieStore = cookies();
  const token = cookieStore.get("sacaturno_token");
  const ownerID = cookieStore.get("sacaturno_userID");
  const authHeader = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token?.value}`,
    },
  };
  const subscriptionData = await axiosReq.get(
    `/subscription/get/ownerID/${ownerID?.value}`,
    authHeader
  );

  if (subscriptionData.data) {
    const subscription: ISubscription = {
      businessID: subscriptionData.data.businessID,
      ownerID: subscriptionData.data.ownerID,
      subscriptionType: subscriptionData.data.subscriptionType,
      paymentDate: dayjs(subscriptionData.data.paymentDate).format(
        "DD/MM/YYYY"
      ),
      expiracyDate: dayjs(subscriptionData.data.expiracyDate).format(
        "DD/MM/YYYY"
      ),
      expiracyDay: subscriptionData.data.expiracyDay,
      expiracyMonth: subscriptionData.data.expiracyMonth,
    };
    return subscription;
  }
}

const MisTurnos: React.FC = async () => {
  const data = await getAppointments();
  const subscription: ISubscription | undefined = await getSubscriptionData();

  return (
    <>
      <div className="flex flex-col justify-center gap-10 md:flex-row">
        <div className="flex justify-center w-full h-full md:w-fit">
          {data.businessData.name && (
            <CalendarTurnos
              appointments={data.appointments}
              businessData={data.businessData}
              servicesData={data.services}
              subscriptionData={subscription}
            />
          )}
          {!data.businessData.name && (
            <div
              style={{ height: "calc(100vh - 64px)" }}
              className="flex flex-col items-center justify-center gap-6 px-4 text-center min-w-40 w-fit"
            >
              <IoIosAlert size={100} color="#d7a954" />
              <span className="font-semibold sm:text-lg text-md md:text-xl">
                ¡Creá tu empresa para comenzar a cargar tus turnos!
              </span>
              <Link href="/admin/miempresa/create">
                <button className={styles.button}>Crear empresa</button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MisTurnos;
