"use client";
import Link from "next/link";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  LuBuilding2,
  LuCalendarCheck,
  LuCalendarCog,
  LuCheck,
  LuUsers,
  LuArrowRight,
} from "react-icons/lu";

export interface BranchAssignmentResult {
  branchName: string;
  isFirstBranch: boolean;
  assignedSchedules: number;
  assignedAppointments: number;
  assignedEmployees: number;
  assignedEmployeeIDs: string[];
  totalSchedules: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  result: BranchAssignmentResult | null;
}

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

const BranchAssignmentModal: React.FC<Props> = ({ open, onClose, result }) => {
  if (!result) return null;
  const {
    branchName,
    isFirstBranch,
    assignedSchedules,
    assignedAppointments,
    assignedEmployees,
    totalSchedules,
  } = result;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:w-[460px] w-[93vw]">
        <DialogTitle className="sr-only">
          {isFirstBranch ? "Turnos asignados a la sucursal" : "Nueva sucursal disponible"}
        </DialogTitle>

        <div className="flex flex-col w-full gap-4">
          {/* Header */}
          <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${
                isFirstBranch ? "bg-green-50 text-green-600" : "bg-orange-50 text-primary"
              }`}
            >
              {isFirstBranch ? <LuCheck size={20} /> : <LuBuilding2 size={20} />}
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="text-lg leading-tight font-semibold text-gray-800">
                {isFirstBranch
                  ? "Tus turnos ya están en esta sucursal"
                  : `"${branchName}" ya está disponible`}
              </h4>
              <p className="text-xs text-gray-400">
                {isFirstBranch
                  ? `Como es tu primera sucursal, asignamos todo a "${branchName}".`
                  : "Ahora podés distribuir tus turnos entre las sucursales."}
              </p>
            </div>
          </div>

          {isFirstBranch ? (
            <>
              <div className="flex flex-col rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100 bg-white">
                <div className="flex items-center gap-3 px-4 py-3">
                  <LuCalendarCog className="text-gray-400 shrink-0" size={16} />
                  <span className="text-sm text-gray-600 flex-1">
                    {plural(assignedSchedules, "Turno automatizado", "Turnos automatizados")} en la
                    plantilla
                  </span>
                  <span className="text-sm font-bold text-gray-800 tabular-nums">
                    {assignedSchedules}
                  </span>
                </div>
                <div className="flex items-center gap-3 px-4 py-3">
                  <LuCalendarCheck className="text-gray-400 shrink-0" size={16} />
                  <span className="text-sm text-gray-600 flex-1">
                    {plural(assignedAppointments, "Turno ya creado", "Turnos ya creados")} a futuro
                  </span>
                  <span className="text-sm font-bold text-gray-800 tabular-nums">
                    {assignedAppointments}
                  </span>
                </div>
                {assignedEmployees > 0 && (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <LuUsers className="text-gray-400 shrink-0" size={16} />
                    <span className="text-sm text-gray-600 flex-1">
                      {plural(assignedEmployees, "Empleado que atiende", "Empleados que atienden")} acá
                    </span>
                    <span className="text-sm font-bold text-gray-800 tabular-nums">
                      {assignedEmployees}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-500 leading-relaxed">
                Los turnos que se generen de acá en adelante también van a quedar asignados a{" "}
                <strong className="text-gray-700">{branchName}</strong>. Si más adelante creás otra
                sucursal, vas a poder reasignarlos desde la agenda.
              </p>

              <Button
                onClick={onClose}
                className="w-full h-10 text-white bg-primary hover:bg-orange-500 border-none rounded-lg"
              >
                Entendido
              </Button>
            </>
          ) : (
            <>
              {assignedEmployees > 0 && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white">
                  <LuUsers className="text-gray-400 shrink-0" size={16} />
                  <span className="text-sm text-gray-600 flex-1">
                    {plural(assignedEmployees, "Empleado asignado", "Empleados asignados")} a esta
                    sucursal
                  </span>
                  <span className="text-sm font-bold text-gray-800 tabular-nums">
                    {assignedEmployees}
                  </span>
                </div>
              )}

              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <span className="text-blue-400 mt-0.5 shrink-0 text-sm">ℹ</span>
                <p className="text-xs text-blue-600 leading-relaxed">
                  Tus {totalSchedules} {plural(totalSchedules, "turno sigue", "turnos siguen")} en la
                  sucursal que tenían. Podés mover los que correspondan a{" "}
                  <strong>{branchName}</strong> desde cualquiera de estas dos pantallas.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  href="/admin/schedule/automate"
                  onClick={onClose}
                  className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50/40 transition-colors duration-200"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-50 text-primary shrink-0">
                    <LuCalendarCog size={17} />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-semibold text-gray-800">Automatizar agenda</span>
                    <span className="text-xs text-gray-400">
                      Cambiá la sucursal de los turnos que se repiten cada semana
                    </span>
                  </div>
                  <LuArrowRight
                    size={15}
                    className="text-gray-300 group-hover:text-primary shrink-0 transition-colors"
                  />
                </Link>

                <Link
                  href="/admin/schedule"
                  onClick={onClose}
                  className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50/40 transition-colors duration-200"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-50 text-primary shrink-0">
                    <LuCalendarCheck size={17} />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-semibold text-gray-800">Mis turnos</span>
                    <span className="text-xs text-gray-400">
                      Cambiá la sucursal de un turno puntual ya creado
                    </span>
                  </div>
                  <LuArrowRight
                    size={15}
                    className="text-gray-300 group-hover:text-primary shrink-0 transition-colors"
                  />
                </Link>
              </div>

              <Button
                onClick={onClose}
                className="w-full h-10 text-gray-700 bg-gray-100 hover:bg-gray-200 border-none rounded-lg"
              >
                Más tarde
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BranchAssignmentModal;
