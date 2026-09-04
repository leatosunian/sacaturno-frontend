"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CalendarCheck,
  LayoutDashboard,
  MousePointerClick,
} from "lucide-react";
import DemoWizardReel from "./DemoWizardReel";

const DEMO_HREF = "/demo";

const DESIGN_W = 390;
const SCALE = 0.66;
const RATIO = 2.1;
const SCREEN_W = Math.round(DESIGN_W * SCALE);
const SCREEN_H = Math.round(SCREEN_W * RATIO);
const BEZEL = 10;
const NOTCH_SPACE = 26;
const DESIGN_H = Math.round(SCREEN_H / SCALE) - NOTCH_SPACE;

const HIGHLIGHTS = [
  { Icon: CalendarCheck, label: "Reservá como tu cliente" },
  { Icon: LayoutDashboard, label: "Probá tu panel de administración" },
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

          {/* Texto */}
          <div className="relative z-[2] flex max-w-[560px] flex-col items-start px-10 py-12 2xl:max-w-[640px] 2xl:px-14">
            <span className="mb-5 inline-flex items-center gap-[7px] rounded-full border border-[rgba(221,73,36,0.18)] bg-[#fff1e8] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.5px] text-[#dd4924] backdrop-blur-sm 2xl:px-4 2xl:py-[6px] 2xl:text-[12px]">
              <MousePointerClick
                className="size-3 shrink-0"
                strokeWidth={2.5}
              />
              Demo interactiva
            </span>

            {/* Misma receta que los títulos de Features, Sectors, Pricing y
                Testimonios: si esta banda escribe su tipografía a mano, se lee
                como una pieza pegada de otra página. */}
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-[#1a1a1a] md:text-4xl 2xl:text-5xl">
              Probalo como{" "}
              <span className="font-extrabold text-accent">cliente</span> y como{" "}
              <span className="font-extrabold text-accent">dueño</span>.
            </h2>

            <p className="mb-7 max-w-[495px] text-[16px] leading-[1.65] text-[#5a5a5a] 2xl:text-[18px]">
              Reservá un turno como lo haría tu cliente y después probá tu panel
              de administración: cómo armás tu agenda, cómo recibís las reservas
              y qué funcionalidades tenés a mano cada día, sin crearte una
              cuenta.
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

            <span className="inline-flex items-center gap-2 rounded-[12px] bg-[#dd4924] px-6 py-3.5 text-[15px] font-semibold text-white 2xl:px-7 2xl:py-4 2xl:text-[16px] shadow-[0_12px_28px_-12px_rgba(221,73,36,0.75)] transition-all duration-300 group-hover:bg-[#d92f04] group-hover:shadow-[0_18px_36px_-12px_rgba(221,73,36,0.85)]">
              Probar la demo
              <ArrowRight className="size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-[20px] top-10 z-[1] select-none 2xl:-right-[6px]"
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
                <span className="absolute left-1/2 top-2 z-[5] h-[9px] w-[30%] -translate-x-1/2 rounded-full bg-neutral-900" />
                <div
                  className="origin-top-left"
                  style={{
                    width: DESIGN_W,
                    paddingTop: NOTCH_SPACE,
                    transform: `scale(${SCALE})`,
                  }}
                >
                  <DemoWizardReel
                    designWidth={DESIGN_W}
                    designHeight={DESIGN_H}
                  />
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
