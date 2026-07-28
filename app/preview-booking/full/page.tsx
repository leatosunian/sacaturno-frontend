"use client"

import { useState } from "react"
import {
  Check, ChevronRight, Sparkles, MapPin, Phone,
  ExternalLink, ArrowLeft, Smartphone, Monitor,
} from "lucide-react"

// ─────────────────────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────────────────────
const business = { name: "Estética Demo", subtitle: "Reservá tu turno online" }

const services = [
  { id: "1", name: "Limpieza facial", duration: 30, price: 49500, deposit: 24750 },
  { id: "2", name: "Masaje descontracturante", duration: 60, price: 42900, deposit: 0 },
  { id: "3", name: "Circuito Spa", duration: 90, price: 82500, deposit: 0 },
  { id: "4", name: "Jornada depilación - 13 junio", duration: 30, price: 16500, deposit: 8250 },
  { id: "5", name: "Primer consulta y evaluación", duration: 60, price: 16500, deposit: 8250 },
]

const branches = [
  { id: "b1", name: "Palermo", address: "Palermo, Cdad. Autónoma de Buenos Aires" },
  { id: "b2", name: "Villa Devoto", address: "plaza arenales" },
]

const employees = [
  { id: "e1", name: "Silvia", initial: "S" },
  { id: "e2", name: "Agustina", initial: "A" },
]

const dates = [
  { key: "d1", day: "LUN", num: 6, month: "Jul" },
  { key: "d2", day: "MAR", num: 7, month: "Jul" },
  { key: "d3", day: "MIÉ", num: 8, month: "Jul" },
  { key: "d4", day: "JUE", num: 9, month: "Jul" },
  { key: "d5", day: "VIE", num: 10, month: "Jul" },
  { key: "d6", day: "LUN", num: 13, month: "Jul" },
  { key: "d7", day: "MAR", num: 14, month: "Jul" },
  { key: "d8", day: "MIÉ", num: 15, month: "Jul" },
]

const times = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
]

type StepKey = "service" | "branch" | "employee" | "date" | "confirm"
const STEPS: StepKey[] = ["service", "branch", "employee", "date", "confirm"]
const STEP_LABELS: Record<StepKey, string> = {
  service: "Servicio",
  branch: "Sucursal",
  employee: "Profesional",
  date: "Fecha",
  confirm: "Confirmar",
}

interface Snapshot {
  step: StepKey
  serviceId: string | null
  branchId: string | null
  employeeId: string | null | "any"
  dateKey: string | null
  time: string | null
  // simulated selections shown in each step
  serviceHighlight?: string | null
  branchHighlight?: string | null
  employeeHighlight?: string | null | "any"
  dateHighlight?: string | null
  timeHighlight?: string | null
}

const snapshots: Record<StepKey, Snapshot> = {
  service: {
    step: "service", serviceId: null, branchId: null, employeeId: null, dateKey: null, time: null,
    serviceHighlight: "1",
  },
  branch: {
    step: "branch", serviceId: "1", branchId: null, employeeId: null, dateKey: null, time: null,
    branchHighlight: "b1",
  },
  employee: {
    step: "employee", serviceId: "1", branchId: "b1", employeeId: null, dateKey: null, time: null,
    employeeHighlight: "e1",
  },
  date: {
    step: "date", serviceId: "1", branchId: "b1", employeeId: "e1", dateKey: "d3", time: "10:30",
  },
  confirm: {
    step: "confirm", serviceId: "1", branchId: "b1", employeeId: "e1", dateKey: "d3", time: "10:30",
  },
}

