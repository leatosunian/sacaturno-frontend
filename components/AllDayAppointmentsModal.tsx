"use client";

import axiosReq from "@/config/axios";
import { IAppointment } from "@/interfaces/appointment.interface";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import styles from "@/app/css-modules/CreateAppointmentModal.module.css";
import { IoMdClose } from "react-icons/io";
import { IService } from "@/interfaces/service.interface";
import { useEffect, useState } from "react";
import { IBusiness } from "@/interfaces/business.interface";

interface IAllDayModalProps {
  date: Date;
  business: IBusiness | undefined;
  services: IService[] | undefined;
  closeModalF: () => void;
  onNewAppointment: () => void;
}

const AllDayAppointmentsModal: React.FC<IAllDayModalProps> = ({
  date,
  business,
  services,
  closeModalF,
  onNewAppointment,
}) => {
  const router = useRouter();
  const [selectedService, setSelectedService] = useState<{
    name: string | undefined;
    price: number | undefined;
  }>();

  useEffect(() => {
    if (services && services[0]) {
      setSelectedService({
        name: services[0].name,
        price: services[0].price,
      });
    }
  }, [services]);

  const handleSetSelectedService = (name: string) => {
    const serviceSelectedObj = services?.find(
      (service) => service.name === name
    );
    setSelectedService({
      price: serviceSelectedObj?.price,
      name: serviceSelectedObj?.name,
    });
  };

  const saveAppointment = async () => {
    const dayAppointments: IAppointment[] = [];
    let inicio = dayjs(date)
      .hour(Number(business?.dayStart))
      .minute(0)
      .second(0);
    const fin = dayjs(date).hour(Number(business?.dayEnd)).minute(0).second(0);

    while (inicio.isBefore(fin)) {
      const finalTurno = inicio.add(
        Number(business?.appointmentDuration),
        "minute"
      );
      dayAppointments.push({
        businessID: business?._id,
        status: "unbooked",
        phone: 0,
        email: "",
        start: inicio.toDate(),
        end: finalTurno.toDate(),
        service: selectedService?.name,
        price: selectedService?.price
      });
      inicio = finalTurno;
    }
    // REQUEST
    const token = localStorage.getItem("sacaturno_token");
    const authHeader = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-store",
      },
    };
    const savedAppointment = await axiosReq.post(
      "/appointment/create/day",
      dayAppointments,
      authHeader
    );
    onNewAppointment();
    router.refresh();
  };

  const closeModal = () => {
    closeModalF();
  };

  return (
    <>
      <div className="absolute flex items-center justify-center text-black modalCont">
        <div className="flex flex-col bg-white w-80 md:w-96 px-7 py-9 h-fit borderShadow">
          <IoMdClose
            className={styles.closeModal}
            onClick={closeModal}
            size={22}
          />
          <h4 className="mb-2 text-xl font-bold text-center uppercase md:text-2xl">
            Crear turnos
          </h4>
          <span className="mb-4 text-sm font-semibold text-center uppercase md:text-md">
            {dayjs(date).format("dddd DD/MM ")}
          </span>

          <span className="mb-4 text-xs text-left md:text-sm">
            &#128161; Seleccioná el servicio a prestar para crear todos los
            turnos del día
          </span>

          <div className="flex flex-col w-full gap-5 h-fit">
            <div
              className={`flex flex-col w-fit h-fit ${styles.formInputAppDuration} `}
            >
              <label
                style={{ fontSize: "12px" }}
                className="mb-1 font-bold uppercase "
              >
                Servicio a prestar
              </label>
              <select
                value={selectedService?.name}
                onChange={(e) => handleSetSelectedService(e.target.value)}
                id="appointmentDuration"
              >
                {services?.map((service) => (
                  <option key={service._id} value={service.name}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center w-full mt-3 align-middle h-fit">
              <button
                className={styles.button}
                onClick={() => {
                  closeModal();
                  saveAppointment();
                }}
              >
                Crear turnos
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AllDayAppointmentsModal;
