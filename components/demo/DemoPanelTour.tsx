"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Building2,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  LayoutDashboard,
  Mail,
  Pause,
  Play,
  Plus,
  Repeat,
  Sparkles,
  Tag,
  Timer,
  Users,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DEMO_BRANCH_NAMES, DEMO_TEAM, demoMoney } from "./demoData";
import type { DemoBooking, DemoConfig } from "./demoSync";

/*
  "Del otro lado": el panel del negocio, contado.

  No es el panel real montado con datos falsos —arrastraría auth, permisos y
  SWR, y a alguien que recién llega una agenda real le dice poco—. Es una
  réplica liviana recorrida en ocho momentos: se arma la plantilla semanal, se
  generan los turnos y entra el turno que el visitante acaba de reservar en la
  otra pestaña.
*/

/** El momento en que el turno reservado aterriza en la agenda. */
export const TOUR_APPOINTMENT_STEP = 5;

const STEPS = [
  {
    title: "El día y su horario",
    line: "La plantilla se arma un día a la vez: de qué hora a qué hora atendés y en intervalos de cuánto se divide la jornada.",
  },
  {
    title: "Cargás los turnos",
    line: "Clic en una franja libre y elegís el servicio. De a un turno, o toda la jornada de una vez.",
  },
  {
    title: "El sábado es distinto",
    line: "Cada día tiene su propio horario y sus propios turnos. El sábado, sólo la mañana.",
  },
  {
    title: "Lo activás una vez",
    line: "Elegís cuántos días de agenda querés publicados y con cuánta anticipación se renuevan. De ahí en más se regenera sola.",
  },
  {
    title: "Cada turno con su dueño",
    line: "La agenda queda publicada, y cada turno sale asignado al profesional y a la sucursal que corresponde.",
  },
  {
    title: "Entra un turno",
    line: "Tu cliente reserva desde el link y aparece acá al instante, sin que toques nada.",
  },
  {
    title: "La ficha del turno",
    line: "Quién es, cómo contactarlo y si dejó la seña. Desde acá también se cancela con devolución.",
  },
  {
    title: "Lo que pasa sin vos",
    line: "Los correos al cliente salen solos: confirmación al reservar y recordatorio antes del turno.",
  },
];

const STEP_MS = [4600, 5400, 4600, 5400, 4800, 5200, 5200, 6000];

const DAYS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
const TIMES = ["09:00", "10:00", "11:00", "12:00", "15:00", "16:00", "17:00"];

// Paleta por profesional. Las clases van completas porque Tailwind no arma
// nombres de clase en tiempo de ejecución.
const TEAM_COLORS = [
  { chip: "bg-orange-100 text-orange-800 border-orange-200", dot: "bg-orange-500" },
  { chip: "bg-sky-100 text-sky-800 border-sky-200", dot: "bg-sky-500" },
  { chip: "bg-violet-100 text-violet-800 border-violet-200", dot: "bg-violet-500" },
];

const NEUTRAL = { chip: "bg-neutral-100 text-neutral-600 border-neutral-200", dot: "bg-neutral-400" };

const CLIENTS = [
  "Sofía B.",
  "Diego M.",
  "Pilar A.",
  "Nico R.",
  "Ana T.",
  "Julián P.",
  "Rocío V.",
  "Ema L.",
];

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return h >>> 0;
}

interface Props {
  step: number;
  onStep: (step: number) => void;
  booking: DemoBooking | null;
  config: DemoConfig;
}

