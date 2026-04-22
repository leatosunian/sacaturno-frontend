"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const MONTH_NAMES_CAP = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

interface Props {
  currentDateStr: string
  initialDateStr: string
  availableDateStrSet: Set<string>
  onDateSelect: (dateStr: string) => void
}

export default function BookingCalendar({
  currentDateStr,
  initialDateStr,
  availableDateStrSet,
  onDateSelect,
}: Props) {
  const [viewMonth, setViewMonth] = useState(currentDateStr.slice(0, 7))

  useEffect(() => {
    setViewMonth(currentDateStr.slice(0, 7))
  }, [currentDateStr])

  const [yearStr, monthStr] = viewMonth.split("-")
  const year = parseInt(yearStr)
  const month = parseInt(monthStr) - 1 // 0-indexed

  const firstDayOfMonth = new Date(Date.UTC(year, month, 1))
  const firstDayOfWeek = firstDayOfMonth.getUTCDay() // 0=Sun
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  const startOffset = (firstDayOfWeek + 6) % 7 // Monday-first

  const cells: (string | null)[] = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(
      `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    )
  }
  while (cells.length % 7 !== 0) cells.push(null)

  const initMonthStr = initialDateStr.slice(0, 7)
  const canGoPrev = viewMonth > initMonthStr

  const goToPrev = () => {
    const d = new Date(Date.UTC(year, month - 1, 1))
    setViewMonth(
      `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
    )
  }
  const goToNext = () => {
    const d = new Date(Date.UTC(year, month + 1, 1))
    setViewMonth(
      `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
    )
  }

  return (
    <div className="p-4 rounded-xl bg-muted/50 select-none">
      {/* Month header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={goToPrev}
          disabled={!canGoPrev}
          className={cn(
            "flex items-center justify-center rounded-md size-7 transition-colors",
            canGoPrev
              ? "hover:bg-muted text-foreground"
              : "text-muted-foreground/30 cursor-not-allowed"
          )}
          aria-label="Mes anterior"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-sm font-semibold text-foreground">
          {MONTH_NAMES_CAP[month]} {year}
        </span>
        <button
          onClick={goToNext}
          className="flex items-center justify-center rounded-md size-7 hover:bg-muted text-foreground transition-colors"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Day-of-week headers (Monday first) */}
      <div className="grid grid-cols-7 mb-1">
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-semibold text-muted-foreground/60 py-1 uppercase"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((dateStr, i) => {
          if (!dateStr) return <div key={`empty-${i}`} />

          const isDisabled = dateStr < initialDateStr
          const isSelected = dateStr === currentDateStr
          const hasAvailable = availableDateStrSet.has(dateStr)

          return (
            <button
              key={dateStr}
              disabled={isDisabled}
              onClick={() => onDateSelect(dateStr)}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-lg aspect-square text-xs font-medium transition-all duration-150 pb-1.5",
                hasAvailable && !isDisabled
                  ? "bg-orange-600 text-white shadow-sm hover:bg-orange-700"
                  : isDisabled
                  ? "text-muted-foreground/25 cursor-not-allowed"
                  : "text-muted-foreground/50 hover:bg-muted/80"
              )}
            >
              {parseInt(dateStr.slice(8))}
              {isSelected && (
                <span
                  className={cn(
                    "absolute bottom-1 w-1 h-1 rounded-full",
                    hasAvailable ? "bg-white/80" : "bg-orange-500"
                  )}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 pt-2 border-t border-border/50">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded bg-orange-600" />
          <span className="text-[10px] text-muted-foreground">Con turnos</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-white border border-orange-500" />
          <span className="text-[10px] text-muted-foreground">Seleccionado</span>
        </div>
      </div>
    </div>
  )
}
