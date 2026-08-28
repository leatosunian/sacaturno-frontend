"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  BizHeader,
  MockupCalendar,
  MockupSlots,
  MockupStepFooter,
  SELECTED_DATE_LABEL,
  StepLabel,
  WIZARD_STEPS,
} from "./HeroMockupParts";
import { easeOutExpo } from "./hero.animations";

/*
  Maqueta mobile del hero: la UI de reserva sin marco de teléfono dibujado — el
  celular del visitante hace de marco. Así la interfaz se ve al tamaño real que
  va a tener en vez de gastar la mitad del ancho en un bezel.

  Va montada como hermana de <HeroSection />, no adentro: esa sección es
  `overflow-hidden` y recortaría la hoja para siempre, dejándola en un asomo que
  nunca se completa por más que scrolleés. Estando afuera, el margen negativo la
  mete HERO_MOCKUP_PEEK px dentro del hero — se lee como parte de él y se ve sin
  scrollear — pero sigue hacia abajo y se revela entera.
*/

// Cuánto monta la hoja sobre el hero, y cuánto aire queda entre ella y los CTA.
// HeroSection reserva la suma como padding-bottom en mobile, así que los dos se
// reparten un presupuesto fijo: subir uno baja el otro. El techo de esa suma lo
// pone el alto del bloque de texto — pasarse hace que el hero supere 100vh y
// entonces se ve MENOS asomo, no más.
export const HERO_MOCKUP_PEEK = 240;
export const HERO_MOCKUP_AIR = 50;

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

const HeroMockupMobile = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    // z-10 para ganarle a las capas internas del hero (el velo inferior es z-[3]),
    // que si no pintan por encima de la parte que monta.
    <div
      className="relative z-10 px-4 lg:hidden"
      style={{ marginTop: -HERO_MOCKUP_PEEK }}
    >
      <motion.div
        className="mx-auto w-full max-w-[400px] overflow-hidden rounded-3xl border border-primary/15 bg-white"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.45, ease: easeOutExpo }}
        role="img"
        aria-label="Vista previa de la página de reservas de SacaTurno en el celular: un cliente eligiendo fecha y horario"
      >
        <div aria-hidden="true">
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

            <MockupStepFooter />
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export default HeroMockupMobile;
