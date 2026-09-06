"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Lock,
  LogIn,
  MousePointerClick,
  Phone,
  Search,
} from "lucide-react";
import {
  BizHeader,
  MockupCalendar,
  MockupSlots,
  SELECTED_DATE_LABEL,
  StepLabel,
  WIZARD_STEPS,
} from "./HeroMockupParts";

/*
  Réplica en vivo del wizard de reserva de /[slug] para el hero.
  Reemplaza a macbook_mockup.png: nítido en cualquier densidad, ~0 KB de imagen
  y no envejece cada vez que se toca la UI real.

  Escalado: todo se dibuja en un lienzo fijo de DESIGN_W px y se reduce con
  transform, así el interior conserva las mismas medidas que la app real sin
  depender de los breakpoints del viewport. El factor se mide con
  ResizeObserver porque CSS no permite dividir dos longitudes (`100cqw / 1200`
  no es un número válido para `scale()`).
*/
const DESIGN_W = 1200;
const DESIGN_H = 750;

const SCREEN_PAD = 12;
const CHROME_H = 38;
const PAGE_H = 672;

const NAV_LINKS = ["Funciones", "Precios", "FAQ"];

// ── Chrome del navegador ─────────────────────────────────────
const BrowserChrome = () => (
  <div
    className="flex items-center gap-3 px-4 shrink-0 border-b"
    style={{
      height: CHROME_H,
      background: "linear-gradient(#fbfbfc,#f1f1f3)",
      borderColor: "rgba(0,0,0,0.08)",
    }}
  >
    <div className="flex items-center gap-1.5 shrink-0">
      <span
        className="size-2.5 rounded-full"
        style={{ background: "#ff5f57" }}
      />
      <span
        className="size-2.5 rounded-full"
        style={{ background: "#febc2e" }}
      />
      <span
        className="size-2.5 rounded-full"
        style={{ background: "#28c840" }}
      />
    </div>
    <div
      className="flex items-center justify-center gap-1.5 mx-auto rounded-md px-3"
      style={{
        width: 340,
        height: 22,
        background: "#ffffff",
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <Lock className="size-2.5 shrink-0" style={{ color: "#8b8b90" }} />
      <span className="text-[11px] font-medium" style={{ color: "#5a5a5f" }}>
        sacaturno.com.ar/odontologia-belgrano
      </span>
    </div>
    <div className="w-[52px] shrink-0" />
  </div>
);

// ── Nav pública ──────────────────────────────────────────────
const SiteNav = () => (
  <div
    className="flex items-center justify-between px-8 shrink-0"
    style={{ height: 56 }}
  >
    <Image
      src="/sacaturno-orange.svg"
      alt=""
      width={124}
      height={31}
      className="shrink-0"
    />
    <nav className="flex items-center gap-7">
      {NAV_LINKS.map((link) => (
        <span key={link} className="text-[13px] font-medium text-neutral-700">
          {link}
        </span>
      ))}
    </nav>
    <div className="flex items-center gap-2.5">
      <span className="flex items-center gap-1.5 rounded-lg border border-black/10 bg-white/70 px-3 py-2 text-[12px] font-semibold text-neutral-800">
        <Search className="size-3" /> Buscar negocio
      </span>
      <span className="flex items-center gap-1.5 rounded-lg border border-black/10 bg-white/70 px-3 py-2 text-[12px] font-semibold text-neutral-800">
        <LogIn className="size-3" /> Ingresar
      </span>
      <span className="rounded-lg bg-primary px-3.5 py-2 text-[12px] font-bold text-primary-foreground shadow-md">
        Probar gratis
      </span>
    </div>
  </div>
);

// ── Sidebar del wizard ───────────────────────────────────────
const WizardSidebar = () => (
  <aside className="relative flex w-60 shrink-0 flex-col overflow-hidden bg-primary p-5 text-white">
    <div className="pointer-events-none absolute -right-20 -top-20 size-52 rounded-full bg-white/10" />
    <div className="pointer-events-none absolute -bottom-24 -left-16 size-60 rounded-full bg-white/5" />
    <div className="pointer-events-none absolute -right-8 top-1/3 size-16 rounded-full bg-white/5" />

    <div className="relative flex flex-1 flex-col">
      <div className="mb-4 flex shrink-0 items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/20 shadow-lg backdrop-blur">
          <CalendarDays className="size-4 text-white" strokeWidth={2.5} />
        </div>
        <h2 className="truncate text-sm font-bold">Nueva reserva</h2>
      </div>

      <div className="flex-1 border-t border-white/20 pt-4">
        <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-white/60">
          Tu reserva
        </span>
        <div className="flex flex-col gap-1.5">
          {WIZARD_STEPS.map((step, i) => (
            <div
              key={step.label}
              className={
                "flex items-center gap-3 rounded-xl px-3 py-2 text-left " +
                (step.state === "current"
                  ? "bg-white shadow-xl shadow-black/10"
                  : step.state === "pending"
                    ? "opacity-75"
                    : "")
              }
            >
              <div className="flex size-5 shrink-0 items-center justify-center">
                {step.state === "done" ? (
                  <div className="flex size-5 items-center justify-center rounded-full bg-emerald-500 shadow-md shadow-emerald-500/50">
                    <Check className="size-3 text-white" strokeWidth={3} />
                  </div>
                ) : (
                  <div
                    className={
                      "flex size-5 items-center justify-center rounded-full text-[11px] font-bold " +
                      (step.state === "current"
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "border border-white/25 bg-white/15 text-white/70")
                    }
                  >
                    {i + 1}
                  </div>
                )}
              </div>
              <div className="flex min-w-0 flex-col">
                <span
                  className={
                    "text-[13px] font-bold " +
                    (step.state === "current"
                      ? "text-primary"
                      : step.state === "pending"
                        ? "text-white/80"
                        : "text-white")
                  }
                >
                  {step.label}
                </span>
                {step.detail && (
                  <span className="truncate text-[11px] font-medium text-white/60">
                    {step.detail}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 shrink-0 rounded-2xl border border-white/20 bg-white/10 p-3.5 backdrop-blur">
        <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-white/70">
          ¿Necesitás ayuda?
        </span>
        <div className="flex items-center gap-2 text-xs text-white">
          <Phone className="size-3" /> 1147885522
        </div>
      </div>
    </div>
  </aside>
);

// ── Tarjeta completa del wizard ──────────────────────────────
const BookingCard = () => (
  <div className="flex flex-col overflow-hidden rounded-3xl border border-orange-100/70 bg-white shadow-2xl">
    <BizHeader />

    <div className="flex flex-1">
      <WizardSidebar />

      <section className="flex min-w-0 flex-1 flex-col bg-gradient-to-b from-white to-orange-50/20 p-6">
        <div className="flex flex-1 flex-col gap-4">
          <div className="shrink-0">
            <span className="block text-[10px] font-bold uppercase leading-none tracking-widest text-orange-600">
              Paso 4 de 5
            </span>
            <h2 className="mt-1.5 text-xl font-extrabold tracking-tight">
              Fecha y hora
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Para <b>Blanqueamiento</b> · 60 min
            </p>
          </div>

          <div className="flex gap-6">
            <div className="shrink-0" style={{ width: 260 }}>
              <StepLabel>Elegí un día</StepLabel>
              <MockupCalendar />
            </div>

            <div className="min-w-0 flex-1 border-l border-orange-100 pl-6">
              <StepLabel>Elegí un horario</StepLabel>
              <p className="-mt-1 mb-3 text-base font-extrabold leading-tight text-neutral-900">
                {SELECTED_DATE_LABEL}
              </p>
              <MockupSlots />
            </div>
          </div>
        </div>

        <div className="mt-4 flex shrink-0 items-center gap-3 border-t border-orange-100 pt-4">
          <span className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-4 text-xs font-bold text-orange-600">
            <ArrowLeft className="size-3.5" /> Volver
          </span>
          <span className="flex h-11 flex-1 items-center justify-center rounded-xl bg-primary text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-md">
            Continuar
          </span>
        </div>
      </section>
    </div>
  </div>
);

// ── Marco del laptop ─────────────────────────────────────────
interface HeroMockupProps {
  className?: string;
  /** Si se pasa, la maqueta entera se vuelve el acceso a la demo interactiva. */
  href?: string;
}

const HeroMockup = ({ className = "", href }: HeroMockupProps) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      // En mobile el contenedor está oculto (width 0): sin el guard la maqueta
      // colapsaría a escala 0 y no volvería al mostrarse.
      if (w > 0) setScale(w / DESIGN_W);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const stage = (
    <>
      <div
        className={
          "relative w-full transition-[opacity,transform] duration-300 ease-out" +
          (href ? " group-hover:-translate-y-1.5" : "")
        }
        style={{
          aspectRatio: DESIGN_W + " / " + DESIGN_H,
          opacity: scale ? 1 : 0,
        }}
      >
        <div
          aria-hidden="true"
          className="absolute left-0 top-0 origin-top-left select-none"
          style={{
            width: DESIGN_W,
            height: DESIGN_H,
            transform: "scale(" + scale + ")",
          }}
        >
          {/* Tapa */}
          <div
            className="relative"
            style={{
              padding: SCREEN_PAD,
              borderRadius: 20,
              background:
                "linear-gradient(160deg,#3a3a3f 0%,#1d1d20 45%,#111113 100%)",
              boxShadow:
                "0 2px 0 rgba(255,255,255,0.18) inset, 0 40px 80px -24px rgba(28,10,4,0.45), 0 12px 28px -12px rgba(28,10,4,0.25)",
            }}
          >
            <div
              className="flex flex-col overflow-hidden"
              style={{ borderRadius: 10, background: "#ffffff" }}
            >
              <BrowserChrome />
              <div
                className="flex flex-col"
                style={{
                  height: PAGE_H,
                  background:
                    "radial-gradient(ellipse 65% 55% at 12% 88%, rgba(255,180,110,0.42) 0%, transparent 100%), radial-gradient(ellipse 55% 50% at 88% 12%, rgba(255,140,90,0.32) 0%, transparent 100%), radial-gradient(ellipse 45% 40% at 65% 78%, rgba(255,210,160,0.24) 0%, transparent 100%), #fff8f3",
                }}
              >
                <SiteNav />
                <main className="flex flex-1 flex-col justify-center px-8 pb-6 pt-2">
                  <BookingCard />
                </main>
              </div>
            </div>
          </div>

          {/* Base */}
          <div
            className="relative"
            style={{
              width: DESIGN_W * 1.06,
              marginLeft: DESIGN_W * -0.03,
              height: 16,
              borderRadius: "2px 2px 12px 12px",
              background: "linear-gradient(#d9d9de,#a9a9b1)",
              boxShadow: "0 18px 26px -14px rgba(28,10,4,0.4)",
            }}
          >
            <div
              className="absolute left-1/2 top-0 -translate-x-1/2"
              style={{
                width: 132,
                height: 6,
                borderRadius: "0 0 8px 8px",
                background: "linear-gradient(#b6b6bd,#c9c9d0)",
              }}
            />
          </div>
        </div>
      </div>

      {href && (
        <>
          {/* Velo cálido: sólo al pasar por encima, y sólo sobre la pantalla —
              la base del laptop queda afuera para que no se vea como una capa
              pegada encima de la foto. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 bottom-[3.5%] rounded-[20px] bg-gradient-to-t from-[#2b1108]/50 via-[#2b1108]/10 to-transparent opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
          />

          {/* La pastilla vive siempre: si la invitación aparece recién al pasar
              el mouse, la mitad de la gente nunca se entera de que hay demo. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-[8%] left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-black/[0.06] bg-white/90 py-2.5 pl-3.5 pr-4 text-[13px] font-bold text-[#1a1a1a] shadow-[0_10px_30px_-10px_rgba(28,10,4,0.45)] backdrop-blur-md transition-all duration-300 ease-out group-hover:border-transparent group-hover:bg-[#dd4924] group-hover:text-white group-hover:shadow-[0_16px_36px_-12px_rgba(221,73,36,0.7)]"
          >
            <span className="relative flex size-5 shrink-0 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-[#dd4924]/30 group-hover:bg-white/40 motion-reduce:hidden" />
              <span className="relative flex size-5 items-center justify-center rounded-full bg-[#dd4924] text-white group-hover:bg-white group-hover:text-[#dd4924]">
                <MousePointerClick className="size-3" strokeWidth={2.5} />
              </span>
            </span>
            Reservá un turno de prueba
            <ArrowRight className="size-3.5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </>
      )}
    </>
  );

  if (!href) {
    return (
      <div
        ref={wrapRef}
        className={"w-full " + className}
        role="img"
        aria-label="Vista previa de la página de reservas de SacaTurno: un cliente eligiendo fecha y horario"
      >
        {stage}
      </div>
    );
  }

  return (
    <div ref={wrapRef} className={"w-full " + className}>
      <Link
        href={href}
        aria-label="Abrir la demo interactiva y reservar un turno de prueba"
        className="group relative block w-full rounded-[22px] outline-none focus-visible:ring-2 focus-visible:ring-[#dd4924] focus-visible:ring-offset-4 focus-visible:ring-offset-[#fff8f3]"
      >
        {stage}
      </Link>
    </div>
  );
};

export default HeroMockup;
