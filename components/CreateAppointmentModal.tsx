"use client";

import axiosReq from "@/config/axios";
import { IAppointment } from "@/interfaces/appointment.interface";
import { IUser } from "@/interfaces/user.interface";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "@/app/css-modules/miempresa.module.css"

interface props {
  appointmentData: IAppointment | undefined;
  closeModalF: () => void
}

const CreateAppointmentModal: React.FC<props> = ({appointmentData, closeModalF}) => {
  const router = useRouter()
  const saveAppointment = async () => {
    const token = localStorage.getItem("sacaturno_token");
    const authHeader = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-store",
      },
    };
    const savedAppointment = await axiosReq.post(
        "/appointment/create",
        appointmentData,
        authHeader
      );
    console.log(savedAppointment);
    router.refresh();
  };



  const closeModal = () => {
    closeModalF()
  }

  return (
    <>
      <div className="absolute flex items-center justify-center modalCont" onClick={closeModal}>
        <div className="flex flex-col bg-white sm:w-5/6 min-w-32 md:4/5 lg:w-2/4 xl:w-80 p-7 h-fit borderShadow">
          <h4 className="mb-6 text-2xl font-semibold text-center">
            Nuevo turno
          </h4>
          {/* <span>Hacé click en un turno para ver los detalles</span> */}
          <div className="flex flex-col w-full gap-4 h-fit">

            <div className="flex flex-col w-fit h-fit">
              <label className="font-semibold text-md">Fecha</label>
              <span className="text-sm">
                {dayjs(appointmentData?.start).format('dddd DD/MM ')}{" "}
              </span>
            </div>

            <div className="flex flex-col w-fit h-fit">
              <label className="font-semibold text-md">Hora</label>
              <span className="text-sm">
                {dayjs(appointmentData?.start).format('HH:mm [hs] ')}{" "}
                {dayjs(appointmentData?.end).format('[a] HH:mm [hs]')}
              </span>
            </div>

            <div className="flex justify-center w-full mt-3 align-middle h-fit">
                <button className={styles.button} onClick={saveAppointment}>Crear turno</button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default CreateAppointmentModal;
