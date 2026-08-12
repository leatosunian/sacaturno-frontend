"use client";
import { IAppointment } from "@/interfaces/appointment.interface";
import { IEmployee } from "@/interfaces/employee.interface";
import { IBranch } from "@/interfaces/branch.interface";
import dayjs from "dayjs";
import styles from "@/app/css-modules/CreateAppointmentModal.module.css";
import { IService } from "@/interfaces/service.interface";
import { useEffect, useState } from "react";
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
import { CalendarDays, Clock } from "lucide-react";

interface props {
  appointmentData: IAppointment | undefined;
  servicesData: IService[] | undefined;
  employees?: IEmployee[];
  branches?: IBranch[];
  currentEmployeeID?: string | null;
  canManageAll?: boolean;
  closeModalF: () => void;
  onSave: (appointmentData: IAppointment) => void;
  tabMode: TabMode;
  onTabModeChange: (mode: TabMode) => void;
}

type TabMode = "pending" | "booked";

const CreateAppointmentModal: React.FC<props> = ({
  appointmentData,
  closeModalF,
  servicesData,
  employees,
  branches,
  currentEmployeeID,
  canManageAll = false,
  onSave,
  tabMode,
  onTabModeChange,
}) => {
  const [selectedService, setSelectedService] = useState<{
    name: string | undefined;
    price: number | undefined;
    description: string | undefined;
    duration: number | undefined;
  }>();
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [end, setEnd] = useState<Date | undefined>(appointmentData?.end);
  const [selectedEmployeeID, setSelectedEmployeeID] = useState<string>(
    currentEmployeeID ?? "",
  );
  const [selectedBranchID, setSelectedBranchID] = useState<string>("");
  const isPast = dayjs(appointmentData?.start).isBefore(dayjs());

  // When the modal is reused (employee context changes), sync the selectedEmployeeID
  useEffect(() => {
    setSelectedEmployeeID(currentEmployeeID ?? "");
  }, [currentEmployeeID]);

  // Branch logic: show branch dropdown when there are 2+ active branches; 1 branch is auto-assigned silently
  const activeBranches = branches ?? [];
  const hasBranches = activeBranches.length >= 1;
  const showBranchDropdown = !currentEmployeeID && activeBranches.length >= 2;
  // Auto-assign single branch
  const singleBranchID =
    activeBranches.length === 1 ? (activeBranches[0]._id ?? "") : "";

  // For employees: always assign to themselves; for owners or canManageAll employees: show dropdown if employees exist
  const activeEmployees = employees?.filter((e) => e.status === "active") ?? [];

  // When branch is selected, filter employees to those assigned to that branch
  const effectiveBranchID = showBranchDropdown
    ? selectedBranchID
    : singleBranchID;
  const filteredEmployees =
    effectiveBranchID && activeEmployees.length > 0
      ? activeEmployees.filter((e) =>
          (e.branches ?? []).includes(effectiveBranchID),
        )
      : activeEmployees;

  const showEmployeeDropdown =
    activeEmployees.length > 0 &&
    (!currentEmployeeID || canManageAll) &&
    (!showBranchDropdown || !!selectedBranchID);

  // Show warning when a branch is resolved but has no employees assigned
  const branchIsResolved = !!effectiveBranchID;
  const showNoBranchEmployeesWarning =
    !currentEmployeeID &&
    hasBranches &&
    branchIsResolved &&
    filteredEmployees.length === 0;

  // Further filter by service: only employees that provide the selected service.
  // El alta de empleado exige al menos un servicio, así que una lista vacía significa
  // "no presta ninguno" y queda fuera del dropdown.
  const selectedServiceID = servicesData?.find(
    (s) => s.name === selectedService?.name,
  )?._id;
  const serviceFilteredEmployees = selectedServiceID
    ? filteredEmployees.filter((e) =>
        (e.services ?? []).includes(selectedServiceID),
      )
    : filteredEmployees;
  const showNoServiceEmployeesWarning =
    !currentEmployeeID &&
    filteredEmployees.length > 0 &&
    serviceFilteredEmployees.length === 0 &&
    !!selectedServiceID;

  useEffect(() => {
    if (servicesData?.[0]) {
      const first = servicesData[0];
      setSelectedService({
        name: first.name,
        price: first.price,
        description: first.description,
        duration: first.duration,
      });
      if (appointmentData?.start && first.duration) {
        setEnd(
          dayjs(appointmentData.start).add(first.duration, "minute").toDate(),
        );
      }
    }
  }, [servicesData, appointmentData?.start]);

  const handleSetSelectedService = (name: string) => {
    const match = servicesData?.find((s) => s.name === name);
    setSelectedService({
      price: match?.price,
      name: match?.name,
      description: match?.description,
      duration: match?.duration,
    });
    if (appointmentData?.start && match?.duration) {
      setEnd(
        dayjs(appointmentData.start).add(match.duration, "minute").toDate(),
      );
    }
    setSelectedEmployeeID("");
  };

  const doSave = () => {
    if (!appointmentData) return;

    const employeeID = selectedEmployeeID || null;
    const branchID = effectiveBranchID || null;

    if (tabMode === "booked") {
      if (!clientName.trim() || !clientEmail.trim() || !clientPhone.trim())
        return;

      const finalAppointment: IAppointment = {
        ...appointmentData,
        end: end ?? appointmentData.end,
        service: selectedService?.name,
        price: selectedService?.price,
        description: selectedService?.description,
        status: "booked",
        name: clientName.trim(),
        title: clientName.trim(),
        email: clientEmail.trim(),
        phone: Number(clientPhone.replace(/\D/g, "")),
        clientID: "",
        employeeID,
        branchID,
      };

      onSave(finalAppointment);
    } else {
      const finalAppointment: IAppointment = {
        ...appointmentData,
        end: end ?? appointmentData.end,
        service: selectedService?.name,
        price: selectedService?.price,
        description: selectedService?.description,
        employeeID,
        branchID,
      };

      onSave(finalAppointment);
    }
  };

  // Dejar el turno sin profesional es una función, no un olvido: lo toma
  // cualquiera del equipo. Por eso no se pide confirmación.
  const handleSave = () => {
    if (!appointmentData) return;
    doSave();
  };

  return (
    <div className="flex flex-col items-center w-full gap-6 pb-1 h-fit">
      <div className="flex flex-col w-full gap-1">
        <div className="pb-4  flex flex-col gap-1 w-full">
          <h4 className="text-lg leading-none font-semibold text-gray-800">
            Nuevo turno
          </h4>
          <p className="text-xs text-gray-400 mt-0.5">
            Agregá un turno disponible o uno ya reservado
          </p>
        </div>

        {/* fecha + horario */}
        <div className="flex items-center border-l-[3px] bg-orange-50/70 border-l-orange-400 w-full gap-4 py-3 px-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex flex-col items-center justify-center w-12 h-12 bg-primary rounded-lg shrink-0">
            <span className="text-xl font-black text-white leading-none">
              {dayjs(appointmentData?.start).format("DD")}
            </span>
            <span className="text-[10px] font-bold text-orange-200 uppercase leading-none mt-0.5">
              {dayjs(appointmentData?.start).format("MMM")}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[15px] leading-none font-semibold text-gray-800 capitalize">
              {dayjs(appointmentData?.start).format("dddd DD [de] MMMM")}
            </span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="text-[12.5px] mt-[1.5px] leading-none font-medium text-gray-500">
                {dayjs(appointmentData?.start).format("HH:mm [hs]")} —{" "}
                {dayjs(end ?? appointmentData?.end).format("HH:mm [hs]")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* disponible/reservado tabs */}
      <div className="flex flex-col w-full gap-1.5">
        <div className="flex w-full border border-gray-300 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => {
              if (!isPast) onTabModeChange("pending");
            }}
            disabled={isPast}
            className="flex-1 py-1.5 text-[11.9px] font-semibold transition-colors focus:outline-none"
            style={{
              backgroundColor: tabMode === "pending" ? "white" : "#f3f4f6",
              color: isPast
                ? "#d1d5db"
                : tabMode === "pending"
                  ? "#dd4924"
                  : "#6b7280",
              borderBottom:
                tabMode === "pending"
                  ? "2px solid #dd4924"
                  : "2px solid transparent",
              cursor: isPast ? "not-allowed" : "pointer",
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
              borderBottom:
                tabMode === "booked"
                  ? "2px solid #dd4924"
                  : "2px solid transparent",
            }}
          >
            Reservado
          </button>
        </div>
        {isPast && (
          <p className="text-[11px] text-gray-400 leading-snug">
            Los turnos pasados deben registrarse como reservados con los datos
            del cliente.
          </p>
        )}
      </div>

      <div className="flex flex-col md:flex-row w-full gap-4 h-fit">
        <div className="flex flex-col w-full h-full gap-4 ">
          {/* servicio a prestar */}
          <div
            className={`flex flex-col w-full gap-1 h-fit ${styles.formInputAppDuration}`}
          >
            <label className="text-xs font-bold uppercase">
              Servicio a prestar
            </label>
            <Select
              value={selectedService?.name}
              onValueChange={handleSetSelectedService}
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
                <SelectTrigger
                  className={`w-full ${!selectedBranchID ? "border-red-300" : ""}`}
                >
                  <SelectValue placeholder="Seleccionar sucursal" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  <SelectGroup>
                    <SelectLabel>Sucursales</SelectLabel>
                    {activeBranches.map((b) => (
                      <SelectItem key={b._id} value={b._id!}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}
          {/* warning: branch selected but no employees assigned */}
          {showNoBranchEmployeesWarning && (
            <div className="flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2.5">
              <span className="mt-0.5 text-orange-500 shrink-0">⚠</span>
              <p className="text-xs text-orange-700 leading-snug">
                {showBranchDropdown
                  ? "Esta sucursal no tiene empleados asignados."
                  : "Tu sucursal no tiene empleados asignados."}{" "}
                Podés asignarlos desde el panel de <strong>Equipo</strong>. Mientras
                tanto, el turno queda disponible para cualquiera.
              </p>
            </div>
          )}
          {/* warning: no employees assigned to selected service */}
          {showNoServiceEmployeesWarning && (
            <div className="flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2.5">
              <span className="mt-0.5 text-orange-500 shrink-0">⚠</span>
              <p className="text-xs text-orange-700 leading-snug">
                Ningún empleado tiene asignado este servicio. Podés asignar
                servicios desde el panel de <strong>Equipo</strong>.
              </p>
            </div>
          )}
          {/* asignar empleado — only shown to owners with employees, not to employees themselves */}
          {showEmployeeDropdown && !showNoServiceEmployeesWarning && (
            <div className="flex flex-col w-full gap-1 h-fit">
              <label className="text-xs font-bold uppercase">
                Empleado asignado
              </label>
              <Select
                value={selectedEmployeeID || "none"}
                onValueChange={(v) =>
                  setSelectedEmployeeID(v === "none" ? "" : v)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Cualquier profesional" />
                </SelectTrigger>
                <SelectContent className="w-full">
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
                  className="w-full border-0 border-b border-gray-200 bg-transparent text-sm py-1.5 outline-none focus:outline-none focus:ring-0 focus:border-b-orange-600 rounded-none"
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
                  className="w-full border-0 border-b border-gray-200 bg-transparent text-sm py-1.5 outline-none focus:outline-none focus:ring-0 focus:border-b-orange-600 rounded-none"
                />
              </div>

              <div className="flex flex-col w-full gap-1 h-fit">
                <label className="text-xs font-bold uppercase">Teléfono</label>
                <input
                  type="number"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="Ej. 11 1234 5678"
                  className="w-full border-0 border-b border-gray-200 bg-transparent text-sm py-1.5 outline-none focus:outline-none focus:ring-0 focus:border-b-orange-600 rounded-none"
                />
              </div>
            </div>
          </>
        )}
      </div>
      <Button
        className="w-full text-white bg-primary border-none rounded-lg shadow-xl outline-none h-11 hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleSave}
        disabled={showBranchDropdown && !selectedBranchID}
      >
        Crear turno
      </Button>
    </div>
  );
};

export default CreateAppointmentModal;
