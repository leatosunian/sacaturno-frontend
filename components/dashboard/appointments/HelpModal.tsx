"use client";
import { useState } from "react";
import Link from "next/link";
import { LuCalendarDays, LuMousePointerClick, LuPencilLine, LuCalendarClock } from "react-icons/lu";
import { FaRepeat } from "react-icons/fa6";
import { FaExternalLinkAlt } from "react-icons/fa";
import { cn } from "@/lib/utils";

interface Props {
  onClose: () => void;
}

interface Step {
  number: number;
  icon: React.ReactNode;
  title: string;
  badge: string | null;
  description: string;
  tip: string | null;
  extra: React.ReactNode;
}

const HelpModal: React.FC<Props> = ({ onClose }) => {
  const [activeStep, setActiveStep] = useState(0);

  const steps: Step[] = [
    {
      number: 1,
      icon: <FaRepeat size={18} className="text-orange-500" />,
      title: "Turnos automáticos",
      badge: "Recomendado",
      description:
        'Ingresá a "Automatizar agenda", hacé click en "Tutorial" y seguí las instrucciones para programar tus turnos.',
      tip: "Con esta opción el sistema crea los turnos por vos. No tenés que hacer nada más que configurar tu agenda.",
      extra: (
        <Link
          href="/admin/schedule/automate"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 underline underline-offset-2 transition-colors"
        >
          <FaExternalLinkAlt size={11} />
          Ir a Automatizar agenda
        </Link>
      ),
    },
    {
      number: 2,
      icon: <LuCalendarDays size={22} className="text-orange-500" />,
      title: "Configurá tu horario",
      badge: null,
      description:
        'Ingresá la hora de inicio (ej: 9:00), la hora de fin (ej: 18:00) y el intervalo entre turnos (ej: 1 hora).',
      tip: "Podés configurar horarios distintos para cada día de la semana.",
      extra: null,
    },
    {
      number: 3,
      icon: <LuMousePointerClick size={22} className="text-orange-500" />,
      title: "Agregá un turno",
      badge: null,
      description:
        "Hacé clic en cualquier franja del calendario para agregar un turno. Podés crearlo como disponible (para que tus clientes lo reserven) o como ya reservado completando los datos del cliente y el servicio.",
      tip: 'Desde el celular, mantené presionado el horario hasta que se marque y luego elegí la opción.',
      extra: null,
    },
    {
      number: 4,
      icon: <LuCalendarClock size={22} className="text-orange-500" />,
      title: "Crear turnos del día",
      badge: null,
      description:
        "En el día a modificar, hacé clic en \"Crear turnos del día\" para agregar múltiples turnos. Seleccioná el servicio, el horario de inicio y fin, y la duración de cada turno. El sistema genera todos los turnos disponibles dentro del rango horario que ingresaste.",
      tip: "Ideal para cuando arrancás la semana y querés cargar toda tu agenda en segundos sin hacerlo turno por turno.",
      extra: null,
    },
    {
      number: 5,
      icon: <LuPencilLine size={22} className="text-orange-500" />,
      title: "Combiná los dos modos",
      badge: null,
      description:
        "No tenés que elegir uno solo. Podés tener la agenda automática activada y de vez en cuando agregar o cancelar turnos a mano, por ejemplo para un cliente fuera de tu horario habitual o un horario que no podrás cubrir.",
      tip: "Esta combinación es la más flexible: el sistema trabaja solo y vos solo intervenís cuando hace falta.",
      extra: null,
    },
  ];

  const step = steps[activeStep];
  const isFirst = activeStep === 0;
  const isLast = activeStep === steps.length - 1;

  return (
    <div className="flex flex-col gap-0 px-5 pb-5">
      {/* Header */}
      <div className="flex flex-col gap-1 pb-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">¿Cómo cargo mis turnos?</h2>
        <p className="text-sm text-gray-500">
          Dos formas de trabajar: automática y/o manual. Vos elegís.
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-1.5 py-4">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveStep(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === activeStep
                ? "bg-orange-500 w-8"
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
      <div className="flex flex-col gap-4">
        {/* Icon + title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-orange-50 border border-orange-100 shrink-0">
            {step.icon}
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              {/* <span className="text-xs font-semibold text-orange-500 uppercase tracking-wide">
                Paso {step.number}
              </span> */}
              {step.badge && (
                <span className="text-[10px] font-semibold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                  {step.badge}
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-gray-800 leading-snug">{step.title}</h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-[15px] my-1 text-gray-700 leading-relaxed">{step.description}</p>

        {/* Extra content (image, link, etc.) */}
        {step.extra}

        {/* Tip */}
        {step.tip && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <span className="text-base leading-none mt-0.5 shrink-0">💡</span>
            <p className="text-sm text-blue-600 leading-relaxed">{step.tip}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-5 mt-5 border-t border-gray-100">
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
            className="h-9 px-5 rounded-lg text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-200"
          >
            Siguiente
          </button>
        ) : (
          <button
            onClick={onClose}
            className="h-9 px-5 rounded-lg text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-200"
          >
            ¡Entendido!
          </button>
        )}
      </div>
    </div>
  );
};

export default HelpModal;
