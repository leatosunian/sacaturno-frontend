"use client";
import { useState } from "react";
import Link from "next/dist/client/link";
import { Dialog, DialogContent } from "../ui/dialog";
import { LuBuilding2, LuLayoutList, LuCalendarDays, LuArrowRight } from "react-icons/lu";
import { cn } from "@/lib/utils";

interface Props {
  onClose: () => void;
  openGuideDialog: boolean;
  isFirstLogin: boolean | undefined;
}

const steps = [
  {
    number: 1,
    icon: <LuBuilding2 size={22} className="text-orange-500" />,
    title: "Creá tu empresa",
    description:
      "Este es el primer paso. Sin una empresa creada no vas a poder cargar servicios ni turnos.",
    bullets: [
      "Definí el nombre de tu negocio",
      "Configurá tus datos básicos",
      "Ajustá horarios y preferencias generales",
    ],
    tip: "Sin empresa creada no podés avanzar. Es el único requisito obligatorio antes de empezar.",
    cta: null,
  },
  {
    number: 2,
    icon: <LuLayoutList size={22} className="text-orange-500" />,
    title: "Agregá tus servicios",
    description: "Contanos qué ofrecés. Estos son los servicios que tus clientes van a poder reservar.",
    bullets: [
      "Creá uno o más servicios",
      "Definí la duración de cada uno",
      "Elegí si requieren seña para reservar",
    ],
    tip: "Podés agregar o editar servicios en cualquier momento desde el panel.",
    cta: null,
  },
  {
    number: 3,
    icon: <LuCalendarDays size={22} className="text-orange-500" />,
    title: "Cargá tus turnos",
    description: "Entrá a Mi agenda y elegí cómo querés trabajar:",
    bullets: [
      "⚡ Automatizar turnos (recomendado) — el sistema los crea solo",
      "✍️ Carga manual — ideal si tenés horarios variables",
      "Cada opción tiene su propio Tutorial paso a paso dentro de la sección",
    ],
    tip: "¡Podés cambiar esta configuración cuando quieras!",
    cta: null,
  },
];

const GuideDialog: React.FC<Props> = ({ onClose, openGuideDialog, isFirstLogin }) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [showWelcome, setShowWelcome] = useState<boolean>(!!isFirstLogin);

  const step = steps[activeStep];
  const isFirst = activeStep === 0;
  const isLast = activeStep === steps.length - 1;

  const handleClose = () => {
    setActiveStep(0);
    setShowWelcome(!!isFirstLogin);
    onClose();
  };

  return (
    <Dialog open={openGuideDialog} onOpenChange={handleClose}>
      <DialogContent className="sm:w-[460px] md:w-[600px] 2xl:w-[700px] w-[93vw]">
        {showWelcome ? (
          /* ── Welcome screen (first login only) ── */
          <div className="flex flex-col items-center gap-6 py-2 text-center">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">¡Bienvenido a SacaTurno!</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                En 3 pasos simples vas a dejar tu agenda lista para empezar a recibir turnos.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full">
              {steps.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 text-left"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-50 border border-orange-100 shrink-0">
                    {s.icon}
                  </div>
                  <div className="flex flex-col gap-0">
                    <span className="text-[10px] font-semibold text-orange-500 uppercase tracking-wide">
                      Paso {s.number}
                    </span>
                    <span className="text-sm font-semibold text-gray-700">{s.title}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowWelcome(false)}
              className="w-full h-10 rounded-lg text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-200"
            >
              Empezar →
            </button>
          </div>
        ) : (
          /* ── Step-by-step guide ── */
          <div className="flex flex-col w-full gap-0 h-full">
            {/* Header */}
            <div className="flex flex-col gap-1 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">
                {isFirstLogin ? "Primeros pasos" : "¿Cómo utilizo la plataforma?"}
              </h2>
              <p className="text-sm text-gray-500">
                {isFirstLogin
                  ? "Seguí estos pasos para dejar tu agenda lista."
                  : "Los pasos básicos para configurar tu agenda."}
              </p>
            </div>

            {/* Step indicators */}
            <div className="flex items-center gap-1.5 pt-5 pb-2">
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
            <div className="flex flex-col gap-5 flex-1 pt-4">
              {/* Icon + title */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-orange-50 border border-orange-100 shrink-0">
                  {step.icon}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-orange-500 uppercase tracking-wide">
                    Paso {step.number}
                  </span>
                  <h3 className="text-[17px]  font-bold text-gray-800 leading-snug">{step.title}</h3>
                </div>
              </div>

              {/* Description */}
              <p className="text-[15px] text-gray-700 leading-relaxed">{step.description}</p>

              {/* Bullets */}
              <div className="flex flex-col gap-2">
                {step.bullets.map((b, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold text-sm leading-snug shrink-0">•</span>
                    <span className="text-[14.3px] text-gray-600 leading-snug">{b}</span>
                  </div>
                ))}
              </div>

              {/* Tip */}
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <span className="text-base leading-none mt-0.5 shrink-0">💡</span>
                <p className="text-sm text-blue-600 leading-relaxed">{step.tip}</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-5 mt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  if (isFirst && isFirstLogin) {
                    setShowWelcome(true);
                  } else {
                    setActiveStep((s) => Math.max(s - 1, 0));
                  }
                }}
                disabled={isFirst && !isFirstLogin}
                className={cn(
                  "h-9 px-4 rounded-lg text-sm font-semibold border transition-colors duration-200",
                  isFirst && !isFirstLogin
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
              ) : isFirstLogin ? (
                <Link href="/admin/business/create" onClick={handleClose}>
                  <button className="group flex items-center gap-2 h-9 px-5 rounded-lg text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-200">
                    Crear mi empresa
                    <LuArrowRight size={15} className="translate-x-0 group-hover:translate-x-1 transition-transform duration-200" />
                  </button>
                </Link>
              ) : (
                <button
                  onClick={handleClose}
                  className="h-9 px-5 rounded-lg text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-200"
                >
                  ¡Entendido!
                </button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GuideDialog;
