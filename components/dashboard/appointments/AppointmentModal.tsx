"use client";
import axiosReq from "@/config/axios";
import { useEffect, useState } from "react";
import styles from "@/app/css-modules/AppointmentModal.module.css";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa6";
import { IAppointment } from "@/interfaces/appointment.interface";

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
  closeModalF: () => void;
  onDeleteAppointment: () => void;
}

const AppointmentModal: React.FC<props> = ({
  appointment,
  closeModalF,
  onDeleteAppointment,
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

  const closeModal = () => {
    closeModalF();
  };

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
      <div
        className="absolute flex items-center justify-center modalCont"
        onClick={closeModal}
      >
        <div
          className="flex flex-col text-black bg-white w-80 md:w-96 p-7 h-fit borderShadow"
          style={{ transform: "translateY(-32px)" }}
        >
          {isBooked && (
            <>
              <div className="flex flex-col justify-center w-full mb-4 h-fit">
                <h4 className="mb-3 text-xl font-bold text-center uppercase ">
                  Turno reservado
                </h4>
                <span className="text-sm font-bold text-center uppercase">
                  &#128197; {"  "}
                  {dayjs(appointment?.start).format("dddd d [de] MMMM ")}
                </span>
                <span className="text-sm text-center">
                  {dayjs(appointment?.start).format("HH:mm [hs]")} -{" "}
                  {dayjs(appointment?.end).format("HH:mm [hs]")}
                </span>
              </div>
            </>
          )}

          {!isBooked && (
            <h4 className="mb-6 text-xl font-bold text-center uppercase">
              Datos del turno
            </h4>
          )}

          {/* <span>Hacé click en un turno para ver los detalles</span> */}
          <div className="flex flex-col gap-4 w-fit h-fit">
            {!isBooked && (
              <>
                <div className="flex flex-col w-fit h-fit">
                  <label
                    style={{ fontSize: "12px" }}
                    className="font-bold uppercase "
                  >
                    Fecha y hora
                  </label>
                  <span className="text-sm capitalize-first-letter">
                    {dayjs(appointment?.start).format("dddd d [de] MMMM  ")}
                  </span>
                </div>
              </>
            )}
            <div className="flex flex-col w-fit h-fit">
              <label
                style={{ fontSize: "12px" }}
                className="font-bold uppercase "
              >
                Servicio
              </label>
              <span className="text-sm">{appointment?.service}</span>
            </div>
            <div className="flex flex-col w-fit h-fit">
              <label
                style={{ fontSize: "12px" }}
                className="font-bold uppercase "
              >
                Precio
              </label>
              <span className="text-sm">AR$ {appointment?.price}</span>
            </div>

            {isBooked && (
              <>
                <div className="flex flex-col w-fit h-fit">
                  <label
                    style={{ fontSize: "12px" }}
                    className="font-bold uppercase "
                  >
                    Nombre del cliente
                  </label>
                  <span className="text-sm">{appointment?.name} </span>
                </div>

                <div className="flex flex-col w-fit h-fit">
                  <label
                    style={{ fontSize: "12px" }}
                    className="font-bold uppercase "
                  >
                    Teléfono
                  </label>
                  <span className="text-sm">{appointment?.phone}</span>
                </div>

                <div className="flex flex-col w-fit h-fit">
                  <label
                    style={{ fontSize: "12px" }}
                    className="font-bold uppercase "
                  >
                    Email
                  </label>
                  <span className="text-sm">{appointment?.email} </span>
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
                  margin: "20px auto",
                }}
              ></div>
              <Link
                target="_blank"
                href={`https://wa.me/54${appointment?.phone}`}
              >
                <div className="button2">
                  <FaWhatsapp color="green" size={22} />
                  <span className="text-gray-700">Iniciar chat</span>
                </div>
              </Link>
            </>
          )}

          {!isBooked && (
            <button
              onClick={() => {
                deleteAppointment();
                onDeleteAppointment();
              }}
              className={`${styles.buttonDelete} mt-6`}
            >
              Eliminar turno
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default AppointmentModal;
