"use client";
import { Dialog, DialogContent } from "../ui/dialog";
import { LuCalendarDays, LuCirclePlus } from "react-icons/lu";
import { usePermissions } from "@/components/dashboard/PermissionsProvider";

interface Props {
  open: boolean;
  onClose: () => void;
}

const EmployeeGuideDialog: React.FC<Props> = ({ open, onClose }) => {
  const { can } = usePermissions();
  const canAddAppointments =
    can("manage_own_appointments") || can("manage_all_appointments");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:w-[460px] w-[93vw]">
        <div className="flex flex-col items-center gap-6 py-2 text-center">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              ¡Bienvenido a SacaTurno!
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Acá vas a poder gestionar tus turnos de forma sencilla.
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 text-left">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-50 border border-orange-100 shrink-0 mt-0.5">
                <LuCalendarDays size={20} className="text-primary" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-gray-700">
                  Mirá tu agenda
                </span>
                <span className="text-xs text-gray-500 leading-relaxed">
                  Desde <strong>Mi agenda</strong> podés ver todos tus turnos
                  del día, semana o mes. Hacé click en cualquier turno para ver
                  los detalles del cliente.
                </span>
              </div>
            </div>

            {canAddAppointments && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 text-left">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-50 border border-orange-100 shrink-0 mt-0.5">
                  <LuCirclePlus size={20} className="text-primary" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-gray-700">
                    Agregá turnos
                  </span>
                  <span className="text-xs text-gray-500 leading-relaxed">
                    Hacé click en un horario disponible de la agenda para crear
                    un turno manualmente. Completá los datos del cliente y
                    confirmá.
                  </span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full h-10 rounded-lg text-sm font-semibold bg-primary hover:bg-orange-500 text-white transition-colors duration-200"
          >
            ¡Entendido!
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeGuideDialog;
