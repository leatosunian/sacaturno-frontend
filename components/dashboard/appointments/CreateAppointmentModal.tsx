"use client";
import { IAppointment } from "@/interfaces/appointment.interface";
import dayjs from "dayjs";
import styles from "@/app/css-modules/CreateAppointmentModal.module.css";
import { IService } from "@/interfaces/service.interface";
import { useEffect, useState } from "react";
import { FaRegClock } from "react-icons/fa6";
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
} from "@/components/ui/select";

interface props {
  appointmentData: IAppointment | undefined;
  servicesData: IService[] | undefined;
  closeModalF: () => void;
  onSave: (appointmentData: IAppointment) => void; // ← sube el dato al padre
}

const CreateAppointmentModal: React.FC<props> = ({
  appointmentData,
  closeModalF,
  servicesData,
  onSave,
}) => {
  const [selectedService, setSelectedService] = useState<{
    name: string | undefined;
    price: number | undefined;
    description: string | undefined;
  }>();

  useEffect(() => {
    if (servicesData?.[0]) {
      setSelectedService({
        name: servicesData[0].name,
        price: servicesData[0].price,
        description: servicesData[0].description,
      });
    }
  }, [servicesData]);

  const handleSetSelectedService = (name: string) => {
    const match = servicesData?.find((s) => s.name === name);
    setSelectedService({ price: match?.price, name: match?.name, description: match?.description });
  };

  const handleSave = () => {
    if (!appointmentData) return;

    // Construimos un objeto nuevo sin mutar la prop
    const finalAppointment: IAppointment = {
      ...appointmentData,
      service: selectedService?.name,
      price: selectedService?.price,
      description: selectedService?.description,
    };

    onSave(finalAppointment); // CalendarTurnos cierra el modal y hace la API call
  };

  return (
    <div className="flex flex-col items-center w-full gap-8 pb-1 h-fit">
      <h4 className="relative inline-block w-full px-2 mx-auto text-2xl font-bold text-center uppercase" style={{ fontSize: 22 }}>
        Nuevo turno
        <span className="absolute left-0 right-0 mx-auto" style={{ bottom: -2, height: 2, background: "#dd4924", width: "30%" }} />
      </h4>

      <div className="flex flex-col w-full gap-6 h-fit">
        <div className="flex flex-col gap-2 w-fit h-fit">
          <label className="text-sm font-bold uppercase">Fecha</label>
          <div className="flex items-center gap-2">
            <LuCalendar color="#9ca3af" size={20} />
            <span className="text-sm font-medium text-gray-800 capitalize-first-letter">
              {dayjs(appointmentData?.start).format("dddd DD [de] MMMM")}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-fit h-fit">
          <label className="text-sm font-bold uppercase">Horario</label>
          <div className="flex items-center gap-2">
            <FaRegClock color="#9ca3af" size={20} />
            <span className="text-sm font-medium text-gray-800">
              {dayjs(appointmentData?.start).format("HH:mm [hs]")}{" "}
              {dayjs(appointmentData?.end).format("[-] HH:mm [hs]")}
            </span>
          </div>
        </div>

        <div className={`flex flex-col w-full gap-1 h-fit ${styles.formInputAppDuration}`}>
          <label className="text-sm font-bold uppercase">Servicio a prestar</label>
          <Select value={selectedService?.name} onValueChange={handleSetSelectedService}>
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
          className="w-full text-white bg-orange-600 border-none rounded-lg shadow-xl outline-none h-11 hover:bg-orange-700"
          onClick={handleSave}
        >
          Crear turno
        </Button>
      </div>
    </div>
  );
};

export default CreateAppointmentModal;