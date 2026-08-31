"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { MousePointerClick } from "lucide-react";
import {
  BizHeader,
  MockupCalendar,
  MockupSlots,
  SELECTED_DATE_LABEL,
  StepLabel,
  WIZARD_STEPS,
} from "./HeroMockupParts";
import { easeOutExpo } from "./hero.animations";

/*
  Cierre del hero en mobile: un teléfono con marco mostrando la pantalla de
  reserva entera, una notificación cruzándolo, y abajo el acceso a la demo.

  El marco importa: es lo que dice "esto es una foto de una app" sin que nadie
  lo piense. Una UI a ancho completo y a escala 1:1 se lee como la app de
  verdad e invita a tocarla — y la interactividad ahora vive en el botón.

  Va montado como hermano de <HeroSection />, no adentro: esa sección es
  `overflow-hidden` y recortaría el bloque. El margen negativo lo mete
  HERO_MOCKUP_PEEK px dentro del hero, así asoma sin scrollear.
*/

// Cuánto monta sobre el hero, y cuánto aire queda entre el teléfono y los CTA.
// HeroSection reserva la suma como padding-bottom en mobile, así que los dos se
// reparten un presupuesto fijo: subir uno baja el otro. El techo lo pone el
// alto del bloque de texto — pasarse hace que el hero supere 100vh y entonces
// se ve MENOS teléfono, no más.
export const HERO_MOCKUP_PEEK = 240;
export const HERO_MOCKUP_AIR = 50;

// Ruta de la demo interactiva.
const DEMO_HREF = "/demo";

// La UI se dibuja en un lienzo fijo de 390px (ancho real de un teléfono) y se
// reduce al ancho de la pantalla del marco, así conserva las mismas medidas
// que la app real en vez de re-maquetarse a 234px.
const PHONE_W = 244;
const BEZEL = 5;
const DESIGN_W = 390;
const SCALE = (PHONE_W - BEZEL * 2) / DESIGN_W;
// Reserva para el notch, dentro del lienzo de 390.
const NOTCH_SPACE = 24;
// Alto estimado hasta que se mide de verdad: evita el salto en el primer pintado.
const SCREEN_H_FALLBACK = 470;

// Barra de progreso del wizard en mobile (el sidebar es sólo desktop).
const MobileStrip = () => {
  const stepIndex = WIZARD_STEPS.findIndex((s) => s.state === "current");

  return (
    <div className="relative shrink-0 overflow-hidden bg-gradient-to-r from-orange-500 via-orange-600 to-orange-600 px-5 pb-3 pt-3 text-white">
      <div className="pointer-events-none absolute -right-4 -top-8 size-24 rounded-full bg-white/10" />
      <p className="relative mb-2 text-sm text-white/85">
        Paso {stepIndex + 1} de {WIZARD_STEPS.length} ·{" "}
        <span className="font-bold text-white">{WIZARD_STEPS[stepIndex].label}</span>
      </p>
      <div className="relative flex gap-1">
        {WIZARD_STEPS.map((step, i) => (
          <span
            key={step.label}
            className={
              "h-1 flex-1 rounded-full " +
              (i < stepIndex
                ? "bg-emerald-400"
                : i === stepIndex
                  ? "bg-white"
                  : "bg-white/25")
            }
          />
        ))}
      </div>
    </div>
  );
};

// Paso 4 del wizard, tal cual se ve en el teléfono del cliente.
const BookingScreen = () => (
  <>
    <BizHeader compact />
    <MobileStrip />

    <section className="bg-white px-5 pb-5 pt-3.5">
      <h2 className="text-lg font-extrabold tracking-tight">Fecha y hora</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Para <b>Blanqueamiento</b> · 60 min
      </p>

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
    </section>
  </>
);

