"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "./Badge";

const DEMO_HREF = "/demo";

const Check: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.4}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const Arrow: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M5 12h13" />
    <path d="M12 5l7 7-7 7" />
  </svg>
);

// Mockups dibujados en código para mobile. A 350px de ancho los recortes del
// panel se leían mal: son vistas anchas, y achicarlas hasta entrar deja el texto
// ilegible. Estos muestran lo mismo pero armados con la tipografía y los colores
// del panel, así se leen a cualquier tamaño y pesan cero.
// En desktop se siguen usando las capturas reales (`shot`).
const AgendaMock = () => (
  <div className="p-3 text-left">
    <div className="flex items-center justify-between mb-2.5">
      <span className="text-[13px] font-bold tracking-tight text-slate-900">
        Martes 9
      </span>
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.04em] text-orange-600 rounded-full bg-orange-50">
        <Check className="w-2.5 h-2.5" />
        Reservas abiertas
      </span>
    </div>

    <ul className="flex flex-col gap-1.5">
      {[
        { time: "09:00", name: "Agustín Bermúdez", online: true },
        { time: "09:30", name: null, online: false },
        { time: "10:00", name: "Carolina Ferrari", online: true },
      ].map((slot) => (
        <li
          key={slot.time}
          className={`flex items-center gap-2.5 rounded-lg border px-2.5 py-2 ${
            slot.name
              ? "border-orange-600/15 bg-orange-50/60"
              : "border-dashed border-stone-200 bg-white"
          }`}
        >
          <span className="text-[11px] font-bold tabular-nums text-slate-500 shrink-0">
            {slot.time}
          </span>
          <span
            className={`grow truncate text-[12px] font-semibold ${
              slot.name ? "text-slate-900" : "text-stone-400"
            }`}
          >
            {slot.name ?? "Disponible"}
          </span>
          {slot.online && (
            <span className="shrink-0 rounded-full bg-orange-600 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.04em] text-white">
              Online
            </span>
          )}
        </li>
      ))}
    </ul>
  </div>
);

const ServiciosMock = () => (
  <div className="p-3 text-left">
    <div className="flex items-start justify-between gap-2 mb-1">
      <span className="text-[13px] font-bold tracking-tight text-slate-900">
        Limpieza y profilaxis
      </span>
      <span className="text-[13px] font-bold tabular-nums text-slate-900 shrink-0">
        $ 38.000
      </span>
    </div>
    <p className="mb-2.5 text-[11px] leading-snug text-stone-400">
      Destartraje con ultrasonido y pulido.
    </p>
    <div className="flex flex-wrap gap-1.5">
      <span className="rounded-full border border-stone-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600">
        1 hora
      </span>
      <span className="rounded-full border border-orange-600/20 bg-orange-50 px-2 py-0.5 text-[11px] font-bold text-orange-600">
        Seña $10.000
      </span>
      <span className="rounded-full border border-stone-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600">
        Lucía y 4 más
      </span>
    </div>
  </div>
);

