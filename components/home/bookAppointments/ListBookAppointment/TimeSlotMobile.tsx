import { cn } from "@/lib/utils"
import { FormattedAppointment } from "../ListBookAppointment"


// ── Time Slot (Mobile) ──────────────────────────────────────
export function TimeSlotMobile({
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
                "relative flex flex-col items-center justify-center rounded-xl border py-3 text-sm font-semibold transition-all",
                isBooked &&
                "cursor-not-allowed border-transparent bg-muted text-muted-foreground/40 line-through",
                !isBooked && "border-transparent bg-orange-600 text-white shadow-md"
            )}
            aria-label={`${appointment.timeLabel} - ${isBooked ? "Ocupado" : "Disponible"}`}
        >
            <span>{appointment.timeLabel}</span>
        </button>
    )
}
