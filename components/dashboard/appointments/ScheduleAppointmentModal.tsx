"use client";
import { useState } from "react";
import { toast } from "sonner";
import axiosReq from "@/config/axios";
import dayjs from "dayjs";
import { LuTag, LuBanknote, LuMapPin, LuUser } from "react-icons/lu";
import { Clock, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IAppointmentSchedule } from "@/interfaces/appointmentSchedule.interface";
import { IEmployee } from "@/interfaces/employee.interface";
import { IBranch } from "@/interfaces/branch.interface";

interface props {
  appointment: IAppointmentSchedule | undefined;
  closeModalF: () => void;
  onDeleteAppointment: (deletedAppointment: IAppointmentSchedule) => void;
  employees?: IEmployee[];
  branches?: IBranch[];
}

const ScheduleAppointmentModal: React.FC<props> = ({
  appointment,
  closeModalF,
  onDeleteAppointment,
  employees,
  branches,
}) => {
  const DAYS_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const DAY_ABBR_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const assignedEmployee = appointment?.employeeID
    ? employees?.find((e) => e._id === appointment.employeeID)
    : null;
  const assignedBranch = appointment?.branchID
    ? branches?.find((b) => b._id === appointment.branchID)
    : null;

  const deleteAppointment = async () => {
    const token = localStorage.getItem("sacaturno_token");
    const authHeader = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-store",
      },
    };
    setDeleting(true);
    try {
      const deletedAppointment = await axiosReq.delete(
        "/schedule/appointment/delete/" + appointment?._id,
        authHeader
      );
      closeModalF();
      onDeleteAppointment(deletedAppointment.data);
      toast.success("Turno eliminado correctamente", { position: "top-center" });
    } catch (error) {
      console.log(error);
      setDeleting(false);
      toast.error("No se pudo eliminar el turno", { position: "top-center" });
    }
  };

  return (
    <div className="flex flex-col w-full gap-4 pb-1">
      {/* Title */}
      <div className="pb-4 border-b border-gray-100 flex flex-col gap-1">
        <h4 className="text-lg leading-none font-semibold text-gray-800">Turno de agenda</h4>
        <p className="text-xs text-gray-400 mt-0.5">Turno recurrente semanal — aún no fue reservado</p>
      </div>

      {/* día recurrente + horario */}
      <div className="flex items-center border-l-[3px] bg-orange-50/70 border-l-orange-400 w-full gap-4 py-3 px-4 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col items-center justify-center w-12 h-12 bg-primary rounded-lg shrink-0">
          <Repeat className="w-[18px] h-[18px] text-white" />
          <span className="text-[10px] font-bold text-orange-200 uppercase leading-none mt-1">
            {DAY_ABBR_ES[dayjs(appointment?.start).day()]}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[15px] leading-none font-semibold text-gray-800">
            Todos los {DAYS_ES[dayjs(appointment?.start).day()]}
          </span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-[12.5px] mt-[1.5px] leading-none font-medium text-gray-500">
              {dayjs(appointment?.start).format("HH:mm [hs]")} —{" "}
              {dayjs(appointment?.end).format("HH:mm [hs]")}
            </span>
          </div>
        </div>
      </div>

      {/* Details card */}
      <div className="flex flex-col rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm divide-y divide-gray-100">
        {/* Service — hero row */}
        <div className="flex items-center gap-3 px-4 py-3.5 bg-gray-50">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-50 shrink-0">
            <LuTag className="text-orange-600" size={15} />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Servicio</span>
            <span className="text-sm font-semibold text-gray-800 leading-tight">{appointment?.service}</span>
          </div>
        </div>

        {/* Price row */}
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <LuBanknote className="text-gray-400 shrink-0" size={15} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Precio</span>
          </div>
          <span className="text-sm font-bold text-gray-800">$ {appointment?.price?.toLocaleString("es-AR")}</span>
        </div>

        {/* Branch row (conditional) */}
        {assignedBranch && (
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-2">
              <LuMapPin className="text-gray-400 shrink-0" size={15} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Sucursal</span>
            </div>
            <span className="text-sm font-semibold text-gray-700">{assignedBranch.name}</span>
          </div>
        )}

        {/* Employee row (conditional) */}
        {assignedEmployee && (
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-2">
              <LuUser className="text-gray-400 shrink-0" size={15} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Empleado</span>
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {assignedEmployee.name} {assignedEmployee.surname}
            </span>
          </div>
        )}
      </div>

      <div style={{ width: "100%", height: "1px", backgroundColor: "rgb(178 178 178 / 40%)" }} />

      {!confirmDelete ? (
        <Button
          onClick={() => setConfirmDelete(true)}
          className="w-full text-white bg-red-600 border-none rounded-lg h-11 hover:bg-orange-700"
        >
          Eliminar turno
        </Button>
      ) : (
        <div className="flex flex-col gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3.5">
          <p className="text-[13px] leading-relaxed text-red-600 text-center font-medium">
            Al eliminar este turno recurrente, a partir de la{" "}
            <strong>próxima generación de turnos</strong> ya no se creará el turno de
            todos los <strong>{DAYS_ES[dayjs(appointment?.start).day()]}</strong> de{" "}
            {dayjs(appointment?.start).format("HH:mm [hs]")} a{" "}
            {dayjs(appointment?.end).format("HH:mm [hs]")}.
          </p>
          <div className="flex gap-2">
            <Button
              disabled={deleting}
              onClick={() => setConfirmDelete(false)}
              className="flex-1 h-9 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 border-none rounded-lg"
            >
              Cancelar
            </Button>
            <Button
              disabled={deleting}
              onClick={deleteAppointment}
              className="flex-1 h-9 text-xs text-white bg-red-600 hover:bg-red-700 border-none rounded-lg"
            >
              {deleting ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Eliminando...
                </span>
              ) : (
                "Confirmar eliminación"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleAppointmentModal;
