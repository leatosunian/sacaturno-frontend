import { cn } from "@/lib/utils"
import { FormattedAppointment } from "../ListBookAppointment"

// ── Time Slot (Desktop) ─────────────────────────────────────
export function TimeSlot({
    appointment,
    isSelected,
    onClick,
}: {
    appointment: FormattedAppointment
    isSelected: boolean
    onClick: () => void
}) {
    const isBooked = appointment.status === "booked"

    return (
        <button
            onClick={onClick}
            disabled={isBooked}
            className={cn(
                "group relative flex h-14 items-center justify-center rounded-lg border text-sm font-semibold transition-all",
                isBooked &&
                "cursor-not-allowed border-transparent bg-muted text-muted-foreground/40 line-through",
                !isBooked && "border-transparent bg-orange-600 text-white shadow-md"
            )}
            aria-label={`${appointment.timeLabel} - ${isBooked ? "Ocupado" : "Disponible"}`}
        >
            {appointment.timeLabel}
        </button>
    )
}