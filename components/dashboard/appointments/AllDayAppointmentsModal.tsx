"use client";
import { IAppointment } from "@/interfaces/appointment.interface";
import dayjs from "dayjs";
import { IService } from "@/interfaces/service.interface";
import { useEffect, useState } from "react";
import { IBusiness } from "@/interfaces/business.interface";
import { timeOptions } from "@/helpers/timeOptions";
import AlertInterface from "@/interfaces/alert.interface";
import Alert from "@/components/Alert";
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

interface IAllDayModalProps {
  date: Date;
  business: IBusiness | undefined;
  services: IService[] | undefined;
  selectedDay: { dayStart: number; dayEnd: number; appointmentDuration: number };
  closeModalF: () => void;
  onSave: (appointments: IAppointment[]) => void; // ← sube los turnos al padre
}

const AllDayAppointmentsModal: React.FC<IAllDayModalProps> = ({
  date,
  business,
  services,
  closeModalF,
  onSave,
}) => {
  const [selectedDaySchedule, setSelectedDaySchedule] = useState({
    dayStart: 9,
    dayEnd: 17,
    appointmentDuration: 60,
  });
  const [selectedService, setSelectedService] = useState<{
    name: string | undefined;
    price: number | undefined;
    description: string | undefined;
  }>();
  const [alert, setAlert] = useState<AlertInterface>();

  useEffect(() => {
    if (services?.[0]) {
      setSelectedService({ name: services[0].name, price: services[0].price, description: services[0].description });
    }
  }, [services]);

  const hideAlert = () => {
    setTimeout(() => {
      setAlert({ error: false, alertType: "ERROR_ALERT", msg: "" });
    }, 3300);
  };

  const handleSetSelectedService = (name: string) => {
    const match = services?.find((s) => s.name === name);
    setSelectedService({ price: match?.price, name: match?.name, description: match?.description });
  };

  const handleSave = () => {
    if (selectedDaySchedule.dayStart >= selectedDaySchedule.dayEnd) {
      setAlert({ msg: "Ingresá un horario válido", error: true, alertType: "ERROR_ALERT" });
      hideAlert();
      return;
    }

    // Construimos el array de turnos del día
    const dayAppointments: IAppointment[] = [];
    let inicio = dayjs(date).hour(selectedDaySchedule.dayStart).minute(0).second(0);
    const fin = dayjs(date).hour(selectedDaySchedule.dayEnd).minute(0).second(0);

    while (inicio.isBefore(fin)) {
      const finalTurno = inicio.add(selectedDaySchedule.appointmentDuration, "minute");
      dayAppointments.push({
        businessID: business?._id,
        status: "unbooked",
        phone: 0,
        email: "",
        start: inicio.toDate(),
        end: finalTurno.toDate(),
        service: selectedService?.name,
        price: selectedService?.price,
        description: selectedService?.description,
      });
      inicio = finalTurno;
    }

    onSave(dayAppointments); // CalendarTurnos cierra el modal y hace la API call
  };

  return (
    <div className="flex flex-col w-full gap-4 pb-1">

      <h4 className="relative inline-block w-full px-2 mx-auto font-bold text-center uppercase" style={{ fontSize: 20 }}>
        Crear turnos
        <span className="absolute left-0 right-0 mx-auto" style={{ bottom: -2, height: 2, background: "#dd4924", width: "30%" }} />
      </h4>

      <div className="flex flex-col items-center gap-0.5 py-3 bg-white rounded-xl border border-gray-200 shadow-sm">
        <span className="text-sm font-bold uppercase text-gray-800 capitalize">
          &#128197; {dayjs(date).format("dddd DD [de] MMMM")}
        </span>
        <span className="text-xs text-gray-400">Seleccioná el servicio y el horario del día</span>
      </div>

      <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Configuración</span>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold uppercase tracking-wide text-gray-400">Servicio a prestar</label>
          <Select value={selectedService?.name} onValueChange={handleSetSelectedService}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Seleccionar servicio" /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Servicios</SelectLabel>
                {services?.map((service) => (
                  <SelectItem key={service._id} value={service.name!}>{service.name}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wide text-gray-400">Desde</label>
            <Select value={selectedDaySchedule.dayStart.toString()} onValueChange={(v) => setSelectedDaySchedule({ ...selectedDaySchedule, dayStart: parseInt(v) })}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Hora de inicio" /></SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {timeOptions.map((t) => <SelectItem key={t.value} value={t.value.toString()}>{t.label}</SelectItem>)}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wide text-gray-400">Hasta</label>
            <Select value={selectedDaySchedule.dayEnd.toString()} onValueChange={(v) => setSelectedDaySchedule({ ...selectedDaySchedule, dayEnd: parseInt(v) })}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Hora de fin" /></SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {timeOptions.map((t) => <SelectItem key={t.value} value={t.value.toString()}>{t.label}</SelectItem>)}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold uppercase tracking-wide text-gray-400">Duración de cada turno</label>
          <Select value={selectedDaySchedule.appointmentDuration.toString()} onValueChange={(v) => setSelectedDaySchedule({ ...selectedDaySchedule, appointmentDuration: parseInt(v) })}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Duración" /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="15">15 min</SelectItem>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="45">45 min</SelectItem>
                <SelectItem value="60">1 h</SelectItem>
                <SelectItem value="75">1:15 hs</SelectItem>
                <SelectItem value="90">1:30 hs</SelectItem>
                <SelectItem value="105">1:45 hs</SelectItem>
                <SelectItem value="120">2 hs</SelectItem>
                <SelectItem value="135">2:15 hs</SelectItem>
                <SelectItem value="150">2:30 hs</SelectItem>
                <SelectItem value="165">2:45 hs</SelectItem>
                <SelectItem value="180">3 hs</SelectItem>
                <SelectItem value="195">3:15 hs</SelectItem>
                <SelectItem value="210">3:30 hs</SelectItem>
                <SelectItem value="225">3:45 hs</SelectItem>
                <SelectItem value="240">4 hs</SelectItem>
                <SelectItem value="255">4:15 hs</SelectItem>
                <SelectItem value="270">4:30 hs</SelectItem>
                <SelectItem value="285">4:45 hs</SelectItem>
                <SelectItem value="300">5 hs</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div style={{ width: "100%", height: "1px", backgroundColor: "rgb(178 178 178 / 40%)" }} />

      <Button onClick={handleSave} className="w-full text-white bg-orange-600 border-none rounded-lg h-11 hover:bg-orange-700">
        Crear turnos del día
      </Button>

      {alert?.error && (
        <div className="absolute flex justify-center w-full h-fit">
          <Alert error={alert.error} msg={alert.msg} alertType={alert.alertType} />
        </div>
      )}
    </div>
  );
};

export default AllDayAppointmentsModal;