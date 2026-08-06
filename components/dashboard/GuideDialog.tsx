"use client";
import { useState } from "react";
import Link from "next/dist/client/link";
import { Dialog, DialogContent } from "../ui/dialog";
import {
  LuBuilding2,
  LuLayoutList,
  LuCalendarDays,
  LuShare2,
  LuArrowRight,
  LuCheck,
  LuClock,
} from "react-icons/lu";
import { IconType } from "react-icons";
import { cn } from "@/lib/utils";

interface Props {
  onClose: () => void;
  openGuideDialog: boolean;
  isFirstLogin: boolean | undefined;
}

interface Bullet {
  strong?: string;
  text: string;
}

interface Step {
  number: number;
  Icon: IconType;
  title: string;
  tagline: string;
  description: string;
  bullets: Bullet[];
  note?: string;
  tip: string;
}

const steps: Step[] = [
  {
    number: 1,
    Icon: LuBuilding2,
    title: "Creá tu empresa",
    tagline: "Tus datos y tu link de reservas online",
    description:
      "Cargás el nombre, el rubro y los datos de contacto de tu negocio. Al terminar obtenés tu link público de reservas, el que vas a compartir con tus clientes para que puedan reservar tus turnos.",
    bullets: [
      { text: "Nombre, rubro y datos de contacto de tu negocio" },
      {
        strong: "Personalizá tu link de reservas",
        text: "sacaturno.com.ar/tu-negocio, lo copiás y compartís con tus clientes",
      },
    ],
    tip: "Sin una empresa creada no vas a poder cargar servicios ni turnos. Es lo único que necesitás para arrancar.",
  },
  {
    number: 2,
    Icon: LuLayoutList,
    title: "Cargá tus servicios",
    tagline: "Lo que tus clientes van a poder reservar",
    description:
      "Creá cada servicio que ofrecés con su precio y duración. Son las opciones que aparecen cuando un cliente pide un turno.",
    bullets: [
      { text: "Definí el precio y la duración de cada servicio" },
      { text: "Creá todos los que ofrezcas; los editás cuando quieras" },
      {
        strong: "Seña opcional",
        text: "se cobra al reservar (requiere vincular tu Mercado Pago)",
      },
    ],
    tip: "Podés agregar, editar o eliminar servicios en cualquier momento desde el panel.",
  },
  {
    number: 3,
    Icon: LuCalendarDays,
    title: "Prepará tu agenda",
    tagline: "Definí cuándo estás disponible",
    description:
      "En la sección Agenda elegís tu horario de atención y cómo se generan los turnos disponibles. Tenés dos formas de trabajar:",
    bullets: [
      {
        strong: "Automatizar agenda",
        text: "armás una plantilla semanal de turnos y el sistema los crea automáticamente durante el tiempo que vos definas (ej. 3 semanas hacia adelante y se vuelven a generar 5 dias antes del último turno disponible)",
      },
      {
        strong: "Turnos",
        text: "cargás turnos a mano para casos puntuales o días con horario especial",
      },
    ],
    note: "Podés combinar ambas: automatizá tu semana base y ajustá las excepciones a mano.",
    tip: "Ahí mismo definís tu política de cancelación: hasta cuándo un cliente puede cancelar su turno por su cuenta.",
  },
  {
    number: 4,
    Icon: LuShare2,
    title: "Compartí tu link y recibí reservas",
    tagline: "¡Todo listo para trabajar!",
    description:
      "Compartí tu link público por WhatsApp, Instagram o donde quieras. Tus clientes eligen un servicio, un horario libre y reservan online.",
    bullets: [
      { text: "Cada reserva aparece automáticamente en tu agenda y te notificamos por correo" },
      { text: "Recibís los turnos sin mensajes, llamadas ni idas y vueltas" },
    ],
    tip: "Vas a poder ver y gestionar todos tus turnos desde el panel de control.",
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
    <Dialog open={openGuideDialog} onOpenChange={isFirstLogin ? undefined : handleClose}>
      <DialogContent
        hideCloseButton={isFirstLogin}
        onEscapeKeyDown={isFirstLogin ? (e) => e.preventDefault() : undefined}
        onPointerDownOutside={isFirstLogin ? (e) => e.preventDefault() : undefined}
        onInteractOutside={isFirstLogin ? (e) => e.preventDefault() : undefined}
        className="sm:w-[460px] md:w-[600px] 2xl:w-[640px] w-[93vw] max-h-[90svh] flex flex-col overflow-hidden p-0"
      >
        {showWelcome ? (
          /* ── Welcome screen (first login only) ── */
          <div className="flex flex-col overflow-hidden">
            {/* Hero */}
            <div className="relative flex flex-col items-center gap-3 px-6 pt-8 pb-6 text-center bg-gradient-to-b from-orange-50 to-white border-b border-orange-100/60">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-white shadow-md shadow-orange-200">
                <LuCalendarDays size={26} />
              </div>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                  ¡Bienvenido a SacaTurno!
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
                  Poné tu agenda a punto y empezá a recibir turnos online. Te guiamos en 4 pasos
                  simples.
                </p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-white border border-orange-100 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
                <LuClock size={13} />
                Te toma menos de 5 minutos
              </span>
            </div>

            {/* Vertical stepper preview */}
            <div className="flex flex-col px-6 py-5 overflow-y-auto">
              {steps.map((s, i) => (
                <div key={i} className="flex gap-3.5">
                  {/* Rail */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 text-primary shrink-0">
                      <s.Icon size={17} />
                    </div>
                    {i < steps.length - 1 && (
                      <div className="w-px flex-1 my-1 bg-gradient-to-b from-orange-200 to-orange-100" />
                    )}
                  </div>
                  {/* Text */}
                  <div className={cn("flex flex-col", i < steps.length - 1 ? "pb-4" : "pb-0")}>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                      Paso {s.number}
                    </span>
                    <span className="text-[15px] font-semibold text-gray-800 leading-snug">
                      {s.title}
                    </span>
                    <span className="text-xs text-gray-500 leading-snug">{s.tagline}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 pt-1">
              <button
                onClick={() => setShowWelcome(false)}
                className="group w-full flex items-center justify-center gap-2 h-11 rounded-lg text-sm font-semibold bg-primary [@media(hover:hover)]:hover:bg-orange-500 text-white transition-colors duration-200"
              >
                Empezar
                <LuArrowRight
                  size={16}
                  className="translate-x-0 [@media(hover:hover)]:group-hover:translate-x-1 transition-transform duration-200"
                />
              </button>
            </div>
          </div>
        ) : (
          /* ── Step-by-step guide ── */
          <div className="flex flex-col w-full gap-0 flex-1 min-h-0">
            {/* Header */}
            <div className="flex flex-col gap-1 px-6 pt-6 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">
                {isFirstLogin ? "Primeros pasos" : "¿Cómo funciona SacaTurno?"}
              </h2>
              <p className="text-sm text-gray-500">
                {isFirstLogin
                  ? "Seguí estos pasos para dejar tu agenda lista."
                  : "Los pasos para configurar tu agenda y recibir turnos."}
              </p>
            </div>

            {/* Step indicators */}
            <div className="flex items-center gap-1.5 px-6 pt-4 pb-1">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveStep(i)}
                  aria-label={`Ir al paso ${i + 1}`}
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
            <div className="flex flex-col gap-5 flex-1 px-6 pt-4 min-h-0 overflow-y-auto pb-2">
              {/* Icon + title */}
              <div className="flex items-center gap-3.5">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 text-primary shrink-0">
                  <step.Icon size={23} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-bold text-primary uppercase tracking-wide">
                    Paso {step.number} · {step.tagline}
                  </span>
                  <h3 className="text-[17px] font-bold text-gray-800 leading-snug">{step.title}</h3>
                </div>
              </div>

              {/* Description + Bullets */}
              <div className="flex flex-col gap-3">
                <p className="text-[15px] text-gray-700 leading-relaxed my-1.5">{step.description}</p>
                <div className="flex flex-col gap-2">
                  {step.bullets.map((b, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center w-4 h-4 mt-0.5 rounded-full bg-orange-100 text-primary shrink-0">
                        <LuCheck size={11} strokeWidth={3} />
                      </span>
                      <span className="text-[14px] text-gray-600 leading-snug">
                        {b.strong && (
                          <span className="font-semibold text-gray-800">{b.strong} — </span>
                        )}
                        {b.text}
                      </span>
                    </div>
                  ))}
                </div>
                {step.note && (
                  <p className="text-[13.5px] text-gray-600 leading-snug mt-1 pt-3 border-t border-gray-100">
                    {step.note}
                  </p>
                )}
              </div>

              {/* Tip */}
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <span className="text-base leading-none mt-0.5 shrink-0">💡</span>
                <p className="text-sm text-blue-600 leading-relaxed">{step.tip}</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between px-6 pb-6 pt-5 mt-1 border-t border-gray-100">
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
                    : "border-gray-200 text-gray-600 [@media(hover:hover)]:hover:border-gray-300 [@media(hover:hover)]:hover:bg-gray-50"
                )}
              >
                {isFirst && isFirstLogin ? "Volver" : "Anterior"}
              </button>

              {!isLast ? (
                <button
                  onClick={() => setActiveStep((s) => Math.min(s + 1, steps.length - 1))}
                  className="h-9 px-5 rounded-lg text-sm font-semibold bg-primary [@media(hover:hover)]:hover:bg-orange-500 text-white transition-colors duration-200"
                >
                  Siguiente
                </button>
              ) : isFirstLogin ? (
                <Link href="/admin/business/create" onClick={handleClose}>
                  <button className="group flex items-center gap-2 h-9 px-5 rounded-lg text-sm font-semibold bg-primary [@media(hover:hover)]:hover:bg-orange-500 text-white transition-colors duration-200">
                    Crear mi empresa
                    <LuArrowRight
                      size={15}
                      className="translate-x-0 [@media(hover:hover)]:group-hover:translate-x-1 transition-transform duration-200"
                    />
                  </button>
                </Link>
              ) : (
                <button
                  onClick={handleClose}
                  className="h-9 px-5 rounded-lg text-sm font-semibold bg-primary [@media(hover:hover)]:hover:bg-orange-500 text-white transition-colors duration-200"
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
