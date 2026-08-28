"use client";

import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Phone,
  Sunset,
} from "lucide-react";

/*
  Piezas compartidas por las dos maquetas del hero: el MacBook de desktop
  (HeroMockup) y la hoja de mobile (HeroMockupMobile). Las clases están
  copiadas de los componentes reales del wizard, pero sin variantes `2xl:`:
  esas responden al viewport, no a la maqueta, y en pantallas anchas
  cambiarían el interior del mockup.
*/

// Septiembre 2026 arranca un martes, así que la grilla (lunes a domingo)
// empieza con una celda vacía.
// prettier-ignore
export const CALENDAR_CELLS: (number | null)[] = [
  null, 1, 2, 3, 4, 5, 6,
  7, 8, 9, 10, 11, 12, 13,
  14, 15, 16, 17, 18, 19, 20,
  21, 22, 23, 24, 25, 26, 27,
  28, 29, 30, null, null, null, null,
];
export const AVAILABLE_DAYS = new Set([1, 2, 4, 5, 7, 8, 9, 10]);
export const SELECTED_DAY = 3;

export const SLOTS = [
  { time: "12:00", branch: "Belgrano", state: "free" },
  { time: "12:00", branch: "Núñez", state: "booked" },
  { time: "12:00", branch: "Vicente López", state: "free" },
  { time: "17:00", branch: "Núñez", state: "booked" },
  { time: "17:00", branch: "Belgrano", state: "selected" },
  { time: "17:00", branch: "Vicente López", state: "booked" },
] as const;

export const WIZARD_STEPS = [
  { label: "Servicio", detail: "Blanqueamiento", state: "done" },
  { label: "Sucursal", detail: null, state: "done" },
  { label: "Especialista", detail: null, state: "done" },
  { label: "Fecha", detail: null, state: "current" },
  { label: "Confirmar", detail: null, state: "pending" },
] as const;

export const BUSINESS = {
  name: "Odontología Belgrano",
  type: "Odontología",
  phone: "1147885522",
  initial: "O",
};

export const SELECTED_DATE_LABEL = "Jueves 3 de septiembre";

// ── Etiqueta de sección del paso ─────────────────────────────
export const StepLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-primary">
    {children}
  </span>
);

// ── Franja del negocio ───────────────────────────────────────
interface BizHeaderProps {
  /** Medidas de la variante mobile del wizard real (avatar 44, título lg). */
  compact?: boolean;
}

export const BizHeader = ({ compact = false }: BizHeaderProps) => (
  <div className="shrink-0 border-b border-primary/10 bg-primary/5">
    <div
      className={
        "flex items-center gap-4 " + (compact ? "px-5 py-4" : "px-6 py-4")
      }
    >
      <div
        className={
          "flex shrink-0 items-center justify-center rounded-2xl bg-primary shadow-md " +
          (compact ? "size-11" : "size-12")
        }
      >
        <span
          className={
            "font-black text-primary-foreground " +
            (compact ? "text-lg" : "text-xl")
          }
        >
          {BUSINESS.initial}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1
            className={
              "truncate font-bold leading-none tracking-tight text-neutral-900 " +
              (compact ? "text-lg" : "text-xl")
            }
          >
            {BUSINESS.name}
          </h1>
          <span className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
            {BUSINESS.type}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-x-4 text-xs text-neutral-500">
          <span className="flex items-center gap-1.5">
            <Phone className="size-3.5 shrink-0 text-primary/60" /> {BUSINESS.phone}
          </span>
        </div>
      </div>

      {/* En el wizard real este CTA es `hidden md:flex` */}
      {!compact && (
        <div className="flex shrink-0 items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-primary-foreground shadow-md">
          <CalendarDays className="size-4" strokeWidth={2.5} />
          <span className="text-[13px] font-bold tracking-wide">Reservar turno</span>
        </div>
      )}
    </div>
  </div>
);

// ── Calendario del mes ───────────────────────────────────────
export const MockupCalendar = () => (
  <div>
    <div className="mb-3 flex items-center justify-between">
      <span className="flex size-9 items-center justify-center rounded-xl border border-orange-200 text-orange-600">
        <ChevronLeft className="size-4" />
      </span>
      <span className="text-sm font-extrabold tracking-tight">
        Septiembre <span className="font-bold text-muted-foreground">2026</span>
      </span>
      <span className="flex size-9 items-center justify-center rounded-xl border border-orange-200 text-orange-600">
        <ChevronRight className="size-4" />
      </span>
    </div>

    <div className="mb-1 grid grid-cols-7 gap-1">
      {["L", "M", "M", "J", "V", "S", "D"].map((w, i) => (
        <span
          key={i}
          className="py-1 text-center text-[10px] font-bold text-muted-foreground"
        >
          {w}
        </span>
      ))}
    </div>

    <div className="grid grid-cols-7 gap-1">
      {CALENDAR_CELLS.map((day, i) => {
        if (day === null) return <span key={"gap-" + i} />;
        const selected = day === SELECTED_DAY;
        const free = AVAILABLE_DAYS.has(day);
        return (
          <span
            key={day}
            className={
              "flex aspect-square items-center justify-center rounded-xl text-sm font-bold " +
              (selected
                ? "bg-primary text-primary-foreground shadow-md"
                : free
                  ? "bg-orange-50 text-neutral-900"
                  : "text-neutral-300")
            }
          >
            {day}
          </span>
        );
      })}
    </div>
  </div>
);

// ── Horarios de la franja ────────────────────────────────────
export const MockupSlots = () => (
  <div>
    <div className="mb-2 flex items-center gap-1.5">
      <Sunset className="size-3.5 text-orange-500" />
      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">
        Tarde
      </span>
      <span className="text-[11px] font-semibold text-muted-foreground">· 6</span>
    </div>

    <div className="grid grid-cols-3 gap-2">
      {SLOTS.map((slot, i) => (
        <span
          key={i}
          className={
            "flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl border px-1 py-2.5 text-xs font-bold " +
            (slot.state === "booked"
              ? "border-border bg-muted/50 text-muted-foreground/40"
              : slot.state === "selected"
                ? "border-primary bg-primary text-primary-foreground shadow-md"
                : "border-primary/15 bg-white")
          }
        >
          <span className="w-full truncate text-center">{slot.time}</span>
          <span
            className={
              "w-full truncate text-center text-[9px] font-semibold leading-tight " +
              (slot.state === "selected"
                ? "text-primary-foreground/75"
                : "text-muted-foreground")
            }
          >
            {slot.branch}
          </span>
        </span>
      ))}
    </div>
  </div>
);

// ── Pie del paso (Volver / Continuar) ────────────────────────
export const MockupStepFooter = () => (
  <div className="mt-4 flex shrink-0 items-center gap-3 border-t border-orange-100 pt-4">
    <span className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-4 text-xs font-bold text-orange-600">
      <ArrowLeft className="size-3.5" /> Volver
    </span>
    <span className="flex h-11 flex-1 items-center justify-center rounded-xl bg-primary text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-md">
      Continuar
    </span>
  </div>
);
