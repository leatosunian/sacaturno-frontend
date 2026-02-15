"use client";
import axiosReq from "@/config/axios";
import { IAppointment } from "@/interfaces/appointment.interface";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import styles from "@/app/css-modules/CreateAppointmentModal.module.css";
import { IoMdClose } from "react-icons/io";
import { IService } from "@/interfaces/service.interface";
import { useEffect, useState } from "react";
import { CiCalendar } from "react-icons/ci";
import { FaCalendar, FaRegClock } from "react-icons/fa6";
import { LuCalendar } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

  // Set selected service on component mount or when servicesData changes
  useEffect(() => {
    if (servicesData && servicesData[0]) {
      setSelectedService({
        name: servicesData[0].name,
        price: servicesData[0].price,
        description: servicesData[0].description
      });
    }
  }, [servicesData]);

  // Update appointmentData when selectedService changes
  useEffect(() => {
    if (appointmentData) {
      appointmentData.service = selectedService?.name;
      appointmentData.price = selectedService?.price;
      appointmentData.description = selectedService?.description;
    }
  }, [selectedService, appointmentData]);

  // Function to handle service selection
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

  // Function to save the appointment
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

  // Function to close the modal
  const closeModal = () => {
    closeModalF();
  };

  return (
    <>
      <div className="flex flex-col items-center w-full gap-8 pb-1 h-fit">
        <h4
          className="relative inline-block w-full px-2 mx-auto text-2xl font-bold text-center uppercase"
          style={{ fontSize: 22 }}
        >
          Nuevo turno
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

        {/* <span>Hacé click en un turno para ver los detalles</span> */}
        <div className="flex flex-col w-full gap-6 h-fit">
          <div className="flex flex-col gap-2 w-fit h-fit">
            <label
              className="text-sm font-bold uppercase"
            >
              Fecha
            </label>
            <div className="flex items-center gap-2">
              <LuCalendar color="#9ca3af" size={20} />
              <span className="text-sm font-medium text-gray-800 capitalize-first-letter">
                {dayjs(appointmentData?.start).format("dddd DD [de] MMMM ")}{" "}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-fit h-fit">
            <label
              className="text-sm font-bold uppercase"
            >
              Horario
            </label>
            <div className="flex items-center gap-2">
              <FaRegClock color="#9ca3af" size={20} />
              <span className="text-sm font-medium text-gray-800">
                {dayjs(appointmentData?.start).format("HH:mm [hs] ")}{" "}
                {dayjs(appointmentData?.end).format("[-] HH:mm [hs]")}
              </span>
            </div>
          </div>

          <div
            className={`flex flex-col w-full gap-1 h-fit ${styles.formInputAppDuration} `}
          >
            <label
              className="text-sm font-bold uppercase "
            >
              Servicio a prestar
            </label>
            {/* <select
              value={selectedService?.name}
              onChange={(e) => handleSetSelectedService(e.target.value)}
              id="appointmentDuration"
            >
              {servicesData?.map((service) => (
                <option
                  key={service._id}
                  value={service.name}
                >
                  {service.name}
                </option>
              ))}
            </select> */}
            <Select value={selectedService?.name} onValueChange={(value) => handleSetSelectedService(value)}>
              <SelectTrigger className="w-full ">
                <SelectValue placeholder="Select a fruit" />
              </SelectTrigger>
              <SelectContent className="w-full">
                <SelectGroup>
                  <SelectLabel>Servicios</SelectLabel>
                  {servicesData?.map((service) => (
                    <SelectItem key={service._id} value={service.name!}>
                      {service.name}
                    </SelectItem>
                  ))}

                </SelectGroup>
              </SelectContent>
            </Select>
          </div>


          <Button
            className="w-full text-white bg-orange-600 border-none rounded-lg shadow-xl outline-none h-11 hover:bg-orange-700 "
            onClick={() => {
              saveAppointment();
              closeModal();
            }}>
            Crear turno
          </Button>
        </div>
      </div>
    </>
  );
};

export default CreateAppointmentModal;
