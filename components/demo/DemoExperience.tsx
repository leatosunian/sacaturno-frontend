"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  CreditCard,
  Sparkles,
  Tag,
  Users,
} from "lucide-react";
import HeaderPublic from "@/components/home/HeaderPublic";
import Footer from "@/components/home/Footer";
import DemoPanelTour, { TOUR_APPOINTMENT_STEP } from "./DemoPanelTour";
import {
  DEFAULT_DEMO_CONFIG,
  DEMO_MSG,
  encodeConfig,
  type DemoBooking,
  type DemoConfig,
  type DemoMessage,
} from "./demoSync";
import { PLAN_LABELS } from "@/lib/planLimits";

/*
  Contenedor de /demo.

  Los switches de arriba reconfiguran el negocio de ejemplo en vivo; abajo, el
  mismo escenario corre en dos dispositivos sincronizados. Cada dispositivo es
  un iframe a /demo/stage con su propio viewport —única forma de que el teléfono
  muestre el layout de teléfono— y este componente hace de central telefónica
  entre los dos.

  En mobile no hay dispositivos: queda un solo iframe a pantalla completa, como
  lo vería un cliente real.
*/

// Lienzo fijo de cada dispositivo. El contenido se dibuja a este tamaño y se
// escala para entrar en el espacio disponible, así el interior conserva las
// medidas reales de la app sin depender del ancho de la ventana.
//
// `bezel` es el grosor del marco y se aplica por style, no con una clase de
// Tailwind: los marcos son border-box, así que el borde hay que sumárselo al
// tamaño o se come pantalla y recorta el contenido contra el borde derecho.
const PHONE = { width: 380, height: 780, box: 300, bezel: 9 };
const LAPTOP = { width: 1080, height: 700, bezel: 10 };

const SWITCHES: {
  key: keyof DemoConfig;
  label: string;
  hint: string;
  Icon: typeof Tag;
}[] = [
  {
    key: "multiService",
    label: "Varios servicios",
    hint: "Cada uno con su precio y su duración",
    Icon: Tag,
  },
  {
    key: "employees",
    label: "Empleados",
    hint: "Suma el paso para elegir profesional",
    Icon: Users,
  },
  {
    key: "branches",
    label: "Sucursales",
    hint: "Suma el paso para elegir dónde",
    Icon: Building2,
  },
  {
    key: "deposit",
    label: "Cobra seña",
    hint: "Pide una parte por adelantado",
    Icon: CreditCard,
  },
];

/**
 * El escenario se escala para entrar en el ancho que le toque, nunca más de 1:1.
 * La medición va en un ref de callback y no en un efecto: el contenedor recién
 * existe cuando se sabe que la pantalla es de escritorio, y para entonces un
 * efecto con dependencias fijas ya no vuelve a correr.
 */
function useFitScale(designWidth: number) {
  const [scale, setScale] = useState(0);
  const observerRef = useRef<ResizeObserver | null>(null);

  const ref = useCallback(
    (element: HTMLDivElement | null) => {
      observerRef.current?.disconnect();
      if (!element) return;
      // Con la pestaña oculta el ancho es 0: conservar la última medida evita
      // que el escenario reaparezca colapsado al volver.
      const measure = (width: number) => {
        if (width > 0) setScale(Math.min(1, width / designWidth));
      };
      measure(element.getBoundingClientRect().width);
      const observer = new ResizeObserver(([entry]) =>
        measure(entry.contentRect.width),
      );
      observer.observe(element);
      observerRef.current = observer;
    },
    [designWidth],
  );

  return { ref, scale };
}

