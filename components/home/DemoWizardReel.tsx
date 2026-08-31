"use client";

import { useEffect, useRef, useState } from "react";
import { Check, MapPin, Sunset } from "lucide-react";
import {
  BizHeader,
  MockupCalendar,
  MockupSlots,
  SELECTED_DATE_LABEL,
  StepLabel,
} from "./HeroMockupParts";

/*
  El wizard de reserva recorriéndose solo, dentro del teléfono de la banda.

  No es un GIF: son seis pantallas del mismo DOM cruzando por opacidad. Cero
  bytes de red, cero imágenes, y el texto queda nítido a cualquier escala.

  Gira en bucle, arrancando cuando la banda entra en pantalla y pausándose
  cuando sale: fuera de vista no se agenda ningún timer, así que no gasta nada
  en una pestaña que nadie mira. "Turno reservado" se queda más tiempo que los
  demás cuadros para que el desenlace no pase de largo.

  No mira `prefers-reduced-motion`: acá el cambio de cuadro es un fundido de
  opacidad, sin desplazamiento ni escala, que es justamente lo que esa
  preferencia recomienda usar EN LUGAR de movimiento. Si algún día se le suma
  un deslizamiento o un zoom, hay que volver a respetarla.

  Ojo al tocar el wizard real: esto es una réplica con las piezas de
  HeroMockupParts, no el componente de verdad. Si cambian los pasos, esto miente
  hasta que alguien lo actualice.
*/

const STEP_MS = 1500;
// El desenlace se queda más tiempo antes de volver a empezar: es el cuadro que
// tiene que quedar en la retina, y a ritmo de paso se pierde.
const FINAL_HOLD_MS = 3400;

const STEP_NAMES = [
  "Servicio",
  "Sucursal",
  "Especialista",
  "Fecha y hora",
  "Confirmar",
] as const;

const SERVICES = [
  { name: "Consulta", meta: "30 min", price: "$18.000" },
  { name: "Limpieza dental", meta: "45 min · seña $10.000", price: "$32.000" },
  { name: "Blanqueamiento", meta: "60 min · seña $25.000", price: "$95.000" },
  { name: "Ortodoncia · control", meta: "30 min", price: "$22.000" },
];

const BRANCHES = [
  { name: "Belgrano", address: "Av. Cabildo 2120" },
  { name: "Núñez", address: "Av. del Libertador 7100" },
  { name: "Vicente López", address: "Av. Maipú 1250" },
];

const STAFF = [
  { name: "Carla Ruiz", role: "Odontóloga" },
  { name: "Martín Sosa", role: "Ortodoncista" },
  { name: "Lucía Ferrer", role: "Odontóloga" },
];

// El índice elegido en cada lista, para que la selección coincida con el
// resumen del paso "Confirmar".
const PICKED = { service: 2, branch: 0, staff: 0 };

// ── Barra de progreso ────────────────────────────────────────
// En el último cuadro el turno ya está tomado: la barra pasa a verde y deja de
// hablar de pasos, o diría "Paso 5 · Confirmar" sobre una pantalla de éxito.
const Strip = ({ step }: { step: number }) => {
  const done = step > STEP_NAMES.length - 1;

  return (
    <div
      className={
        "relative shrink-0 overflow-hidden px-5 pb-3 pt-3 text-white transition-colors duration-500 " +
        (done
          ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
          : "bg-gradient-to-r from-orange-500 via-orange-600 to-orange-600")
      }
    >
      <div className="pointer-events-none absolute -right-4 -top-8 size-24 rounded-full bg-white/10" />
      <p className="relative mb-2 text-sm text-white/85">
        {done ? (
          <span className="font-bold text-white">Turno reservado</span>
        ) : (
          <>
            Paso {step + 1} de {STEP_NAMES.length} ·{" "}
            <span className="font-bold text-white">{STEP_NAMES[step]}</span>
          </>
        )}
      </p>
      <div className="relative flex gap-1">
        {STEP_NAMES.map((name, i) => (
          <span
            key={name}
            className={
              "h-1 flex-1 rounded-full transition-colors duration-500 " +
              (done
                ? "bg-white"
                : i < step
                  ? "bg-emerald-400"
                  : i === step
                    ? "bg-white"
                    : "bg-white/25")
            }
          />
        ))}
      </div>
    </div>
  );
};

