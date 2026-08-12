"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import axiosReq from "@/config/axios";
import dayjs from "dayjs";
import { LuTag, LuBanknote, LuMapPin, LuUser, LuPencil, LuX } from "react-icons/lu";
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
import PropagateBookedStep, { BookedMatch } from "./PropagateBookedStep";
import { IAppointmentSchedule } from "@/interfaces/appointmentSchedule.interface";
import { IService } from "@/interfaces/service.interface";
import { IEmployee } from "@/interfaces/employee.interface";
import { IBranch } from "@/interfaces/branch.interface";

interface props {
  appointment: IAppointmentSchedule | undefined;
  closeModalF: () => void;
  onDeleteAppointment: (deletedAppointment: IAppointmentSchedule) => void;
  onEditAppointment?: (editedAppointment: IAppointmentSchedule) => void;
  servicesData?: IService[];
  employees?: IEmployee[];
  branches?: IBranch[];
}

const ScheduleAppointmentModal: React.FC<props> = ({
  appointment,
  closeModalF,
  onDeleteAppointment,
  onEditAppointment,
  servicesData,
  employees,
  branches,
}) => {
  const DAYS_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const DAY_ABBR_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [draftService, setDraftService] = useState(appointment?.service ?? "");
  const [draftBranchID, setDraftBranchID] = useState(appointment?.branchID ?? "");
  const [draftEmployeeID, setDraftEmployeeID] = useState(appointment?.employeeID ?? "");
  // Paso siguiente al guardar: los turnos libres ya se actualizaron solos, estos
  // tienen cliente y hay que preguntar.
  const [propagation, setPropagation] = useState<{
    booked: BookedMatch[];
    unbookedUpdated: number;
    fields: { employeeID?: string | null; branchID?: string | null };
    branchChanged: boolean;
  } | null>(null);

  // El modal se reutiliza entre turnos: al cambiar de turno el borrador se rebasea.
  useEffect(() => {
    setDraftService(appointment?.service ?? "");
    setDraftBranchID(appointment?.branchID ?? "");
    setDraftEmployeeID(appointment?.employeeID ?? "");
    setEditing(false);
    setConfirmDelete(false);
    setPropagation(null);
  }, [appointment]);

  const activeEmployees = employees?.filter((e) => e.status === "active") ?? [];
  const activeBranches = branches ?? [];

  const assignedEmployee = appointment?.employeeID
    ? employees?.find((e) => e._id === appointment.employeeID)
    : null;
  const assignedBranch = appointment?.branchID
    ? branches?.find((b) => b._id === appointment.branchID)
    : null;

  const draftServiceID = servicesData?.find((s) => s.name === draftService)?._id;
  // Un empleado sólo es elegible si atiende en la sucursal elegida y presta el servicio.
  const eligibleEmployees = activeEmployees
    .filter((e) => !draftBranchID || (e.branches ?? []).includes(draftBranchID))
    .filter((e) => !draftServiceID || (e.services ?? []).includes(draftServiceID));

  const canEdit = !!onEditAppointment;
  const isDirty =
    draftService !== (appointment?.service ?? "") ||
    draftBranchID !== (appointment?.branchID ?? "") ||
    draftEmployeeID !== (appointment?.employeeID ?? "");

  const authHeader = () => ({
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("sacaturno_token")}`,
      "Cache-Control": "no-store",
    },
  });

  const saveEdit = async () => {
    if (!appointment?._id) return;
    const service = servicesData?.find((s) => s.name === draftService);
    // Si cambió el servicio, el fin se recalcula con su duración; si no, se respeta.
    const nextEnd =
      service?.duration && draftService !== appointment.service
        ? dayjs(appointment.start).add(service.duration, "minute").toDate()
        : appointment.end;

    const branchChanged = draftBranchID !== (appointment.branchID ?? "");

    setSaving(true);
    try {
      const res = await axiosReq.put(
        "/schedule/appointment/edit/" + appointment._id,
        {
          service: draftService,
          price: service?.price ?? appointment.price,
          description: service?.description ?? appointment.description,
          end: nextEnd,
          branchID: draftBranchID || null,
          employeeID: draftEmployeeID || null,
        },
        authHeader()
      );
      const { appointment: updated, propagated } = res.data;
      onEditAppointment?.(updated);
      setSaving(false);

      const booked: BookedMatch[] = propagated?.booked ?? [];
      const unbookedUpdated: number = propagated?.unbookedUpdated ?? 0;

      // Sólo se interrumpe si quedó algo que decidir. Si no, se cierra y listo.
      if (booked.length > 0) {
        setPropagation({
          booked,
          unbookedUpdated,
          fields: {
            employeeID: draftEmployeeID || null,
            branchID: draftBranchID || null,
          },
          branchChanged,
        });
        return;
      }

      closeModalF();
      toast.success(
        unbookedUpdated > 0
          ? `Turno actualizado · ${unbookedUpdated} ${unbookedUpdated === 1 ? "turno ya creado" : "turnos ya creados"} al día`
          : "Turno actualizado correctamente",
        { position: "top-center" }
      );
    } catch (error: any) {
      setSaving(false);
      if (error?.response?.status === 409) {
        toast.error("El empleado ya tiene un turno en ese horario", { position: "top-center" });
      } else if (error?.response?.status === 400) {
        toast.error("El empleado no atiende en esa sucursal", { position: "top-center" });
      } else {
        toast.error("No se pudo actualizar el turno", { position: "top-center" });
      }
    }
  };

  const deleteAppointment = async () => {
    setDeleting(true);
    try {
      const deletedAppointment = await axiosReq.delete(
        "/schedule/appointment/delete/" + appointment?._id,
        authHeader()
      );
      closeModalF();
      onDeleteAppointment(deletedAppointment.data);
      toast.success("Turno eliminado correctamente", { position: "top-center" });
    } catch (error) {
      setDeleting(false);
      toast.error("No se pudo eliminar el turno", { position: "top-center" });
    }
  };

  if (propagation) {
    return (
      <PropagateBookedStep
        booked={propagation.booked}
        unbookedUpdated={propagation.unbookedUpdated}
        fields={propagation.fields}
        branchChanged={propagation.branchChanged}
        onDone={closeModalF}
      />
    );
  }

  return (
    <div className="flex flex-col w-full gap-4 pb-1">
      {/* Title */}
      <div className="pb-4 border-b border-gray-100 flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h4 className="text-lg leading-none font-semibold text-gray-800">
            {editing ? "Editar turno de agenda" : "Turno de agenda"}
          </h4>
          <p className="text-xs text-gray-400 mt-0.5">
            {editing
              ? "Los cambios se aplican a partir de la próxima generación de turnos"
              : "Turno recurrente semanal — aún no fue reservado"}
          </p>
        </div>
        {canEdit && !confirmDelete && (
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 hover:border-orange-300 hover:text-orange-600 transition-colors duration-200 shrink-0"
          >
            {editing ? <LuX size={13} /> : <LuPencil size={13} />}
            {editing ? "Cancelar" : "Editar"}
          </button>
        )}
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

      {editing ? (
        /* ── Modo edición ── */
        <div className="flex flex-col w-full gap-4">
          <div className="flex flex-col w-full gap-1">
            <label className="text-xs font-bold uppercase text-gray-600">Servicio a prestar</label>
            <Select
              value={draftService || undefined}
              onValueChange={(v) => {
                setDraftService(v);
                setDraftEmployeeID("");
              }}
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

          {activeBranches.length > 0 && (
            <div className="flex flex-col w-full gap-1">
              <label className="text-xs font-bold uppercase text-gray-600">Sucursal</label>
              <Select
                value={draftBranchID || "none"}
                onValueChange={(v) => {
                  setDraftBranchID(v === "none" ? "" : v);
                  setDraftEmployeeID("");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  <SelectGroup>
                    <SelectLabel>Sucursales</SelectLabel>
                    <SelectItem value="none">Sin asignar</SelectItem>
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

          {activeEmployees.length > 0 && (
            <div className="flex flex-col w-full gap-1">
              <label className="text-xs font-bold uppercase text-gray-600">Empleado asignado</label>
              <Select
                value={draftEmployeeID || "none"}
                onValueChange={(v) => setDraftEmployeeID(v === "none" ? "" : v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  <SelectGroup>
                    <SelectLabel>Empleados</SelectLabel>
                    <SelectItem value="none">Sin asignar</SelectItem>
                    {eligibleEmployees.map((emp) => (
                      <SelectItem key={emp._id} value={emp._id!}>
                        {emp.name} {emp.surname}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {eligibleEmployees.length === 0 && (
                <span className="text-[11px] text-orange-600 mt-0.5">
                  Ningún empleado coincide con la sucursal y el servicio elegidos.
                </span>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              disabled={saving}
              onClick={() => setEditing(false)}
              className="flex-1 h-10 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 border-none rounded-lg"
            >
              Cancelar
            </Button>
            <Button
              disabled={saving || !isDirty}
              onClick={saveEdit}
              className="flex-1 h-10 text-white bg-primary hover:bg-orange-500 border-none rounded-lg disabled:opacity-50"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Guardando...
                </span>
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </div>
        </div>
      ) : (
        /* ── Modo lectura ── */
        <>
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

            {/* Branch row */}
            {activeBranches.length > 0 && (
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-2">
                  <LuMapPin className="text-gray-400 shrink-0" size={15} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Sucursal</span>
                </div>
                <span
                  className={
                    assignedBranch
                      ? "text-sm font-semibold text-gray-700"
                      : "text-sm font-medium text-gray-400 italic"
                  }
                >
                  {assignedBranch?.name ?? "Sin asignar"}
                </span>
              </div>
            )}

            {/* Employee row */}
            {activeEmployees.length > 0 && (
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-2">
                  <LuUser className="text-gray-400 shrink-0" size={15} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Empleado</span>
                </div>
                <span
                  className={
                    assignedEmployee
                      ? "text-sm font-semibold text-gray-700"
                      : "text-sm font-medium text-gray-400 italic"
                  }
                >
                  {assignedEmployee
                    ? `${assignedEmployee.name} ${assignedEmployee.surname}`
                    : "Sin asignar"}
                </span>
              </div>
            )}
          </div>

          <div style={{ width: "100%", height: "1px", backgroundColor: "rgb(178 178 178 / 40%)" }} />

          {!confirmDelete ? (
            <Button
              onClick={() => setConfirmDelete(true)}
              className="w-full text-white bg-red-600 border-none rounded-lg h-11 hover:bg-red-700"
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
        </>
      )}
    </div>
  );
};

export default ScheduleAppointmentModal;