export default function DemoPanelTour({ step, onStep, booking, config }: Props) {
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    if (step >= STEPS.length - 1) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => onStep(step + 1), STEP_MS[step] ?? 4500);
    return () => clearTimeout(timer);
  }, [playing, step, onStep]);

  const go = (next: number) => {
    setPlaying(false);
    onStep(Math.max(0, Math.min(STEPS.length - 1, next)));
  };

  const current = STEPS[Math.min(step, STEPS.length - 1)];

  return (
    <div className="flex flex-col lg:flex-row gap-5 lg:gap-7">
      {/* ── Narración ── */}
      <div className="lg:w-[290px] shrink-0 flex flex-col gap-4">
        <div className="rounded-2xl bg-white border border-orange-100 shadow-sm p-5 flex flex-col gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
            Paso {step + 1} de {STEPS.length}
          </span>
          <h3 className="text-lg font-bold tracking-tight text-neutral-900 leading-snug">
            {current.title}
          </h3>
          <p className="text-[13px] text-neutral-600 leading-relaxed">{current.line}</p>

          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => go(step - 1)}
              disabled={step === 0}
              aria-label="Momento anterior"
              className="size-9 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-600 hover:border-orange-300 hover:text-orange-600 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => setPlaying((value) => !value)}
              className="h-9 flex-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              {playing ? (
                <>
                  <Pause className="size-3.5" /> Pausar
                </>
              ) : (
                <>
                  <Play className="size-3.5" />
                  {step >= STEPS.length - 1 ? "Ver de nuevo" : "Reproducir"}
                </>
              )}
            </button>
            <button
              onClick={() => go(step + 1)}
              disabled={step === STEPS.length - 1}
              aria-label="Momento siguiente"
              className="size-9 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-600 hover:border-orange-300 hover:text-orange-600 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        <ol className="hidden lg:flex flex-col gap-0.5">
          {STEPS.map((item, index) => (
            <li key={item.title}>
              <button
                onClick={() => go(index)}
                className={cn(
                  "w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors",
                  index === step
                    ? "bg-white border border-orange-200 shadow-sm"
                    : "hover:bg-white/70 border border-transparent",
                )}
              >
                <span
                  className={cn(
                    "size-5 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold",
                    index < step
                      ? "bg-emerald-500 text-white"
                      : index === step
                        ? "bg-orange-600 text-white"
                        : "bg-neutral-200 text-neutral-500",
                  )}
                >
                  {index < step ? <Check className="size-3" strokeWidth={3} /> : index + 1}
                </span>
                <span
                  className={cn(
                    "text-[13px] truncate",
                    index === step ? "font-bold text-neutral-900" : "text-neutral-500",
                  )}
                >
                  {item.title}
                </span>
              </button>
            </li>
          ))}
        </ol>

        <div className="lg:hidden flex gap-1.5">
          {STEPS.map((item, index) => (
            <button
              key={item.title}
              onClick={() => go(index)}
              aria-label={`Ir a: ${item.title}`}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                index < step ? "bg-emerald-400" : index === step ? "bg-orange-600" : "bg-neutral-200",
              )}
            />
          ))}
        </div>
      </div>

      {/* ── Pantalla ── */}
      <div className="flex-1 min-w-0 flex flex-col items-center gap-2.5">
        <div className="w-full rounded-t-2xl lg:border-[10px] lg:border-b-0 border-neutral-900 bg-neutral-900 overflow-hidden shadow-2xl rounded-b-2xl lg:rounded-b-none">
          <PanelScreen step={step} booking={booking} config={config} />
        </div>
        <div className="hidden lg:block h-3 w-[calc(100%+52px)] rounded-b-xl bg-neutral-900 shadow-xl" />
      </div>
    </div>
  );
}

