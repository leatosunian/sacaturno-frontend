"use client"

import { useState } from "react"
import {
  Check, ChevronLeft, ChevronRight, Sparkles, MapPin, Phone, User,
  CreditCard, CircleCheck, ExternalLink, ArrowLeft, Star, Heart,
} from "lucide-react"

// ─────────────────────────────────────────────────────────────
// Shared fake data
// ─────────────────────────────────────────────────────────────
const business = {
  name: "Estética Demo",
  subtitle: "Reservá tu turno online",
  rating: 5.0,
  reviewCount: 1,
}

const services = [
  { id: "1", name: "Limpieza facial", duration: 30, price: 49500, deposit: 24750 },
  { id: "2", name: "Masaje descontracturante", duration: 60, price: 42900, deposit: 0, desc: "Sesión de 30 minutos" },
  { id: "3", name: "Circuito Spa", duration: 90, price: 82500, deposit: 0 },
  { id: "4", name: "Jornada depilación - 13 junio", duration: 30, price: 16500, deposit: 8250 },
  { id: "5", name: "Primer consulta y evaluación", duration: 60, price: 16500, deposit: 8250, desc: "Evaluamos tu caso para asesorarte sobre el tratamiento que mejor se adapte." },
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
  "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30",
]

// ─────────────────────────────────────────────────────────────
// Wizard step types
// ─────────────────────────────────────────────────────────────
type StepKey = "service" | "branch" | "employee" | "date" | "confirm" | "done"
const STEP_LABELS: Record<StepKey, string> = {
  service: "Servicio",
  branch: "Sucursal",
  employee: "Profesional",
  date: "Fecha",
  confirm: "Confirmar",
  done: "Listo",
}
const STEPS: StepKey[] = ["service", "branch", "employee", "date", "confirm"]

interface WizardState {
  step: StepKey
  serviceId: string | null
  branchId: string | null
  employeeId: string | null | "any"
  dateKey: string | null
  time: string | null
}

const initialState: WizardState = {
  step: "service",
  serviceId: null,
  branchId: null,
  employeeId: null,
  dateKey: null,
  time: null,
}

function useWizard() {
  const [state, setState] = useState<WizardState>(initialState)
  const setStep = (step: StepKey) => setState((s) => ({ ...s, step }))
  const reset = () => setState(initialState)
  const goNext = () => {
    const idx = STEPS.indexOf(state.step)
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1])
    else setStep("done")
  }
  const goPrev = () => {
    const idx = STEPS.indexOf(state.step)
    if (idx > 0) setStep(STEPS[idx - 1])
  }
  const svc = services.find((s) => s.id === state.serviceId)
  const br = branches.find((b) => b.id === state.branchId)
  const emp = state.employeeId === "any" ? null : employees.find((e) => e.id === state.employeeId)
  const dt = dates.find((d) => d.key === state.dateKey)
  return { state, setState, setStep, reset, goNext, goPrev, svc, br, emp, dt }
}

