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
  tabMode: TabMode;
  onTabModeChange: (mode: TabMode) => void;
}

type TabMode = "pending" | "booked";

const CreateAppointmentModal: React.FC<props> = ({
  appointmentData,
  closeModalF,
  servicesData,
  onSave,
  tabMode,
  onTabModeChange,
}) => {
  const [selectedService, setSelectedService] = useState<{
    name: string | undefined;
    price: number | undefined;
    description: string | undefined;
  }>();
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");

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

    if (tabMode === "booked") {
      if (!clientName.trim() || !clientEmail.trim() || !clientPhone.trim()) return;

      const finalAppointment: IAppointment = {
        ...appointmentData,
        service: selectedService?.name,
        price: selectedService?.price,
        description: selectedService?.description,
        status: "booked",
        name: clientName.trim(),
        title: clientName.trim(),
        email: clientEmail.trim(),
        phone: Number(clientPhone.replace(/\D/g, "")),
        clientID: "",
      };

      onSave(finalAppointment);
    } else {
      const finalAppointment: IAppointment = {
        ...appointmentData,
        service: selectedService?.name,
        price: selectedService?.price,
        description: selectedService?.description,
      };

      onSave(finalAppointment);
    }
  };

  return (
    <div className="flex flex-col items-center w-full gap-7 pb-1 h-fit">
      <h4 className="relative inline-block w-fit px-2 mx-auto text-2xl font-bold text-center uppercase" style={{ fontSize: 22 }}>
        Nuevo turno
        <span className="absolute left-0 right-0 mx-auto" style={{ bottom: -2, height: 2, background: "#dd4924", width: "30%" }} />
      </h4>

      {/* disponible/reservado tabs */}
      <div className="flex w-full border border-gray-300 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => onTabModeChange("pending")}
          className="flex-1 py-1.5 text-[11.9px] font-semibold transition-colors focus:outline-none"
          style={{
            backgroundColor: tabMode === "pending" ? "white" : "#f3f4f6",
            color: tabMode === "pending" ? "#dd4924" : "#6b7280",
            borderBottom: tabMode === "pending" ? "2px solid #dd4924" : "2px solid transparent",
          }}
        >
          Disponible
        </button>
        <button
          type="button"
          onClick={() => onTabModeChange("booked")}
          className="flex-1 py-1.5 text-[11.9px] font-semibold transition-colors focus:outline-none"
          style={{
            backgroundColor: tabMode === "booked" ? "white" : "#f3f4f6",
            color: tabMode === "booked" ? "#dd4924" : "#6b7280",
            borderBottom: tabMode === "booked" ? "2px solid #dd4924" : "2px solid transparent",
          }}
        >
          Reservado
        </button>
      </div>

      <div className="flex flex-col md:flex-row w-full gap-4 h-fit">
        <div className="flex flex-col w-full h-fit gap-4">
          {/* fecha */}
          <div className="flex flex-col gap-2 w-fit h-fit">
            <label className="text-xs font-bold uppercase">Fecha</label>
            <div className="flex items-center gap-2">
              <LuCalendar color="#9ca3af" size={20} />
              <span className="text-sm font-medium text-gray-800 capitalize-first-letter">
                {dayjs(appointmentData?.start).format("dddd DD [de] MMMM")}
              </span>
            </div>
          </div>
          {/* horario */}
          <div className="flex flex-col gap-2 w-fit h-fit">
            <label className="text-xs font-bold uppercase">Horario</label>
            <div className="flex items-center gap-2">
              <FaRegClock color="#9ca3af" size={20} />
              <span className="text-sm font-medium text-gray-800">
                {dayjs(appointmentData?.start).format("HH:mm [hs]")}{" "}
                {dayjs(appointmentData?.end).format("[-] HH:mm [hs]")}
              </span>
            </div>
          </div>
          {/* servicio a prestar */}
          <div className={`flex flex-col w-full gap-1 h-fit ${styles.formInputAppDuration}`}>
            <label className="text-xs font-bold uppercase">Servicio a prestar</label>
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
        </div>
        {tabMode === "booked" && (
          <>
            <div className="flex flex-col w-full h-fit gap-4">
              {/* nombre */}
              <div className="flex flex-col w-full gap-1 h-fit">
                <label className="text-xs font-bold uppercase">Nombre</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Juan Pérez"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-orange-500"
                />
              </div>
              {/* email */}
              <div className="flex flex-col w-full gap-1 h-fit">
                <label className="text-xs font-bold uppercase">Email</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="juan.perez@email.com"
                  className="w-full px-3 py-1.5  text-sm border border-gray-300 rounded-md outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex flex-col w-full gap-1 h-fit">
                <label className="text-xs font-bold uppercase">Teléfono</label>
                <input
                  type="number"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="Ej. 11 1234 5678"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </>
        )}

      </div>
      <Button
        className="w-full  text-white bg-orange-600 border-none rounded-lg shadow-xl outline-none h-11 hover:bg-orange-700"
        onClick={handleSave}
      >
        Crear turno
      </Button>
    </div>
  );
};

export default CreateAppointmentModal;
