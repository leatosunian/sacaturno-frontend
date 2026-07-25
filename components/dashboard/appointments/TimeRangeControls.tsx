"use client";
import { ReactNode } from "react";
import { LuInfo } from "react-icons/lu";
import { timeOptions, durationOptions } from "@/helpers/timeOptions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
}

const selectClass =
  "h-8 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-700 hover:border-orange-400 focus:border-orange-500 focus:outline-none transition-colors duration-200 cursor-pointer";

const labelClass = "text-[10px] font-semibold text-gray-400 uppercase tracking-wider";

interface SelectWithHintProps {
  hoverCapable: boolean;
  hint: ReactNode;
  hintClassName?: string;
  children: ReactNode;
}

function SelectWithHint({ hoverCapable, hint, hintClassName, children }: SelectWithHintProps) {
  if (!hoverCapable) return <>{children}</>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
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
}: TimeRangeControlsProps) {
  const hoverCapable = useHoverCapable();

  return (
    <TooltipProvider delayDuration={150}>
      {title && (
        <div className="-mx-4 -mt-4 mb-3 px-4 py-2.5 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-800">{title}</p>
        </div>
      )}
      <div className={cn("flex items-end gap-3 flex-wrap", className)}>
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Desde</label>
          <SelectWithHint hoverCapable={hoverCapable} hint="Inicio del día">
            <select
              value={dayStart}
              onChange={(e) => onDayStartChange(Number(e.target.value))}
              className={selectClass}
            >
              {timeOptions.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </SelectWithHint>
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass}>Hasta</label>
          <SelectWithHint hoverCapable={hoverCapable} hint="Fin del día">
            <select
              value={dayEnd}
              onChange={(e) => onDayEndChange(Number(e.target.value))}
              className={selectClass}
            >
              {timeOptions.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </SelectWithHint>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <label className={labelClass}>
              Intervalos
              <span className="lg:hidden ml-1 normal-case font-normal tracking-normal text-gray-400">
                (división del día)
              </span>
            </label>
            <LuInfo size={11} className="hidden lg:inline-flex text-gray-400" />
          </div>
          <SelectWithHint
            hoverCapable={hoverCapable}
            hint="Divide el horario en intervalos de este tamaño (ej: turnos disponibles cada 30 minutos)"
            hintClassName="max-w-[220px] text-center"
          >
            <select
              value={appointmentDuration}
              onChange={(e) => onDurationChange(Number(e.target.value))}
              className={selectClass}
            >
              {durationOptions.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </SelectWithHint>
        </div>
      </div>
    </TooltipProvider>
  );
}