// ═════════════════════════════════════════════════════════════
// VARIANT A — Vibrante Colorido (gradient warmth, playful)
// ═════════════════════════════════════════════════════════════
function VariantA() {
  const w = useWizard()
  const { state, setState, goNext, goPrev, svc, br, emp, dt, reset } = w
  const isDone = state.step === "done"

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-xl border border-border">
        {/* Vibrant gradient sidebar */}
        <aside className="md:w-80 md:shrink-0 relative bg-gradient-to-br from-orange-500 via-orange-600 to-pink-500 text-white p-8 md:p-10 overflow-hidden">
          <div className="absolute -top-16 -right-16 size-48 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-20 -left-16 size-56 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 size-4 rounded-full bg-yellow-300/60 pointer-events-none" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-14 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center">
                <span className="text-2xl font-black">{business.name[0]}</span>
              </div>
              <div>
                <h2 className="text-base font-black">{business.name}</h2>
                <div className="flex items-center gap-1 text-xs opacity-90">
                  <div className="flex">
                    {[0,1,2,3,4].map((i) => (
                      <Star key={i} className="size-3 fill-yellow-300 text-yellow-300" />
                    ))}
                  </div>
                  <span className="ml-1">{business.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div className="mb-6 p-3 rounded-2xl bg-white/15 backdrop-blur border border-white/20">
              <p className="text-xs font-semibold leading-relaxed flex items-start gap-2">
                <Sparkles className="size-4 shrink-0 mt-0.5" />
                <span>¡Hola! Reservar tu turno lleva menos de 1 minuto</span>
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              {STEPS.map((step, i) => {
                const currIdx = isDone ? STEPS.length : STEPS.indexOf(state.step)
                const isCurr = state.step === step
                const isDoneStep = currIdx > i
                return (
                  <button
                    key={step}
                    onClick={() => isDoneStep && w.setStep(step)}
                    disabled={!isDoneStep && !isCurr}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-left transition-all ${
                      isCurr
                        ? "bg-white shadow-lg scale-[1.02]"
                        : isDoneStep
                        ? "hover:bg-white/15 cursor-pointer"
                        : "opacity-50 cursor-default"
                    }`}
                  >
                    <div className={`size-8 rounded-full flex items-center justify-center shrink-0 text-sm font-black transition-all ${
                      isCurr
                        ? "bg-gradient-to-br from-orange-500 to-pink-500 text-white"
                        : isDoneStep
                        ? "bg-white/25 text-white"
                        : "bg-white/10 text-white/60 border border-white/25"
                    }`}>
                      {isDoneStep ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                    </div>
                    <span className={`text-sm font-bold ${isCurr ? "text-orange-700" : "text-white"}`}>
                      {STEP_LABELS[step]}
                    </span>
                  </button>
                )
              })}
            </div>
            <button onClick={reset} className="mt-6 text-xs text-white/70 hover:text-white underline">
              Reiniciar demo
            </button>
          </div>
        </aside>

        {/* Content */}
        <section className="flex-1 min-w-0 bg-white p-8 md:p-10">
          {state.step === "service" && (
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
                  Elegí tu servicio <Sparkles className="size-6 text-orange-500" />
                </h1>
                <p className="text-sm text-muted-foreground mt-1">¿Qué te haría feliz hoy?</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {services.map((s, idx) => {
                  const sel = state.serviceId === s.id
                  const palettes = [
                    "bg-orange-50 hover:border-orange-300",
                    "bg-pink-50 hover:border-pink-300",
                    "bg-amber-50 hover:border-amber-300",
                    "bg-rose-50 hover:border-rose-300",
                    "bg-orange-50 hover:border-orange-300",
                  ]
                  return (
                    <button
                      key={s.id}
                      onClick={() => { setState((v) => ({ ...v, serviceId: s.id })); goNext() }}
                      className={`text-left p-5 rounded-2xl border-2 transition-all hover:shadow-lg ${
                        sel
                          ? "border-orange-500 shadow-lg bg-gradient-to-br from-orange-50 to-pink-50"
                          : `border-transparent ${palettes[idx % palettes.length]}`
                      }`}
                    >
                      <div className="font-black text-base text-foreground">{s.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{s.duration} min</div>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <span className="text-lg font-black bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                          ${s.price.toLocaleString("es-AR")}
                        </span>
                        {s.deposit > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-orange-700 border border-orange-200">
                            Seña ${s.deposit.toLocaleString("es-AR")}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {state.step === "branch" && (
            <div className="flex flex-col gap-6">
              <button onClick={goPrev} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground w-fit">
                <ArrowLeft className="size-3.5" /> Volver
              </button>
              <div>
                <h1 className="text-3xl font-black tracking-tight">¿Dónde te queda cerca?</h1>
                <p className="text-sm text-muted-foreground mt-1">Elegí tu sucursal preferida</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {branches.map((b) => {
                  const sel = state.branchId === b.id
                  return (
                    <button
                      key={b.id}
                      onClick={() => { setState((v) => ({ ...v, branchId: b.id })); goNext() }}
                      className={`text-left p-5 rounded-2xl border-2 transition-all hover:shadow-lg ${
                        sel
                          ? "border-orange-500 bg-gradient-to-br from-orange-50 to-pink-50 shadow-lg"
                          : "border-transparent bg-orange-50/60 hover:border-orange-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-md">
                          <MapPin className="size-5 text-white" />
                        </div>
                        <div>
                          <div className="font-black">{b.name}</div>
                          <div className="text-xs text-muted-foreground">{b.address}</div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {state.step === "employee" && (
            <div className="flex flex-col gap-6">
              <button onClick={goPrev} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground w-fit">
                <ArrowLeft className="size-3.5" /> Volver
              </button>
              <div>
                <h1 className="text-3xl font-black tracking-tight">¿Con quién preferís?</h1>
                <p className="text-sm text-muted-foreground mt-1">Elegí un profesional</p>
              </div>
              <button
                onClick={() => { setState((v) => ({ ...v, employeeId: "any" })); goNext() }}
                className={`text-left p-5 rounded-2xl border-2 transition-all flex items-center gap-4 hover:shadow-lg ${
                  state.employeeId === "any"
                    ? "border-orange-500 bg-gradient-to-br from-orange-50 to-pink-50 shadow-lg"
                    : "border-transparent bg-amber-50/60 hover:border-amber-300"
                }`}
              >
                <div className="size-12 rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 flex items-center justify-center shadow-md">
                  <Sparkles className="size-5 text-white" />
                </div>
                <div>
                  <div className="font-black">Primero disponible</div>
                  <div className="text-xs text-muted-foreground">El turno más próximo</div>
                </div>
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {employees.map((e) => {
                  const sel = state.employeeId === e.id
                  return (
                    <button
                      key={e.id}
                      onClick={() => { setState((v) => ({ ...v, employeeId: e.id })); goNext() }}
                      className={`text-left p-5 rounded-2xl border-2 flex items-center gap-3 transition-all hover:shadow-lg ${
                        sel
                          ? "border-orange-500 bg-gradient-to-br from-orange-50 to-pink-50 shadow-lg"
                          : "border-transparent bg-pink-50/60 hover:border-pink-300"
                      }`}
                    >
                      <div className="size-12 rounded-2xl bg-gradient-to-br from-pink-400 to-orange-500 flex items-center justify-center text-lg font-black text-white shadow-md">
                        {e.initial}
                      </div>
                      <span className="font-black">{e.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {state.step === "date" && (
            <div className="flex flex-col gap-6">
              <button onClick={goPrev} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground w-fit">
                <ArrowLeft className="size-3.5" /> Volver
              </button>
              <div>
                <h1 className="text-3xl font-black tracking-tight">¿Cuándo te viene bien?</h1>
                {svc && <p className="text-sm text-muted-foreground mt-1">Para <b>{svc.name}</b></p>}
              </div>
              <div>
                <span className="text-xs uppercase font-bold text-muted-foreground mb-2 block tracking-wider">Día</span>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  {dates.map((d) => {
                    const sel = state.dateKey === d.key
                    return (
                      <button
                        key={d.key}
                        onClick={() => setState((v) => ({ ...v, dateKey: d.key }))}
                        className={`shrink-0 w-16 py-3 rounded-2xl flex flex-col items-center transition-all ${
                          sel
                            ? "bg-gradient-to-br from-orange-500 to-pink-500 text-white shadow-md"
                            : "bg-orange-50 hover:bg-orange-100"
                        }`}
                      >
                        <span className={`text-[10px] font-bold uppercase ${sel ? "text-white/80" : "text-muted-foreground"}`}>{d.day}</span>
                        <span className="text-lg font-black">{d.num}</span>
                        <span className={`text-[10px] font-semibold ${sel ? "text-white/80" : "text-muted-foreground"}`}>{d.month}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              {state.dateKey && (
                <div>
                  <span className="text-xs uppercase font-bold text-muted-foreground mb-2 block tracking-wider">Horario</span>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                    {times.map((t) => {
                      const sel = state.time === t
                      return (
                        <button
                          key={t}
                          onClick={() => setState((v) => ({ ...v, time: t }))}
                          className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                            sel
                              ? "bg-gradient-to-br from-orange-500 to-pink-500 text-white shadow-md"
                              : "bg-orange-50 hover:bg-orange-100 text-foreground"
                          }`}
                        >
                          {t}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
              <button
                disabled={!state.dateKey || !state.time}
                onClick={goNext}
                className={`h-12 rounded-full text-sm font-black uppercase tracking-wider transition-all ${
                  state.dateKey && state.time
                    ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg hover:shadow-xl"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                Continuar
              </button>
            </div>
          )}

          {state.step === "confirm" && (
            <div className="flex flex-col gap-6">
              <button onClick={goPrev} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground w-fit">
                <ArrowLeft className="size-3.5" /> Volver
              </button>
              <div>
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
                  ¡Casi listo! <Heart className="size-6 text-pink-500 fill-pink-500" />
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Solo faltan tus datos</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FakeInput label="Nombre" placeholder="Juan" />
                <FakeInput label="Teléfono" placeholder="11 1234 5678" />
              </div>
              <FakeInput label="Email" placeholder="juan@email.com" />
              <div className="rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-pink-500 p-6 text-white shadow-xl">
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/70">Tu turno</span>
                <div className="mt-3 flex flex-col gap-2.5">
                  <RowA label="Servicio" value={svc?.name ?? "—"} />
                  <RowA label="Fecha y hora" value={dt ? `${dt.day.toLowerCase()} ${dt.num} · ${state.time}` : "—"} />
                  {emp && <RowA label="Profesional" value={emp.name} />}
                  {state.employeeId === "any" && <RowA label="Profesional" value="Primero disponible" />}
                  {br && <RowA label="Sucursal" value={br.name} />}
                  {svc && svc.deposit > 0 && <RowA label="Seña" value={`$${svc.deposit.toLocaleString("es-AR")}`} />}
                  {svc && (
                    <div className="border-t border-white/20 pt-2.5 mt-1">
                      <div className="flex justify-between items-center">
                        <span className="text-white/80 text-sm">Total</span>
                        <span className="text-xl font-black">${svc.price.toLocaleString("es-AR")}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={goNext}
                className="h-14 rounded-full text-base font-black uppercase tracking-wider bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-xl hover:shadow-2xl flex items-center justify-center gap-2"
              >
                {svc && svc.deposit > 0 ? (<><ExternalLink className="size-5" /> Pagar seña · ${svc.deposit.toLocaleString("es-AR")}</>) : (<>Confirmar reserva</>)}
              </button>
            </div>
          )}

          {state.step === "done" && (
            <div className="flex flex-col items-center gap-4 py-10">
              <div className="size-24 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center shadow-xl">
                <Check className="text-white size-12" strokeWidth={3} />
              </div>
              <h1 className="text-3xl font-black">¡Reservado!</h1>
              <p className="text-sm text-muted-foreground text-center max-w-xs">Te enviamos la confirmación a tu email.</p>
              <button onClick={reset} className="mt-2 h-12 px-8 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-black shadow-lg">
                Reservar otro turno
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function RowA({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-white/70">{label}</span>
      <div className="text-right font-bold">{value}</div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════
// VARIANT B — Premium Oscuro
// ═════════════════════════════════════════════════════════════
function VariantB() {
  const w = useWizard()
  const { state, setState, goNext, goPrev, svc, br, emp, dt, reset } = w
  const isDone = state.step === "done"

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row gap-4 rounded-3xl bg-white border border-border overflow-hidden shadow-xl">
        {/* Dark sidebar */}
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
                const currIdx = isDone ? STEPS.length : STEPS.indexOf(state.step)
                const isCurr = state.step === step
                const isDoneStep = currIdx > i
                return (
                  <button
                    key={step}
                    onClick={() => isDoneStep && w.setStep(step)}
                    disabled={!isDoneStep && !isCurr}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                      isCurr ? "bg-white/10" : isDoneStep ? "hover:bg-white/5 cursor-pointer" : "opacity-40 cursor-default"
                    }`}
                  >
                    <div className="size-6 shrink-0 flex items-center justify-center">
                      {isDoneStep ? (
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
                    <span className={`text-sm font-semibold ${isCurr ? "text-white" : isDoneStep ? "text-white/80" : "text-white/40"}`}>
                      {STEP_LABELS[step]}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
          <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-2">¿Necesitás ayuda?</span>
            <div className="flex items-center gap-2 text-xs text-white/80"><Phone className="size-3" /> 11 5678 1234</div>
            <div className="flex items-center gap-2 text-xs text-white/80 mt-1"><MapPin className="size-3" /> Av. Santa Fe 3521</div>
          </div>
          <button onClick={reset} className="mt-4 text-xs text-white/40 hover:text-white/70 underline">Reiniciar demo</button>
        </aside>

        {/* Content */}
        <section className="flex-1 min-w-0 p-8 md:p-10">
          {state.step === "service" && (
            <div className="flex flex-col gap-6">
              <div>
                <span className="text-xs uppercase tracking-widest text-orange-600 font-bold">Paso 1 de 5</span>
                <h1 className="text-3xl font-black tracking-tight mt-1">Elegí tu servicio</h1>
                <p className="text-sm text-muted-foreground mt-1">¿Qué querés reservar hoy?</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {services.map((s) => {
                  const sel = state.serviceId === s.id
                  return (
                    <button
                      key={s.id}
                      onClick={() => { setState((v) => ({ ...v, serviceId: s.id })); goNext() }}
                      className={`text-left p-5 rounded-2xl border transition-all group ${
                        sel ? "border-neutral-900 bg-neutral-50 shadow-md" : "border-border bg-white hover:border-neutral-400 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="font-bold text-base">{s.name}</span>
                        <span className={`transition-all ${sel ? "text-neutral-900" : "text-muted-foreground/40 group-hover:text-muted-foreground"}`}>
                          <ChevronRight className="size-4" />
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">{s.duration} min</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="font-bold">${s.price.toLocaleString("es-AR")}</span>
                      </div>
                      {s.deposit > 0 && (
                        <div className="mt-2 inline-block px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold">
                          Seña ${s.deposit.toLocaleString("es-AR")}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {state.step === "branch" && (
            <div className="flex flex-col gap-6">
              <div>
                <button onClick={goPrev} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3">
                  <ArrowLeft className="size-3.5" /> Volver
                </button>
                <span className="text-xs uppercase tracking-widest text-orange-600 font-bold">Paso 2 de 5</span>
                <h1 className="text-3xl font-black tracking-tight mt-1">¿Dónde querés atenderte?</h1>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {branches.map((b) => {
                  const sel = state.branchId === b.id
                  return (
                    <button
                      key={b.id}
                      onClick={() => { setState((v) => ({ ...v, branchId: b.id })); goNext() }}
                      className={`text-left p-5 rounded-2xl border transition-all ${
                        sel ? "border-neutral-900 bg-neutral-50 shadow-md" : "border-border hover:border-neutral-400 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-lg bg-orange-100 flex items-center justify-center">
                            <MapPin className="size-4 text-orange-700" />
                          </div>
                          <div>
                            <div className="font-bold">{b.name}</div>
                            <div className="text-xs text-muted-foreground">{b.address}</div>
                          </div>
                        </div>
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {state.step === "employee" && (
            <div className="flex flex-col gap-6">
              <div>
                <button onClick={goPrev} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3">
                  <ArrowLeft className="size-3.5" /> Volver
                </button>
                <span className="text-xs uppercase tracking-widest text-orange-600 font-bold">Paso 3 de 5</span>
                <h1 className="text-3xl font-black tracking-tight mt-1">¿Con quién preferís?</h1>
              </div>
              <button
                onClick={() => { setState((v) => ({ ...v, employeeId: "any" })); goNext() }}
                className={`text-left p-5 rounded-2xl border transition-all flex items-center gap-3 ${
                  state.employeeId === "any" ? "border-neutral-900 bg-neutral-50 shadow-md" : "border-border hover:border-neutral-400"
                }`}
              >
                <div className="size-11 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                  <Sparkles className="size-5 text-white" />
                </div>
                <div>
                  <div className="font-bold">Primero disponible</div>
                  <div className="text-xs text-muted-foreground">Cualquier profesional</div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground ml-auto" />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {employees.map((e) => {
                  const sel = state.employeeId === e.id
                  return (
                    <button
                      key={e.id}
                      onClick={() => { setState((v) => ({ ...v, employeeId: e.id })); goNext() }}
                      className={`text-left p-5 rounded-2xl border flex items-center gap-3 transition-all ${
                        sel ? "border-neutral-900 bg-neutral-50 shadow-md" : "border-border hover:border-neutral-400"
                      }`}
                    >
                      <div className="size-11 rounded-full bg-neutral-100 border border-border flex items-center justify-center text-sm font-bold">
                        {e.initial}
                      </div>
                      <span className="font-bold">{e.name}</span>
                      <ChevronRight className="size-4 text-muted-foreground ml-auto" />
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {state.step === "date" && (
            <div className="flex flex-col gap-6">
              <div>
                <button onClick={goPrev} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3">
                  <ArrowLeft className="size-3.5" /> Volver
                </button>
                <span className="text-xs uppercase tracking-widest text-orange-600 font-bold">Paso 4 de 5</span>
                <h1 className="text-3xl font-black tracking-tight mt-1">Fecha y hora</h1>
                {svc && <p className="text-sm text-muted-foreground mt-1">Para <b>{svc.name}</b> · {svc.duration} min</p>}
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2 block">Elegí un día</span>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  {dates.map((d) => {
                    const sel = state.dateKey === d.key
                    return (
                      <button
                        key={d.key}
                        onClick={() => setState((v) => ({ ...v, dateKey: d.key }))}
                        className={`shrink-0 w-16 py-3 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                          sel ? "border-neutral-900 bg-neutral-900 text-white shadow-md" : "border-border bg-white hover:border-neutral-400"
                        }`}
                      >
                        <span className={`text-[10px] font-bold uppercase leading-none ${sel ? "text-white/70" : "text-muted-foreground"}`}>{d.day}</span>
                        <span className="text-lg font-black leading-tight mt-1">{d.num}</span>
                        <span className={`text-[10px] font-semibold mt-0.5 ${sel ? "text-white/70" : "text-muted-foreground"}`}>{d.month}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2 block">Elegí un horario</span>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                  {times.map((t) => {
                    const sel = state.time === t
                    return (
                      <button
                        key={t}
                        onClick={() => setState((v) => ({ ...v, time: t }))}
                        className={`py-2.5 rounded-lg border text-sm font-bold transition-all ${
                          sel ? "border-neutral-900 bg-neutral-900 text-white shadow-md" : "border-border hover:border-neutral-400"
                        }`}
                      >
                        {t}
                      </button>
                    )
                  })}
                </div>
              </div>
              <button
                disabled={!state.dateKey || !state.time}
                onClick={goNext}
                className={`h-12 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                  state.dateKey && state.time ? "bg-neutral-900 text-white hover:bg-neutral-800" : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                Continuar
              </button>
            </div>
          )}

          {state.step === "confirm" && (
            <div className="flex flex-col gap-6">
              <div>
                <button onClick={goPrev} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3">
                  <ArrowLeft className="size-3.5" /> Volver
                </button>
                <span className="text-xs uppercase tracking-widest text-orange-600 font-bold">Paso 5 de 5</span>
                <h1 className="text-3xl font-black tracking-tight mt-1">Casi listo</h1>
                <p className="text-sm text-muted-foreground mt-1">Completá tus datos y confirmá.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FakeInput label="Nombre" placeholder="Juan" />
                <FakeInput label="Teléfono" placeholder="11 1234 5678" />
              </div>
              <FakeInput label="Email" placeholder="juan@email.com" />
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 flex flex-col gap-3">
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Resumen</span>
                <RowB label="Servicio" value={svc?.name ?? "—"} />
                <RowB label="Fecha y hora" value={dt ? `${dt.day.toLowerCase()} ${dt.num} de julio · ${state.time}` : "—"} />
                {emp && <RowB label="Profesional" value={emp.name} />}
                {state.employeeId === "any" && <RowB label="Profesional" value="Primero disponible" />}
                {br && <RowB label="Sucursal" value={br.name} />}
                {svc && svc.deposit > 0 && <RowB label="Seña" value={<span className="text-orange-600 font-bold">${svc.deposit.toLocaleString("es-AR")}</span>} />}
                {svc && <div className="border-t border-border pt-3 mt-1"><RowB label="Total" value={<span className="text-lg font-black">${svc.price.toLocaleString("es-AR")}</span>} /></div>}
              </div>
              <button
                onClick={goNext}
                className="h-12 rounded-xl text-sm font-bold uppercase tracking-wider bg-neutral-900 text-white hover:bg-neutral-800 flex items-center justify-center gap-2"
              >
                {svc && svc.deposit > 0 ? (<><ExternalLink className="size-4" /> Pagar seña · ${svc.deposit.toLocaleString("es-AR")}</>) : (<>Confirmar reserva</>)}
              </button>
            </div>
          )}

          {state.step === "done" && (
            <div className="flex flex-col items-center gap-4 py-10">
              <div className="size-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CircleCheck className="text-emerald-500 size-12" />
              </div>
              <h1 className="text-3xl font-black">Turno reservado</h1>
              <p className="text-sm text-muted-foreground text-center max-w-xs">Te enviamos la confirmación a tu email. Nos vemos pronto.</p>
              <button onClick={reset} className="mt-2 h-11 px-6 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-bold">
                Reservar otro turno
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function RowB({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="text-right font-semibold text-foreground">{typeof value === "function" ? value() : value}</div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════
// VARIANT C — Minimalista horizontal (no sidebar)
// ═════════════════════════════════════════════════════════════
function VariantC() {
  const w = useWizard()
  const { state, setState, goNext, goPrev, svc, br, emp, dt, reset } = w
  const isDone = state.step === "done"
  const currIdx = isDone ? STEPS.length : STEPS.indexOf(state.step)

  return (
    <div className="w-full max-w-3xl mx-auto rounded-3xl bg-white border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 md:px-10 pt-8 pb-4 border-b border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-12 rounded-full bg-orange-100 flex items-center justify-center">
            <span className="text-base font-black text-orange-700">{business.name[0]}</span>
          </div>
          <div className="flex-1">
            <h2 className="font-bold">{business.name}</h2>
            <p className="text-xs text-muted-foreground">{business.subtitle}</p>
          </div>
          <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground underline">Reiniciar</button>
        </div>
        {/* Progress bar */}
        <div className="flex items-center gap-1">
          {STEPS.map((step, i) => {
            const isCurr = state.step === step
            const isDoneStep = currIdx > i
            return (
              <div key={step} className="flex-1 flex flex-col items-center gap-1.5">
                <div className={`w-full h-1.5 rounded-full transition-colors ${
                  isDoneStep ? "bg-orange-600" : isCurr ? "bg-orange-600" : "bg-muted"
                }`} />
                <div className="flex items-center gap-1.5">
                  <div className={`size-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                    isDoneStep ? "bg-orange-600 text-white" : isCurr ? "bg-orange-600 text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    {isDoneStep ? <Check className="size-2.5" strokeWidth={3} /> : i + 1}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:block ${
                    isCurr ? "text-orange-600" : isDoneStep ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {STEP_LABELS[step]}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 md:px-10 py-8">
        {state.step === "service" && (
          <div className="flex flex-col gap-5">
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-black">¿Qué querés reservar?</h1>
              <p className="text-sm text-muted-foreground mt-1">Elegí un servicio para continuar</p>
            </div>
            <div className="flex flex-col gap-2 max-w-lg mx-auto w-full">
              {services.map((s) => {
                const sel = state.serviceId === s.id
                return (
                  <button
                    key={s.id}
                    onClick={() => { setState((v) => ({ ...v, serviceId: s.id })); goNext() }}
                    className={`text-left p-4 rounded-xl border-2 flex items-center justify-between gap-4 transition-all ${
                      sel ? "border-orange-500 bg-orange-50" : "border-border bg-white hover:border-orange-300"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-bold">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.duration} min{s.deposit > 0 && <> · seña ${s.deposit.toLocaleString("es-AR")}</>}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-black text-orange-600">${s.price.toLocaleString("es-AR")}</div>
                      <ChevronRight className="size-4 text-muted-foreground ml-auto" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {state.step === "branch" && (
          <div className="flex flex-col gap-5">
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-black">¿En qué sucursal?</h1>
              <p className="text-sm text-muted-foreground mt-1">Elegí dónde querés atenderte</p>
            </div>
            <div className="flex flex-col gap-2 max-w-lg mx-auto w-full">
              {branches.map((b) => {
                const sel = state.branchId === b.id
                return (
                  <button
                    key={b.id}
                    onClick={() => { setState((v) => ({ ...v, branchId: b.id })); goNext() }}
                    className={`p-4 rounded-xl border-2 flex items-center gap-3 text-left transition-all ${
                      sel ? "border-orange-500 bg-orange-50" : "border-border hover:border-orange-300"
                    }`}
                  >
                    <div className="size-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                      <MapPin className="size-4 text-orange-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold">{b.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{b.address}</div>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </button>
                )
              })}
            </div>
            <button onClick={goPrev} className="text-sm text-muted-foreground hover:text-foreground mx-auto">← Volver</button>
          </div>
        )}

        {state.step === "employee" && (
          <div className="flex flex-col gap-5">
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-black">¿Con quién?</h1>
              <p className="text-sm text-muted-foreground mt-1">Elegí un profesional</p>
            </div>
            <div className="flex flex-col gap-2 max-w-lg mx-auto w-full">
              <button
                onClick={() => { setState((v) => ({ ...v, employeeId: "any" })); goNext() }}
                className={`p-4 rounded-xl border-2 flex items-center gap-3 text-left transition-all ${
                  state.employeeId === "any" ? "border-orange-500 bg-orange-50" : "border-border hover:border-orange-300"
                }`}
              >
                <div className="size-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shrink-0">
                  <Sparkles className="size-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-bold">Primero disponible</div>
                  <div className="text-xs text-muted-foreground">Cualquier profesional</div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </button>
              {employees.map((e) => {
                const sel = state.employeeId === e.id
                return (
                  <button
                    key={e.id}
                    onClick={() => { setState((v) => ({ ...v, employeeId: e.id })); goNext() }}
                    className={`p-4 rounded-xl border-2 flex items-center gap-3 text-left transition-all ${
                      sel ? "border-orange-500 bg-orange-50" : "border-border hover:border-orange-300"
                    }`}
                  >
                    <div className="size-10 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-sm font-bold text-orange-700 shrink-0">
                      {e.initial}
                    </div>
                    <span className="font-bold flex-1">{e.name}</span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </button>
                )
              })}
            </div>
            <button onClick={goPrev} className="text-sm text-muted-foreground hover:text-foreground mx-auto">← Volver</button>
          </div>
        )}

        {state.step === "date" && (
          <div className="flex flex-col gap-5">
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-black">¿Cuándo?</h1>
              {svc && <p className="text-sm text-muted-foreground mt-1">Para <b>{svc.name}</b></p>}
            </div>
            <div>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {dates.map((d) => {
                  const sel = state.dateKey === d.key
                  return (
                    <button
                      key={d.key}
                      onClick={() => setState((v) => ({ ...v, dateKey: d.key }))}
                      className={`shrink-0 w-16 py-3 rounded-xl border-2 flex flex-col items-center transition-all ${
                        sel ? "border-orange-500 bg-orange-50 text-orange-700" : "border-border hover:border-orange-300"
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase">{d.day}</span>
                      <span className="text-lg font-black">{d.num}</span>
                      <span className="text-[10px]">{d.month}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            {state.dateKey && (
              <div className="grid grid-cols-4 gap-2">
                {times.map((t) => {
                  const sel = state.time === t
                  return (
                    <button
                      key={t}
                      onClick={() => setState((v) => ({ ...v, time: t }))}
                      className={`py-2.5 rounded-lg border-2 text-sm font-bold transition-all ${
                        sel ? "border-orange-600 bg-orange-600 text-white" : "border-border hover:border-orange-400"
                      }`}
                    >
                      {t}
                    </button>
                  )
                })}
              </div>
            )}
            <div className="flex items-center justify-between gap-4">
              <button onClick={goPrev} className="text-sm text-muted-foreground hover:text-foreground">← Volver</button>
              <button
                disabled={!state.dateKey || !state.time}
                onClick={goNext}
                className={`h-11 px-8 rounded-full text-sm font-bold uppercase tracking-wider transition-all ${
                  state.dateKey && state.time ? "bg-orange-600 text-white hover:bg-orange-700" : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {state.step === "confirm" && (
          <div className="flex flex-col gap-5">
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-black">Casi listo</h1>
              <p className="text-sm text-muted-foreground mt-1">Confirmá tus datos</p>
            </div>
            <div className="max-w-md mx-auto w-full flex flex-col gap-4">
              <FakeInput label="Nombre" placeholder="Juan" />
              <FakeInput label="Teléfono" placeholder="11 1234 5678" />
              <FakeInput label="Email" placeholder="juan@email.com" />

              <div className="rounded-xl border-2 border-dashed border-border p-4 flex flex-col gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Tu turno</span>
                <RowC label="Servicio" value={svc?.name ?? "—"} />
                <RowC label="Fecha" value={dt ? `${dt.day.toLowerCase()} ${dt.num} de julio · ${state.time}` : "—"} />
                {emp && <RowC label="Profesional" value={emp.name} />}
                {state.employeeId === "any" && <RowC label="Profesional" value="Primero disponible" />}
                {br && <RowC label="Sucursal" value={br.name} />}
                {svc && <div className="border-t border-border pt-2 mt-1 flex items-center justify-between text-sm"><span>Total</span><span className="font-black text-lg text-orange-600">${svc.price.toLocaleString("es-AR")}</span></div>}
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 max-w-md mx-auto w-full">
              <button onClick={goPrev} className="text-sm text-muted-foreground hover:text-foreground">← Volver</button>
              <button
                onClick={goNext}
                className="h-12 px-6 rounded-full text-sm font-bold uppercase tracking-wider bg-orange-600 text-white hover:bg-orange-700 flex items-center gap-2"
              >
                {svc && svc.deposit > 0 ? (<><ExternalLink className="size-4" /> Pagar seña</>) : (<>Confirmar</>)}
              </button>
            </div>
          </div>
        )}

        {state.step === "done" && (
          <div className="flex flex-col items-center gap-4 py-10">
            <CircleCheck className="text-green-500 size-16" />
            <h1 className="text-3xl font-black">¡Reservado!</h1>
            <p className="text-sm text-muted-foreground text-center max-w-xs">Te enviamos la confirmación a tu email.</p>
            <button onClick={reset} className="mt-2 h-11 px-6 rounded-full bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold">
              Reservar otro turno
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function RowC({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════
// VARIANT D — Corporativo / Confianza (clean, list-based, sharp)
// ═════════════════════════════════════════════════════════════
function VariantD() {
  const w = useWizard()
  const { state, setState, goNext, goPrev, svc, br, emp, dt, reset } = w
  const isDone = state.step === "done"

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row bg-white border border-border">
        {/* Clean minimal sidebar */}
        <aside className="md:w-72 md:shrink-0 bg-white p-8 md:border-r md:border-border">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border">
            <div className="size-11 rounded-md bg-neutral-100 border border-border flex items-center justify-center">
              <span className="text-base font-bold text-neutral-700">{business.name[0]}</span>
            </div>
            <div>
              <h2 className="text-sm font-bold">{business.name}</h2>
              <p className="text-[11px] text-muted-foreground">{business.subtitle}</p>
            </div>
          </div>

          <div className="mb-6">
            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Reserva</span>
          </div>

          <div className="relative">
            <div className="absolute left-[13px] top-3 bottom-3 w-px bg-border" />
            <div className="flex flex-col gap-4">
              {STEPS.map((step, i) => {
                const currIdx = isDone ? STEPS.length : STEPS.indexOf(state.step)
                const isCurr = state.step === step
                const isDoneStep = currIdx > i
                return (
                  <button
                    key={step}
                    onClick={() => isDoneStep && w.setStep(step)}
                    disabled={!isDoneStep && !isCurr}
                    className={`relative flex items-center gap-3 text-left transition-all ${
                      isDoneStep ? "cursor-pointer" : !isCurr ? "cursor-default" : ""
                    }`}
                  >
                    <div className={`size-7 rounded-full flex items-center justify-center shrink-0 border-2 text-xs font-bold z-10 transition-all ${
                      isCurr
                        ? "border-orange-600 bg-orange-600 text-white"
                        : isDoneStep
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-border bg-white text-muted-foreground"
                    }`}>
                      {isDoneStep ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-[10px] uppercase tracking-wider font-semibold ${
                        isCurr ? "text-orange-600" : isDoneStep ? "text-neutral-500" : "text-muted-foreground"
                      }`}>
                        Paso {i + 1}
                      </span>
                      <span className={`text-sm font-bold ${
                        isCurr ? "text-foreground" : isDoneStep ? "text-foreground" : "text-muted-foreground"
                      }`}>
                        {STEP_LABELS[step]}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-3">Contacto</div>
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5"><Phone className="size-3" /> 11 5678 1234</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1.5"><MapPin className="size-3" /> Av. Santa Fe 3521</div>
          </div>

          <button onClick={reset} className="mt-6 text-xs text-muted-foreground hover:text-foreground underline">Reiniciar demo</button>
        </aside>

        {/* Content */}
        <section className="flex-1 min-w-0 p-8 md:p-12">
          {state.step === "service" && (
            <div className="flex flex-col gap-6">
              <div className="pb-4 border-b border-border">
                <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Servicio</span>
                <h1 className="text-2xl font-bold text-foreground mt-1">Seleccionar servicio</h1>
                <p className="text-sm text-muted-foreground mt-1">Elegí el servicio que querés reservar.</p>
              </div>
              <div className="flex flex-col divide-y divide-border">
                {services.map((s) => {
                  const sel = state.serviceId === s.id
                  return (
                    <button
                      key={s.id}
                      onClick={() => { setState((v) => ({ ...v, serviceId: s.id })); goNext() }}
                      className={`text-left py-4 flex items-start justify-between gap-4 transition-colors group ${sel ? "" : "hover:bg-neutral-50 -mx-2 px-2"}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-base">{s.name}</span>
                          {sel && <span className="text-[10px] font-bold uppercase text-orange-600">Seleccionado</span>}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {s.duration} minutos {s.deposit > 0 && <>· Requiere seña ${s.deposit.toLocaleString("es-AR")}</>}
                        </div>
                        {s.desc && <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{s.desc}</p>}
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end gap-1">
                        <span className="font-bold text-base tabular-nums">${s.price.toLocaleString("es-AR")}</span>
                        <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground" />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {state.step === "branch" && (
            <div className="flex flex-col gap-6">
              <div className="pb-4 border-b border-border">
                <button onClick={goPrev} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2">
                  <ArrowLeft className="size-3.5" /> Volver
                </button>
                <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Sucursal</span>
                <h1 className="text-2xl font-bold mt-1">Seleccionar sucursal</h1>
              </div>
              <div className="flex flex-col divide-y divide-border">
                {branches.map((b) => {
                  return (
                    <button
                      key={b.id}
                      onClick={() => { setState((v) => ({ ...v, branchId: b.id })); goNext() }}
                      className="text-left py-4 flex items-start justify-between gap-4 transition-colors group hover:bg-neutral-50 -mx-2 px-2"
                    >
                      <div className="flex items-start gap-3">
                        <MapPin className="size-5 text-neutral-500 mt-0.5" />
                        <div>
                          <div className="font-bold">{b.name}</div>
                          <div className="text-xs text-muted-foreground">{b.address}</div>
                        </div>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground" />
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {state.step === "employee" && (
            <div className="flex flex-col gap-6">
              <div className="pb-4 border-b border-border">
                <button onClick={goPrev} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2">
                  <ArrowLeft className="size-3.5" /> Volver
                </button>
                <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Profesional</span>
                <h1 className="text-2xl font-bold mt-1">Seleccionar profesional</h1>
              </div>
              <div className="flex flex-col divide-y divide-border">
                <button
                  onClick={() => { setState((v) => ({ ...v, employeeId: "any" })); goNext() }}
                  className="text-left py-4 flex items-center justify-between gap-4 transition-colors group hover:bg-neutral-50 -mx-2 px-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-neutral-100 border border-border flex items-center justify-center">
                      <Sparkles className="size-4 text-neutral-600" />
                    </div>
                    <div>
                      <div className="font-bold">Primero disponible</div>
                      <div className="text-xs text-muted-foreground">Sin preferencia de profesional</div>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground" />
                </button>
                {employees.map((e) => {
                  return (
                    <button
                      key={e.id}
                      onClick={() => { setState((v) => ({ ...v, employeeId: e.id })); goNext() }}
                      className="text-left py-4 flex items-center justify-between gap-4 transition-colors group hover:bg-neutral-50 -mx-2 px-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-neutral-100 border border-border flex items-center justify-center text-xs font-bold text-neutral-700">
                          {e.initial}
                        </div>
                        <span className="font-bold">{e.name}</span>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground" />
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {state.step === "date" && (
            <div className="flex flex-col gap-6">
              <div className="pb-4 border-b border-border">
                <button onClick={goPrev} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2">
                  <ArrowLeft className="size-3.5" /> Volver
                </button>
                <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Fecha y hora</span>
                <h1 className="text-2xl font-bold mt-1">Seleccionar día y horario</h1>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-2 block">Día</span>
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
                  {dates.map((d) => {
                    const sel = state.dateKey === d.key
                    return (
                      <button
                        key={d.key}
                        onClick={() => setState((v) => ({ ...v, dateKey: d.key }))}
                        className={`shrink-0 w-14 py-2.5 border transition-all ${
                          sel ? "border-orange-600 bg-orange-600 text-white" : "border-border bg-white hover:border-neutral-400"
                        }`}
                      >
                        <span className={`text-[10px] font-bold uppercase leading-none block ${sel ? "text-white/80" : "text-muted-foreground"}`}>{d.day}</span>
                        <span className="text-lg font-bold leading-tight mt-1 block">{d.num}</span>
                        <span className={`text-[10px] font-semibold mt-0.5 block ${sel ? "text-white/80" : "text-muted-foreground"}`}>{d.month}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-2 block">Horario</span>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-1.5">
                  {times.map((t) => {
                    const sel = state.time === t
                    return (
                      <button
                        key={t}
                        onClick={() => setState((v) => ({ ...v, time: t }))}
                        className={`py-2 text-sm font-semibold border transition-all tabular-nums ${
                          sel ? "border-orange-600 bg-orange-600 text-white" : "border-border bg-white hover:border-neutral-400"
                        }`}
                      >
                        {t}
                      </button>
                    )
                  })}
                </div>
              </div>
              <button
                disabled={!state.dateKey || !state.time}
                onClick={goNext}
                className={`h-11 text-sm font-bold uppercase tracking-wider transition-all ${
                  state.dateKey && state.time ? "bg-neutral-900 text-white hover:bg-neutral-800" : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                Continuar
              </button>
            </div>
          )}

          {state.step === "confirm" && (
            <div className="flex flex-col gap-6">
              <div className="pb-4 border-b border-border">
                <button onClick={goPrev} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2">
                  <ArrowLeft className="size-3.5" /> Volver
                </button>
                <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Confirmación</span>
                <h1 className="text-2xl font-bold mt-1">Datos del cliente</h1>
                <p className="text-sm text-muted-foreground mt-1">Completá tus datos para finalizar la reserva.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FakeInput label="Nombre completo" placeholder="Juan Pérez" />
                <FakeInput label="Teléfono" placeholder="11 1234 5678" />
              </div>
              <FakeInput label="Correo electrónico" placeholder="juan@email.com" />
              <div className="border border-border p-6">
                <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-4">Detalle de la reserva</div>
                <div className="flex flex-col divide-y divide-border">
                  <RowD label="Servicio" value={svc?.name ?? "—"} />
                  <RowD label="Fecha y hora" value={dt ? `${dt.day.toLowerCase()} ${dt.num} de julio · ${state.time}` : "—"} />
                  {emp && <RowD label="Profesional" value={emp.name} />}
                  {state.employeeId === "any" && <RowD label="Profesional" value="Primero disponible" />}
                  {br && <RowD label="Sucursal" value={br.name} />}
                  {svc && svc.deposit > 0 && <RowD label="Seña" value={`$${svc.deposit.toLocaleString("es-AR")}`} />}
                  {svc && (
                    <div className="py-3 flex items-center justify-between">
                      <span className="text-sm font-bold uppercase tracking-wider">Total</span>
                      <span className="text-xl font-bold tabular-nums">${svc.price.toLocaleString("es-AR")}</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={goNext}
                className="h-12 text-sm font-bold uppercase tracking-wider bg-neutral-900 text-white hover:bg-neutral-800 flex items-center justify-center gap-2"
              >
                {svc && svc.deposit > 0 ? (<><ExternalLink className="size-4" /> Pagar seña · ${svc.deposit.toLocaleString("es-AR")}</>) : (<>Confirmar reserva</>)}
              </button>
              <p className="text-[11px] text-muted-foreground text-center">Al confirmar aceptás los términos y condiciones.</p>
            </div>
          )}

          {state.step === "done" && (
            <div className="flex flex-col items-center gap-4 py-14">
              <div className="size-14 border-2 border-neutral-900 flex items-center justify-center">
                <Check className="text-neutral-900 size-8" strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl font-bold">Reserva confirmada</h1>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                Recibirás un correo con los detalles de tu turno.
              </p>
              <button onClick={reset} className="mt-2 h-11 px-6 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-bold uppercase tracking-wider">
                Reservar otro turno
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function RowD({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="py-3 flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="text-right font-semibold">{value}</div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Reusable FakeInput
// ─────────────────────────────────────────────────────────────
function FakeInput({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
      <input
        placeholder={placeholder}
        className="h-11 px-3 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all"
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
type VariantKey = "A" | "B" | "C" | "D"

export default function PreviewBookingPage() {
  const [active, setActive] = useState<VariantKey>("A")

  const tabs: { key: VariantKey; label: string }[] = [
    { key: "A", label: "A — Vibrante" },
    { key: "B", label: "B — Premium" },
    { key: "C", label: "C — Minimal" },
    { key: "D", label: "D — Corporativo" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-orange-50/30">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
        <div className="text-center mb-8">
          <span className="inline-block text-[10px] uppercase tracking-widest font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full mb-3">
            Preview interactivo de rediseño
          </span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground mb-2">
            Elegí la dirección
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Cada variante es un wizard completamente interactivo. Recorré el flujo completo (Servicio → Sucursal → Profesional → Fecha → Confirmar) para ver cómo se siente cada una.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8 sticky top-4 z-20 px-2">
          <div className="flex gap-1 p-1 rounded-full bg-white shadow-md border border-border overflow-x-auto max-w-full">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
                  active === t.key ? "bg-orange-600 text-white" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active preview */}
        <div>
          {active === "A" && <VariantA />}
          {active === "B" && <VariantB />}
          {active === "C" && <VariantC />}
          {active === "D" && <VariantD />}
        </div>

        {/* Notes */}
        <div className="mt-8 p-5 rounded-2xl bg-white border border-border">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3">
            {active === "A" && "Variante A — Vibrante Colorido"}
            {active === "B" && "Variante B — Premium Oscuro"}
            {active === "C" && "Variante C — Minimal Horizontal"}
            {active === "D" && "Variante D — Corporativo / Confianza"}
          </h3>
          <ul className="text-xs text-muted-foreground space-y-1.5">
            {active === "A" && (
              <>
                <li>• Sidebar con gradiente cálido (naranja → rosa) — visual amigable y moderno</li>
                <li>• Cards de servicios con fondos pastel diferenciados por color</li>
                <li>• Botones grandes redondeados con gradiente y shadow fuerte</li>
                <li>• Precio con gradiente en el texto — feel wellness / estética premium</li>
                <li>• Público joven, rubros de belleza/spa; rompe con las capturas de referencia</li>
              </>
            )}
            {active === "B" && (
              <>
                <li>• Sidebar oscuro con branding premium y contacto siempre visible</li>
                <li>• Pasos completados con checkmark verde — feedback claro</li>
                <li>• Títulos grandes y editoriales — sensación cuidada</li>
                <li>• Bloque de ayuda con teléfono y dirección en el sidebar</li>
                <li>• Botones acción negros — contraste alto</li>
              </>
            )}
            {active === "C" && (
              <>
                <li>• Sin sidebar — todo el ancho para el contenido, ideal mobile</li>
                <li>• Barra de progreso horizontal con números + labels</li>
                <li>• Contenido centrado, títulos grandes tipo Typeform</li>
                <li>• Cada paso enfoca UNA sola decisión — mínima carga cognitiva</li>
                <li>• Más informal y directo — se siente rápido</li>
              </>
            )}
            {active === "D" && (
              <>
                <li>• Sidebar blanco limpio con timeline vertical clásico (punto + línea)</li>
                <li>• Bordes rectos, tipografía sana, cero gradientes ni shadows</li>
                <li>• Servicios como lista con dividers (no cards) — feel de tabla profesional</li>
                <li>• Naranja solo en el paso activo, negro en los CTAs — sobrio</li>
                <li>• Rubros formales: consultorio, clínica, servicio B2B, estudio jurídico</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
