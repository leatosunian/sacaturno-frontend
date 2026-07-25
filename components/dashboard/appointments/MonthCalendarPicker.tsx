"use client";
import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { DayButton } from "react-day-picker";
import { es } from "react-day-picker/locale";
import { LuCalendar, LuChevronDown } from "react-icons/lu";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useHoverCapable } from "@/hooks/use-hover-capable";
import { cn } from "@/lib/utils";

interface MonthCalendarPickerProps {
  date: Date;
  onSelect: (date: Date) => void;
  appointmentDateSet: Set<string>;
  className?: string;
}

function DayButtonWithDot(props: React.ComponentProps<typeof DayButton>) {
  const { modifiers } = props;
  const showDot = modifiers.hasAppointments && !modifiers.selected;
  const isTodayUnselected = modifiers.today && !modifiers.selected;
  return (
    <>
      <CalendarDayButton
        {...props}
        className={cn(
          isTodayUnselected &&
            "border-2 border-primary text-primary font-semibold",
          props.className
        )}
      />
      {showDot && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary"
        />
      )}
    </>
  );
}

export default function MonthCalendarPicker({
  date,
  onSelect,
  appointmentDateSet,
  className,
}: MonthCalendarPickerProps) {
  const [open, setOpen] = useState(false);
  const [suppressTooltip, setSuppressTooltip] = useState(false);
  const suppressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [viewMonth, setViewMonth] = useState<Date>(dayjs(date).startOf("month").toDate());
  const hoverCapable = useHoverCapable();

  const suppressTooltipBriefly = () => {
    if (suppressTimerRef.current) clearTimeout(suppressTimerRef.current);
    setSuppressTooltip(true);
    suppressTimerRef.current = setTimeout(() => setSuppressTooltip(false), 400);
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) suppressTooltipBriefly();
  };

  useEffect(() => {
    setViewMonth(dayjs(date).startOf("month").toDate());
  }, [date]);

  const rawLabel = dayjs(date).format("dddd D [de] MMMM");
  const dateLabel = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);

  const trigger = (
    <PopoverTrigger asChild>
      <button
        type="button"
        aria-label="Cambiar fecha"
        className={cn(
          "group flex items-center gap-2 h-9 pl-3.5 pr-2.5 rounded-lg border text-[15px] 2xl:text-base font-semibold transition-all duration-200 min-w-0 cursor-pointer",
          open
            ? "border-primary bg-orange-50 text-primary ring-2 ring-primary/15"
            : "border-gray-200 bg-white text-gray-800 hover:border-orange-300 hover:bg-orange-50 hover:text-primary",
          className
        )}
      >
        <LuCalendar size={15} className="text-primary shrink-0" />
        <span className="truncate">{dateLabel}</span>
        <LuChevronDown
          size={15}
          className={cn(
            "shrink-0 text-gray-400 transition-all duration-200 group-hover:text-primary",
            open && "rotate-180 text-primary"
          )}
        />
      </button>
    </PopoverTrigger>
  );

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      {hoverCapable ? (
        <TooltipProvider delayDuration={150}>
          <Tooltip open={(open || suppressTooltip) ? false : undefined}>
            <TooltipTrigger asChild>{trigger}</TooltipTrigger>
            <TooltipContent sideOffset={6}>Seleccionar fecha</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        trigger
      )}
      <PopoverContent className="w-auto p-0" align="center">
        <Calendar
          mode="single"
          required
          locale={es}
          month={viewMonth}
          onMonthChange={setViewMonth}
          selected={date}
          classNames={{ today: "" }}
          onSelect={(day) => {
            onSelect(day);
            setOpen(false);
            suppressTooltipBriefly();
          }}
          modifiers={{
            hasAppointments: (d) => appointmentDateSet.has(dayjs(d).format("YYYY-MM-DD")),
          }}
          components={{ DayButton: DayButtonWithDot }}
        />
        <div className="flex items-center gap-3 px-3 pb-3 pt-1 border-t border-gray-100">
          <span className="flex items-center gap-1.5 text-[10px] text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
            Con turnos
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-gray-400">
            <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
            Seleccionado
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-gray-400">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-primary inline-block" />
            Hoy
          </span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
