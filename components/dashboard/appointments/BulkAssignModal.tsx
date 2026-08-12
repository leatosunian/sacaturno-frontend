"use client";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { toast } from "sonner";
import axiosReq from "@/config/axios";
import { LuUser, LuMapPin, LuCheck } from "react-icons/lu";
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
import { IEmployee } from "@/interfaces/employee.interface";
import { IBranch } from "@/interfaces/branch.interface";
import { cn } from "@/lib/utils";

const DAYS = [
  { key: "LUN", label: "Lunes" },
  { key: "MAR", label: "Martes" },
  { key: "MIE", label: "Miércoles" },
  { key: "JUE", label: "Jueves" },
  { key: "VIE", label: "Viernes" },
  { key: "SAB", label: "Sábado" },
  { key: "DOM", label: "Domingo" },
];

type Scope = "unassigned" | "all";

interface Props {
  appointments: IAppointmentSchedule[];
  employees?: IEmployee[];
  branches?: IBranch[];
  onAssigned: (updated: { ids: string[]; employeeID: string | null; branchID: string | null }) => void;
  closeModalF: () => void;
}

const BulkAssignModal: React.FC<Props> = ({
  appointments,
  employees,
  branches,
  onAssigned,
  closeModalF,
}) => {
  const activeEmployees = (employees ?? []).filter((e) => e.status === "active");
  const activeBranches = branches ?? [];

  const [scope, setScope] = useState<Scope>("unassigned");
  const [targetEmployeeID, setTargetEmployeeID] = useState("");
  const [targetBranchID, setTargetBranchID] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [failedReasons, setFailedReasons] = useState<Map<string, string>>(new Map());
  const [propagation, setPropagation] = useState<{
    booked: BookedMatch[];
    unbookedUpdated: number;
  } | null>(null);

  const visible = useMemo(() => {
    const list = appointments.filter((a) => !!a._id);
    if (scope === "all") return list;
    return list.filter((a) => !a.employeeID);
  }, [appointments, scope]);

  const byDay = useMemo(() => {
    return DAYS.map((d) => ({
      ...d,
      items: visible
        .filter((a) => a.day === d.key)
        .sort((a, b) => dayjs(a.start).format("HH:mm").localeCompare(dayjs(b.start).format("HH:mm"))),
    })).filter((d) => d.items.length > 0);
  }, [visible]);

  const unassignedCount = appointments.filter((a) => !a.employeeID).length;

  // Un profesional sólo puede tomar turnos de las sucursales donde atiende.
  const eligibleEmployees = targetBranchID
    ? activeEmployees.filter((e) => (e.branches ?? []).includes(targetBranchID))
    : activeEmployees;

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleDay = (ids: string[]) => {
    const allOn = ids.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (allOn ? next.delete(id) : next.add(id)));
      return next;
    });
  };

  const employeeName = (id: string | null | undefined) => {
    if (!id) return null;
    const e = activeEmployees.find((x) => x._id === id);
    return e ? (e.surname ? `${e.name} ${e.surname[0]}.` : e.name) : null;
  };

  const branchName = (id: string | null | undefined) =>
    id ? (activeBranches.find((b) => b._id === id)?.name ?? null) : null;

  const nothingToApply = !targetEmployeeID && !targetBranchID;

  const apply = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    setSaving(true);
    setFailedReasons(new Map());
    try {
      const token = localStorage.getItem("sacaturno_token");
      const { data } = await axiosReq.put(
        "/schedule/appointment/assignmany",
        {
          appointmentIDs: ids,
          // undefined = no tocar ese campo; el backend distingue eso de null.
          ...(targetEmployeeID ? { employeeID: targetEmployeeID } : {}),
          ...(targetBranchID ? { branchID: targetBranchID } : {}),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-store",
          },
        }
      );

      const assigned: string[] = data.assigned ?? [];
      const failed: { _id: string; reason: string }[] = data.failed ?? [];
      const booked: BookedMatch[] = data.propagated?.booked ?? [];
      const unbookedUpdated: number = data.propagated?.unbookedUpdated ?? 0;

      onAssigned({
        ids: assigned,
        employeeID: targetEmployeeID || null,
        branchID: targetBranchID || null,
      });

      if (failed.length === 0) {
        // Los reservados no se tocaron: van al paso de decisión.
        if (booked.length > 0) {
          setPropagation({ booked, unbookedUpdated });
          return;
        }
        toast.success(
          `${assigned.length} ${assigned.length === 1 ? "turno asignado" : "turnos asignados"}` +
            (unbookedUpdated > 0 ? ` · ${unbookedUpdated} ya creados al día` : ""),
          { position: "top-center" }
        );
        closeModalF();
        return;
      }

      // Resultado parcial: se quedan marcados los que fallaron para que el
      // usuario vea cuáles y por qué, en vez de perder toda la selección.
      setFailedReasons(new Map(failed.map((f) => [f._id, f.reason])));
      setSelected(new Set(failed.map((f) => f._id)));

      const conflicts = failed.filter((f) => f.reason === "CONFLICT").length;
      const notInBranch = failed.filter((f) => f.reason === "NOT_IN_BRANCH").length;
      const detail = [
        conflicts > 0 ? `${conflicts} con horario ocupado` : null,
        notInBranch > 0 ? `${notInBranch} en otra sucursal` : null,
      ]
        .filter(Boolean)
        .join(" · ");

      toast.warning(
        `${assigned.length} asignados · ${detail || `${failed.length} sin aplicar`}`,
        { position: "top-center" }
      );
    } catch {
      toast.error("No se pudo aplicar la asignación", { position: "top-center" });
    } finally {
      setSaving(false);
    }
  };

  if (propagation) {
    return (
      <PropagateBookedStep
        booked={propagation.booked}
        unbookedUpdated={propagation.unbookedUpdated}
        fields={{
          ...(targetEmployeeID ? { employeeID: targetEmployeeID } : {}),
          ...(targetBranchID ? { branchID: targetBranchID } : {}),
        }}
        branchChanged={!!targetBranchID}
        onDone={closeModalF}
      />
    );
  }

  return (
    <div className="flex flex-col w-full gap-4 min-h-0">
      {/* Header */}
      <div className="pb-4 border-b border-gray-100 flex flex-col gap-1">
        <h4 className="text-lg leading-none font-semibold text-gray-800">
          Asignar profesional y sucursal
        </h4>
        <p className="text-xs text-gray-400 mt-0.5">
          Elegí los turnos de la plantilla y aplicá la asignación de una sola vez
        </p>
      </div>

      {/* Scope + targets */}
      <div className="flex flex-col gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setScope("unassigned")}
            className={cn(
              "text-[11px] font-semibold px-3 py-1.5 rounded-full transition-colors duration-200",
              scope === "unassigned"
                ? "bg-primary text-white"
                : "bg-white border border-gray-200 text-gray-500 hover:border-orange-300"
            )}
          >
            Sin profesional · {unassignedCount}
          </button>
          <button
            type="button"
            onClick={() => setScope("all")}
            className={cn(
              "text-[11px] font-semibold px-3 py-1.5 rounded-full transition-colors duration-200",
              scope === "all"
                ? "bg-primary text-white"
                : "bg-white border border-gray-200 text-gray-500 hover:border-orange-300"
            )}
          >
            Todos · {appointments.length}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {activeBranches.length > 0 && (
            <Select
              value={targetBranchID || "none"}
              onValueChange={(v) => {
                setTargetBranchID(v === "none" ? "" : v);
                setTargetEmployeeID("");
              }}
            >
              <SelectTrigger className="h-9 bg-white text-xs">
                <SelectValue placeholder="Sucursal" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Sucursal a aplicar</SelectLabel>
                  <SelectItem value="none">No cambiar sucursal</SelectItem>
                  {activeBranches.map((b) => (
                    <SelectItem key={b._id} value={b._id!}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}

          {activeEmployees.length > 0 && (
            <Select
              value={targetEmployeeID || "none"}
              onValueChange={(v) => setTargetEmployeeID(v === "none" ? "" : v)}
            >
              <SelectTrigger className="h-9 bg-white text-xs">
                <SelectValue placeholder="Profesional" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Profesional a aplicar</SelectLabel>
                  <SelectItem value="none">No cambiar profesional</SelectItem>
                  {eligibleEmployees.map((e) => (
                    <SelectItem key={e._id} value={e._id!}>
                      {e.name} {e.surname}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-0 max-h-[42vh] overflow-y-auto -mx-1 px-1">
        {byDay.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">
            {scope === "unassigned"
              ? "Todos los turnos de la plantilla ya tienen profesional."
              : "No hay turnos en la plantilla."}
          </p>
        )}

        {byDay.map((d) => {
          const ids = d.items.map((a) => a._id!);
          const allOn = ids.every((id) => selected.has(id));
          return (
            <div key={d.key} className="flex flex-col">
              <button
                type="button"
                onClick={() => toggleDay(ids)}
                className="flex items-center gap-2.5 py-2.5 border-b border-gray-100 text-left"
              >
                <span
                  className={cn(
                    "flex items-center justify-center w-4 h-4 rounded shrink-0 border transition-colors",
                    allOn ? "bg-primary border-primary" : "border-gray-300 bg-white"
                  )}
                >
                  {allOn && <LuCheck size={11} className="text-white" />}
                </span>
                <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  {d.label}
                </span>
                <span className="ml-auto text-xs text-gray-400">
                  {d.items.length} {d.items.length === 1 ? "turno" : "turnos"}
                </span>
              </button>

              {d.items.map((a) => {
                const id = a._id!;
                const on = selected.has(id);
                const failReason = failedReasons.get(id);
                const failed = !!failReason;
                const emp = employeeName(a.employeeID);
                const br = branchName(a.branchID);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggle(id)}
                    className={cn(
                      "flex items-center gap-2.5 py-2.5 border-b border-gray-50 text-left transition-colors",
                      failed && "bg-red-50/60"
                    )}
                  >
                    <span
                      className={cn(
                        "flex items-center justify-center w-4 h-4 rounded shrink-0 border transition-colors",
                        on ? "bg-primary border-primary" : "border-gray-300 bg-white"
                      )}
                    >
                      {on && <LuCheck size={11} className="text-white" />}
                    </span>
                    <span className="text-[13px] tabular-nums text-gray-700 shrink-0">
                      {dayjs(a.start).format("HH:mm")}
                    </span>
                    <span className="text-[13px] text-gray-500 truncate">{a.service}</span>

                    <span className="ml-auto flex items-center gap-1.5 shrink-0">
                      {failed ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                          {failReason === "NOT_IN_BRANCH"
                            ? "otra sucursal"
                            : failReason === "CONFLICT"
                              ? "horario ocupado"
                              : "no se aplicó"}
                        </span>
                      ) : emp ? (
                        <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                          <LuUser size={9} />
                          {emp}
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700">
                          sin asignar
                        </span>
                      )}
                      {br && (
                        <span className="hidden sm:flex items-center gap-1 text-[10px] text-gray-400">
                          <LuMapPin size={9} />
                          {br}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-500 mr-auto">
          {selected.size} {selected.size === 1 ? "seleccionado" : "seleccionados"}
        </span>
        <Button
          onClick={closeModalF}
          disabled={saving}
          className="h-9 px-4 text-xs bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-lg"
        >
          Cancelar
        </Button>
        <Button
          onClick={apply}
          disabled={saving || selected.size === 0 || nothingToApply}
          className="h-9 px-4 text-xs text-white bg-primary hover:bg-orange-500 border-none rounded-lg disabled:opacity-50"
        >
          {saving
            ? "Aplicando..."
            : `Asignar ${selected.size || ""} ${selected.size === 1 ? "turno" : "turnos"}`.trim()}
        </Button>
      </div>

      {nothingToApply && selected.size > 0 && (
        <p className="text-[11px] text-orange-600 -mt-2 text-right">
          Elegí un profesional o una sucursal para aplicar.
        </p>
      )}
    </div>
  );
};

export default BulkAssignModal;