// ─────────────────────────────────────────────────────────────
// Sidebar (desktop) — full dark sidebar
// ─────────────────────────────────────────────────────────────
function SidebarDesktop({ activeStep }: { activeStep: StepKey }) {
  const activeIdx = STEPS.indexOf(activeStep)
  return (
    <aside className="md:w-80 md:shrink-0 bg-neutral-900 text-white p-8 md:p-10">
      <div className="flex items-center gap-4 mb-6">
        <div className="size-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
          <span className="text-xl font-black">{business.name[0]}</span>
        </div>
        <div>
          <h2 className="text-lg font-bold">{business.name}</h2>
          <p className="text-xs text-white/60">{business.subtitle}</p>
        </div>
      </div>
      <div className="border-t border-white/10 pt-6">
        <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-3 block">Progreso</span>
        <div className="flex flex-col gap-1">
          {STEPS.map((step, i) => {
            const isCurr = step === activeStep
            const isDone = i < activeIdx
            return (
              <div
                key={step}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${
                  isCurr ? "bg-white/10" : ""
                }`}
              >
                <div className="size-6 shrink-0 flex items-center justify-center">
                  {isDone ? (
                    <div className="size-6 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check className="size-3.5 text-white" strokeWidth={3} />
                    </div>
                  ) : (
                    <div className={`size-6 rounded-full border flex items-center justify-center text-xs font-bold ${
                      isCurr ? "border-orange-400 text-orange-400" : "border-white/20 text-white/40"
                    }`}>
                      {i + 1}
                    </div>
                  )}
                </div>
                <span className={`text-sm font-semibold ${
                  isCurr ? "text-white" : isDone ? "text-white/80" : "text-white/40"
                }`}>
                  {STEP_LABELS[step]}
                </span>
              </div>
            )
          })}
        </div>
      </div>
      <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10">
        <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-2">¿Necesitás ayuda?</span>
        <div className="flex items-center gap-2 text-xs text-white/80"><Phone className="size-3" /> 11 5678 1234</div>
        <div className="flex items-center gap-2 text-xs text-white/80 mt-1"><MapPin className="size-3" /> Av. Santa Fe 3521</div>
      </div>
    </aside>
  )
}

// ─────────────────────────────────────────────────────────────
// Header (mobile) — compact dark top bar with horizontal progress
// ─────────────────────────────────────────────────────────────
function HeaderMobile({ activeStep }: { activeStep: StepKey }) {
  const activeIdx = STEPS.indexOf(activeStep)
  return (
    <div className="bg-neutral-900 text-white px-4 pt-4 pb-3">
      <div className="flex items-center gap-3 mb-3">
        <div className="size-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
          <span className="text-sm font-black">{business.name[0]}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold truncate">{business.name}</h2>
          <p className="text-[10px] text-white/60 truncate">Paso {activeIdx + 1} de 5 · {STEP_LABELS[activeStep]}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {STEPS.map((step, i) => {
          const isCurr = step === activeStep
          const isDone = i < activeIdx
          return (
            <div key={step} className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-full h-1 rounded-full transition-colors ${
                isDone ? "bg-emerald-500" : isCurr ? "bg-orange-400" : "bg-white/20"
              }`} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Step content — static render of each step with pre-selected items
// ─────────────────────────────────────────────────────────────
function StepContent({ state, stepIdx, mobile = false }: { state: Snapshot; stepIdx: number; mobile?: boolean }) {
  const svc = services.find((s) => s.id === state.serviceId)
  const br = branches.find((b) => b.id === state.branchId)
  const emp = state.employeeId === "any" ? null : employees.find((e) => e.id === state.employeeId)
  const dt = dates.find((d) => d.key === state.dateKey)

  const titleSize = mobile ? "text-xl" : "text-3xl"
  const pad = mobile ? "p-4" : "p-8 md:p-10"

  if (state.step === "service") {
    return (
      <div className={`${pad} flex flex-col gap-5`}>
        <div>
          <span className="text-[10px] md:text-xs uppercase tracking-widest text-orange-600 font-bold">Paso {stepIdx + 1} de 5</span>
          <h1 className={`${titleSize} font-black tracking-tight mt-1`}>Elegí tu servicio</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">¿Qué querés reservar hoy?</p>
        </div>
        <div className={mobile ? "grid grid-cols-1 gap-2.5" : "grid grid-cols-1 md:grid-cols-2 gap-3"}>
          {services.map((s) => {
            const sel = state.serviceHighlight === s.id
            return (
              <div
                key={s.id}
                className={`text-left ${mobile ? "p-3.5" : "p-5"} rounded-2xl border transition-all ${
                  sel ? "border-neutral-900 bg-neutral-50 shadow-md" : "border-border bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`font-bold ${mobile ? "text-sm" : "text-base"}`}>{s.name}</span>
                  <ChevronRight className={`size-4 shrink-0 ${sel ? "text-neutral-900" : "text-muted-foreground/40"}`} />
                </div>
                <div className={`flex items-center gap-2 ${mobile ? "text-xs" : "text-sm"}`}>
                  <span className="text-muted-foreground">{s.duration} min</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="font-bold">${s.price.toLocaleString("es-AR")}</span>
                </div>
                {s.deposit > 0 && (
                  <div className="mt-2 inline-block px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold">
                    Seña ${s.deposit.toLocaleString("es-AR")}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (state.step === "branch") {
    return (
      <div className={`${pad} flex flex-col gap-5`}>
        <div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <ArrowLeft className="size-3.5" /> Volver
          </div>
          <span className="text-[10px] md:text-xs uppercase tracking-widest text-orange-600 font-bold">Paso {stepIdx + 1} de 5</span>
          <h1 className={`${titleSize} font-black tracking-tight mt-1`}>¿Dónde querés atenderte?</h1>
        </div>
        <div className={mobile ? "grid grid-cols-1 gap-2.5" : "grid grid-cols-1 md:grid-cols-2 gap-3"}>
          {branches.map((b) => {
            const sel = state.branchHighlight === b.id
            return (
              <div
                key={b.id}
                className={`text-left ${mobile ? "p-3.5" : "p-5"} rounded-2xl border transition-all ${
                  sel ? "border-neutral-900 bg-neutral-50 shadow-md" : "border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                      <MapPin className="size-4 text-orange-700" />
                    </div>
                    <div>
                      <div className="font-bold">{b.name}</div>
                      <div className="text-xs text-muted-foreground">{b.address}</div>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (state.step === "employee") {
    return (
      <div className={`${pad} flex flex-col gap-5`}>
        <div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <ArrowLeft className="size-3.5" /> Volver
          </div>
          <span className="text-[10px] md:text-xs uppercase tracking-widest text-orange-600 font-bold">Paso {stepIdx + 1} de 5</span>
          <h1 className={`${titleSize} font-black tracking-tight mt-1`}>¿Con quién preferís?</h1>
        </div>
        <div className={`text-left ${mobile ? "p-3.5" : "p-5"} rounded-2xl border border-border flex items-center gap-3`}>
          <div className="size-11 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shrink-0">
            <Sparkles className="size-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold">Primero disponible</div>
            <div className="text-xs text-muted-foreground">Cualquier profesional</div>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </div>
        <div className={mobile ? "grid grid-cols-1 gap-2.5" : "grid grid-cols-1 md:grid-cols-2 gap-3"}>
          {employees.map((e) => {
            const sel = state.employeeHighlight === e.id
            return (
              <div
                key={e.id}
                className={`text-left ${mobile ? "p-3.5" : "p-5"} rounded-2xl border flex items-center gap-3 transition-all ${
                  sel ? "border-neutral-900 bg-neutral-50 shadow-md" : "border-border"
                }`}
              >
                <div className="size-11 rounded-full bg-neutral-100 border border-border flex items-center justify-center text-sm font-bold shrink-0">
                  {e.initial}
                </div>
                <span className="font-bold flex-1">{e.name}</span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (state.step === "date") {
    return (
      <div className={`${pad} flex flex-col gap-5`}>
        <div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <ArrowLeft className="size-3.5" /> Volver
          </div>
          <span className="text-[10px] md:text-xs uppercase tracking-widest text-orange-600 font-bold">Paso {stepIdx + 1} de 5</span>
          <h1 className={`${titleSize} font-black tracking-tight mt-1`}>Fecha y hora</h1>
          {svc && <p className="text-xs md:text-sm text-muted-foreground mt-1">Para <b>{svc.name}</b> · {svc.duration} min</p>}
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-2 block">Elegí un día</span>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
            {dates.map((d) => {
              const sel = state.dateKey === d.key
              return (
                <div
                  key={d.key}
                  className={`shrink-0 w-14 py-3 rounded-2xl border flex flex-col items-center justify-center ${
                    sel ? "border-neutral-900 bg-neutral-900 text-white shadow-md" : "border-border bg-white"
                  }`}
                >
                  <span className={`text-[10px] font-bold uppercase leading-none ${sel ? "text-white/70" : "text-muted-foreground"}`}>{d.day}</span>
                  <span className="text-base font-black leading-tight mt-1">{d.num}</span>
                  <span className={`text-[10px] font-semibold mt-0.5 ${sel ? "text-white/70" : "text-muted-foreground"}`}>{d.month}</span>
                </div>
              )
            })}
          </div>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-2 block">Elegí un horario</span>
          <div className={mobile ? "grid grid-cols-4 gap-1.5" : "grid grid-cols-4 md:grid-cols-6 gap-2"}>
            {(mobile ? times.slice(0, 12) : times).map((t) => {
              const sel = state.time === t
              return (
                <div
                  key={t}
                  className={`py-2.5 rounded-lg border text-sm font-bold text-center ${
                    sel ? "border-neutral-900 bg-neutral-900 text-white shadow-md" : "border-border"
                  }`}
                >
                  {t}
                </div>
              )
            })}
          </div>
        </div>
        <div className="h-11 rounded-xl text-sm font-bold uppercase tracking-wider bg-neutral-900 text-white flex items-center justify-center">
          Continuar
        </div>
      </div>
    )
  }

  if (state.step === "confirm") {
    return (
      <div className={`${pad} flex flex-col gap-5`}>
        <div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <ArrowLeft className="size-3.5" /> Volver
          </div>
          <span className="text-[10px] md:text-xs uppercase tracking-widest text-orange-600 font-bold">Paso {stepIdx + 1} de 5</span>
          <h1 className={`${titleSize} font-black tracking-tight mt-1`}>Casi listo</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">Completá tus datos y confirmá.</p>
        </div>
        <div className={mobile ? "grid grid-cols-1 gap-3" : "grid grid-cols-1 sm:grid-cols-2 gap-4"}>
          <FakeInput label="Nombre" value="Juan" />
          <FakeInput label="Teléfono" value="11 1234 5678" />
        </div>
        <FakeInput label="Email" value="juan@email.com" />
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 md:p-5 flex flex-col gap-2.5">
          <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Resumen</span>
          <Row label="Servicio" value={svc?.name ?? "—"} />
          <Row label="Fecha y hora" value={dt ? `${dt.day.toLowerCase()} ${dt.num} de julio · ${state.time}` : "—"} />
          {emp && <Row label="Profesional" value={emp.name} />}
          {br && <Row label="Sucursal" value={br.name} />}
          {svc && svc.deposit > 0 && <Row label="Seña" value={<span className="text-orange-600 font-bold">${svc.deposit.toLocaleString("es-AR")}</span>} />}
          {svc && <div className="border-t border-border pt-2.5 mt-0.5"><Row label="Total" value={<span className="text-lg font-black">${svc.price.toLocaleString("es-AR")}</span>} /></div>}
        </div>
        <div className="h-12 rounded-xl text-sm font-bold uppercase tracking-wider bg-neutral-900 text-white flex items-center justify-center gap-2 px-3">
          {svc && svc.deposit > 0 ? (
            <>
              <ExternalLink className="size-4" />
              <span className="truncate">Pagar seña · ${svc.deposit.toLocaleString("es-AR")}</span>
            </>
          ) : <>Confirmar reserva</>}
        </div>
      </div>
    )
  }

  return null
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <div className="text-right font-semibold text-foreground">{value}</div>
    </div>
  )
}

function FakeInput({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="h-11 px-3 rounded-lg border border-border bg-white text-sm flex items-center text-foreground">
        {value}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Desktop frame — one full-width wizard per step
// ─────────────────────────────────────────────────────────────
function DesktopWizardStep({ stepIdx }: { stepIdx: number }) {
  const step = STEPS[stepIdx]
  const state = snapshots[step]
  return (
    <div className="flex flex-col md:flex-row gap-0 rounded-3xl bg-white border border-border overflow-hidden shadow-xl">
      <SidebarDesktop activeStep={step} />
      <section className="flex-1 min-w-0">
        <StepContent state={state} stepIdx={stepIdx} />
      </section>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Mobile frame — fake phone with dark top bar
// ─────────────────────────────────────────────────────────────
function MobileWizardStep({ stepIdx }: { stepIdx: number }) {
  const step = STEPS[stepIdx]
  const state = snapshots[step]
  return (
    <div
      className="rounded-[2.5rem] bg-white border-[10px] border-neutral-900 overflow-hidden shadow-2xl relative"
      style={{ width: 375 }}
    >
      {/* Notch */}
      <div className="bg-neutral-900 h-6 flex justify-center items-end pb-1">
        <div className="w-24 h-1.5 rounded-full bg-white/20" />
      </div>
      <HeaderMobile activeStep={step} />
      <div className="bg-white">
        <StepContent state={state} stepIdx={stepIdx} mobile />
      </div>
      {/* Bottom home indicator */}
      <div className="bg-white pt-4 pb-2 flex justify-center">
        <div className="w-28 h-1 rounded-full bg-neutral-300" />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
export default function PreviewBookingFullPage() {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop")

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="px-4 py-6 md:py-10">
        {/* Header */}
        <div className="max-w-5xl mx-auto text-center mb-8">
          <span className="inline-block text-[10px] uppercase tracking-widest font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full mb-3">
            Ruta completa · Variante B (Premium Oscuro)
          </span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground mb-2">
            Los 5 pasos, uno abajo del otro
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Cada paso muestra el estado del wizard con los datos de los pasos anteriores ya seleccionados.
            Los checkmarks verdes en el sidebar indican pasos completados.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-10 sticky top-4 z-20">
          <div className="flex gap-1 p-1 rounded-full bg-white shadow-md border border-border">
            <button
              onClick={() => setDevice("desktop")}
              className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                device === "desktop" ? "bg-orange-600 text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Monitor className="size-4" /> Desktop
            </button>
            <button
              onClick={() => setDevice("mobile")}
              className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                device === "mobile" ? "bg-orange-600 text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Smartphone className="size-4" /> Mobile
            </button>
          </div>
        </div>

        {/* Desktop grid */}
        {device === "desktop" && (
          <div className="max-w-7xl mx-auto flex flex-col gap-14">
            {STEPS.map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-orange-600 text-white flex items-center justify-center text-sm font-black">
                      {i + 1}
                    </div>
                    <span className="text-lg font-bold text-foreground">{STEP_LABELS[STEPS[i]]}</span>
                  </div>
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                    {i === 0 && "Estado inicial"}
                    {i === 1 && "Servicio ya elegido"}
                    {i === 2 && "Servicio + sucursal ya elegidos"}
                    {i === 3 && "3 pasos previos ya elegidos"}
                    {i === 4 && "Todo listo para confirmar"}
                  </span>
                </div>
                <DesktopWizardStep stepIdx={i} />
              </div>
            ))}
          </div>
        )}

        {/* Mobile grid */}
        {device === "mobile" && (
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-14 gap-x-8 justify-items-center">
            {STEPS.map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-black">
                    {i + 1}
                  </div>
                  <span className="text-sm font-bold text-foreground">{STEP_LABELS[STEPS[i]]}</span>
                </div>
                <MobileWizardStep stepIdx={i} />
              </div>
            ))}
          </div>
        )}

        {/* Footer note */}
        <div className="mt-14 max-w-2xl mx-auto p-5 rounded-2xl bg-white border border-border">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-2">
            Cómo se comporta en cada breakpoint
          </h3>
          <ul className="text-xs text-muted-foreground space-y-1.5">
            <li>• <b>Desktop (≥768px)</b>: sidebar oscuro fijo a la izquierda con timeline vertical + contacto siempre visible. Ideal para PC/tablet horizontal.</li>
            <li>• <b>Mobile (&lt;768px)</b>: el sidebar se convierte en una barra oscura arriba con progreso horizontal. Cada paso ocupa toda la pantalla del teléfono. Menos scroll, más foco.</li>
            <li>• Los cards y grids pasan de 2 columnas a 1 columna automáticamente.</li>
            <li>• En el paso Fecha, los horarios pasan de 6 columnas a 4 columnas para mantener tamaños tocables.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
