"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { HELP, topicText, type Block, type Chapter, type Topic } from "@/lib/helpContent";
import { cn } from "@/lib/utils";
import {
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineArrowRight,
  HiOutlineLightBulb,
  HiOutlineExclamationTriangle,
  HiOutlineListBullet,
} from "react-icons/hi2";

// Busca sin acentos: "seña" tiene que encontrarse escribiendo "sena".
const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export default function HelpCenter() {
  const [query, setQuery] = useState("");
  const [openIndex, setOpenIndex] = useState(false);
  const [activeId, setActiveId] = useState<string>("");
  const contentRef = useRef<HTMLDivElement>(null);

  // El manual se muestra completo a cualquier usuario: lo único que filtra es
  // la búsqueda. Las etiquetas de cada tema ("Solo dueño", "Planes Pro y Full")
  // siguen indicando a quién aplica, sin esconder nada.
  const chapters = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return HELP;

    const out: Chapter[] = [];
    for (const ch of HELP) {
      const topics = ch.topics.filter(
        (t) => norm(topicText(t)).includes(q) || norm(ch.title).includes(q),
      );
      if (topics.length) out.push({ ...ch, topics });
    }
    return out;
  }, [query]);

  const totalTopics = chapters.reduce((n, c) => n + c.topics.length, 0);

  // Resalta en el índice la sección que se está leyendo.
  useEffect(() => {
    const els = Array.from(
      contentRef.current?.querySelectorAll<HTMLElement>("[data-topic-id]") ?? [],
    );
    if (!els.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiveId(visible.target.getAttribute("data-topic-id") ?? "");
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [chapters]);

  // Índice abierto en mobile: se cierra con Escape y no deja scrollear el fondo.
  useEffect(() => {
    if (!openIndex) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenIndex(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [openIndex]);

  const goTo = (id: string) => {
    setOpenIndex(false);
    // Diferido: mientras el índice está abierto el body tiene overflow hidden,
    // así que scrollear antes de que se restaure no hace nada.
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    });
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 max-w-screen-2xl mx-auto py-4 md:py-6 flex flex-col gap-5">
      {/* ── Encabezado ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Centro de ayuda</h1>
        <p className="text-sm text-gray-500">
          Todo lo que podés hacer en SacaTurno, paso a paso y con capturas de la app.
        </p>
      </div>

      {/* ── Buscador ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1">
          <HiOutlineMagnifyingGlass
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscá una duda: seña, cancelar, empleado, link…"
            className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-9 text-sm
                       transition-all duration-200 ease-in-out
                       hover:border-orange-600 focus:border-orange-600 focus:outline-none focus:bg-white"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Limpiar búsqueda"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <HiOutlineXMark size={16} />
            </button>
          )}
        </div>

        <button
          onClick={() => setOpenIndex((v) => !v)}
          className="lg:hidden flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:border-orange-600 hover:text-orange-600 transition-colors"
        >
          <HiOutlineListBullet size={16} />
          Índice
        </button>
      </div>

      {query && (
        <p className="-mt-2 text-xs text-gray-500">
          {totalTopics === 0
            ? "No encontramos nada con ese término."
            : `${totalTopics} ${totalTopics === 1 ? "resultado" : "resultados"} para «${query}».`}
        </p>
      )}

      <div className="flex gap-8 items-start">
        {/* Fondo del índice en mobile: cierra al tocar fuera. */}
        {openIndex && (
          <div
            onClick={() => setOpenIndex(false)}
            className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200"
            aria-hidden
          />
        )}

        {/* ── Índice lateral ───────────────────────────────────────── */}
        <nav
          className={cn(
            "shrink-0 w-64 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:block lg:z-auto lg:bg-transparent lg:p-0 lg:rounded-none lg:border-0 lg:shadow-none lg:animate-none",
            openIndex
              ? "fixed inset-x-3 top-16 bottom-3 z-50 w-auto overflow-y-auto bg-white rounded-xl border border-gray-100 shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-200"
              : "hidden",
          )}
        >
          {/* Cabecera solo mobile: sin esto el panel no se puede cerrar sin elegir un tema. */}
          <div className="lg:hidden flex items-center justify-between pb-3 mb-3 border-b border-gray-100 sticky -top-4 bg-white pt-1">
            <span className="text-sm font-bold text-gray-800">Índice</span>
            <button
              onClick={() => setOpenIndex(false)}
              aria-label="Cerrar índice"
              className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <HiOutlineXMark size={18} />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {chapters.map((ch, i) => (
              <div key={ch.id} className="flex flex-col gap-1">
                <button
                  onClick={() => goTo(ch.id)}
                  className="text-left text-xs font-bold text-gray-800 hover:text-orange-600 transition-colors"
                >
                  <span className="text-gray-300 tabular-nums mr-1.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {ch.title}
                </button>
                <div className="flex flex-col border-l border-gray-100 ml-1 pl-3 gap-0.5">
                  {ch.topics.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => goTo(t.id)}
                      className={cn(
                        "text-left text-xs py-0.5 transition-colors leading-snug",
                        activeId === t.id
                          ? "text-orange-600 font-semibold"
                          : "text-gray-500 hover:text-gray-800",
                      )}
                    >
                      {t.title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {!chapters.length && (
              <p className="text-xs text-gray-400">Sin secciones que mostrar.</p>
            )}
          </div>
        </nav>

        {/* ── Contenido ────────────────────────────────────────────── */}
        <div ref={contentRef} className="flex-1 min-w-0 flex flex-col gap-10 pb-16">
          {chapters.map((ch, i) => (
            <section key={ch.id} id={ch.id} className="flex flex-col gap-5 scroll-mt-20">
              <div className="flex flex-col gap-1 pb-3 border-b border-gray-100">
                <span className="text-[11px] font-bold uppercase tracking-widest text-orange-600">
                  Capítulo {i + 1}
                </span>
                <h2 className="text-xl font-bold text-gray-800">{ch.title}</h2>
                <p className="text-sm text-gray-500">{ch.summary}</p>
              </div>

              {ch.topics.map((t) => (
                <TopicCard key={t.id} topic={t} />
              ))}
            </section>
          ))}

          {!chapters.length && (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <p className="text-sm font-semibold text-gray-700">Sin resultados</p>
              <p className="text-xs text-gray-500 max-w-xs">
                Probá con otra palabra. Por ejemplo: seña, cancelar, empleado, sucursal,
                link o recordatorio.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Tarjeta de un tema ─────────────────────────────────────────────── */

function TopicCard({ topic }: { topic: Topic }) {
  return (
    <article
      id={topic.id}
      data-topic-id={topic.id}
      className="flex flex-col gap-4 p-5 md:p-6 bg-white rounded-xl border border-gray-100 shadow-lg scroll-mt-20"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-base font-semibold text-gray-800">{topic.title}</h3>
        {topic.plan && <PlanBadge plan={topic.plan} />}
        {topic.audience === "employee" && <Badge tone="blue">Empleados</Badge>}
        {topic.audience === "owner" && <Badge tone="gray">Solo dueño</Badge>}
      </div>

      <div className="flex flex-col gap-4">
        {topic.blocks.map((b, i) => (
          <BlockView key={i} block={b} />
        ))}
      </div>
    </article>
  );
}

function PlanBadge({ plan }: { plan: NonNullable<Topic["plan"]> }) {
  const label =
    plan === "SC_FULL" ? "Plan Full" : plan === "SC_PRO" ? "Planes Pro y Full" : "Planes pagos";
  return <Badge tone="orange">{label}</Badge>;
}

function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "orange" | "blue" | "gray";
}) {
  const tones = {
    orange: "bg-orange-100 text-orange-700",
    blue: "bg-blue-50 text-blue-600",
    gray: "bg-gray-100 text-gray-500",
  };
  return (
    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", tones[tone])}>
      {children}
    </span>
  );
}

function BlockView({ block: b }: { block: Block }) {
  switch (b.k) {
    case "p":
      return <p className="text-sm text-gray-700 leading-relaxed">{b.text}</p>;

    case "list":
      return (
        <ul className="flex flex-col gap-1.5">
          {b.items.map((it, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700 leading-relaxed">
              <span className="text-orange-500 mt-1.5 shrink-0 w-1 h-1 rounded-full bg-orange-500" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      );

    case "steps":
      return (
        <ol className="flex flex-col gap-3">
          {b.items.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-orange-50 border border-orange-100 text-[11px] font-bold text-orange-600 tabular-nums">
                {i + 1}
              </span>
              <div className="flex flex-col gap-1 pt-0.5">
                <span className="text-sm font-semibold text-gray-800 leading-snug">
                  {s.title}
                </span>
                <span className="text-sm text-gray-600 leading-relaxed">{s.text}</span>
                {s.tip && (
                  <span className="text-xs text-gray-500 leading-relaxed">{s.tip}</span>
                )}
              </div>
            </li>
          ))}
        </ol>
      );

    case "img": {
      // Las capturas de diálogos son angostas por naturaleza: a todo lo ancho
      // se ven desproporcionadas en desktop.
      const esModal = b.size === "modal";
      return (
        <figure className={cn("flex flex-col gap-2 w-full", esModal && "md:max-w-[560px]")}>
          <div className="relative w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
            <Image
              src={b.src}
              alt={b.alt}
              width={1600}
              height={1000}
              className="w-full h-auto"
              sizes={esModal ? "(max-width: 768px) 100vw, 560px" : "(max-width: 1024px) 100vw, 900px"}
            />
          </div>
          {b.caption && (
            <figcaption className="text-xs text-gray-400 leading-relaxed">
              {b.caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case "tip":
      return (
        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <HiOutlineLightBulb size={16} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700 leading-relaxed">{b.text}</p>
        </div>
      );

    case "warn":
      return (
        <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg border border-orange-100">
          <HiOutlineExclamationTriangle
            size={16}
            className="text-orange-500 shrink-0 mt-0.5"
          />
          <p className="text-sm text-orange-800 leading-relaxed">{b.text}</p>
        </div>
      );

    case "table":
      return (
        <div className="w-full overflow-x-auto rounded-lg border border-gray-100">
          <table className="w-full text-left border-collapse min-w-[420px]">
            <thead>
              <tr className="bg-gray-50">
                {b.head.map((h, i) => (
                  <th
                    key={i}
                    className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-100"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0">
                  {r.map((c, j) => (
                    <td
                      key={j}
                      className={cn(
                        "px-3 py-2 text-xs leading-relaxed align-top",
                        j === 0 ? "font-medium text-gray-800" : "text-gray-600",
                      )}
                    >
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "route":
      return (
        <Link
          href={b.href}
          className="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-orange-600 hover:text-[#d92f04] transition-colors"
        >
          {b.label}
          <HiOutlineArrowRight size={13} />
        </Link>
      );
  }
}
