"use client";
import { IAppointment } from "@/interfaces/appointment.interface";
import dayjs from "dayjs";
import { IService } from "@/interfaces/service.interface";
import { useEffect, useState } from "react";
import { IBusiness } from "@/interfaces/business.interface";
import { IEmployee } from "@/interfaces/employee.interface";
import { IBranch } from "@/interfaces/branch.interface";
import { timeOptions } from "@/helpers/timeOptions";
import AlertInterface from "@/interfaces/alert.interface";
import Alert from "@/components/Alert";
import { Button } from "@/components/ui/button";
import { IoInformationCircle } from "react-icons/io5";
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
  employees?: IEmployee[];
  branches?: IBranch[];
  currentEmployeeID?: string | null;
  canManageAll?: boolean;
  closeModalF: () => void;
  onSave: (appointments: IAppointment[]) => void; // ← sube los turnos al padre
}

const AllDayAppointmentsModal: React.FC<IAllDayModalProps> = ({
  date,
  business,
  services,
  employees,
  branches,
  currentEmployeeID,
  canManageAll = false,
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
  const [selectedEmployeeID, setSelectedEmployeeID] = useState<string>(
    currentEmployeeID ?? "",
  );
  const [selectedBranchID, setSelectedBranchID] = useState<string>("");
  const [alert, setAlert] = useState<AlertInterface>();

  useEffect(() => {
    if (services?.[0]) {
      setSelectedService({ name: services[0].name, price: services[0].price, description: services[0].description });
    }
  }, [services]);

  // Keep employee selection in sync when the modal is reused in an employee context
  useEffect(() => {
    setSelectedEmployeeID(currentEmployeeID ?? "");
  }, [currentEmployeeID]);

  // Branch logic: show dropdown with 2+ branches; a single branch is auto-assigned silently
  const activeBranches = branches ?? [];
  const hasBranches = activeBranches.length >= 1;
  const showBranchDropdown = !currentEmployeeID && activeBranches.length >= 2;
  const singleBranchID =
    activeBranches.length === 1 ? (activeBranches[0]._id ?? "") : "";
  const effectiveBranchID = showBranchDropdown ? selectedBranchID : singleBranchID;

  // Employees active + filtered by the resolved branch
  const activeEmployees = employees?.filter((e) => e.status === "active") ?? [];
  const filteredEmployees =
    effectiveBranchID && activeEmployees.length > 0
      ? activeEmployees.filter((e) => (e.branches ?? []).includes(effectiveBranchID))
      : activeEmployees;

  const showEmployeeDropdown =
    activeEmployees.length > 0 &&
    (!currentEmployeeID || canManageAll) &&
    (!showBranchDropdown || !!selectedBranchID);

  const branchIsResolved = !!effectiveBranchID;
  const showNoBranchEmployeesWarning =
    !currentEmployeeID && hasBranches && branchIsResolved && filteredEmployees.length === 0;

  // Filter employees by the selected service. El alta de empleado exige al menos un
  // servicio, así que una lista vacía significa "no presta ninguno" y queda fuera.
  const selectedServiceID = services?.find((s) => s.name === selectedService?.name)?._id;
  const serviceFilteredEmployees = selectedServiceID
    ? filteredEmployees.filter((e) => (e.services ?? []).includes(selectedServiceID))
    : filteredEmployees;
  const showNoServiceEmployeesWarning =
    !currentEmployeeID &&
    filteredEmployees.length > 0 &&
    serviceFilteredEmployees.length === 0 &&
    !!selectedServiceID;

  const hideAlert = () => {
    setTimeout(() => {
      setAlert({ error: false, alertType: "ERROR_ALERT", msg: "" });
    }, 3300);
  };

  const handleSetSelectedService = (name: string) => {
    const match = services?.find((s) => s.name === name);
    setSelectedService({ price: match?.price, name: match?.name, description: match?.description });
    setSelectedEmployeeID("");
  };

  const doSave = () => {
    // Construimos el array de turnos del día
    const dayAppointments: IAppointment[] = [];
    let inicio = dayjs(date).hour(selectedDaySchedule.dayStart).minute(0).second(0);
    const fin = dayjs(date).hour(selectedDaySchedule.dayEnd).minute(0).second(0);

    const employeeID = selectedEmployeeID || null;
    const branchID = effectiveBranchID || null;

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
        employeeID,
        branchID,
      });
      inicio = finalTurno;
    }

    onSave(dayAppointments); // CalendarTurnos cierra el modal y hace la API call
  };

  const handleSave = () => {
    if (selectedDaySchedule.dayStart >= selectedDaySchedule.dayEnd) {
      setAlert({ msg: "Ingresá un horario válido", error: true, alertType: "ERROR_ALERT" });
      hideAlert();
      return;
    }

    // Sin profesional asignado los turnos quedan en el pool: los toma cualquiera
    // del equipo. Es una función, no un olvido, así que no se confirma.
    doSave();
  };

  const { dayStart, dayEnd, appointmentDuration } = selectedDaySchedule;
  const isValidRange = dayStart < dayEnd && appointmentDuration > 0;
  const turnCount = isValidRange
    ? Math.ceil(((dayEnd - dayStart) * 60) / appointmentDuration)
    : 0;

  const formatHour = (h: number) => `${h.toString().padStart(2, "0")}:00 hs`;
  const formatDuration = (min: number) => {
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m === 0 ? `${h} h` : `${h}:${m.toString().padStart(2, "0")} hs`;
  };

  return (
    <div className="flex flex-col w-full min-h-0 flex-1">
      {/* Header fijo */}
      <div className="shrink-0 flex flex-col gap-4 px-6 pt-6 pb-4">
        <div className="flex flex-col gap-1 w-full pr-8">
          <h4 className="text-lg leading-none font-semibold text-gray-800">
            Crear turnos del día
          </h4>
          <p className="text-xs text-gray-400 mt-0.5">
            Generá todos los turnos de la jornada de una sola vez
          </p>
        </div>

        {/* fecha */}
        <div className="flex items-center border-l-[3px] bg-orange-50/70 border-l-orange-400 w-full gap-4 py-3 px-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex flex-col items-center justify-center w-12 h-12 bg-primary rounded-lg shrink-0">
            <span className="text-xl font-black text-white leading-none">
              {dayjs(date).format("DD")}
            </span>
            <span className="text-[10px] font-bold text-orange-200 uppercase leading-none mt-0.5">
              {dayjs(date).format("MMM")}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[15px] leading-none font-semibold text-gray-800 capitalize">
              {dayjs(date).format("dddd DD [de] MMMM")}
            </span>
          </div>
        </div>
      </div>

      {/* Body scrolleable */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 flex flex-col gap-4">
        {/* servicio a prestar */}
        <div className="flex flex-col w-full gap-1 h-fit">
          <label className="text-xs font-bold uppercase">Servicio a prestar</label>
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

        {/* sucursal — only when 2+ branches */}
        {showBranchDropdown && (
          <div className="flex flex-col w-full gap-1 h-fit">
            <label className="text-xs font-bold uppercase">
              Sucursal <span className="text-red-500">*</span>
            </label>
            <Select
              value={selectedBranchID || undefined}
              onValueChange={(v) => {
                setSelectedBranchID(v);
                setSelectedEmployeeID("");
              }}
            >
              <SelectTrigger className={`w-full ${!selectedBranchID ? "border-red-300" : ""}`}>
                <SelectValue placeholder="Seleccionar sucursal" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Sucursales</SelectLabel>
                  {activeBranches.map((b) => (
                    <SelectItem key={b._id} value={b._id!}>{b.name}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* warning: sucursal sin empleados */}
        {showNoBranchEmployeesWarning && (
          <div className="flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2.5">
            <span className="mt-0.5 text-orange-500 shrink-0">⚠</span>
            <p className="text-xs text-orange-700 leading-snug">
              {showBranchDropdown
                ? "Esta sucursal no tiene empleados asignados."
                : "Tu sucursal no tiene empleados asignados."}{" "}
              Podés asignarlos desde el panel de <strong>Equipo</strong>. Mientras
              tanto, los turnos quedan disponibles para cualquiera.
            </p>
          </div>
        )}

        {/* warning: servicio sin empleados */}
        {showNoServiceEmployeesWarning && (
          <div className="flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2.5">
            <span className="mt-0.5 text-orange-500 shrink-0">⚠</span>
            <p className="text-xs text-orange-700 leading-snug">
              Ningún empleado tiene asignado este servicio. Podés asignar servicios desde el panel de <strong>Equipo</strong>.
            </p>
          </div>
        )}

        {/* asignar empleado */}
        {showEmployeeDropdown && !showNoServiceEmployeesWarning && (
          <div className="flex flex-col w-full gap-1 h-fit">
            <label className="text-xs font-bold uppercase">Empleado asignado</label>
            <Select
              value={selectedEmployeeID || "none"}
              onValueChange={(v) => setSelectedEmployeeID(v === "none" ? "" : v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Cualquier profesional" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Empleados</SelectLabel>
                  <SelectItem value="none">Cualquier profesional</SelectItem>
                  {serviceFilteredEmployees.map((emp) => (
                    <SelectItem key={emp._id} value={emp._id!}>
                      {emp.name} {emp.surname}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* horarios */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col w-full gap-1 h-fit">
            <label className="text-xs font-bold uppercase">Desde</label>
            <Select value={selectedDaySchedule.dayStart.toString()} onValueChange={(v) => setSelectedDaySchedule({ ...selectedDaySchedule, dayStart: parseInt(v) })}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Hora de inicio" /></SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {timeOptions.map((t) => <SelectItem key={t.value} value={t.value.toString()}>{t.label}</SelectItem>)}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col w-full gap-1 h-fit">
            <label className="text-xs font-bold uppercase">Hasta</label>
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

        {/* duración */}
        <div className="flex flex-col w-full gap-1 h-fit">
          <label className="text-xs font-bold uppercase">Duración de cada turno</label>
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

        {/* aclaración */}
        {isValidRange && (
          <div className="flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2.5">
            <IoInformationCircle className="mt-[1px] text-orange-500 shrink-0" size={16} />
            <p className="text-xs text-orange-700 leading-snug">
              Se crearán <strong>{turnCount} turno{turnCount !== 1 ? "s" : ""}</strong> desde
              las <strong>{formatHour(dayStart)}</strong> hasta las{" "}
              <strong>{formatHour(dayEnd)}</strong>, uno cada{" "}
              <strong>{formatDuration(appointmentDuration)}</strong>, para el{" "}
              <strong className="capitalize">{dayjs(date).format("dddd DD [de] MMMM")}</strong>.
            </p>
          </div>
        )}
      </div>

      {/* Footer fijo */}
      <div className="shrink-0 px-6 pt-4 pb-6 border-t border-gray-100">
        <Button
          onClick={handleSave}
          disabled={showBranchDropdown && !selectedBranchID}
          className="w-full text-white bg-primary border-none rounded-lg shadow-xl outline-none h-11 hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Crear turnos del día
        </Button>
      </div>

      {alert?.error && (
        <div className="absolute flex justify-center w-full h-fit">
          <Alert error={alert.error} msg={alert.msg} alertType={alert.alertType} />
        </div>
      )}
    </div>
  );
};

export default AllDayAppointmentsModal;