const Title = ({ title, hint }: { title: string; hint?: string }) => (
  <>
    <h2 className="text-lg font-extrabold tracking-tight">{title}</h2>
    {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
  </>
);

// La fila seleccionada usa el mismo tratamiento que los slots del wizard real:
// borde y fondo primary, para que el ojo la encuentre sin leer.
const Row = ({
  picked,
  children,
}: {
  picked: boolean;
  children: React.ReactNode;
}) => (
  <div
    className={
      "flex items-center gap-3 rounded-xl border px-3.5 py-3 " +
      (picked
        ? "border-primary bg-primary/5 shadow-sm"
        : "border-border bg-white")
    }
  >
    {children}
    {picked && (
      <span className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full bg-primary">
        <Check className="size-3 text-white" strokeWidth={3} />
      </span>
    )}
  </div>
);

const ServiceScreen = () => (
  <>
    <Title title="Seleccioná un servicio" />
    <div className="mt-4 flex flex-col gap-2">
      {SERVICES.map((service, i) => (
        <Row key={service.name} picked={i === PICKED.service}>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-[13px] font-bold text-neutral-900">
              {service.name}
            </span>
            <span className="truncate text-[11px] text-muted-foreground">
              {service.meta}
            </span>
          </span>
          <span className="ml-auto shrink-0 text-[13px] font-extrabold text-primary">
            {service.price}
          </span>
        </Row>
      ))}
    </div>
  </>
);

const BranchScreen = () => (
  <>
    <Title title="¿En qué sucursal?" hint="Para Blanqueamiento · 60 min" />
    <div className="mt-4 flex flex-col gap-2">
      {BRANCHES.map((branch, i) => (
        <Row key={branch.name} picked={i === PICKED.branch}>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <MapPin className="size-4 text-primary" strokeWidth={2.5} />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-[13px] font-bold text-neutral-900">
              {branch.name}
            </span>
            <span className="truncate text-[11px] text-muted-foreground">
              {branch.address}
            </span>
          </span>
        </Row>
      ))}
    </div>
  </>
);

const StaffScreen = () => (
  <>
    <Title title="Elegí un especialista" hint="Sucursal Belgrano" />
    <div className="mt-4 flex flex-col gap-2">
      {STAFF.map((person, i) => (
        <Row key={person.name} picked={i === PICKED.staff}>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-[13px] font-black text-white">
            {person.name[0]}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-[13px] font-bold text-neutral-900">
              {person.name}
            </span>
            <span className="truncate text-[11px] text-muted-foreground">
              {person.role}
            </span>
          </span>
        </Row>
      ))}
    </div>
  </>
);

const DateScreen = () => (
  <>
    <Title title="Fecha y hora" hint="Para Blanqueamiento · 60 min" />
    <div className="mt-4 flex flex-col gap-5">
      <div>
        <StepLabel>Elegí un día</StepLabel>
        <MockupCalendar />
      </div>
      <div>
        <StepLabel>Elegí un horario</StepLabel>
        <p className="-mt-1 mb-3 text-base font-extrabold leading-tight text-neutral-900">
          {SELECTED_DATE_LABEL}
        </p>
        <MockupSlots />
      </div>
    </div>
  </>
);

const SUMMARY = [
  { label: "Servicio", value: "Blanqueamiento" },
  { label: "Sucursal", value: "Belgrano" },
  { label: "Especialista", value: "Carla Ruiz" },
  { label: "Cuándo", value: "Jue 3 de sep · 17:00" },
];

const ConfirmScreen = () => (
  <>
    <Title title="Confirmá tu reserva" />
    <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50/60 px-4 py-3">
      {SUMMARY.map((row) => (
        <div
          key={row.label}
          className="flex items-baseline justify-between gap-3 border-b border-orange-100/70 py-2 last:border-b-0"
        >
          <span className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            {row.label}
          </span>
          <span className="truncate text-[13px] font-bold text-neutral-900">
            {row.value}
          </span>
        </div>
      ))}
    </div>

    <div className="mt-3 flex items-center justify-between rounded-2xl bg-neutral-900 px-4 py-3">
      <span className="text-[11px] font-bold uppercase tracking-wider text-white/60">
        Seña a pagar
      </span>
      <span className="text-base font-extrabold text-white">$25.000</span>
    </div>

    <div className="mt-4 flex h-11 items-center justify-center rounded-xl bg-primary text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-md">
      Confirmar reserva
    </div>
  </>
);

const BookedScreen = () => (
  <div className="flex flex-col items-center pt-6 text-center">
    <span className="flex size-16 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30">
      <Check className="size-8 text-white" strokeWidth={3} />
    </span>
    <h2 className="mt-4 text-xl font-extrabold tracking-tight text-neutral-900">
      Turno reservado
    </h2>
    <p className="mt-1 text-xs text-muted-foreground">
      Te mandamos el comprobante por mail.
    </p>

    <div className="mt-5 w-full rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left">
      <div className="flex items-center gap-2">
        <Sunset className="size-3.5 shrink-0 text-emerald-600" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
          Jueves 3 de septiembre
        </span>
      </div>
      <p className="mt-1.5 text-lg font-extrabold leading-tight text-neutral-900">
        17:00 a 18:00 hs
      </p>
      <p className="mt-0.5 text-[11px] text-neutral-600">
        Blanqueamiento · Belgrano · Carla Ruiz
      </p>
    </div>
  </div>
);

const SCREENS = [
  ServiceScreen,
  BranchScreen,
  StaffScreen,
  DateScreen,
  ConfirmScreen,
  BookedScreen,
];

const LAST = SCREENS.length - 1;

interface Props {
  /** Lienzo en el que se dibuja; el padre lo escala al tamaño del marco. */
  designWidth: number;
  designHeight: number;
}

const DemoWizardReel = ({ designWidth, designHeight }: Props) => {
  const [step, setStep] = useState(0);
  const [onScreen, setOnScreen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { threshold: 0.35 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Un timeout por cuadro, recreado en cada paso. Fuera de pantalla no se
  // agenda ninguno: el bucle queda en pausa donde estaba en vez de girar en
  // vano en una pestaña que nadie mira.
  useEffect(() => {
    if (!onScreen) return;
    const timer = setTimeout(
      () => setStep((current) => (current + 1) % SCREENS.length),
      step === LAST ? FINAL_HOLD_MS : STEP_MS,
    );
    return () => clearTimeout(timer);
  }, [onScreen, step]);

  return (
    <div
      ref={rootRef}
      className="flex flex-col"
      style={{ width: designWidth, height: designHeight }}
    >
      <BizHeader compact />
      <Strip step={step} />

      {/* Las pantallas se apilan en la misma caja: cruzar por opacidad no
          reflota nada, así que la animación no cuesta layout. */}
      <div className="relative flex-1 bg-white">
        {SCREENS.map((Screen, i) => (
          <div
            key={i}
            aria-hidden={i !== step}
            className={
              "absolute inset-0 px-5 pb-5 pt-3.5 transition-opacity duration-500 ease-out " +
              (i === step ? "opacity-100" : "opacity-0")
            }
          >
            <Screen />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DemoWizardReel;
