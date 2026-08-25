"use client";
import { ReactNode, useRef, useState } from "react";
import { timeOptions, durationOptions } from "@/helpers/timeOptions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHoverCapable } from "@/hooks/use-hover-capable";
import { cn } from "@/lib/utils";

interface TimeRangeControlsProps {
  dayStart: number;
  dayEnd: number;
  appointmentDuration: number;
  onDayStartChange: (value: number) => void;
  onDayEndChange: (value: number) => void;
  onDurationChange: (value: number) => void;
  className?: string;
  title?: string;
  inline?: boolean;
}

const triggerBase =
  "h-8 rounded-md border border-gray-200 px-2.5 text-xs font-medium text-gray-800 shadow-none transition-all duration-200 ease-in-out focus:ring-0 focus:ring-offset-0 hover:border-orange-600 focus-visible:border-orange-600 data-[state=open]:border-orange-600";

const itemClass =
  "cursor-pointer text-xs text-gray-700 focus:bg-orange-50 focus:text-orange-700 data-[state=checked]:font-medium data-[state=checked]:text-orange-700";

const stackedLabelClass = "text-[10px] font-semibold text-gray-400 uppercase tracking-wider";

const inlineLabelClass = "text-[11px] font-medium text-gray-500 whitespace-nowrap";

interface HintedTriggerProps {
  hoverCapable: boolean;
  hint: ReactNode;
  hintClassName?: string;
  children: ReactNode;
}

function HintedTrigger({ hoverCapable, hint, hintClassName, children }: HintedTriggerProps) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  if (!hoverCapable) return <>{children}</>;

  // Hover-only: opening is driven exclusively by pointer enter/leave so the tooltip
  // never reappears when the Select restores focus to the trigger on close. We only
  // honor Radix's onOpenChange for closing (e.g. Escape), never for opening.
  const openSoon = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(true), 150);
  };
  const closeNow = () => {
    clearTimeout(timerRef.current);
    setOpen(false);
  };

  return (
    <Tooltip open={open} onOpenChange={(next) => { if (!next) closeNow(); }}>
      <TooltipTrigger
        asChild
        onPointerEnter={openSoon}
        onPointerLeave={closeNow}
        onPointerDown={closeNow}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="top" className={hintClassName}>{hint}</TooltipContent>
    </Tooltip>
  );
}

export default function TimeRangeControls({
  dayStart,
  dayEnd,
  appointmentDuration,
  onDayStartChange,
  onDayEndChange,
  onDurationChange,
  className,
  title,
  inline = false,
}: TimeRangeControlsProps) {
  const hoverCapable = useHoverCapable();

  const triggerClass = cn(triggerBase, inline ? "bg-white" : "bg-gray-100");
  const labelClass = inline ? inlineLabelClass : stackedLabelClass;
  const fieldClass = inline ? "flex items-center gap-1.5" : "flex flex-col gap-1";

  return (
    <TooltipProvider delayDuration={150}>
      {title && (
        <div className="-mx-4 -mt-4 mb-3 px-4 py-2.5 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-800">{title}</p>
        </div>
      )}
      <div
        className={cn(
          "flex gap-3",
          inline ? "items-center gap-2.5" : "items-end flex-wrap",
          className
        )}
      >
        <div className={fieldClass}>
          <label className={labelClass}>Desde</label>
          <Select value={String(dayStart)} onValueChange={(v) => onDayStartChange(Number(v))}>
            <HintedTrigger hoverCapable={hoverCapable} hint="Inicio del día">
              <SelectTrigger className={triggerClass}>
                <SelectValue />
              </SelectTrigger>
            </HintedTrigger>
            <SelectContent className="max-h-72">
              {timeOptions.map((t) => (
                <SelectItem key={t.value} value={String(t.value)} className={itemClass}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className={fieldClass}>
          <label className={labelClass}>Hasta</label>
          <Select value={String(dayEnd)} onValueChange={(v) => onDayEndChange(Number(v))}>
            <HintedTrigger hoverCapable={hoverCapable} hint="Fin del día">
              <SelectTrigger className={triggerClass}>
                <SelectValue />
              </SelectTrigger>
            </HintedTrigger>
            <SelectContent className="max-h-72">
              {timeOptions.map((t) => (
                <SelectItem key={t.value} value={String(t.value)} className={itemClass}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className={fieldClass}>
          <label className={labelClass}>
            Intervalos
            <span className="lg:hidden ml-1 normal-case font-normal tracking-normal text-gray-400">
              (división del día)
            </span>
          </label>
          <Select value={String(appointmentDuration)} onValueChange={(v) => onDurationChange(Number(v))}>
            <HintedTrigger
              hoverCapable={hoverCapable}
              hint="Divide el horario en intervalos de este tamaño (ej: turnos disponibles cada 30 minutos)"
              hintClassName="max-w-[220px] text-center"
            >
              <SelectTrigger className={triggerClass}>
                <SelectValue />
              </SelectTrigger>
            </HintedTrigger>
            <SelectContent className="max-h-72">
              {durationOptions.map((d) => (
                <SelectItem key={d.value} value={String(d.value)} className={itemClass}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </TooltipProvider>
  );
}
