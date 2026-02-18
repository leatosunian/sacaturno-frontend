"use client";
import axiosReq from "@/config/axios";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import styles from "@/app/css-modules/CreateAppointmentModal.module.css";
import { IService } from "@/interfaces/service.interface";
import { useEffect, useState } from "react";
import updateLocale from "dayjs/plugin/updateLocale";
import { IAppointmentSchedule } from "@/interfaces/appointmentSchedule.interface";
import { FaRegClock } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface props {
  appointmentData: IAppointmentSchedule | undefined;
  servicesData: IService[] | undefined;
  closeModalF: () => void;
  onNewAppointment: (newAppointment: IAppointmentSchedule) => void;
}

const CreateScheduleAppointmentModal: React.FC<props> = ({
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

  dayjs.extend(updateLocale);

  dayjs.updateLocale("es", {
    weekdays: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
  });

  useEffect(() => {
    if (servicesData && servicesData[0]) {
      setSelectedService({
        name: servicesData[0].name,
        price: servicesData[0].price,
        description: servicesData[0].description,
      });
    }
  }, [servicesData]);

  useEffect(() => {
    if (appointmentData) {
      appointmentData.service = selectedService?.name!;
      appointmentData.price = selectedService?.price!;
      appointmentData.description = selectedService?.description!;
      appointmentData.dayScheduleID = appointmentData.dayScheduleID;
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
    const data: IAppointmentSchedule = {
      businessID: appointmentData?.businessID!,
      day: appointmentData?.day!,
      dayScheduleID: appointmentData?.dayScheduleID!,
      price: selectedService?.price!,
      description: selectedService?.description!,
      ownerID: appointmentData?.ownerID!,
      end: appointmentData?.end!,
      start: appointmentData?.start!,
      service: selectedService?.name!,
      dayNumber: appointmentData?.dayNumber!,
    };
    try {
      const newAppointment = await axiosReq.post(
        "/schedule/appointment/create",
        data,
        authHeader
      );

      onNewAppointment(newAppointment.data);

      closeModal();
    } catch (error) {
      closeModal();
    }
  };

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
              bottom: -2,
              height: 2,
              background: "#dd4924",
              width: "30%",
            }}
          />
        </h4>

        <div className="flex flex-col w-full gap-6 h-fit">
          
          <div className="flex flex-col gap-2 w-fit h-fit">
            <label className="text-sm font-bold uppercase">Horario</label>
            <div className="flex items-center gap-2">
              <FaRegClock color="#9ca3af" size={20} />
              <span className="text-sm font-medium text-gray-800">
                {dayjs(appointmentData?.start).format("HH:mm [hs] ")}{" "}
                {dayjs(appointmentData?.end).format("[a] HH:mm [hs]")}
              </span>
            </div>
          </div>

          <div className="flex flex-col w-full gap-2 h-fit">
            <label className="text-sm font-bold uppercase">
              Servicio a prestar
            </label>
            <Select
              value={selectedService?.name}
              onValueChange={(value) => handleSetSelectedService(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar servicio" />
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
            className="w-full mt-2 text-white bg-orange-600 border-none rounded-lg shadow-xl outline-none h-11 hover:bg-orange-700"
            onClick={() => {
              saveAppointment();
              closeModal();
            }}
          >
            Crear turno
          </Button>
        </div>
      </div>
    </>
  );
};

export default CreateScheduleAppointmentModal;
