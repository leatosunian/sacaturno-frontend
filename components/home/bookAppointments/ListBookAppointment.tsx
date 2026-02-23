"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, CalendarDays, Info, Tag } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { IAppointment } from "@/interfaces/appointment.interface"
import { IBusiness } from "@/interfaces/business.interface"
import { IDaySchedule } from "@/interfaces/daySchedule.interface"
import BookAppointmentModal from "./BookAppointmentModal"
import axiosReq from "@/config/axios"
import { TimeSlotMobile } from "./ListBookAppointment/TimeSlotMobile"
import { TimeSlot } from "./ListBookAppointment/TimeSlot"

// ── Timezone config ─────────────────────────────────────────
const ARG_TZ_OFFSET_HOURS = -3 // Buenos Aires (UTC-3)
const TZ_MS = ARG_TZ_OFFSET_HOURS * 60 * 60 * 1000

// ── Helpers ─────────────────────────────────────────────────

function toISOString(v: Date | string): string {
  const d = typeof v === "string" ? new Date(v) : v
  const adjusted = new Date(d.getTime() + TZ_MS)
  return adjusted.toISOString()
}

function extractDateStr(iso: string): string {
  return iso.slice(0, 10)
}

function extractTime(iso: string): string {
  const m = iso.match(/T(\d{2}:\d{2})/)
  return m ? m[1] : "00:00"
}

// Create a Date for a given dateStr but adjusted to the configured TZ.
// Uses midday UTC as a base to avoid boundary issues, then applies TZ offset.
function dateForDateStr(dateStr: string): Date {
  const base = new Date(`${dateStr}T12:00:00Z`)
  return new Date(base.getTime() + TZ_MS)
}