// La notificación real que manda el sistema cuando entra un turno.
const BookingNotification = () => (
  <div
    aria-hidden="true"
    className="absolute right-0 top-6 w-[200px] rotate-3 rounded-2xl border border-black/[0.07] bg-white/95 p-3 shadow-xl backdrop-blur"
  >
    <div className="mb-1 flex items-center gap-1.5">
      <span className="size-4 shrink-0 rounded bg-primary" />
      <span className="text-[8.5px] font-extrabold uppercase tracking-widest text-neutral-400">
        SacaTurno
      </span>
      <span className="ml-auto text-[8.5px] text-neutral-400">ahora</span>
    </div>
    <p className="text-[12.5px] font-extrabold leading-tight tracking-tight text-neutral-900">
      Nuevo turno reservado
    </p>
    <p className="mt-0.5 text-[11px] leading-snug text-neutral-500">
      Martes 5, 18:00 · Blanqueamiento · Belgrano
    </p>
  </div>
);

const HeroMockupMobile = () => {
  const prefersReducedMotion = useReducedMotion();
  const uiRef = useRef<HTMLDivElement>(null);
  const [screenH, setScreenH] = useState(SCREEN_H_FALLBACK);

  // Un elemento con transform no le aporta alto a su contenedor, así que la
  // pantalla necesita el suyo declarado a partir del alto real de la UI.
  useLayoutEffect(() => {
    const el = uiRef.current;
    if (!el) return;
    const measure = () => {
      const h = Math.round(el.scrollHeight * SCALE);
      if (h > 0) setScreenH(h);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    // Sin fondo propio: arriba del borde del hero se ve el hero a través, y
    // abajo el blanco de la página. z-10 para ganarle a las capas internas del
    // hero (su velo inferior es z-[3]), que si no pintan por encima.
    <motion.div
      className="relative z-10 px-6 lg:hidden"
      style={{ marginTop: -HERO_MOCKUP_PEEK }}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.45, ease: easeOutExpo }}
    >
      <div className="relative">
        <div
          role="img"
          aria-label="Vista previa de la página de reservas de SacaTurno en el celular: un cliente eligiendo fecha y horario"
          className="mx-auto rounded-[30px] bg-gradient-to-br from-neutral-700 to-neutral-900"
          style={{
            width: PHONE_W,
            padding: BEZEL,
            boxShadow:
              "0 2px 0 rgba(255,255,255,0.16) inset, 0 26px 44px -20px rgba(58,20,8,0.5)",
          }}
        >
          <div
            className="relative overflow-hidden rounded-[26px] bg-[#fff8f3]"
            style={{ height: screenH }}
          >
            <span className="absolute left-1/2 top-[7px] z-[5] h-[10px] w-[34%] -translate-x-1/2 rounded-full bg-neutral-900" />
            <div
              ref={uiRef}
              aria-hidden="true"
              className="origin-top-left"
              style={{
                width: DESIGN_W,
                paddingTop: NOTCH_SPACE,
                transform: `scale(${SCALE})`,
              }}
            >
              <BookingScreen />
            </div>
          </div>
        </div>

        <BookingNotification />
      </div>

      <div className="mt-7">
        <h2 className="text-[27px] font-extrabold leading-tight tracking-tight text-neutral-900">
          Así reservan <span className="text-primary">tus clientes</span>
        </h2>
        <p className="mt-2 max-w-[30ch] text-sm leading-relaxed text-neutral-600">
          La misma pantalla que ve alguien que entra por tu link. Probala vos.
        </p>
        <Link
          href={DEMO_HREF}
          className="mt-5 inline-flex h-12 items-center gap-2 rounded-[10px] bg-primary px-5 text-[13.5px] font-bold text-primary-foreground shadow-md transition-all duration-300 ease-in-out hover:bg-[#d92f04] hover:shadow-lg"
        >
          <MousePointerClick className="size-4 shrink-0" />
          Ver demo interactiva
        </Link>
      </div>
    </motion.div>
  );
};

export default HeroMockupMobile;
