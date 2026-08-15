"use client";
import { useState } from "react";
import { LuToggleRight, LuCalendarDays, LuClock, LuSave, LuMousePointerClick } from "react-icons/lu";
import { FaRepeat } from "react-icons/fa6";
import { cn } from "@/lib/utils";

interface Props {
  onClose: () => void;
}

const steps = [
  {
    number: 1,
    icon: <LuClock size={22} className="text-orange-500" />,
    title: "Configurá tu horario de atención",
    description:
      'En la sección "Horario de atención", elegí para cada día de la semana: desde qué hora hasta qué hora atendés, y agregá los turnos en los horarios correspondientes.',
    tip: "Podés configurar horarios distintos para cada día y ubicar los turnos para el servicio/sucursal/empleado que desees.",
  },
  {
    number: 2,
    icon: <LuMousePointerClick size={22} className="text-orange-500" />,
    title: "Agregá los turnos en el calendario",
    description:
      "Hacé clic en cualquier fila del calendario para agregar un turno en ese horario. Podés asignar el turno a una sucursal y a un empleado de la misma.",
    tip: 'Por ejemplo: si agregas un turno el dia lunes a las 18:00 hs, todos los lunes a las 18:00 hs se creará un turno para el mismo servicio, sucursal y/o empleado.',
  },
  {
    number: 3,
    icon: <LuCalendarDays size={22} className="text-orange-500" />,
    title: "Elegí cuántos días de agenda crear",
    description:
      'Más abajo, en "Frecuencia y cantidad de días", elegí en "Días con turnos disponibles" si querés crear 7, 15 o 30 días de turnos. Esa es la cantidad de días con turnos que se van a crear según la plantilla de agenda que configuraste arriba en "Horario de atención".',
    tip: "Podés crear 7 días para comenzar a probar esta funcionalidad.",
  },
  {
    number: 4,
    icon: <FaRepeat size={18} className="text-orange-500" />,
    title: "Elegí con cuánta anticipación renovar los turnos",
    description:
      'En "¿Con qué anticipación crear turnos?" elegí cuántos días antes del último turno querés que se vuelva a generar la plantilla de turnos automáticos.',
    tip: "Por ejemplo: si creás 7 días y elegís 3 días de anticipación, el día 4 se crearán 7 días más automáticamente.",
  },
  {
    number: 5,
    icon: <LuToggleRight size={22} className="text-orange-500" />,
    title: "Activá la agenda automática",
    description:
      'En la misma sección, activá la opción "Crear turnos automáticamente". Cuando la agenda automática está activada, se pone naranja.',
    tip: "Si el interruptor está gris, la agenda automática está desactivada.",
  },
  {
    number: 6,
    icon: <LuSave size={22} className="text-orange-500" />,
    title: "Guardá los cambios",
    description:
      'Tocá el botón naranja "Guardar cambios". ¡Y listo! Se crearán los turnos configurados a partir del día de hoy y tu agenda ya funciona sola.',
    tip: "No te olvides de este paso, si cerrás sin guardar se pierden los cambios.",
  },
];

const TutorialAutomateModal: React.FC<Props> = ({ onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const step = steps[activeStep];
  const isFirst = activeStep === 0;
  const isLast = activeStep === steps.length - 1;

  return (
    <div className="flex flex-col w-full gap-0 h-full">
      {/* Header */}
      <div className="flex flex-col gap-1 pb-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">Cómo automatizar tu agenda</h2>
        <p className="text-sm text-gray-500">
          Seguí estos pasos y en minutos tu agenda funciona sola.
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-1.5 pt-5 pb-2">
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => setActiveStep(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === activeStep
                ? "bg-primary w-8"
                : i < activeStep
                ? "bg-orange-200 w-4"
                : "bg-gray-200 w-4"
            )}
          />
        ))}
        <span className="ml-auto text-xs text-gray-400 font-medium tabular-nums">
          {activeStep + 1} / {steps.length}
        </span>
      </div>

      {/* Step content */}
      <div className="flex flex-col gap-5 flex-1 pt-4">
        {/* title, icon and number */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-orange-50 border border-orange-100 shrink-0">
            {step.icon}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-orange-500 uppercase tracking-wide">
              Paso {step.number}
            </span>
            <h3 className="text-base font-bold text-gray-800 leading-snug">{step.title}</h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>

        {/* Tip */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <span className="text-base leading-none mt-0.5 shrink-0">💡</span>
          <p className="text-sm text-blue-600 leading-relaxed">{step.tip}</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-5 mt-auto border-t border-gray-100">
        <button
          onClick={() => setActiveStep((s) => Math.max(s - 1, 0))}
          disabled={isFirst}
          className={cn(
            "h-9 px-4 rounded-lg text-sm font-semibold border transition-colors duration-200",
            isFirst
              ? "border-gray-100 text-gray-300 cursor-not-allowed"
              : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
          )}
        >
          Anterior
        </button>

        {!isLast ? (
          <button
            onClick={() => setActiveStep((s) => Math.min(s + 1, steps.length - 1))}
            className="h-9 px-5 rounded-lg text-sm font-semibold bg-primary hover:bg-orange-500 text-white transition-colors duration-200"
          >
            Siguiente
          </button>
        ) : (
          <button
            onClick={onClose}
            className="h-9 px-5 rounded-lg text-sm font-semibold bg-primary hover:bg-orange-500 text-white transition-colors duration-200"
          >
            ¡Entendido!
          </button>
        )}
      </div>
    </div>
  );
};

export default TutorialAutomateModal;
