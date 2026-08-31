"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CreditCard, MousePointerClick, Users } from "lucide-react";
import DemoWizardReel from "./DemoWizardReel";

/*
  Banda hacia /demo, entre Sectors y Pricing.

  Va antes de los precios a propósito: quien llega a mirar la tabla sin haber
  visto el producto andando es justo a quien la demo rescata. Y va lejos de
  CallToAction, que es el pedido grande —"creá tu cuenta"—; pegados, el pedido
  chico le come conversión al grande.

  Sólo desktop: en mobile el hero ya cierra con su propio botón a la demo, y
  repetirlo dos pantallas más abajo es pedir lo mismo dos veces.

  El teléfono asoma recortado por el borde de la banda. El recorte es el punto:
  le pide al ojo que complete lo que falta, y eso se resuelve haciendo clic. Es
  un teléfono y no un laptop porque la pantalla que muestra es la del cliente, y
  los clientes reservan del celular — además de que arriba ya hay un laptop y
  dos seguidos hacen que la página se vea fotocopiada.
*/

const DEMO_HREF = "/demo";

// La UI se dibuja al ancho real de un teléfono y se reduce, así conserva las
// medidas de la app en vez de re-maquetarse chica.
//
// SCREEN_H sale de multiplicar el ancho por RATIO y no es un número suelto: un
// teléfono ronda 2,1:1, y con menos que eso el marco se lee como una tablet
// rechoncha por más que la UI de adentro esté a escala correcta.
const DESIGN_W = 390;
const SCALE = 0.66;
const RATIO = 2.1;
const SCREEN_W = Math.round(DESIGN_W * SCALE);
const SCREEN_H = Math.round(SCREEN_W * RATIO);
const BEZEL = 10;
// Reserva del notch y alto del lienzo en su propia escala: el carrusel apila
// las pantallas en absoluto, así que necesita un alto declarado.
const NOTCH_SPACE = 26;
const DESIGN_H = Math.round(SCREEN_H / SCALE) - NOTCH_SPACE;

const HIGHLIGHTS = [
  { Icon: Users, label: "Con empleados y sucursales" },
  { Icon: CreditCard, label: "Cobrando seña" },
];


const DemoCtaSection = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="hidden w-full bg-white px-8 py-12 lg:block 2xl:py-16">
      <motion.div
        className="mx-auto max-w-[1200px] 2xl:max-w-[1400px]"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link
          href={DEMO_HREF}
          aria-label="Abrir la demo interactiva y reservar un turno de prueba"
          className="group relative flex min-h-[340px] items-center overflow-hidden rounded-[28px] border border-orange-100 outline-none transition-shadow duration-300 focus-visible:ring-2 focus-visible:ring-[#dd4924] focus-visible:ring-offset-4 focus-visible:ring-offset-white 2xl:min-h-[380px]"
          style={{
            background:
              "radial-gradient(ellipse 55% 90% at 8% 10%, rgba(255,180,110,0.34) 0%, transparent 100%), radial-gradient(ellipse 60% 80% at 78% 90%, rgba(255,140,90,0.26) 0%, transparent 100%), #fff8f3",
          }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(rgba(128,128,128,0.2) 1px,transparent 1px)",
              backgroundSize: "22px 22px",
              maskImage:
                "radial-gradient(ellipse 80% 90% at 40% 50%,black 10%,transparent 75%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 80% 90% at 40% 50%,black 10%,transparent 75%)",
            }}
          />

          {/* ── Texto ── */}
          <div className="relative z-[2] flex max-w-[560px] flex-col items-start px-10 py-12 2xl:max-w-[640px] 2xl:px-14">
            <span className="mb-5 inline-flex items-center gap-[7px] rounded-full border border-[rgba(221,73,36,0.18)] bg-[#fff1e8] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.5px] text-[#dd4924] backdrop-blur-sm 2xl:px-4 2xl:py-[6px] 2xl:text-[12px]">
              <MousePointerClick className="size-3 shrink-0" strokeWidth={2.5} />
              Demo interactiva
            </span>

            <h2 className="mb-4 text-[34px] font-medium leading-[1.05] tracking-[-1.5px] text-[#1a1a1a] 2xl:text-[44px] 2xl:tracking-[-2px]">
              Antes de ver los precios,{" "}
              <span className="font-bold text-[#dd4924]">probalo</span>.
            </h2>

            <p className="mb-7 max-w-[440px] text-[16px] leading-[1.65] text-[#5a5a5a] 2xl:text-[18px]">
              Armá el negocio de ejemplo como es el tuyo y reservá un turno,
              igual que lo haría tu cliente. Sin crear cuenta.
            </p>

            <div className="mb-8 flex flex-wrap items-center gap-2">
              {HIGHLIGHTS.map(({ Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-white/70 py-1.5 pl-2.5 pr-3.5 text-[13px] font-semibold text-[#5a5a5a] backdrop-blur-sm"
                >
                  <Icon className="size-3.5 shrink-0 text-[#dd4924]" />
                  {label}
                </span>
              ))}
            </div>

            <span className="inline-flex items-center gap-2 rounded-[12px] bg-[#dd4924] px-7 py-4 text-[16px] font-semibold text-white shadow-[0_12px_28px_-12px_rgba(221,73,36,0.75)] transition-all duration-300 group-hover:bg-[#d92f04] group-hover:shadow-[0_18px_36px_-12px_rgba(221,73,36,0.85)]">
              Probar la demo interactiva
              <ArrowRight className="size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>

          {/* ── Teléfono asomando ──
              Entra por arriba y se va por abajo y por la derecha: recortado por
              un solo borde parecería un error de medida, y recortarlo también
              arriba se comería la isla, que es lo que lo delata como teléfono. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-[64px] top-10 z-[1] select-none 2xl:-right-[24px]"
          >
            <div
              className="rotate-[-7deg] rounded-[38px] bg-gradient-to-br from-neutral-700 to-neutral-900 transition-transform duration-500 ease-out group-hover:-translate-y-2.5 group-hover:rotate-[-5deg]"
              style={{
                padding: BEZEL,
                boxShadow:
                  "0 2px 0 rgba(255,255,255,0.16) inset, 0 34px 60px -22px rgba(58,20,8,0.55)",
              }}
            >
              <div
                className="relative overflow-hidden rounded-[28px] bg-white"
                style={{ width: SCREEN_W, height: SCREEN_H }}
              >
                {/* Isla al frente de la UI, con su propio respiro arriba: sin
                    ella el marco podría ser cualquier rectángulo negro. */}
                <span className="absolute left-1/2 top-2 z-[5] h-[9px] w-[30%] -translate-x-1/2 rounded-full bg-neutral-900" />
                <div
                  className="origin-top-left"
                  style={{
                    width: DESIGN_W,
                    paddingTop: NOTCH_SPACE,
                    transform: `scale(${SCALE})`,
                  }}
                >
                  <DemoWizardReel designWidth={DESIGN_W} designHeight={DESIGN_H} />
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    </section>
  );
};

export default DemoCtaSection;