export default function DemoExperience() {
  const [config, setConfig] = useState<DemoConfig>(DEFAULT_DEMO_CONFIG);
  const [tab, setTab] = useState<"booking" | "panel">("booking");
  const [booking, setBooking] = useState<DemoBooking | null>(null);
  const [tourStep, setTourStep] = useState(0);
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  const configRef = useRef(config);
  const phoneRef = useRef<HTMLIFrameElement>(null);
  const laptopRef = useRef<HTMLIFrameElement>(null);
  const [stageSrc] = useState(
    () => `/demo/stage?cfg=${encodeConfig(DEFAULT_DEMO_CONFIG)}`,
  );

  const laptop = useFitScale(LAPTOP.width);
  const phoneScale = PHONE.box / PHONE.width;

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // ── Central entre los dos dispositivos ──
  const frames = useCallback(
    () =>
      [phoneRef.current, laptopRef.current].filter(
        Boolean,
      ) as HTMLIFrameElement[],
    [],
  );

  const send = useCallback((frame: HTMLIFrameElement, message: DemoMessage) => {
    frame.contentWindow?.postMessage(message, window.location.origin);
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const message = event.data as DemoMessage;
      if (!message || typeof message !== "object") return;

      if (message.type === DEMO_MSG.ready) {
        const source = event.source as Window | null;
        source?.postMessage(
          { type: DEMO_MSG.config, config: configRef.current },
          window.location.origin,
        );
        return;
      }
      if (message.type === DEMO_MSG.state) {
        // Sólo al otro: devolverle el estado a quien lo mandó lo haría rebotar.
        frames()
          .filter((frame) => frame.contentWindow !== event.source)
          .forEach((frame) => send(frame, message));
        return;
      }
      if (message.type === DEMO_MSG.booked) setBooking(message.booking);
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [frames, send]);

  const toggle = (key: keyof DemoConfig) => {
    const next = { ...configRef.current, [key]: !configRef.current[key] };
    configRef.current = next;
    setConfig(next);
    frames().forEach((frame) =>
      send(frame, { type: DEMO_MSG.config, config: next }),
    );
  };

  const seeInPanel = () => {
    setTourStep(TOUR_APPOINTMENT_STEP);
    setTab("panel");
  };

  const plan = config.employees || config.branches ? "SC_PRO" : "SC_BASIC";

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{
        background:
          "radial-gradient(ellipse 60% 45% at 10% 0%, rgba(255, 180, 110, 0.32) 0%, transparent 100%), radial-gradient(ellipse 50% 40% at 92% 8%, rgba(255, 140, 90, 0.24) 0%, transparent 100%), #fff8f3",
      }}
    >
      <HeaderPublic />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-8 pt-[84px] md:pt-[110px] pb-16">
        {/* ── Encabezado ── */}
        <div className="flex flex-col items-center text-center gap-2 md:gap-3 mb-5 md:mb-8">
          <span className="rounded-full text-orange-600 bg-orange-50 border border-orange-100 px-3.5 py-1 md:px-4 md:py-1.5 text-[13px] md:text-sm font-medium">
            Demo interactiva
          </span>
          <h1 className="text-[26px] leading-[1.15] md:text-5xl font-bold tracking-tight text-neutral-900 max-w-3xl text-balance">
            Probá SacaTurno como si fueras{" "}
            <span className="text-orange-600">tu propio cliente</span>
          </h1>
          <p className="text-[13px] md:text-base text-neutral-600 max-w-2xl">
            Este es un negocio de ejemplo. Armalo como es el tuyo, reservá un
            turno y mirá cómo le llega a la agenda del negocio. Sin crear
            cuenta.
          </p>
        </div>

        {/* ── Pestañas ── */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex gap-1 p-1 rounded-full bg-white border border-orange-100 shadow-sm">
            {(
              [
                ["booking", "Reservá un turno"],
                ["panel", "Del otro lado"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setTab(value)}
                aria-current={tab === value}
                className={
                  "px-4 md:px-5 h-9 rounded-full text-[13px] md:text-sm font-semibold transition-all " +
                  (tab === value
                    ? "bg-orange-600 text-white shadow"
                    : "text-neutral-500 hover:text-neutral-900")
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Barra de configuración ── */}
        <div className="rounded-2xl bg-white border border-orange-100 shadow-sm p-3 md:px-5 md:py-3.5 mb-5">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-5">
            <div className="flex items-center gap-2 shrink-0">
              <Sparkles className="size-4 text-orange-600" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                ¿Cómo es tu negocio?
              </span>
            </div>

            {/* En mobile van en grilla, no en fila con scroll: una opción que hay
                que arrastrar para descubrir es una opción que nadie toca. */}
            <div className="flex-1 grid grid-cols-2 gap-2 md:flex md:flex-wrap">
              {SWITCHES.map(({ key, label, hint, Icon }) => {
                const on = config[key];
                return (
                  <button
                    key={key}
                    role="switch"
                    aria-checked={on}
                    title={hint}
                    onClick={() => toggle(key)}
                    className={
                      "md:shrink-0 flex items-center gap-2 h-9 pl-2.5 pr-3 md:pr-3.5 rounded-full border text-[12.5px] md:text-[13px] font-semibold transition-all " +
                      (on
                        ? "bg-orange-600 border-orange-600 text-white shadow-sm"
                        : "bg-white border-neutral-200 text-neutral-500 hover:border-orange-300 hover:text-neutral-800")
                    }
                  >
                    <span
                      className={
                        "size-5 rounded-full flex items-center justify-center shrink-0 " +
                        (on ? "bg-white/20" : "bg-neutral-100")
                      }
                    >
                      <Icon className="size-3" strokeWidth={2.5} />
                    </span>
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </div>

            <div className="shrink-0 flex items-center gap-2 pt-3 border-t border-neutral-100 md:pt-0 md:border-t-0 md:pl-4 md:border-l">
              <span className="text-[11px] text-neutral-400 font-medium">
                Plan ideal
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100 whitespace-nowrap">
                {PLAN_LABELS[plan]}
              </span>
            </div>
          </div>
        </div>

        {/* ── Aviso: el turno ya está del otro lado ── */}
        {booking && tab === "booking" && (
          <button
            onClick={seeInPanel}
            className="w-full mb-5 group flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left hover:bg-emerald-100/70 transition-colors"
          >
            <span className="size-9 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-sm">
              <CalendarCheck
                className="size-4.5 text-white"
                strokeWidth={2.5}
              />
            </span>
            <span className="flex flex-col min-w-0 flex-1">
              <span className="text-[13px] md:text-sm font-bold text-emerald-900">
                El turno de {booking.clientName} ya está en la agenda del
                negocio
              </span>
              <span className="text-xs text-emerald-800/80 capitalize-first-letter truncate">
                {booking.dateLabel} · {booking.timeLabel} hs
                {booking.employeeName ? ` · ${booking.employeeName}` : ""}
                {booking.deposit > 0 ? " · seña acreditada" : ""}
              </span>
            </span>
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-800 shrink-0">
              Verlo del otro lado
              <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>
        )}

        {/* ── Escenario ── */}
        {isDesktop === null ? (
          <div className="h-[560px] rounded-3xl bg-white/40 border border-orange-100 animate-pulse" />
        ) : isDesktop ? (
          <>
            <div
              className={
                tab === "booking" ? "flex items-end gap-6 xl:gap-8" : "hidden"
              }
            >
              {/* Teléfono */}
              <div className="shrink-0 flex flex-col items-center gap-2.5">
                <div
                  className="relative rounded-[2.2rem] border-neutral-900 bg-neutral-900 shadow-2xl overflow-hidden"
                  style={{
                    borderWidth: PHONE.bezel,
                    width: PHONE.box + PHONE.bezel * 2,
                    height:
                      Math.round(PHONE.height * phoneScale) + PHONE.bezel * 2,
                  }}
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 h-4 w-24 rounded-b-xl bg-neutral-900" />
                  <div
                    style={{
                      width: PHONE.width,
                      height: PHONE.height,
                      transform: `scale(${phoneScale})`,
                      transformOrigin: "top left",
                    }}
                  >
                    <iframe
                      ref={phoneRef}
                      src={stageSrc}
                      title="La reserva vista desde un teléfono"
                      className="w-full h-full border-0 bg-white"
                    />
                  </div>
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider mt-2 text-neutral-400">
                  Tu cliente, desde el celular
                </span>
              </div>

              {/* Laptop */}
              <div
                ref={laptop.ref}
                className="flex-1 min-w-0 flex flex-col items-center gap-2.5"
              >
                {laptop.scale > 0 && (
                  <>
                    <div className="w-full flex flex-col items-center">
                      <div
                        className="rounded-t-2xl border-neutral-900 bg-neutral-900 shadow-2xl overflow-hidden"
                        style={{
                          borderWidth: LAPTOP.bezel,
                          borderBottomWidth: 0,
                          width:
                            Math.round(LAPTOP.width * laptop.scale) +
                            LAPTOP.bezel * 2,
                          height:
                            Math.round(LAPTOP.height * laptop.scale) +
                            LAPTOP.bezel,
                        }}
                      >
                        <div
                          style={{
                            width: LAPTOP.width,
                            height: LAPTOP.height,
                            transform: `scale(${laptop.scale})`,
                            transformOrigin: "top left",
                          }}
                        >
                          <iframe
                            ref={laptopRef}
                            src={stageSrc}
                            title="La misma reserva vista desde una computadora"
                            className="w-full h-full border-0 bg-white"
                          />
                        </div>
                      </div>
                      <div
                        className="h-3 rounded-b-xl bg-neutral-900 shadow-xl"
                        style={{
                          width: Math.round(LAPTOP.width * laptop.scale) + 64,
                        }}
                      />
                    </div>
                    <span className="text-[11px] mt-2 font-semibold uppercase tracking-wider text-neutral-400">
                      Tu cliente, desde su computadora
                    </span>
                  </>
                )}
              </div>
            </div>

            {tab === "panel" && (
              <DemoPanelTour
                step={tourStep}
                onStep={setTourStep}
                booking={booking}
                config={config}
              />
            )}
          </>
        ) : tab === "booking" ? (
          // En mobile no hay dispositivo: la demo es la pantalla. Sigue siendo un
          // iframe para que el wizard tenga su propio viewport y entre justo, sin
          // un scroll anidado dentro de la página.
          <div className="rounded-2xl overflow-hidden border border-orange-100 shadow-lg bg-white">
            <iframe
              ref={phoneRef}
              src={stageSrc}
              title="La reserva, como la ve tu cliente"
              className="w-full h-[calc(100dvh-190px)] min-h-[540px] border-0 block"
            />
          </div>
        ) : (
          <DemoPanelTour
            step={tourStep}
            onStep={setTourStep}
            booking={booking}
            config={config}
          />
        )}

        {/* ── Cierre ── */}
        <div className="relative mt-14 overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm">
          {/* Halos cálidos detrás del texto: el cierre tiene que leerse como el
              final del recorrido, no como una fila más de la página. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_140%_at_0%_0%,#fff1e9_0%,transparent_55%),radial-gradient(90%_120%_at_100%_100%,#ffe7db_0%,transparent_60%)]"
          />
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 to-[#d92f04]" />

          <div className="relative flex flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:gap-10 md:px-10 md:py-9">
            <div className="flex flex-1 flex-col gap-2.5">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-orange-700 ring-1 ring-orange-100">
                <Sparkles className="size-3" strokeWidth={2.5} />
                Qué plan necesitás
              </span>
              <h2 className="text-[22px] font-extrabold leading-tight tracking-tight text-neutral-900 md:text-[26px]">
                Por las características de tu negocio,
                <br className="hidden sm:block" /> tu plan ideal es el{" "}
                <span className="text-primary">{PLAN_LABELS[plan]}</span>
              </h2>
              <p className="max-w-[52ch] text-sm leading-relaxed text-neutral-600">
                Empezá con la prueba gratis y tu link de reservas queda listo el
                mismo día, con el nombre de tu negocio.
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-stretch gap-2 md:items-end">
              <Link
                href="/register"
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-orange-600 px-7 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:bg-[#d92f04] hover:shadow-xl"
              >
                Comenzar prueba gratuita
                <ArrowRight className="size-4 shrink-0" />
              </Link>
              <p className="text-center text-xs text-neutral-500 md:text-right">
                15 días gratis, sin tarjeta de crédito.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
