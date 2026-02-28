"use client";
import axiosReq from "@/config/axios";
import { useEffect, useState } from "react";
import styles from "@/app/css-modules/AppointmentModal.module.css";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa6";
import { IAppointment } from "@/interfaces/appointment.interface";
import { Button } from "@/components/ui/button";

interface eventType2 {
  start: Date;
  end: Date;
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

interface props {
  appointment: eventType2 | undefined;
  onDeleteAppointment: () => void;
  closeModalF: () => void;
}

const AppointmentModal: React.FC<props> = ({
  appointment,
  onDeleteAppointment,
  closeModalF
}) => {
  const [isBooked, setIsBooked] = useState(false);
  const router = useRouter();
  const token = localStorage.getItem("sacaturno_token");
  const authHeader = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "Cache-Control": "no-store",
    },
  };

  useEffect(() => {
    if (appointment?.status === "booked") {
      setIsBooked(true);
    }
  }, [appointment]);



  const deleteAppointment = async () => {
    try {
      const deletedAppointment = await axiosReq.delete(
        "/appointment/delete/" + appointment?._id,
        authHeader
      );
      router.refresh();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>

      <div className="flex flex-col items-center w-full gap-5 pb-1 h-fit">

        {isBooked && (
          <>
            <div className="flex flex-col justify-center w-full gap-1 h-fit">

              <h4
                className="relative inline-block w-full px-2 mx-auto text-2xl font-bold text-center uppercase"
                style={{ fontSize: 22 }}
              >
                Turno reservado

                {/* linea */}
                <span
                  className="absolute left-0 right-0 mx-auto"
                  style={{
                    bottom: -2,    // gap entre texto y linea 
                    height: 2,     // grosor de la linea
                    background: "#dd4924",
                    width: "30%",  // ancho opcional de la linea
                  }}
                />
              </h4>
              <span className="mt-5 text-lg font-bold text-center uppercase">
                &#128197; {"  "}
                {dayjs(appointment?.start).format("dddd DD [de] MMMM ")}
              </span>
              <span className="font-medium text-center ">
                {dayjs(appointment?.start).format("HH:mm [hs]")} -{" "}
                {dayjs(appointment?.end).format("HH:mm [hs]")}
              </span>
            </div>
          </>
        )}

        {!isBooked && (
          <h4
            className="relative inline-block w-full px-2 mx-auto text-xl font-bold text-center uppercase"
            style={{ fontSize: 20 }}
          >
            Datos del turno
            {/* linea */}
            <span
              className="absolute left-0 right-0 mx-auto"
              style={{
                bottom: -2,    // gap entre texto y linea (ajustalo)
                height: 2,     // grosor de la linea (ajustalo)
                background: "#dd4924",
                width: "30%",  // ancho opcional de la linea
              }}
            />
          </h4>

        )}

        {/* <span>Hacé click en un turno para ver los detalles</span> */}
        <div className="flex flex-col w-full gap-5 mt-2 h-fit">
          {!isBooked && (
            <>
              <div className="flex flex-col w-fit h-fit">
                <label
                  className="text-sm font-bold uppercase"
                >
                  Fecha y hora
                </label>
                <span className="font-medium capitalize-first-letter">
                  {dayjs(appointment?.start).format("dddd d [de] MMMM | HH:mm [hs]")} -{" "}
                  {dayjs(appointment?.end).format("HH:mm [hs]")}
                </span>
              </div>
            </>
          )}
          <div className="flex flex-col w-fit h-fit">
            <label
              className="text-sm font-bold uppercase"
            >
              Servicio
            </label>
            <span className="font-normal ">{appointment?.service}</span>
          </div>
          <div className="flex flex-col w-fit h-fit">
            <label
              className="text-sm font-bold uppercase"
            >
              Precio
            </label>
            <span className="font-normal">$ {appointment?.price?.toLocaleString()}</span>
          </div>
          {/*  */}
          {isBooked && (
            <>
              <div className="flex flex-col w-fit h-fit">
                <label
                  className="text-sm font-bold uppercase"
                >
                  Nombre del cliente
                </label>
                <span className="font-medium">{appointment?.name} </span>
              </div>

              <div className="flex flex-col w-fit h-fit">
                <label
                  className="text-sm font-bold uppercase"

                >
                  Teléfono
                </label>
                <span className="font-medium">+54 {appointment?.phone}</span>
              </div>

              <div className="flex flex-col w-fit h-fit">
                <label
                  className="text-sm font-bold uppercase"
                >
                  Email
                </label>
                <span className="font-medium">{appointment?.email} </span>
              </div>
            </>
          )}
        </div>

        {isBooked && (
          <>
            <div
              style={{
                width: "100%",
                height: "1px",
                backgroundColor: "rgb(178 178 178 / 55%)",
                margin: "5px auto",
              }}
            ></div>
            <Link
              target="_blank"
              href={`https://wa.me/54${appointment?.phone}`}
              className="flex items-center w-full gap-2 h-fit"
            >
              <Button
                className="w-full text-white bg-orange-600 border-none rounded-lg shadow-2xl outline-none h-11 hover:bg-orange-700 ">
                <FaWhatsapp color="green" />
                Iniciar chat en WhatsApp
              </Button>

            </Link>
          </>
        )}

        {!isBooked && (
          <Button
            onClick={() => {
              deleteAppointment();
              onDeleteAppointment();
              closeModalF()
            }}
            className="w-full mt-1 text-white bg-orange-600 border-none rounded-lg shadow-2xl outline-none h-11 hover:bg-orange-700 ">
            Eliminar turno
          </Button>
        )}
      </div >
    </>
  );
};

export default AppointmentModal;
