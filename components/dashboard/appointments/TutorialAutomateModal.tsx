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
    icon: <LuToggleRight size={22} className="text-orange-500" />,
    title: "Activá la agenda automática",
    description:
      'Buscá el interruptor que dice "Crear turnos automáticamente" y activalo. Cuando está encendido, se pone naranja.',
    tip: "Si el interruptor está gris, la agenda automática está apagada.",
  },
  {
    number: 2,
    icon: <LuCalendarDays size={22} className="text-orange-500" />,
    title: "Elegí cuántos días de agenda crear",
    description:
      'En "Días con turnos disponibles" elegí si querés crear 7, 15 o 30 días de turnos. Esos son los días que van a poder reservar tus clientes.',
    tip: "Si arrancás, 7 días es más que suficiente para comenzar.",
  },
  {
    number: 3,
    icon: <FaRepeat size={18} className="text-orange-500" />,
    title: "Elegí con cuánta anticipación renovar",
    description:
      'En "¿Con qué anticipación crear turnos?" elegí cuántos días antes de que se acaben los turnos el sistema tiene que volver a crear más.',
    tip: "Por ejemplo: si creás 7 días y elegís 3 días de anticipación, el día 4 el sistema crea 7 días más automáticamente.",
  },
  {
    number: 4,
    icon: <LuClock size={22} className="text-orange-500" />,
    title: "Configurá tu horario de atención",
    description:
      'En la sección "Horario de atención", elegí para cada día de la semana: desde qué hora hasta qué hora atendés, y cuánto dura cada turno.',
    tip: "Podés configurar horarios distintos para cada día.",
  },
  {
    number: 5,
    icon: <LuMousePointerClick size={22} className="text-orange-500" />,
    title: "Agregá los turnos en el calendario",
    description:
      "Hacé clic en cualquier franja del calendario para agregar un turno en ese horario. Se va a poner naranja cuando esté creado.",
    tip: 'También podés usar el botón "+" debajo del horario para agregarlo.',
  },
  {
    number: 6,
    icon: <LuSave size={22} className="text-orange-500" />,
    title: "Guardá los cambios",
    description:
      'Tocá el botón naranja "Guardar cambios". ¡Y listo! Tu agenda ya funciona sola.',
    tip: "No te olvides de este paso, si no cerrás sin guardar se pierden los cambios.",
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