function addDaysStr(dateStr: string, days: number): string {
  const d = dateForDateStr(dateStr)
  // operate on UTC components (we've already shifted the base to target TZ)
  d.setUTCDate(d.getUTCDate() + days)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`
}

function getDayIndex(dateStr: string): number {
  return dateForDateStr(dateStr).getUTCDay()
}

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"]
const DAY_NAMES_UPPER = DAY_NAMES.map((n) => n.toUpperCase())

const MONTH_ABBR = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"]
const MONTH_NAMES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
]

function formatDateLong(dateStr: string): string {
  const d = dateForDateStr(dateStr)
  const dayName = DAY_NAMES_UPPER[d.getUTCDay()]
  const day = d.getUTCDate()
  const month = MONTH_NAMES[d.getUTCMonth()]
  return `${dayName} ${day} DE ${month.toUpperCase()}`
}

// ── Service fetch ────────────────────────────────────────────

interface IService {
  _id: string
  name: string
  businessID: string
  [key: string]: unknown
}

async function getBusinessServices(businessID: string): Promise<IService[]> {
  const res = await axiosReq.get(`/user/business/service/get/${businessID}`)
  return res.data
}

// ── Internal display type ──────────────────────────────────
export interface FormattedAppointment {
  _id: string
  startISO: string
  endISO: string
  title: string
  clientID: string
  service: string
  email: string
  phone: number
  name: string
  price: number
  description: string
  status: "booked" | "unbooked"
  timeLabel: string
  endTimeLabel: string
  dateStr: string
}

// ── Schedule key map ────────────────────────────────────────
const SCHEDULE_DAY_KEYS: Record<number, string> = {
  0: "DOM", 1: "LUN", 2: "MAR", 3: "MIE", 4: "JUE", 5: "VIE", 6: "SAB",
}

// ── Props ───────────────────────────────────────────────────
interface Props {
  appointments: IAppointment[]
  businessData: IBusiness
  scheduleDays: IDaySchedule[]
}

// ── Component ───────────────────────────────────────────────
export default function ListBookAppointment({
  appointments,
  businessData,
  scheduleDays,
}: Props) {
  const initialDateStr = useMemo(() => {
    if (appointments.length > 0) {
      return extractDateStr(toISOString(appointments[0].start))
    }
    const n = new Date()
    const adjusted = new Date(n.getTime() + TZ_MS)
    return `${adjusted.getUTCFullYear()}-${String(adjusted.getUTCMonth() + 1).padStart(2, "0")}-${String(adjusted.getUTCDate()).padStart(2, "0")}`
  }, [appointments])

  const [currentDateStr, setCurrentDateStr] = useState<string>(initialDateStr)
  const [selectedSlot, setSelectedSlot] = useState<FormattedAppointment | null>(null)
  const [bookAppointmentModal, setBookAppointmentModal] = useState(false)

  // ── Service filter state ──
  const [services, setServices] = useState<IService[]>([])
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [loadingServices, setLoadingServices] = useState(false)

  // ── Fetch services on mount; auto-select first ──
  useEffect(() => {
    if (!businessData._id) return
    setLoadingServices(true)
    getBusinessServices(businessData._id)
      .then((data) => {
        setServices(data)
        if (data.length > 0) {
          setSelectedService(data[0].name)
        }
      })
      .catch(() => setServices([]))
      .finally(() => setLoadingServices(false))
  }, [businessData._id])

  // ── Schedule for current day ──
  const daySchedule = useMemo(() => {
    const key = SCHEDULE_DAY_KEYS[getDayIndex(currentDateStr)]
    return scheduleDays.find((d) => d.day === key) ?? {
      day: key,
      dayStart: 9,
      dayEnd: 20,
      appointmentDuration: 30,
      enabled: true,
      businessID: "",
      ownerID: "",
    }
  }, [currentDateStr, scheduleDays])

  // ── Formatted appointments for current day (with service filter) ──
  const dayAppointments = useMemo(() => {
    return appointments
      .filter((apt) => extractDateStr(toISOString(apt.start)) === currentDateStr)
      .filter((apt) => {
        if (!selectedService) return true
        return apt.service === selectedService
      })
      .map((apt): FormattedAppointment => {
        const startISO = toISOString(apt.start)
        const endISO = toISOString(apt.end)
        return {
          _id: apt._id ?? "",
          startISO,
          endISO,
          title: apt.title ?? "",
          clientID: apt.clientID ?? "",
          service: apt.service ?? "",
          email: apt.email ?? "",
          phone: apt.phone ?? 0,
          name: apt.name ?? "",
          price: apt.price ?? 0,
          description: apt.description ?? "",
          status: apt.status ?? "unbooked",
          timeLabel: extractTime(startISO),
          endTimeLabel: extractTime(endISO),
          dateStr: extractDateStr(startISO),
        }
      })
      .sort((a, b) => a.timeLabel.localeCompare(b.timeLabel))
  }, [appointments, currentDateStr, selectedService])

  // ── Navigation ──
  const goNext = useCallback(() => {
    setCurrentDateStr((prev) => addDaysStr(prev, 1))
    setSelectedSlot(null)
  }, [])

  const canGoPrev = currentDateStr !== initialDateStr

  const goPrev = useCallback(() => {
    setCurrentDateStr((prev) => {
      const prevDay = addDaysStr(prev, -1)
      if (prevDay < initialDateStr) return prev
      return prevDay
    })
    setSelectedSlot(null)
  }, [initialDateStr])

  // ── Slot selection ──
  const handleSlotClick = (apt: FormattedAppointment) => {
    if (apt.status === "booked") return
    setSelectedSlot(apt)
    setBookAppointmentModal(true)
  }

  // ── Display strings ──
  const formattedDateLong = useMemo(() => formatDateLong(currentDateStr), [currentDateStr])

  const dayNumber = useMemo(() => {
    const d = dateForDateStr(currentDateStr)
    return String(d.getUTCDate())
  }, [currentDateStr])

  const monthLabel = useMemo(() => {
    const d = dateForDateStr(currentDateStr)
    return MONTH_ABBR[d.getUTCMonth()]
  }, [currentDateStr])

  const dayNameFull = useMemo(() => {
    return DAY_NAMES[getDayIndex(currentDateStr)].toUpperCase()
  }, [currentDateStr])

  const scheduleHours = `${String(daySchedule.dayStart).padStart(2, "0")}:00 - ${String(daySchedule.dayEnd).padStart(2, "0")}:00`

  const modalDateStr = useMemo(() => {
    if (!selectedSlot) return ""
    const d = dateForDateStr(selectedSlot.dateStr)
    const dayName = DAY_NAMES[d.getUTCDay()].toLowerCase()
    const day = d.getUTCDate()
    const month = MONTH_NAMES[d.getUTCMonth()]
    return `${dayName} ${day} de ${month}`
  }, [selectedSlot])

  // ── Service filter buttons ──
  const ServiceFilterButtons = () => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5 mb-1">
        <Tag className="size-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
          Filtrar por servicio
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {loadingServices ? (
          <span className="py-1 text-xs text-muted-foreground animate-pulse">
            Cargando servicios...
          </span>
        ) : (
          services.map((svc) => (
            <button
              key={svc._id}
              onClick={() => {
                setSelectedService(svc.name)
                setSelectedSlot(null)
              }}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold transition-all",
                selectedService === svc.name
                  ? "border-transparent bg-orange-600 text-white shadow-lg"
                  : "border-border bg-muted/50 text-muted-foreground hover:border-orange-400 hover:text-foreground"
              )}
            >
              {svc.name}
            </button>
          ))
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Booking Modal */}
      <Dialog
        open={bookAppointmentModal}
        onOpenChange={() => setBookAppointmentModal(false)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:w-[460px] w-[93vw]">
          {selectedSlot && (
            <BookAppointmentModal
              appointmentData={selectedSlot}
              businessData={businessData}
              modalDateStr={modalDateStr}
              closeModalF={(action: string) => {
                setBookAppointmentModal(false)
                setSelectedSlot(null)
                if (action === "BOOKED" || action === "CANCELLED") {
                  // Parent can react to the action here
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <div className="flex flex-col w-full min-h-screen bg-background">
        {/* ── Main Content ── */}
        <main className="flex flex-col flex-1 w-full max-w-6xl py-6 mx-auto px-7 2xl:max-w-8xl md:px-8 md:py-10">
          {/* Header */}
          <header className="flex flex-col items-center mb-5 md:mb-8 md:items-start">
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {businessData.name}
            </h1>
            <p className="mt-1 text-xs font-medium tracking-widest text-orange-500 uppercase text-muted-foreground">
              Reservar turno
            </p>
          </header>

          {/* ── Desktop Layout ── */}
          <div className="flex-1 hidden gap-8 md:flex h-fit">
            {/* Left Column – Date Info */}
            <div className="flex flex-col gap-5 w-72 h-fit shrink-0">
              {/* Date Card */}
              <div className="p-5 border-none rounded-xl bg-muted/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">
                    Fecha del turno
                  </h3>
                  <button
                    className="flex items-center gap-1.5 text-xs font-semibold text-orange-500 transition-colors hover:text-orange-600"
                    onClick={() => setCurrentDateStr(initialDateStr)}
                  >
                    Hoy
                    <CalendarDays className="size-3.5" />
                  </button>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center justify-center bg-orange-100 rounded-lg size-12">
                    <span className="text-[10px] font-bold uppercase leading-none text-orange-500">
                      {monthLabel}
                    </span>
                    <span className="text-lg font-bold leading-tight text-orange-600">
                      {dayNumber}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-bold uppercase text-foreground">
                      {dayNameFull}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">
                      {dayNumber} de {MONTH_NAMES[dateForDateStr(currentDateStr).getUTCMonth()]}
                    </span>
                    {/* <span className="text-xs text-muted-foreground">
                      Horario de atencion: {scheduleHours}
                    </span> */}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 pt-8 mt-auto">
                  <button
                    onClick={goPrev}
                    disabled={!canGoPrev}
                    className={cn(
                      "rounded-lg px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all",
                      canGoPrev
                        ? "bg-muted/50 text-foreground hover:bg-orange-50 border border-transparent"
                        : "cursor-not-allowed bg-muted text-muted-foreground/50"
                    )}
                  >
                    Anterior
                  </button>
                  <button
                    onClick={goNext}
                    className="rounded-lg bg-orange-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-orange-700"
                  >
                    Siguiente
                  </button>
                </div>
              </div>

              {/* Service Filter Card — only shown if there are multiple services */}
              {(services.length > 1 || loadingServices) && (
                <div className="p-4 border-none rounded-xl bg-muted/50">
                  <ServiceFilterButtons />
                </div>
              )}

              {/* Info Card */}
              <div className="p-4 border border-orange-200 border-dashed rounded-xl bg-orange-50">
                <div className="flex gap-3">
                  <Info className="mt-0.5 size-4 shrink-0 text-orange-500" />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Los turnos tienen una duracion estimada de{" "}
                    {daySchedule.appointmentDuration} minutos. Por favor, asiste
                    5 minutos antes.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column – Time Slots */}
            <div className="flex flex-col flex-1 h-fit">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col gap-0.5">
                  <h2 className="text-[1.3rem] font-bold text-foreground">
                    Horarios Disponibles
                  </h2>
                  {selectedService && (
                    <span className="text-xs font-semibold text-orange-500">
                      {selectedService}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-orange-600" />
                    <span className="text-xs text-muted-foreground">
                      Disponible
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-muted-foreground/30" />
                    <span className="text-xs text-muted-foreground">
                      Ocupado
                    </span>
                  </div>
                </div>
              </div>

              {/* Time Slots Grid */}
              {dayAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 py-[7.7rem] rounded-xl bg-muted/50" style={{height:'200px'}}>
                  <CalendarDays className="mb-3 size-10 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-muted-foreground">
                    {selectedService
                      ? `No hay turnos disponibles para "${selectedService}" este dia`
                      : "No hay turnos disponibles para este dia"}
                  </p>
                  <button
                    onClick={goNext}
                    className="mt-3 text-sm font-semibold text-orange-600 hover:underline"
                  >
                    Ver siguiente dia
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-6 gap-3">
                  {dayAppointments.map((apt) => (
                    <TimeSlot
                      key={apt._id}
                      appointment={apt}
                      isSelected={selectedSlot?._id === apt._id}
                      onClick={() => handleSlotClick(apt)}
                    />
                  ))}
                </div>
              )}

              {/* Navigation */}
              {/* <div className="flex items-center justify-end gap-3 pt-8 mt-auto">
                <button
                  onClick={goPrev}
                  disabled={!canGoPrev}
                  className={cn(
                    "rounded-lg px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all",
                    canGoPrev
                      ? "bg-muted/50 text-foreground hover:bg-orange-50 border border-transparent"
                      : "cursor-not-allowed bg-muted text-muted-foreground/50"
                  )}
                >
                  Día Anterior
                </button>
                <button
                  onClick={goNext}
                  className="rounded-lg bg-orange-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-orange-700"
                >
                  Día Siguiente
                </button>
              </div> */}
            </div>
          </div>

          {/* ── Mobile Layout ── */}
          <div className="flex flex-col flex-1 md:hidden">
            {/* Date Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={goPrev}
                disabled={!canGoPrev}
                className={cn(
                  "flex size-9 items-center justify-center rounded-full transition-colors",
                  canGoPrev
                    ? "text-foreground hover:bg-orange-50"
                    : "cursor-not-allowed text-muted-foreground/30"
                )}
                aria-label="Dia anterior"
              >
                <ChevronLeft className="size-5" />
              </button>
              <h2 className="text-base font-bold tracking-wide uppercase text-foreground">
                {formattedDateLong}
              </h2>
              <button
                onClick={goNext}
                className="flex items-center justify-center transition-colors rounded-full size-9 text-foreground hover:bg-orange-50"
                aria-label="Dia siguiente"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>

            {/* Mobile Service Filter — only shown if there are multiple services */}
            {(services.length > 1 || loadingServices) && (
              <div className="pb-4 mb-4 border-b border-border">
                <ServiceFilterButtons />
              </div>
            )}

            {/* Time Slots Grid */}
            {dayAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 py-12 rounded-xl bg-muted/50">
                <CalendarDays className="mb-3 size-8 text-muted-foreground/40" />
                <p className="px-4 text-sm text-center text-muted-foreground">
                  {selectedService
                    ? `No hay turnos para "${selectedService}"`
                    : "No hay turnos disponibles"}
                </p>
                <button
                  onClick={goNext}
                  className="mt-2 text-sm font-semibold text-orange-600 hover:underline"
                >
                  Ver siguiente dia
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2.5">
                {dayAppointments.map((apt) => (
                  <TimeSlotMobile
                    key={apt._id}
                    appointment={apt}
                    isSelected={selectedSlot?._id === apt._id}
                    onClick={() => handleSlotClick(apt)}
                  />
                ))}
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center justify-center gap-5 mt-5">
              <div className="flex items-center gap-1.5">
                <span className="bg-orange-600 rounded-full size-2" />
                <span className="text-[11px] text-muted-foreground">Disponible</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="rounded-full size-2 bg-muted-foreground/30" />
                <span className="text-[11px] text-muted-foreground">Ocupado</span>
              </div>
            </div>

            {/* Divider */}
            {/* <div className="h-px my-6 bg-border" /> */}

            {/* Fixed Bottom Navigation */}
            <div className="fixed inset-x-0 bottom-0 z-10 flex gap-3 px-4 py-3 border-t bg-gray-50 border-border">
              <button
                onClick={goPrev}
                disabled={!canGoPrev}
                className={cn(
                  "flex-1 rounded-full py-3 text-xs font-bold uppercase tracking-wider transition-all",
                  canGoPrev
                    ? "bg-muted/50 text-foreground border "
                    : "cursor-not-allowed bg-white border-white border text-muted-foreground/50"
                )}
              >
                Anterior
              </button>
              <button
                onClick={goNext}
                className="flex-1 py-3 text-xs font-bold tracking-wider text-white uppercase transition-all bg-orange-600 rounded-full hover:bg-orange-700"
              >
                Siguiente
              </button>
            </div>

            {/* Spacer for fixed bottom bar */}
            <div className="h-20" />
          </div>
        </main>

        {/* ── Footer (Desktop only) ── */}
        <footer className="hidden px-8 py-5 border-t bg-muted/50 md:block border-border">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <p className="text-xs text-muted-foreground">
              &copy; 2025 sacaturno. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-xs transition-colors text-muted-foreground hover:text-foreground">
                Terminos
              </a>
              <a href="#" className="text-xs transition-colors text-muted-foreground hover:text-foreground">
                Privacidad
              </a>
              <a href="#" className="text-xs transition-colors text-muted-foreground hover:text-foreground">
                Contacto
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}


