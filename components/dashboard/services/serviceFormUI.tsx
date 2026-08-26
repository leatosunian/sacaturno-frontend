"use client";
import { useEffect, useState } from "react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

// Estilos compartidos por el alta y la edición: los dos modales son la misma
// ficha y antes venían divergiendo cada vez que se tocaba uno solo.
export const fieldLabel = "text-[11px] font-medium text-gray-400";
export const errorText = "text-xs text-red-500 mt-1";
export const underline =
  "border-b border-gray-200 transition-colors duration-200 ease-in-out hover:border-gray-300 focus-within:border-orange-600";
export const chipBase =
  "inline-flex items-center gap-1.5 px-2.5 py-1 2xl:px-3 2xl:py-1.5 rounded-full text-[11px] 2xl:text-xs font-medium border transition-all duration-200 ease-in-out cursor-pointer";
export const chipOn = "bg-primary text-white border-primary";
export const chipOff =
  "bg-white text-gray-400 border-gray-200 hover:border-orange-300 hover:text-gray-600";

// Los campos van en cuerpo grande sólo a partir de 2xl: en pantallas chicas
// ese tamaño se comía el modal.
export const titleInput = `w-full bg-transparent pb-1.5 text-base 2xl:text-xl font-semibold text-gray-800 outline-none placeholder:text-gray-300 placeholder:font-normal ${underline}`;
export const descInput = `w-full bg-transparent pb-1.5 text-xs 2xl:text-sm text-gray-700 leading-relaxed outline-none resize-none overflow-hidden placeholder:text-gray-300 ${underline}`;
export const moneyRow = `flex items-baseline gap-1 pb-1 ${underline}`;
export const moneyPrefix = "text-sm 2xl:text-lg font-medium text-gray-300";
export const moneyInput =
  "flex-1 min-w-0 bg-transparent outline-none text-lg 2xl:text-2xl font-semibold text-gray-800 placeholder:text-gray-300";

export const durationLabel = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}min` : `${hours} hora${hours > 1 ? "s" : ""}`;
  }
  return `${mins} min`;
};

const PRESETS = [15, 30, 45, 60, 90];

interface durationProps {
  value?: number;
  options: number[];
  onChange: (minutes: number) => void;
}

// Las duraciones habituales quedan a un click; el resto de la lista (que en el
// alta son 33 opciones) sigue disponible detrás de "Otra".
export const DurationPicker: React.FC<durationProps> = ({ value, options, onChange }) => {
  const presets = PRESETS.filter((p) => options.includes(p));
  const isCustom = value !== undefined && !presets.includes(value);
  const [showOther, setShowOther] = useState<boolean>(isCustom);

  useEffect(() => {
    if (value !== undefined) setShowOther(!presets.includes(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {presets.map((minutes) => (
          <button
            key={minutes}
            type="button"
            onClick={() => onChange(minutes)}
            className={`${chipBase} ${value === minutes ? chipOn : chipOff}`}
          >
            {durationLabel(minutes)}
          </button>
        ))}
        {/* Sólo se prende cuando el valor elegido no es ninguno de los chips:
            si no, quedaría encendido a la par del preset activo. */}
        <button
          type="button"
          onClick={() => setShowOther(true)}
          className={`${chipBase} ${isCustom ? chipOn : chipOff}`}
        >
          {isCustom ? durationLabel(value!) : "Otra"}
        </button>
      </div>

      {showOther && (
        <Select
          value={value !== undefined ? String(value) : undefined}
          onValueChange={(val) => onChange(Number(val))}
        >
          <SelectTrigger className="h-8 2xl:h-9 text-xs 2xl:text-sm border-gray-200 bg-gray-50 hover:border-orange-600 focus:ring-0 focus:border-orange-600 transition-all duration-200">
            <SelectValue placeholder="Elegí la duración" />
          </SelectTrigger>
          <SelectContent>
            {options.map((minutes) => (
              <SelectItem key={minutes} value={String(minutes)} className="text-sm">
                {durationLabel(minutes)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};