const EquipoMock = () => (
  <div className="p-3 text-left">
    <div className="flex items-center gap-2.5 mb-3">
      <span className="inline-flex items-center justify-center w-8 h-8 text-[11px] font-bold text-orange-600 rounded-full shrink-0 bg-orange-50">
        CF
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-bold tracking-tight truncate text-slate-900">
            Carolina Ferrari
          </span>
          <span className="shrink-0 rounded-full bg-orange-600 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.04em] text-white">
            Vos
          </span>
        </div>
        <span className="text-[11px] text-stone-400">Dueño del negocio</span>
      </div>
    </div>

    {[
      { label: "Servicios", chips: ["Consulta", "Limpieza", "Urgencias"] },
      { label: "Sucursales", chips: ["Belgrano", "Núñez", "Vicente López"] },
    ].map((row) => (
      <div key={row.label} className="mt-2 first:mt-0">
        <span className="block mb-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-stone-400">
          {row.label}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {row.chips.map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-orange-600/15 bg-orange-50/70 px-2 py-0.5 text-[11px] font-semibold text-slate-700"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// Los tres pilares agrupan las funciones que se pueden mostrar con una captura
// del panel. El resto vive en EXTRAS, abajo, para no volver a la grilla de 12
// tarjetas iguales.
const PILLARS = [
  {
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </>
    ),
    title: "Reservas 24/7, sin mensajes",
    description:
      "Tus clientes reservan desde tu link a cualquier hora. Vos elegís qué se reserva solo y qué cargás a mano.",
    shot: "/home/agenda.webp",
    mobile: <AgendaMock />,
    alt: "Agenda de turnos de SacaTurno",
  },
  {
    icon: (
      <>
        <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
        <circle cx="7.5" cy="7.5" r="1.2" />
      </>
    ),
    title: "Servicios y señas",
    description:
      "Definí duración, precio y anticipo de cada servicio. El turno queda confirmado cuando la seña está paga.",
    shot: "/home/servicios.webp",
    mobile: <ServiciosMock />,
    alt: "Servicios con seña configurada",
    link: {
      href: "/senas-sin-comision",
      label: "Sin comisión por seña: mirá cuánto ahorrás",
    },
  },
  {
    icon: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    title: "Equipo y sucursales",
    description:
      "Cada empleado entra con su usuario y ve sólo sus turnos. Sumá locales sin duplicar sistemas.",
    shot: "/home/equipo.webp",
    mobile: <EquipoMock />,
    alt: "Empleados del equipo con sus servicios y sucursales",
  },
];

// Contenedor de los íconos de la lista de abajo: todos comparten trazo y grilla
// de 24, así se ven de la misma familia aunque los dibujos sean distintos.
const Glyph: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

const EXTRAS = [
  {
    label: "Renovación automática de agenda",
    icon: (
      <>
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
        <path d="M3 21v-5h5" />
      </>
    ),
  },
  {
    label: "Recordatorios por email",
    icon: (
      <>
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </>
    ),
  },
  {
    label: "Cancelaciones sin llamados",
    icon: (
      <>
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M3 10h18" />
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <path d="m14 14-4 4" />
        <path d="m10 14 4 4" />
      </>
    ),
  },
  {
    label: "Devolución automática de la seña",
    icon: (
      <>
        <path d="M9 14 4 9l5-5" />
        <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
      </>
    ),
  },
  {
    label: "Servicios ilimitados",
    icon: (
      <path d="M6.5 8a4 4 0 1 0 0 8c3 0 5-8 8-8a4 4 0 1 1 0 8c-3 0-5-8-8-8z" />
    ),
  },
  {
    label: "Estadísticas mes a mes",
    icon: (
      <>
        <path d="M3 3v16a2 2 0 0 0 2 2h16" />
        <path d="M18 17V9" />
        <path d="M13 17V5" />
        <path d="M8 17v-3" />
      </>
    ),
  },
  {
    label: "Buscador público de negocios",
    icon: (
      <>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </>
    ),
  },
  {
    label: "Centro de ayuda con capturas",
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <path d="M12 17h.01" />
      </>
    ),
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

// Centro de cada tramo de scroll dentro del bloque fijado. Se usa para saber a
// dónde llevar el scroll cuando alguien clickea un pilar en vez de scrollear.
const STEP_CENTERS = [0.17, 0.5, 0.84];

// Cuánto más cerca del centro tiene que estar otra tarjeta para robarle el foco
// a la abierta. Sin este margen, el borde entre dos tarjetas hace parpadear el
// acordeón mientras se scrollea.
const SWITCH_MARGIN = 40;

export default function Features() {
  const [active, setActive] = useState(0);
  const pinRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const barRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);

  // La barra se escribe directo en el DOM: si pasara por el estado, cada frame
  // de scroll re-renderizaría toda la sección.
  const drawBar = useCallback((progress: number) => {
    if (barRef.current) {
      barRef.current.style.transform = `scaleX(${Math.max(progress, 0.04)})`;
    }
  }, []);

  // Espejo de `active` para leerlo desde los listeners sin volver a suscribirlos
  // en cada cambio de paso.
  const activeRef = useRef(0);
  activeRef.current = active;

  // Abre una tarjeta compensando el scroll: al cerrarse la anterior el contenido
  // de abajo sube, y sin esto la tarjeta que se abre pega un salto bajo el dedo.
  const openKeepingPlace = useCallback((next: number) => {
    const anchor = buttonRefs.current[next];
    const before = anchor?.getBoundingClientRect().top ?? null;
    setActive(next);
    if (before === null) return;
    requestAnimationFrame(() => {
      const el = buttonRefs.current[next];
      if (!el) return;
      const delta = el.getBoundingClientRect().top - before;
      if (delta) window.scrollBy(0, delta);
    });
  }, []);

  // El alto extra y el sticky los pone el CSS (lg), así que no hay salto de
  // hidratación. Acá sólo replicamos esa condición para el JS.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px) and (min-height: 700px)");
    const sync = () => setPinned(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Mientras el bloque está fijado, el avance del scroll dentro de su alto extra
  // es el que elige el pilar activo.
  useEffect(() => {
    const el = pinRef.current;
    if (!pinned || !el) return;

    // Mientras está fijado la barra sigue al scroll cuadro a cuadro, así que no
    // lleva transición: cualquier suavizado se vería como retraso.
    if (barRef.current) barRef.current.style.transition = "none";

    const update = () => {
      const travel = el.offsetHeight - window.innerHeight;
      if (travel <= 0) return;
      const progress = Math.min(
        Math.max(-el.getBoundingClientRect().top / travel, 0),
        1
      );
      drawBar(progress);
      const next = progress < 0.34 ? 0 : progress < 0.67 ? 1 : 2;
      setActive((cur) => (cur === next ? cur : next));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pinned, drawBar]);

  // Sin bloque fijado (mobile, y desktop en ventanas bajas) manda la posición:
  // se abre la tarjeta que quedó en el centro de la pantalla.
  useEffect(() => {
    const wrap = pinRef.current;
    if (pinned || !wrap) return;

    const update = () => {
      const box = wrap.getBoundingClientRect();
      if (box.bottom < 0 || box.top > window.innerHeight) return;

      const middle = window.innerHeight / 2;
      const dist = buttonRefs.current.map((el) => {
        if (!el) return Infinity;
        const r = el.getBoundingClientRect();
        return Math.abs(r.top + r.height / 2 - middle);
      });

      let best = 0;
      dist.forEach((d, i) => {
        if (d < dist[best]) best = i;
      });

      const cur = activeRef.current;
      if (best === cur || dist[cur] - dist[best] < SWITCH_MARGIN) return;
      drawBar((best + 1) / PILLARS.length);
      openKeepingPlace(best);
    };

    // Sin bloque fijado la barra avanza de a pasos, no con el scroll: acá sí
    // conviene suavizar el salto.
    if (barRef.current) {
      barRef.current.style.transition = "transform 300ms ease-out";
    }
    drawBar((activeRef.current + 1) / PILLARS.length);

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pinned, openKeepingPlace, drawBar]);

  const goTo = useCallback(
    (i: number) => {
      const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const el = pinRef.current;

      if (pinned && el) {
        setActive(i);
        const travel = el.offsetHeight - window.innerHeight;
        if (travel <= 0) return;
        const top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: top + travel * STEP_CENTERS[i],
          behavior: calm ? "instant" : "smooth",
        });
        return;
      }

      // Sin bloque fijado, tocar una tarjeta la lleva al centro: si no, el
      // siguiente scroll la cerraría de nuevo.
      setActive(i);
      requestAnimationFrame(() => {
        const btn = buttonRefs.current[i];
        if (!btn) return;
        const r = btn.getBoundingClientRect();
        window.scrollTo({
          top: window.scrollY + r.top + r.height / 2 - window.innerHeight / 2,
          behavior: calm ? "instant" : "smooth",
        });
      });
    },
    [pinned]
  );

  return (
    <section
      id="features"
      className="w-full pt-14 pb-10 lg:pb-18 lg:pt-28 2xl:pb-24 2xl:pt-36"
    >
      <div className="relative px-4 mx-auto max-w-7xl md:px-6">
        <div
          aria-hidden="true"
          className="absolute pointer-events-none -top-40 right-0 w-[min(620px,100%)] h-[520px]"
          style={{
            background:
              "radial-gradient(ellipse at center, hsla(20,90%,80%,0.30) 0%, hsla(20,80%,88%,0.14) 48%, transparent 72%)",
          }}
        />

        {/* Bloque fijado: el alto extra del contenedor es el recorrido de scroll
            que se consume avanzando de pilar en pilar. La pantalla `pin` exige
            ancho y alto; fuera de eso la sección fluye como un acordeón común. */}
        <div ref={pinRef} className="pin:h-[230vh]">
          <div className="pin:sticky pin:top-0 pin:flex pin:min-h-screen pin:flex-col pin:justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative flex flex-col items-center gap-3 lg:gap-4 mb-8 lg:mb-14 short:mb-6 text-center"
            >
              <Badge
                className="rounded-full text-orange-600 bg-orange-50 px-4 py-1.5 text-sm font-medium"
                variant="secondary"
              >
                Ahorrá tu tiempo
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl 2xl:text-5xl max-w-[760px]">
                Todo lo que necesitás para
                <br className="hidden md:block" />
                <span className="text-accent font-extrabold">
                  {" "}
                  profesionalizar tus turnos
                </span>
                .
              </h2>
              <p className="max-w-[620px] text-slate-600 dark:text-slate-300 md:text-base 2xl:text-lg">
                Un solo sistema para reservar, cobrar y organizar. Sin planillas y
                sin cadenas de mensajes.
              </p>
            </motion.div>

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="relative grid items-start gap-8 lg:gap-9 lg:grid-cols-[392px_minmax(0,1fr)] lg:items-center"
            >
              <div className="flex flex-col gap-2.5 short:gap-2">
                {PILLARS.map((pillar, i) => {
                  const on = i === active;
                  return (
                    <motion.div
                      key={pillar.title}
                      variants={item}
                      className={`rounded-2xl transition-all duration-300 ${
                        on
                          ? "bg-[#fff1e8] border border-orange-900/10 shadow-[0_20px_44px_-32px_rgba(15,23,42,0.5)]"
                          : "bg-transparent border border-transparent lg:bg-transparent"
                      }`}
                    >
                      <button
                        ref={(el) => {
                          buttonRefs.current[i] = el;
                        }}
                        type="button"
                        onClick={() => goTo(i)}
                        aria-expanded={on}
                        className="block w-full min-h-[44px] p-5 short:p-4 text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`inline-flex items-center justify-center shrink-0 w-9 h-9 short:w-8 short:h-8 rounded-xl transition-colors duration-300 ${
                              on
                                ? "bg-orange-600 text-white"
                                : "bg-stone-100 text-stone-400"
                            }`}
                          >
                            <Glyph className="w-[18px] h-[18px] short:w-4 short:h-4">
                              {pillar.icon}
                            </Glyph>
                          </span>
                          <span
                            className={`text-base 2xl:text-[17px] short:text-[15px] font-semibold tracking-tight transition-colors duration-300 ${
                              on ? "text-slate-900" : "text-stone-600"
                            }`}
                          >
                            {pillar.title}
                          </span>
                        </div>
                        <p
                          className={`text-sm short:text-[13px] leading-relaxed transition-colors duration-300 ${
                            on ? "text-slate-500" : "text-stone-400"
                          }`}
                        >
                          {pillar.description}
                        </p>
                      </button>

                      {on && pillar.link && (
                        <div className="px-5 pb-4 -mt-2 short:px-4 short:pb-3">
                          <Link
                            href={pillar.link.href}
                            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-orange-600 transition-colors duration-300 hover:text-[#d92f04]"
                          >
                            {pillar.link.label}
                            <Arrow className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}

                      {on && (
                        <div className="px-3 pb-3 lg:hidden">
                          <div className="overflow-hidden bg-white border rounded-xl border-stone-200/70">
                            {pillar.mobile}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                <motion.div variants={item}>
                  <Link
                    href={DEMO_HREF}
                    className="flex items-center justify-center gap-2 mt-2 text-[15px] font-semibold text-white transition-colors duration-300 bg-orange-600 rounded-xl min-h-12 hover:bg-[#d92f04] lg:hidden"
                  >
                    Probar la demo en vivo
                    <Arrow className="w-4 h-4" />
                  </Link>
                  <div className="items-center hidden gap-4 px-5 pt-4 short:pt-2 lg:flex">
                    {/* Avance del scroll dentro del bloque fijado. Las dos
                        muescas marcan dónde cambia de pilar. */}
                    <div
                      className="relative h-[3px] w-28 shrink-0 overflow-hidden rounded-full bg-stone-200/90"
                      aria-hidden="true"
                    >
                      <div
                        ref={barRef}
                        className="absolute inset-0 origin-left rounded-full bg-orange-600"
                        style={{ transform: "scaleX(0.04)" }}
                      />
                      <span className="absolute top-0 bottom-0 w-px left-1/3 bg-white/85" />
                      <span className="absolute top-0 bottom-0 w-px left-2/3 bg-white/85" />
                    </div>
                    <Link
                      href={DEMO_HREF}
                      className="flex items-center gap-2 text-sm font-semibold text-orange-600 transition-colors duration-300 hover:text-[#d92f04]"
                    >
                      Probar la demo en vivo
                      <Arrow className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              </div>

              <motion.div
                variants={item}
                className="hidden overflow-hidden bg-white border rounded-[18px] border-stone-200/80 shadow-[0_32px_70px_-40px_rgba(15,23,42,0.45)] lg:block short:w-full short:max-w-[680px] short:justify-self-end"
              >
                <div className="flex items-center h-10 gap-2.5 px-4 border-b bg-stone-50 border-stone-100">
                  <div className="flex gap-1.5">
                    <span className="block w-2 h-2 rounded-full bg-stone-300" />
                    <span className="block w-2 h-2 rounded-full bg-stone-300" />
                    <span className="block w-2 h-2 rounded-full bg-stone-300" />
                  </div>
                  <div className="flex justify-center grow">
                    <span className="px-3.5 py-1 text-[11px] font-medium text-slate-400 bg-white border rounded-full border-stone-100">
                      sacaturno.com.ar/admin
                    </span>
                  </div>
                  <div className="w-11" />
                </div>
                {/* La proporción del contenedor es la de las capturas (1400x595),
                    así object-cover las muestra enteras y sin recortar. */}
                <div className="relative bg-white aspect-[1078/650]">
                  {PILLARS.map((pillar, i) => (
                    <div
                      key={pillar.title}
                      aria-hidden={i !== active}
                      className={`absolute inset-0 transition-opacity duration-500 motion-reduce:duration-0 ${
                        i === active ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <Image
                        src={pillar.shot}
                        alt={pillar.alt}
                        width={1320}
                        height={796}
                        className="block object-cover object-left-top w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="relative p-5 mt-8 overflow-hidden border lg:mt-12 lg:p-10 rounded-[20px] lg:rounded-[24px] border-orange-900/[0.07] bg-[#fdfaf8]"
        >
          <div
            aria-hidden="true"
            className="absolute top-0 right-0 pointer-events-none w-[min(520px,80%)] h-[260px]"
            style={{
              background:
                "radial-gradient(ellipse at top right, hsla(20,90%,72%,0.16) 0%, transparent 70%)",
            }}
          />

          <div className="relative flex flex-col items-start gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4 lg:mb-8">
            <h3 className="text-2xl font-extrabold tracking-tight lg:text-[28px] text-slate-900">
              Y además,{" "}
              <span className="text-accent">en todos los planes</span>
            </h3>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.04em] text-orange-600 rounded-full bg-orange-50 border border-orange-600/15 lg:text-[13px] whitespace-nowrap">
              <Check className="w-3.5 h-3.5" />
              Sin costo extra
            </span>
          </div>

          <ul className="relative grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-3">
            {EXTRAS.map((extra) => (
              <li
                key={extra.label}
                className="flex items-center gap-3 p-3.5 transition-colors duration-300 bg-white border group lg:p-4 rounded-2xl border-orange-900/[0.06] shadow-[0_10px_24px_-20px_rgba(15,23,42,0.55)] hover:border-orange-600/25"
              >
                <span className="inline-flex items-center justify-center shrink-0 w-9 h-9 rounded-xl transition-colors duration-300 bg-orange-50 text-orange-600 lg:w-10 lg:h-10 group-hover:bg-orange-600 group-hover:text-white">
                  <Glyph className="w-[18px] h-[18px] lg:w-5 lg:h-5">
                    {extra.icon}
                  </Glyph>
                </span>
                <span className="text-[15px] font-semibold leading-snug text-slate-800 lg:text-base">
                  {extra.label}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
