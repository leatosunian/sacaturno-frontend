"use client";

import axiosReq from "@/config/axios";
import { IUser } from "@/interfaces/user.interface";
import { useEffect, useState } from "react";
import styles from "@/app/css-modules/AppointmentModal.module.css";
import { useRouter } from "next/navigation";

interface eventType2 {
  start: string;
  end: string;
  title: string | undefined;
  clientID: string | "" | undefined;
  _id?: string | undefined;
  name: string | undefined;
  email: string | undefined;
  phone: number | undefined;
  service: string | undefined
  status?: "booked" | "unbooked" | undefined;
}

interface props {
  appointment: eventType2 | undefined;
  closeModalF: () => void;
}

const AppointmentModal: React.FC<props> = ({ appointment, closeModalF }) => {

  const [isBooked, setIsBooked] = useState(false);
  const [clientData, setClientData] = useState<IUser>();
  const router = useRouter();
  const token = localStorage.getItem("sacaturno_token");
  const authHeader = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "Cache-Control": "no-store",
    },
  };

  const getClientData = async (clientID: string | undefined) => {
    const clientDataReq = await axiosReq.get(
      "/user/get/" + clientID,
      authHeader
    );
    setClientData(clientDataReq.data.response_data);
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
        <div className="flex flex-col text-black bg-white w-80 md:w-96 p-7 h-fit borderShadow">
          <h4 className="mb-6 text-xl font-bold text-center uppercase">
            Datos del turno
          </h4>
          {/* <span>Hacé click en un turno para ver los detalles</span> */}
          <div className="flex flex-col gap-4 mb-2 w-fit h-fit">
            <div className="flex flex-col w-fit h-fit">
              <label
                style={{ fontSize: "12px" }}
                className="font-bold uppercase "
              >
                Fecha y hora
              </label>
              <span className="text-sm">
                {appointment?.start} {appointment?.end}
              </span>
            </div>
            <div className="flex flex-col w-fit h-fit">
              <label
                style={{ fontSize: "12px" }}
                className="font-bold uppercase "
              >
                Estado del turno
              </label>
              {!isBooked && (
                <span className="text-sm">{appointment?.title}</span>
              )}
              {isBooked && <span className="text-sm">Reservado</span>}
            </div>
            <div className="flex flex-col w-fit h-fit">
              <label
                style={{ fontSize: "12px" }}
                className="font-bold uppercase "
              >
                Servicio a prestar
              </label>
              <span className="text-sm">
                {appointment?.service}
              </span>
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

          {!isBooked && (
            <button onClick={deleteAppointment} className={styles.buttonDelete}>
              Eliminar turno
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default AppointmentModal;
