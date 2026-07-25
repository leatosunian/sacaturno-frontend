"use client";
import axiosReq from "@/config/axios";
import dayjs from "dayjs";
import { IService } from "@/interfaces/service.interface";
import { IEmployee } from "@/interfaces/employee.interface";
import { IBranch } from "@/interfaces/branch.interface";
import { useEffect, useState } from "react";
import updateLocale from "dayjs/plugin/updateLocale";
import { IAppointmentSchedule } from "@/interfaces/appointmentSchedule.interface";
import { Clock, Repeat } from "lucide-react";
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
import { toast } from "sonner";

interface props {
  appointmentData: IAppointmentSchedule | undefined;
  servicesData: IService[] | undefined;
  employees?: IEmployee[];
  branches?: IBranch[];
  closeModalF: () => void;
  onNewAppointment: (newAppointment: IAppointmentSchedule) => void;
}

const CreateScheduleAppointmentModal: React.FC<props> = ({
  appointmentData,
  closeModalF,
  servicesData,
  employees,
  branches,
  onNewAppointment,
}) => {
  const [selectedService, setSelectedService] = useState<{
    name: string | undefined;
    price: number | undefined;
    description: string | undefined;
    duration?: number | undefined;
  }>();
  const [endTime, setEndTime] = useState<Date | undefined>(
    appointmentData?.end,
  );
  const [selectedEmployeeID, setSelectedEmployeeID] = useState<string>("");
  const [selectedBranchID, setSelectedBranchID] = useState<string>("");
  const [showNoEmployeeConfirm, setShowNoEmployeeConfirm] = useState(false);

  const activeEmployees = employees?.filter((e) => e.status === "active") ?? [];
  const activeBranches = branches ?? [];
  const hasBranches = activeBranches.length >= 1;
  const showBranchDropdown = activeBranches.length >= 2;
  const singleBranchID =
    activeBranches.length === 1 ? (activeBranches[0]._id ?? "") : "";
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
    activeEmployees.length > 0 && (!showBranchDropdown || !!selectedBranchID);

  const branchIsResolved = !!effectiveBranchID;
  const showNoBranchEmployeesWarning =
    hasBranches && branchIsResolved && filteredEmployees.length === 0;

  const selectedServiceID = servicesData?.find(
    (s) => s.name === selectedService?.name,
  )?._id;
  const serviceFilteredEmployees = selectedServiceID
    ? filteredEmployees.filter((e) =>
        (e.services ?? []).includes(selectedServiceID),
      )
    : filteredEmployees;
  const showNoServiceEmployeesWarning =
    filteredEmployees.length > 0 &&
    serviceFilteredEmployees.length === 0 &&
    !!selectedServiceID;

  dayjs.extend(updateLocale);

  const DAYS_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const DAY_ABBR_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  useEffect(() => {
    if (servicesData && servicesData[0]) {
      setSelectedService({
        name: servicesData[0].name,
        price: servicesData[0].price,
        description: servicesData[0].description,
        duration: servicesData[0].duration,
      });
    }
  }, [servicesData]);

  useEffect(() => {
    if (appointmentData) {
      appointmentData.service = selectedService?.name!;
      appointmentData.price = selectedService?.price!;
      appointmentData.description = selectedService?.description!;
      appointmentData.dayScheduleID = appointmentData.dayScheduleID;
      const newEnd =
        selectedService?.duration && appointmentData.start
          ? dayjs(appointmentData.start)
              .add(selectedService.duration, "minute")
              .toDate()
          : appointmentData.end;
      appointmentData.end = newEnd!;
      setEndTime(newEnd);
    }
  }, [selectedService, appointmentData]);

  const handleSetSelectedService = (name: string) => {
    const serviceSelectedObj = servicesData?.find(
      (service) => service.name === name,
    );
    setSelectedService({
      price: serviceSelectedObj?.price,
      name: serviceSelectedObj?.name,
      description: serviceSelectedObj?.description,
      duration: serviceSelectedObj?.duration,
    });
    setSelectedEmployeeID("");
  };

  const doSaveAppointment = async () => {
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
      end: endTime ?? appointmentData?.end!,
      start: appointmentData?.start!,
      service: selectedService?.name!,
      dayNumber: appointmentData?.dayNumber!,
      employeeID: selectedEmployeeID || null,
      branchID: effectiveBranchID || null,
    };
    try {
      const newAppointment = await axiosReq.post(
        "/schedule/appointment/create",
        data,
        authHeader,
      );
      onNewAppointment(newAppointment.data);
      closeModal();
    } catch (error: any) {
      if (error?.response?.status === 409) {
        toast.error("El empleado ya tiene un turno en ese horario", {
          position: "top-center",
        });
      } else if (error?.response?.status === 400) {
        toast.error("Se alcanzó el límite máximo de turnos en la agenda", {
          position: "top-center",
        });
      }
      closeModal();
    }
  };

  const saveAppointment = () => {
    if (serviceFilteredEmployees.length > 0 && !selectedEmployeeID) {
      setShowNoEmployeeConfirm(true);
      return;
    }
    doSaveAppointment();
  };

  const closeModal = () => {
    closeModalF();
  };

  return (
    <div className="flex flex-col items-center w-full gap-6 pb-1 h-fit">
      <div className="flex flex-col w-full gap-1">
        <div className="pb-4 flex flex-col gap-1 w-full">
          <h4 className="text-lg leading-none font-semibold text-gray-800">
            Nuevo turno
          </h4>
          <p className="text-xs text-gray-400 mt-0.5">
            Este turno se repetirá cada semana automáticamente
          </p>
        </div>

        {/* día recurrente + horario */}
        <div className="flex items-center border-l-[3px] bg-orange-50/70 border-l-orange-400 w-full gap-4 py-3 px-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex flex-col items-center justify-center w-12 h-12 bg-primary rounded-lg shrink-0">
            <Repeat className="w-[18px] h-[18px] text-white" />
            <span className="text-[10px] font-bold text-orange-200 uppercase leading-none mt-1">
              {DAY_ABBR_ES[dayjs(appointmentData?.start).day()]}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[15px] leading-none font-semibold text-gray-800">
              Todos los {DAYS_ES[dayjs(appointmentData?.start).day()]}
            </span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="text-[12.5px] mt-[1.5px] leading-none font-medium text-gray-500">
                {dayjs(appointmentData?.start).format("HH:mm [hs]")} —{" "}
                {dayjs(endTime ?? appointmentData?.end).format("HH:mm [hs]")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-full gap-4 h-fit">
        {/* servicio a prestar */}
        <div className="flex flex-col w-full gap-1 h-fit">
          <label className="text-xs font-bold uppercase">
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
              Esta sucursal no tiene empleados asignados. Podés asignar
              empleados desde el panel de <strong>Equipo</strong>.
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

        {/* asignar empleado */}
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
                <SelectValue placeholder="Sin asignar" />
              </SelectTrigger>
              <SelectContent className="w-full">
                <SelectGroup>
                  <SelectLabel>Empleados</SelectLabel>
                  <SelectItem value="none">Sin asignar</SelectItem>
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

        {showNoEmployeeConfirm && (
          <div className="flex flex-col gap-3 w-full rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
            <p className="text-sm text-orange-800 font-medium leading-snug">
              No asignaste un empleado al turno. ¿Deseás continuar sin asignar?
            </p>
            <div className="flex gap-2 w-full">
              <Button
                className="flex-1 h-9 text-sm bg-primary text-white hover:bg-primary border-none"
                onClick={() => {
                  setShowNoEmployeeConfirm(false);
                  doSaveAppointment();
                }}
              >
                Sí, continuar
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-9 text-sm border-gray-300 text-gray-700 hover:bg-gray-100"
                onClick={() => setShowNoEmployeeConfirm(false)}
              >
                No, volver
              </Button>
            </div>
          </div>
        )}
        {!showNoEmployeeConfirm && (
          <Button
            className="w-full text-white bg-primary border-none rounded-lg shadow-xl outline-none h-11 hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={saveAppointment}
            disabled={showBranchDropdown && !selectedBranchID}
          >
            Crear turno
          </Button>
        )}
      </div>
    </div>
  );
};

export default CreateScheduleAppointmentModal;
