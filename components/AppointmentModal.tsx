"use client";

import axiosReq from "@/config/axios";
import { IUser } from "@/interfaces/user.interface";
import { useEffect, useState } from "react";
import styles from "@/app/css-modules/miempresa.module.css";
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
  status?: "booked" | "unbooked" | undefined;
}

interface props {
  appointment: eventType2 | undefined;
  closeModalF: () => void;
}

const AppointmentModal: React.FC<props> = ({ appointment, closeModalF }) => {
  console.log(appointment);
  
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
    if (appointment?.clientID !== "") {
      getClientData(appointment?.clientID);
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
        <div className="flex flex-col text-black bg-white sm:w-5/6 md:4/5 lg:w-2/4 xl:w-fit p-7 h-fit borderShadow">
          <h4 className="mb-6 text-2xl font-semibold text-center">
            Datos del turno
          </h4>
          {/* <span>Hacé click en un turno para ver los detalles</span> */}
          <div className="flex flex-col gap-4 mb-7 w-fit h-fit">
            <div className="flex flex-col w-fit h-fit">
              <label className="font-semibold text-md">Estado</label>
              {!isBooked && (
                <span className="text-sm">{appointment?.title}</span>
              )}
              {isBooked && <span>Reservado</span>}
            </div>
            <div className="flex flex-col w-fit h-fit">
              <label className="font-semibold text-md">Fecha y hora</label>
              <span className="text-sm">
                {appointment?.start} {appointment?.end}
              </span>
            </div>

            {isBooked && (
              <>
                <div className="flex flex-col w-fit h-fit">
                  <label className="font-semibold text-md">
                    Nombre del cliente
                  </label>
                  <span className="text-sm">{appointment?.name} </span>
                </div>

                <div className="flex flex-col w-fit h-fit">
                  <label className="font-semibold text-md">Teléfono</label>
                  <span className="text-sm">+{appointment?.phone}</span>
                </div>

                <div className="flex flex-col w-fit h-fit">
                  <label className="font-semibold text-md">Email</label>
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