// ── La pantalla del panel ───────────────────────────────────
function PanelScreen({
  step,
  booking,
  config,
}: {
  step: number;
  booking: DemoBooking | null;
  config: DemoConfig;
}) {
  const nav = [
    { label: "Inicio", Icon: LayoutDashboard },
    { label: "Turnos", Icon: CalendarDays, active: true },
    { label: "Servicios", Icon: Tag },
    ...(config.employees ? [{ label: "Equipo", Icon: Users }] : []),
    ...(config.branches ? [{ label: "Sucursales", Icon: Building2 }] : []),
    { label: "Suscripción", Icon: CreditCard },
  ];

  return (
    <div className="flex bg-neutral-50 h-[440px] lg:h-[520px] text-neutral-900">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-44 shrink-0 bg-white border-r border-neutral-100 py-4">
        <span className="px-4 text-[15px] font-light tracking-tight mb-5">
          saca<span className="text-orange-600">turno</span>
        </span>
        <nav className="flex flex-col gap-0.5 px-2">
          {nav.map(({ label, Icon, active }: any) => (
            <span
              key={label}
              className={cn(
                "flex items-center gap-2.5 px-3 h-9 rounded-lg text-[13px] font-medium",
                active ? "bg-orange-50 text-orange-700" : "text-neutral-500",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </span>
          ))}
        </nav>
        <div className="mt-auto mx-3 rounded-xl bg-neutral-50 border border-neutral-100 px-3 py-2.5">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Odontología
          </span>
          <span className="block text-[13px] font-bold truncate">Belgrano</span>
        </div>
      </aside>

      {/* Contenido */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="shrink-0 flex items-center justify-between gap-3 px-4 md:px-5 h-14 bg-white border-b border-neutral-100">
          <div className="flex flex-col min-w-0">
            <h4 className="text-sm font-bold tracking-tight truncate">
              {step <= 3 ? "Automatizar agenda" : step === 7 ? "Automatizaciones" : "Turnos"}
            </h4>
            <span className="text-[11px] text-neutral-400 truncate">
              {step <= 2
                ? "Plantilla semanal"
                : step === 3
                  ? "Frecuencia y cantidad de días"
                  : step === 7
                    ? "Correos que salen solos"
                    : "Esta semana"}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {step <= 3 && (
              <span className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-lg bg-orange-600 text-white text-[11px] font-bold">
                <Check className="size-3.5" strokeWidth={3} /> Guardar cambios
              </span>
            )}
            {step >= 4 && step < 7 && (
              <span className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-lg border border-neutral-200 text-neutral-600 text-[11px] font-bold">
                <Repeat className="size-3.5" /> Automatizar
              </span>
            )}
          </div>
        </header>

        <div className="flex-1 min-h-0 overflow-hidden relative">
          {step <= 2 && <TemplateView step={step} />}
          {step === 3 && <AutomationConfigView />}
          {step >= 4 && step <= 6 && (
            <AgendaView step={step} booking={booking} config={config} />
          )}
          {step === 7 && <AutomationsView booking={booking} />}
        </div>
      </div>
    </div>
  );
}

// ── Plantilla semanal (pasos 1 a 3) ─────────────────────────
//
// Réplica de /admin/schedule/automate: pestañas por día, rango horario propio
// (Desde / Hasta / Intervalos) y una grilla donde los turnos se cargan de a
// uno, haciendo clic en una franja libre. No hay un switch por día ni una
// "duración de cada turno" global: la duración la pone el servicio elegido, y
// un día queda cerrado simplemente por no tener turnos cargados.
const TPL_DAYS = [
  { key: "LUN", full: "Lunes" },
  { key: "MAR", full: "Martes" },
  { key: "MIÉ", full: "Miércoles" },
  { key: "JUE", full: "Jueves" },
  { key: "VIE", full: "Viernes" },
  { key: "SÁB", full: "Sábado" },
  { key: "DOM", full: "Domingo" },
];

/** Franjas dibujadas en la grilla. La jornada sigue más abajo, con scroll. */
const TPL_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
];

const WEEKDAY_SHIFT = { from: "09:00", to: "20:00", every: 30, hours: 11 };
const SATURDAY_SHIFT = { from: "09:00", to: "13:00", every: 30, hours: 4 };

const WEEKDAY_APPOINTMENTS = [
  { at: "09:00", service: "Consulta", end: "09:30" },
  { at: "10:00", service: "Limpieza dental", end: "10:45" },
  { at: "11:30", service: "Consulta", end: "12:00" },
  { at: "12:00", service: "Blanqueamiento", end: "13:00" },
];

const SATURDAY_APPOINTMENTS = [
  { at: "09:00", service: "Consulta", end: "09:30" },
  { at: "10:30", service: "Limpieza dental", end: "11:15" },
];

const SLOT_H = 34;

function TemplateView({ step }: { step: number }) {
  const isSaturday = step >= 2;
  const dayIndex = isSaturday ? 5 : 0;
  const shift = isSaturday ? SATURDAY_SHIFT : WEEKDAY_SHIFT;
  const appointments =
    step === 0 ? [] : isSaturday ? SATURDAY_APPOINTMENTS : WEEKDAY_APPOINTMENTS;

  // El puntito bajo la pestaña marca los días que ya tienen turnos cargados.
  const loaded = (index: number) =>
    step === 0 ? false : index <= 4 || (index === 5 && isSaturday);

  return (
    <div className="h-full overflow-y-auto p-3 md:p-4 flex flex-col gap-3">
      {/* Nota: la plantilla por sí sola no publica nada */}
      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-orange-50/70 border border-orange-100">
        <Zap className="size-3.5 text-orange-600 mt-0.5 shrink-0" />
        <p className="text-[11px] leading-relaxed text-neutral-600">
          Esto es una <b className="text-neutral-800">plantilla semanal</b>: los
          turnos se publican solo si activás{" "}
          <b className="text-neutral-800">Crear turnos automáticamente</b>.
        </p>
      </div>

      {/* Pestañas por día */}
      <div className="grid grid-cols-7 gap-1 p-1 rounded-xl bg-white border border-neutral-100">
        {TPL_DAYS.map((day, index) => (
          <span
            key={day.key}
            className={cn(
              "relative flex items-center justify-center h-7 text-[10px] font-bold rounded-lg transition-colors",
              index === dayIndex
                ? "bg-orange-600 text-white"
                : index === 6
                  ? "text-neutral-300"
                  : "text-neutral-500",
            )}
          >
            {day.key}
            <span
              className={cn(
                "absolute bottom-0.5 left-1/2 -translate-x-1/2 size-1 rounded-full",
                loaded(index)
                  ? index === dayIndex
                    ? "bg-white"
                    : "bg-orange-500/70"
                  : "bg-transparent",
              )}
            />
          </span>
        ))}
      </div>

      {/* Grilla del día */}
      <div className="rounded-xl border border-neutral-100 bg-white overflow-hidden">
        {/* Cabecera: identidad del día + rango horario */}
        <div className="flex items-center gap-3 px-3 py-2 border-b border-neutral-100 bg-neutral-50">
          <span className="w-[3px] h-5 rounded-full bg-orange-600 shrink-0" />
          <span className="flex flex-col leading-tight shrink-0">
            <span className="text-[12px] font-bold text-neutral-800">
              {TPL_DAYS[dayIndex].full}
            </span>
            <span className="text-[10px] text-neutral-400">
              {appointments.length} turno{appointments.length === 1 ? "" : "s"} ·{" "}
              {shift.hours} h
            </span>
          </span>

          <span className="hidden sm:block w-px h-6 bg-neutral-200 shrink-0" />

          <div className="ml-auto sm:ml-0 flex items-center gap-2 shrink-0">
            <Field label="Desde" value={shift.from} />
            <Field label="Hasta" value={shift.to} />
            <Field label="Intervalos" value={`${shift.every} min`} />
          </div>
        </div>

        {/* Franjas */}
        <div className="flex">
          <div className="w-[52px] shrink-0 border-r border-neutral-100">
            {TPL_SLOTS.map((slot) => (
              <div
                key={slot}
                style={{ height: SLOT_H }}
                className="flex flex-col items-center justify-center gap-0.5"
              >
                <span className="text-[10px] tabular-nums text-neutral-400">{slot}</span>
                <span className="flex items-center justify-center size-4 rounded-full text-orange-500">
                  <Plus className="size-3" strokeWidth={3} />
                </span>
              </div>
            ))}
          </div>

          <div className="relative flex-1 min-w-0">
            {TPL_SLOTS.map((slot, index) => (
              <div
                key={slot}
                style={{ height: SLOT_H }}
                className={cn(
                  "flex items-center justify-center",
                  index % 2 === 0
                    ? "border-b border-neutral-100"
                    : "border-b border-dashed border-neutral-100",
                )}
              >
                {step === 0 && index === 2 && (
                  <span className="text-[10px] font-medium text-orange-400">
                    + Nuevo turno
                  </span>
                )}
              </div>
            ))}

            {appointments.map((appointment) => {
              const top = TPL_SLOTS.indexOf(appointment.at);
              if (top < 0) return null;
              const span = Math.max(
                1,
                Math.round(
                  (toMinutes(appointment.end) - toMinutes(appointment.at)) / 30,
                ),
              );
              return (
                <span
                  key={appointment.at}
                  style={{
                    position: "absolute",
                    top: top * SLOT_H + 1,
                    left: 6,
                    height: span * SLOT_H - 3,
                  }}
                  className="motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 w-[150px] max-w-[70%] rounded-md bg-orange-600 border-l-[3px] border-orange-800 px-1.5 py-1 flex flex-col overflow-hidden"
                >
                  <span className="text-[10px] font-bold text-white leading-tight truncate">
                    {appointment.service}
                  </span>
                  <span className="text-[9px] text-orange-100 leading-tight tabular-nums">
                    {appointment.at} – {appointment.end}
                  </span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Leyenda */}
        <div className="flex items-center gap-3 px-3 py-1.5 border-t border-neutral-100 bg-neutral-50">
          <span className="flex items-center gap-1.5 text-[10px] text-neutral-400">
            <span className="size-2.5 rounded-sm bg-orange-600 border-l-2 border-orange-800 inline-block" />
            Turno automatizado
          </span>
          <span className="text-[10px] text-neutral-400 truncate">
            Click en franja vacía para agregar turno
          </span>
        </div>
      </div>

      {/* El modal de alta, cuando se está cargando un turno */}
      {step === 1 && <NewAppointmentCard />}
    </div>
  );
}

function toMinutes(label: string): number {
  const [hours, minutes] = label.split(":").map(Number);
  return hours * 60 + minutes;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="hidden md:inline text-[10px] font-medium text-neutral-500">
        {label}
      </span>
      <span className="h-6 flex items-center px-2 rounded-md border border-neutral-200 bg-white text-[10px] font-semibold text-neutral-800 tabular-nums">
        {value}
      </span>
    </span>
  );
}

/** Lo que se abre al hacer clic en una franja libre. */
function NewAppointmentCard() {
  return (
    <div className="absolute inset-0 bg-neutral-900/30 flex items-center justify-center p-4 motion-safe:animate-in motion-safe:fade-in">
      <div className="w-full max-w-[300px] rounded-2xl bg-white shadow-2xl p-4 flex flex-col gap-3 motion-safe:animate-in motion-safe:zoom-in-95">
        <div className="flex flex-col gap-0.5">
          <h5 className="text-[15px] font-bold text-neutral-900 leading-none">
            Nuevo turno
          </h5>
          <span className="text-[11px] text-neutral-400">
            Este turno se repetirá cada semana automáticamente
          </span>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-neutral-200 border-l-[3px] border-l-orange-400 bg-orange-50/70 px-3 py-2.5">
          <span className="flex flex-col items-center justify-center size-10 rounded-lg bg-orange-600 shrink-0">
            <Repeat className="size-4 text-white" />
            <span className="text-[9px] font-bold text-orange-200 uppercase leading-none mt-0.5">
              Lun
            </span>
          </span>
          <span className="flex flex-col gap-1">
            <span className="text-[13px] font-bold text-neutral-800 leading-none">
              Todos los lunes
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500">
              <Clock className="size-3 text-neutral-400" />
              10:00 hs — 10:45 hs
            </span>
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase text-neutral-700">
            Servicio a prestar
          </span>
          <span className="h-8 flex items-center px-2.5 rounded-md border border-neutral-200 text-[11px] font-semibold text-neutral-800">
            Limpieza dental · 45 min
          </span>
        </div>

        <span className="h-9 rounded-lg bg-orange-600 text-white text-[12px] font-bold flex items-center justify-center">
          Crear turno
        </span>
      </div>
    </div>
  );
}

// ── Frecuencia y cantidad de días (paso 4) ──────────────────
function AutomationConfigView() {
  return (
    <div className="h-full overflow-y-auto p-3 md:p-4 flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2.5">
        <div className="flex flex-col gap-1.5 p-3 rounded-xl border border-neutral-200 bg-white">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-600">
            <CalendarDays className="size-3.5 text-neutral-400 shrink-0" />
            Días con turnos disponibles
          </span>
          <span className="h-8 flex items-center px-2.5 rounded-md border border-neutral-200 bg-neutral-50 text-[12px] font-semibold text-neutral-800">
            Crear 30 días
          </span>
        </div>
        <div className="flex flex-col gap-1.5 p-3 rounded-xl border border-neutral-200 bg-white">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-600">
            <Timer className="size-3.5 text-neutral-400 shrink-0" />
            ¿Con qué anticipación?
          </span>
          <span className="h-8 flex items-center px-2.5 rounded-md border border-neutral-200 bg-neutral-50 text-[12px] font-semibold text-neutral-800">
            3 días antes
          </span>
        </div>
      </div>

      {/* Interruptor maestro */}
      <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-orange-200 bg-orange-50/60">
        <span className="flex items-center gap-3 min-w-0">
          <span className="flex items-center justify-center size-9 rounded-full bg-orange-600 text-white shrink-0">
            <Zap className="size-4" />
          </span>
          <span className="flex flex-col min-w-0">
            <span className="text-[12.5px] font-bold text-neutral-800">
              Crear turnos automáticamente
            </span>
            <span className="text-[11px] text-neutral-500">
              La agenda se completa sola, sin que hagas nada.
            </span>
          </span>
        </span>
        <span className="w-11 h-6 rounded-full bg-orange-600 relative shrink-0">
          <span className="absolute top-0.5 left-[22px] size-5 rounded-full bg-white shadow" />
        </span>
      </div>

      {/* Resumen */}
      <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-3.5">
        <span className="flex items-center gap-1.5 text-[12.5px] font-bold text-neutral-800">
          <Sparkles className="size-3.5 text-orange-600" />
          Resumen de tu automatización
        </span>
        <div className="flex flex-col divide-y divide-orange-100 mt-2">
          <SummaryRow label="Estado" value="Activada" accent />
          <SummaryRow label="Agenda cargada hasta" value="30 días" />
          <SummaryRow label="Turnos por semana" value="22" />
          <SummaryRow label="Ventana" value="30 días · renueva 3 antes" />
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
      <span className="text-[11px] text-neutral-500 shrink-0">{label}</span>
      {accent ? (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-orange-200 bg-orange-50 text-[10px] font-bold text-orange-700">
          <span className="size-1.5 rounded-full bg-orange-600" />
          {value}
        </span>
      ) : (
        <span className="text-[11px] font-bold text-neutral-800 text-right">
          {value}
        </span>
      )}
    </div>
  );
}

// ── Agenda (pasos 4 a 7) ────────────────────────────────────
function AgendaView({
  step,
  booking,
  config,
}: {
  step: number;
  booking: DemoBooking | null;
  config: DemoConfig;
}) {
  const colored = step >= 4 && config.employees;
  const showBooking = step >= 5;
  const showDetail = step === 6;

  const bookingRow = Math.max(
    0,
    booking ? TIMES.indexOf(booking.timeLabel) : 5,
  );
  const bookingCol = 2;
  const clientName = booking?.clientName ?? "Martina Gómez";
  const serviceName = booking?.service ?? "Blanqueamiento";
  const deposit = booking?.deposit ?? 25000;
  const timeLabel = booking?.timeLabel ?? TIMES[5];
  const endTimeLabel = booking?.endTimeLabel ?? "17:00";
  const branchName = booking?.branchName ?? DEMO_BRANCH_NAMES[0];
  const employeeName = booking?.employeeName ?? DEMO_TEAM[0].name;

  return (
    <div className="h-full flex flex-col">
      {/* Leyenda */}
      {colored && (
        <div className="shrink-0 flex items-center gap-3 px-4 md:px-5 py-2 bg-white border-b border-neutral-100 overflow-x-auto scrollbar-hide">
          {DEMO_TEAM.map((member, index) => (
            <span
              key={member.id}
              className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500 whitespace-nowrap"
            >
              <span className={cn("size-2 rounded-full", TEAM_COLORS[index].dot)} />
              {member.name}
            </span>
          ))}
        </div>
      )}

      {/* El aviso de turno nuevo flota arriba a la derecha: en ese momento la
          grilla baja para no quedar tapada. */}
      <div
        className={cn(
          "flex-1 min-h-0 overflow-auto p-3 md:p-4",
          step === 5 && "pt-14 md:pt-16",
        )}
      >
        <div className="min-w-[520px]">
          {/* Encabezado de días */}
          <div className="grid grid-cols-[46px_repeat(6,1fr)] gap-1 mb-1">
            <span />
            {DAYS.map((day) => (
              <span
                key={day}
                className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 text-center"
              >
                {day}
              </span>
            ))}
          </div>

          {TIMES.map((time, row) => (
            <div key={time} className="grid grid-cols-[46px_repeat(6,1fr)] gap-1 mb-1">
              <span className="text-[10px] text-neutral-400 font-medium tabular-nums pt-1.5 text-right pr-1">
                {time}
              </span>
              {DAYS.map((day, col) => {
                const isSaturdayAfternoon = col === 5 && row >= 4;
                const isBookingCell = showBooking && row === bookingRow && col === bookingCol;
                const seed = hash(`${day}-${time}`);
                const busy = !isSaturdayAfternoon && seed % 100 < 42;
                const color = colored ? TEAM_COLORS[seed % TEAM_COLORS.length] : NEUTRAL;

                if (isSaturdayAfternoon) {
                  return <span key={day} className="h-8 rounded-md bg-neutral-100/60" />;
                }

                if (isBookingCell) {
                  return (
                    <span
                      key={day}
                      className="h-8 rounded-md border-2 border-emerald-500 bg-emerald-50 px-1.5 flex flex-col justify-center overflow-hidden motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:fade-in ring-4 ring-emerald-500/20"
                    >
                      <span className="text-[10px] font-bold text-emerald-900 truncate leading-tight">
                        {clientName}
                      </span>
                      <span className="text-[9px] text-emerald-700 truncate leading-tight">
                        {serviceName}
                      </span>
                    </span>
                  );
                }

                if (!busy) {
                  return (
                    <span
                      key={day}
                      className="h-8 rounded-md border border-dashed border-neutral-200 bg-white"
                    />
                  );
                }

                return (
                  <span
                    key={day}
                    className={cn(
                      "h-8 rounded-md border px-1.5 flex items-center overflow-hidden",
                      color.chip,
                    )}
                  >
                    <span className="text-[10px] font-semibold truncate">
                      {CLIENTS[seed % CLIENTS.length]}
                    </span>
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Aviso de turno nuevo */}
      {step === 5 && (
        <div className="absolute top-3 right-3 md:right-4 w-[230px] rounded-xl bg-white border border-neutral-200 shadow-xl p-3 flex gap-2.5 motion-safe:animate-in motion-safe:slide-in-from-right-4 motion-safe:fade-in">
          <span className="size-7 rounded-lg bg-orange-600 flex items-center justify-center shrink-0">
            <Bell className="size-3.5 text-white" />
          </span>
          <span className="flex flex-col min-w-0">
            <span className="text-[12px] font-bold leading-tight">
              Nuevo turno reservado
            </span>
            <span className="text-[11px] text-neutral-500 leading-tight truncate">
              {clientName} · {timeLabel} hs
            </span>
          </span>
        </div>
      )}

      {/* Ficha del turno */}
      {showDetail && (
        <div className="absolute inset-0 bg-neutral-900/30 flex items-center justify-center p-4 motion-safe:animate-in motion-safe:fade-in">
          <div className="w-full max-w-[320px] rounded-2xl bg-white shadow-2xl overflow-hidden motion-safe:animate-in motion-safe:zoom-in-95">
            <div className="px-4 py-3 bg-orange-50 border-b border-orange-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                Turno reservado
              </span>
              <h5 className="text-sm font-bold text-neutral-900">{clientName}</h5>
            </div>
            <div className="p-4 flex flex-col gap-2 text-[12px]">
              <Row label="Servicio" value={serviceName} />
              <Row label="Horario" value={`${timeLabel} a ${endTimeLabel} hs`} />
              {config.employees && <Row label="Profesional" value={employeeName} />}
              {config.branches && <Row label="Sucursal" value={branchName} />}
              <Row label="Teléfono" value={booking?.clientPhone ?? "11 5550 1234"} />
              {config.deposit && deposit > 0 && (
                <div className="flex items-center justify-between gap-3 mt-1 pt-2 border-t border-neutral-100">
                  <span className="text-neutral-500">Seña</span>
                  <span className="flex items-center gap-1.5 font-bold text-emerald-700">
                    <Check className="size-3.5" strokeWidth={3} />
                    {demoMoney(deposit)} acreditada
                  </span>
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <span className="flex-1 h-8 rounded-lg bg-orange-600 text-white text-[11px] font-bold flex items-center justify-center">
                  Reprogramar
                </span>
                <span className="flex-1 h-8 rounded-lg border border-red-200 text-red-600 text-[11px] font-bold flex items-center justify-center">
                  Cancelar y devolver
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-neutral-500 shrink-0">{label}</span>
      <span className="font-semibold text-neutral-800 text-right truncate">{value}</span>
    </div>
  );
}

// ── Automatizaciones (paso 8) ───────────────────────────────
function AutomationsView({ booking }: { booking: DemoBooking | null }) {
  const client = booking?.clientName ?? "Martina Gómez";

  const items = [
    {
      Icon: Mail,
      title: "Confirmación al reservar",
      line: `${client} ya recibió el detalle del turno y el link para cancelarlo.`,
      state: "Enviado",
    },
    {
      Icon: Bell,
      title: "Recordatorio 24 horas antes",
      line: "Sale solo la tarde anterior. Es lo que más baja los ausentes.",
      state: "Programado",
    },
    {
      Icon: Repeat,
      title: "Turnos del mes que viene",
      line: "La agenda se vuelve a publicar sin que entres al panel.",
      state: "Automático",
    },
  ];

  return (
    <div className="h-full overflow-y-auto p-4 md:p-5 flex flex-col gap-2.5">
      {items.map(({ Icon, title, line, state }) => (
        <div
          key={title}
          className="flex items-start gap-3 rounded-xl bg-white border border-neutral-100 p-3.5"
        >
          <span className="size-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
            <Icon className="size-4 text-orange-600" />
          </span>
          <span className="flex flex-col min-w-0 flex-1">
            <span className="text-[13px] font-bold text-neutral-900">{title}</span>
            <span className="text-[11px] text-neutral-500 leading-relaxed">{line}</span>
          </span>
          <span className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
            {state}
          </span>
        </div>
      ))}

      <div className="mt-auto flex items-start gap-2.5 rounded-xl bg-orange-50 border border-orange-100 p-3.5">
        <Sparkles className="size-4 text-orange-600 shrink-0 mt-0.5" />
        <p className="text-[12px] text-orange-900 leading-relaxed">
          Todo esto pasa sin que abras el panel. Vos entrás cuando querés ver
          cómo viene la semana.
        </p>
      </div>
    </div>
  );
}
