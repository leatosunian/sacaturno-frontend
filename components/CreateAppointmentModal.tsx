"use client";
import axiosReq from "@/config/axios";
import { IAppointment } from "@/interfaces/appointment.interface";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import styles from "@/app/css-modules/CreateAppointmentModal.module.css";
import { IoMdClose } from "react-icons/io";
import { IService } from "@/interfaces/service.interface";
import { useEffect, useState } from "react";

interface props {
  appointmentData: IAppointment | undefined;
  servicesData: IService[] | undefined;
  closeModalF: () => void;
  onNewAppointment: () => void;
}

const CreateAppointmentModal: React.FC<props> = ({
  appointmentData,
  closeModalF,
  servicesData,
  onNewAppointment,
}) => {
  const router = useRouter();
  const [selectedService, setSelectedService] = useState<{
    name: string | undefined;
    price: number | undefined;
    description: string | undefined;
  }>();

  useEffect(() => {
    if (servicesData && servicesData[0]) {
      setSelectedService({
        name: servicesData[0].name,
        price: servicesData[0].price,
        description: servicesData[0].description
      });
    }
  }, [servicesData]);

  useEffect(() => {
    if (appointmentData) {
      appointmentData.service = selectedService?.name;
      appointmentData.price = selectedService?.price;
      appointmentData.description = selectedService?.description;
    }
  }, [selectedService, appointmentData]);

  const handleSetSelectedService = (name: string) => {
    const serviceSelectedObj = servicesData?.find(
      (service) => service.name === name
    );
    setSelectedService({
      price: serviceSelectedObj?.price,
      name: serviceSelectedObj?.name,
      description: serviceSelectedObj?.description,
    });
  };

  const saveAppointment = async () => {
    closeModal();
    const token = localStorage.getItem("sacaturno_token");
    const authHeader = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-store",
      },
    };
    try {
      await axiosReq.post("/appointment/create", appointmentData, authHeader);
      onNewAppointment();
      router.refresh();
    } catch (error) {
      closeModal();
    }
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
          <h4 className="mb-6 text-2xl font-bold text-center uppercase">
            Nuevo turno
          </h4>
          {/* <span>Hacé click en un turno para ver los detalles</span> */}
          <div className="flex flex-col w-full gap-5 h-fit">
            <div className="flex flex-col w-fit h-fit">
              <label
                style={{ fontSize: "12px" }}
                className="font-bold uppercase "
              >
                Fecha
              </label>
              <span className="text-sm">
                {dayjs(appointmentData?.start).format("dddd DD/MM ")}{" "}
              </span>
            </div>

            <div className="flex flex-col w-fit h-fit">
              <label
                style={{ fontSize: "12px" }}
                className="font-bold uppercase "
              >
                Hora
              </label>
              <span className="text-sm">
                {dayjs(appointmentData?.start).format("HH:mm [hs] ")}{" "}
                {dayjs(appointmentData?.end).format("[a] HH:mm [hs]")}
              </span>
            </div>

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
                {servicesData?.map((service) => (
                  <option
                    key={service._id}
                    onClick={(asd) => {}}
                    value={service.name}
                  >
                    {service.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center w-full mt-3 align-middle h-fit">
              <button
                className={styles.button}
                onClick={() => {
                  saveAppointment();
                  closeModal();
                }}
              >
                Crear turno
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateAppointmentModal;
