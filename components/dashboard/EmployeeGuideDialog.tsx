"use client";
import { Dialog, DialogContent } from "../ui/dialog";
import { LuCalendarDays, LuCirclePlus, LuChartLine } from "react-icons/lu";
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
    <Dialog open={open}>
      <DialogContent
        hideCloseButton
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className="sm:w-[520px] lg:w-[720px] xl:w-[780px] lg:max-w-[780px] w-[93vw] max-h-[90svh] p-0 overflow-hidden flex flex-col"
      >
        {/* Hero */}
        <div className="relative flex flex-col items-center gap-3 px-6 lg:px-10 pt-8 pb-6 text-center bg-gradient-to-b from-orange-50 to-white border-b border-orange-100/60 shrink-0">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-white shadow-md shadow-orange-200">
            <LuCalendarDays size={26} />
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              ¡Bienvenido a SacaTurno!
            </h2>
            <p className="text-[15px] text-gray-600 leading-relaxed max-w-md">
              Este es tu panel personal para organizar tu día a día. Desde acá
              vas a poder ver tu agenda, gestionar tus turnos y estar al tanto
              de todo lo que tenés que hacer.
            </p>
          </div>
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 lg:px-10 py-5">
          <div className="flex flex-col gap-3">
            <div className="w-full flex flex-col gap-2 p-4 rounded-xl bg-gray-50 border border-gray-100 text-left">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 shrink-0">
                  <LuCalendarDays size={20} className="text-primary" />
                </div>
                <span className="text-[15px] font-semibold text-gray-800">
                  Mirá tu agenda
                </span>
              </div>
              <p className="text-[14px] text-gray-600 leading-relaxed">
                En <strong className="text-gray-800">Mi agenda</strong> vas a
                encontrar todos los turnos que te corresponden: los que te{" "}
                <strong className="text-gray-800">asignó el negocio</strong> y
                los que los{" "}
                <strong className="text-gray-800">clientes reservaron online</strong>{" "}
                con vos. Podés cambiar entre vista día, semana o mes según lo
                que necesites. Hacé click en cualquier turno para ver los datos
                del cliente (nombre, teléfono, email), el servicio reservado,
                la duración, el precio y el estado del pago o la seña.
              </p>
            </div>

            {canAddAppointments && (
              <div className="w-full flex flex-col gap-2 p-4 rounded-xl bg-gray-50 border border-gray-100 text-left">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 shrink-0">
                    <LuCirclePlus size={20} className="text-primary" />
                  </div>
                  <span className="text-[15px] font-semibold text-gray-800">
                    Agregá turnos
                  </span>
                </div>
                <p className="text-[14px] text-gray-600 leading-relaxed">
                  Si un cliente te contacta por otro medio, podés cargar su
                  turno a mano. Hacé click en un horario libre de la agenda,
                  completá los datos del cliente, elegí el servicio y confirmá.
                  El turno queda reservado al instante y aparece junto con el
                  resto de tu jornada.
                </p>
              </div>
            )}

            <div className="w-full flex flex-col gap-2 p-4 rounded-xl bg-gray-50 border border-gray-100 text-left">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 shrink-0">
                  <LuChartLine size={20} className="text-primary" />
                </div>
                <span className="text-[15px] font-semibold text-gray-800">
                  Seguí tus estadísticas
                </span>
              </div>
              <p className="text-[14px] text-gray-600 leading-relaxed">
                Vas a ver tus propios números: cuántos turnos tenés reservados
                esta semana y este mes, tus servicios más pedidos y la
                evolución de tu actividad. Todo pensado para que sepas cómo
                venís sin depender de nadie.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 lg:px-10 pb-6 pt-4 border-t border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full h-11 rounded-lg text-sm font-semibold bg-primary [@media(hover:hover)]:hover:bg-orange-600 text-white transition-colors duration-200"
          >
            ¡Entendido!
          </button>
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default EmployeeGuideDialog;
