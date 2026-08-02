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
}

const triggerClass =
  "h-8 rounded-md border border-gray-200 bg-[rgb(245,245,245)] px-2.5 text-xs font-medium text-gray-800 shadow-none transition-all duration-200 ease-in-out focus:ring-0 focus:ring-offset-0 hover:border-orange-600 focus:border-orange-600 data-[state=open]:border-orange-600";

const itemClass =
  "cursor-pointer text-xs text-gray-700 focus:bg-orange-50 focus:text-orange-700 data-[state=checked]:font-medium data-[state=checked]:text-orange-700";

const labelClass = "text-[10px] font-semibold text-gray-400 uppercase tracking-wider";

interface HintedTriggerProps {
  hoverCapable: boolean;
  hint: ReactNode;
  hintClassName?: string;
  children: ReactNode;
}

function HintedTrigger({ hoverCapable, hint, hintClassName, children }: HintedTriggerProps) {
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

        <div className="flex flex-col gap-1">
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
