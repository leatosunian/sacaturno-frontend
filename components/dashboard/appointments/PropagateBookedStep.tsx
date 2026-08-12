"use client";
import { useState } from "react";
import dayjs from "dayjs";
import { toast } from "sonner";
import axiosReq from "@/config/axios";
import { LuCheck, LuCalendarCheck } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface BookedMatch {
  _id: string;
  start: string | Date;
  name: string;
  employeeChosenByClient?: boolean;
}

interface Props {
  booked: BookedMatch[];
  /** Cuántos turnos libres ya se actualizaron solos. */
  unbookedUpdated: number;
  fields: { employeeID?: string | null; branchID?: string | null };
  /** Cambió la sucursal: al cliente le cambia la dirección, el aviso es obligatorio. */
  branchChanged: boolean;
  onDone: () => void;
}

const PropagateBookedStep: React.FC<Props> = ({
  booked,
  unbookedUpdated,
  fields,
  branchChanged,
  onDone,
}) => {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(booked.map((b) => b._id))
  );
  const [notifyClient, setNotifyClient] = useState(true);
  const [saving, setSaving] = useState(false);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const apply = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) {
      onDone();
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("sacaturno_token");
      const { data } = await axiosReq.put(
        "/appointment/assignmany",
        {
          appointmentIDs: ids,
          ...fields,
          notifyClient: branchChanged || notifyClient,
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
      const failed: { _id: string }[] = data.failed ?? [];

      if (failed.length > 0) {
        toast.warning(`${assigned.length} actualizados · ${failed.length} con conflicto`, {
          position: "top-center",
        });
      } else {
        toast.success(
          `${assigned.length} ${assigned.length === 1 ? "turno reservado actualizado" : "turnos reservados actualizados"}`,
          { position: "top-center" }
        );
      }
      onDone();
    } catch {
      toast.error("No se pudieron actualizar los turnos reservados", {
        position: "top-center",
      });
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="pb-4 border-b border-gray-100 flex items-start gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50 text-green-600 shrink-0">
          <LuCheck size={20} />
        </div>
        <div className="flex flex-col gap-1">
          <h4 className="text-lg leading-tight font-semibold text-gray-800">
            {unbookedUpdated > 0
              ? `${unbookedUpdated} ${unbookedUpdated === 1 ? "turno libre actualizado" : "turnos libres actualizados"}`
              : "Plantilla actualizada"}
          </h4>
          <p className="text-xs text-gray-400">
            Falta decidir qué hacer con los turnos que ya tienen cliente.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-50 border border-orange-200">
        <LuCalendarCheck size={14} className="text-orange-500 mt-0.5 shrink-0" />
        <p className="text-xs text-orange-700 leading-relaxed">
          {branchChanged
            ? "Estos turnos ya están reservados y el cambio les modifica el lugar de atención. Si los actualizás, se les avisa siempre."
            : "Estos turnos ya están reservados. Si los actualizás, cambia el profesional que los atiende."}
        </p>
      </div>

      <div className="flex flex-col max-h-[34vh] overflow-y-auto">
        {booked.map((b) => {
          const on = selected.has(b._id);
          return (
            <button
              key={b._id}
              type="button"
              onClick={() => toggle(b._id)}
              className="flex items-center gap-2.5 py-2.5 border-b border-gray-50 text-left"
            >
              <span
                className={cn(
                  "flex items-center justify-center w-4 h-4 rounded shrink-0 border transition-colors",
                  on ? "bg-primary border-primary" : "border-gray-300 bg-white"
                )}
              >
                {on && <LuCheck size={11} className="text-white" />}
              </span>
              <span className="text-[13px] text-gray-700 capitalize shrink-0 tabular-nums">
                {dayjs(b.start).format("ddd DD/MM · HH:mm")}
              </span>
              <span className="text-[13px] text-gray-500 truncate">{b.name}</span>
              {b.employeeChosenByClient && (
                <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 shrink-0">
                  eligió profesional
                </span>
              )}
            </button>
          );
        })}
      </div>

      <label
        className={cn(
          "flex items-start gap-2.5 text-xs text-gray-600",
          branchChanged ? "" : "cursor-pointer"
        )}
      >
        <input
          type="checkbox"
          checked={branchChanged || notifyClient}
          disabled={branchChanged}
          onChange={(e) => setNotifyClient(e.target.checked)}
          className="mt-0.5 size-3.5 accent-orange-600 shrink-0 disabled:opacity-70"
        />
        <span>
          Avisarle por email a cada cliente.
          {(branchChanged || notifyClient) && (
            <span className="block mt-0.5 text-gray-400">
              Si el cambio no les sirve van a poder cancelar y se les devuelve la seña.
            </span>
          )}
        </span>
      </label>

      <div className="flex gap-2">
        <Button
          disabled={saving}
          onClick={onDone}
          className="flex-1 h-10 text-xs bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-lg"
        >
          Dejarlos como están
        </Button>
        <Button
          disabled={saving || selected.size === 0}
          onClick={apply}
          className="flex-1 h-10 text-xs text-white bg-primary hover:bg-orange-500 border-none rounded-lg disabled:opacity-50"
        >
          {saving ? "Aplicando..." : `Actualizar ${selected.size}`}
        </Button>
      </div>
    </div>
  );
};

export default PropagateBookedStep;
