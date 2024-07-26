"use client";
import { IBusiness } from "@/interfaces/business.interface";
import { IUser } from "@/interfaces/user.interface";
import { LuCalendarPlus } from "react-icons/lu";
import { MdOutlineWorkOutline } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import Link from "next/link";
import { IoMdMore } from "react-icons/io";
import styles from "@/app/css-modules/FormMiEmpresa.module.css";
import { IAppointment } from "@/interfaces/appointment.interface";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/es-mx";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import advanced from "dayjs/plugin/advancedFormat";
import AppointmentModal from "./appointments/AppointmentModal";

interface Props {
  businessData:
    | {
        business: IBusiness | undefined;
        appointments: IAppointment[] | undefined;
      }
    | undefined;
  userData: IUser | undefined;
}

interface eventType extends IAppointment {
  start: Date;
  end: Date;
  title: string | undefined;
  businessID?: string | undefined;
  clientID: string | "" | undefined;
  _id?: string | undefined;
  name: string | undefined;
  email: string | undefined;
  phone: number | undefined;
  service: string | undefined;
  status?: "booked" | "unbooked" | undefined;
  price: number | undefined;
}
interface eventType2 {
  start: string;
  end: string;
  title: string | undefined;
  clientID: string | "" | undefined;
  _id?: string | undefined;
  name: string | undefined;
  email: string | undefined;
  phone: number | undefined;
  service: string | undefined;
  status?: "booked" | "unbooked" | undefined;
  price: number | undefined;
}
const DashboardComponent: React.FC<Props> = ({ businessData, userData }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [appointmentsData, setAppointmentsData] = useState<eventType[]>();
  const [appointmentInfoModal, setAppointmentInfoModal] =
    useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = useState<eventType2>();
 
  useEffect(() => {
    parseAppointments(businessData?.appointments);
    return;
  }, [businessData]);

  const handleSelectEvent = (event: eventType) => {
    const eventDataObj: eventType2 = {
      _id: event._id,
      start: dayjs(event.start).format("D [de] MMMM [|] HH:mm [hs]"),
      end: dayjs(event.end).format("[-] HH:mm [hs]"),
      clientID: event.clientID,
      title: event.title,
      status: event.status,
      name: event.name,
      phone: event.phone,
      email: event.email,
      service: event.service,
      price: event.price
    };
    setSelectedAppointment(eventDataObj);
    setAppointmentInfoModal(true);
  };

  const parseAppointments = (appointments: IAppointment[] | undefined) => {
    dayjs.extend(timezone);
    dayjs.extend(utc);
    dayjs.extend(advanced);

    let appointmentsList: eventType[] = [];

    appointments?.map(
      ({
        start,
        end,
        title,
        clientID,
        businessID,
        _id,
        status,
        name,
        email,
        phone,
        service,
        price
      }) => {
        let appointmentObj: eventType;
        appointmentObj = {
          start: dayjs(start).tz("America/Argentina/Buenos_Aires").toDate(),
          end: dayjs(end).tz("America/Argentina/Buenos_Aires").toDate(),
          title,
          clientID,
          status,
          businessID,
          _id,
          name,
          email,
          phone,
          service,
          price
        };
        if (appointmentObj.status === "booked") {
          appointmentsList.push(appointmentObj);
        }
      }
    );
    setAppointmentsData(appointmentsList);
    setLoading(false);
    appointmentsList.sort((a, b) => a.start.getTime() - b.start.getTime());
    return appointmentsList;
  };

  return (
    <>
      {/* APPOINTMENT INFO */}
      {appointmentInfoModal && (
        <AppointmentModal
          appointment={selectedAppointment}
          closeModalF={() => setAppointmentInfoModal(false)}
          onDeleteAppointment={() => {}}
        />
      )}
      <div className="flex w-full h-full pt-8 px-7 sm:px-24 md:pt-16 md:px-24 lg:px-36 xl:px-60 2xl:px-80">
        <div className="flex flex-col w-full gap-7 md:gap-12 h-fit">
          <h4 className="text-2xl font-semibold md:text-3xl">
            ¡Bienvenido, {userData?.name}!
          </h4>

          <div className="flex flex-col gap-6">
            <span className="text-xl font-semibold sm:text-2xl">
              &#128204; Acceso rápido
            </span>

            <div className="flex-col hidden gap-4 md:flex md:gap-16 md:flex-row">
              <Link href="/admin/misturnos">
                <div className="flex flex-col gap-1 md:gap-4">
                  <div
                    style={{ backgroundColor: "#dd4924" }}
                    className="flex items-end justify-end w-full h-20 p-5 md:h-32 md:w-40 xl:w-52 rounded-2xl"
                  >
                    <div className="hidden md:flex">
                      <LuCalendarPlus size={40} color="white" />
                    </div>
                    <div className="flex md:hidden">
                      <LuCalendarPlus size={30} color="white" />
                    </div>
                  </div>
                  <span className="text-sm font-semibold md:text-lg">
                    Agregar turno
                  </span>
                </div>
              </Link>
              <Link href="/admin/miempresa">
                <div className="flex flex-col gap-1 md:gap-4">
                  <div
                    style={{ backgroundColor: "#dd4924" }}
                    className="flex items-end justify-end w-full h-20 p-5 md:h-32 md:w-40 xl:w-52 rounded-2xl"
                  >
                    <MdOutlineWorkOutline size={40} color="white" />
                  </div>
                  <span className="text-sm font-semibold md:text-lg">
                    Editar empresa
                  </span>
                </div>
              </Link>
              <Link href="/admin/miempresa/settings">
                <div className="flex flex-col gap-1 md:gap-4">
                  <div
                    style={{ backgroundColor: "#dd4924" }}
                    className="flex items-end justify-end w-full h-20 p-5 md:h-32 md:w-40 xl:w-52 rounded-2xl"
                  >
                    <FaRegEdit size={40} color="white" />
                  </div>
                  <span className="text-sm font-semibold text-left md:text-lg">
                    Editar servicios
                  </span>
                </div>
              </Link>
            </div>

            <div className="flex flex-col gap-4 md:hidden md:gap-16 md:flex-row">
              <Link href="/admin/misturnos">
                <div className="flex flex-col gap-1 md:gap-4">
                  <div
                    style={{ backgroundColor: "#dd4924" }}
                    className="flex items-center justify-between w-full p-5 h-14 md:h-32 md:w-52 rounded-2xl"
                  >
                    <span className="text-sm font-medium text-white md:text-lg">
                      Agregar turno
                    </span>
                    <div className="hidden md:flex">
                      <LuCalendarPlus size={45} color="white" />
                    </div>
                    <div className="flex md:hidden">
                      <LuCalendarPlus size={26} color="white" />
                    </div>
                  </div>
                </div>
              </Link>
              <Link href="/admin/miempresa">
                <div className="flex flex-col gap-1 md:gap-4">
                  <div
                    style={{ backgroundColor: "#dd4924" }}
                    className="flex items-center justify-between w-full p-5 h-14 md:h-32 md:w-52 rounded-2xl"
                  >
                    <span className="text-sm font-medium text-white md:text-lg">
                      Editar empresa
                    </span>
                    <div className="hidden md:flex">
                      <MdOutlineWorkOutline size={45} color="white" />
                    </div>
                    <div className="flex md:hidden">
                      <MdOutlineWorkOutline size={28} color="white" />
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/admin/miempresa/settings">
                <div className="flex flex-col gap-1 md:gap-4">
                  <div
                    style={{ backgroundColor: "#dd4924" }}
                    className="flex items-center justify-between w-full p-5 h-14 md:h-32 md:w-52 rounded-2xl"
                  >
                    <span className="text-sm font-medium text-white md:text-lg">
                      Editar servicios
                    </span>
                    <div className="hidden md:flex">
                      <FaRegEdit size={45} color="white" />
                    </div>
                    <div className="flex md:hidden">
                      <FaRegEdit size={26} color="white" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-6 mt-5">
            <span className="text-xl font-semibold sm:text-2xl">
              &#128198; Próximos turnos de hoy
            </span>
            {appointmentsData && appointmentsData?.length > 0 && (
              <>
                <div className="flex flex-col w-full gap-3 h-fit">
                  {appointmentsData &&
                    appointmentsData.map((appointment) => (
                      <div key={appointment._id} className="flex items-center">
                        <span className="text-xs font-semibold">
                          {dayjs(appointment.start).format("HH:mm [hs] ")}
                        </span>
                        <div
                          style={{
                            width: "1px",
                            height: "18px",
                            backgroundColor: "black",
                          }}
                          className="mx-5"
                        ></div>
                        <div className="flex flex-col w-fit h-fit">
                          <span className="text-sm font-semibold">
                            {appointment.name}
                          </span>
                          <span className="text-xs font-normal text-gray-500">
                            {appointment.service}
                          </span>
                        </div>
                        <IoMdMore
                          className="ml-auto"
                          size={22}
                          onClick={() => handleSelectEvent(appointment)}
                        />
                      </div>
                    ))}
                </div>
              </>
            )}

            {appointmentsData && appointmentsData?.length < 1 && (
              <>
                <div className="flex flex-col items-center justify-center w-full gap-5 py-10 h-fit">
                  <span className="px-5 text-xl font-semibold text-center md:px-0">
                    No tenés turnos pendientes para el dia de hoy.
                  </span>
                  <Link href="/admin/misturnos">
                    <button className={`${styles.button} px-7`}>
                      Ver mis turnos
                    </button>
                  </Link>
                </div>
              </>
            )}
            {loading && (
              <>
                <div
                  style={{ height: "100%", width: "100%", padding: "70px 0" }}
                  className="flex items-center justify-center w-full"
                >
                  <div className="loader"></div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardComponent;
