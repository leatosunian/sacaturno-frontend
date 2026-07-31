"use client";
import { useEffect, useRef, useState } from "react";
import {
  BUSINESS_CATEGORIES,
  OTHER_SPECIALTY,
  getCategoryDef,
  isKnownSpecialty,
} from "@/lib/businessCategories";
import type { IconType } from "react-icons";
import { LuScissors, LuStethoscope, LuDumbbell, LuPawPrint, LuBriefcase, LuGraduationCap, LuEllipsis } from "react-icons/lu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORY_ICONS: Record<string, IconType> = {
  estetica: LuScissors,
  salud: LuStethoscope,
  bienestar: LuDumbbell,
  mascotas: LuPawPrint,
  servicios: LuBriefcase,
  educacion: LuGraduationCap,
  otros: LuEllipsis,
};

interface Props {
  /** Código de categoría actual (businessCategory). */
  category?: string;
  /** Etiqueta de especialidad actual (businessType). */
  type?: string;
  /** Se dispara con el código de categoría y la etiqueta final de especialidad. */
  onChange: (category: string, type: string) => void;
  categoryError?: string;
  typeError?: string;
}

const selectClass = (hasError: boolean) =>
  `h-9 w-full rounded-md border px-3 text-sm bg-[rgb(235,235,235)] transition-all duration-200 ease-in-out hover:border-orange-600 focus:border-orange-600 focus:outline-none ${
    hasError ? "border-red-500" : "border-gray-200"
  }`;

const RubroPicker: React.FC<Props> = ({ category, type, onChange, categoryError, typeError }) => {
  // Especialidad seleccionada en el <select>: una etiqueta conocida o el centinela "Otro".
  const [specialty, setSpecialty] = useState<string>("");
  // Texto libre cuando la especialidad es "Otro".
  const [customType, setCustomType] = useState<string>("");

  // Sincroniza el estado interno cuando cambian los valores externos (ej. carga de datos en edición).
  const hydratedKey = useRef<string>("");
  useEffect(() => {
    const key = `${category ?? ""}|${type ?? ""}`;
    if (hydratedKey.current === key) return;
    hydratedKey.current = key;

    if (!category) {
      setSpecialty("");
      setCustomType("");
      return;
    }
    if (type && isKnownSpecialty(category, type)) {
      setSpecialty(type);
      setCustomType("");
    } else if (type) {
      setSpecialty(OTHER_SPECIALTY);
      setCustomType(type);
    } else {
      setSpecialty("");
      setCustomType("");
    }
  }, [category, type]);

  const selectCategory = (code: string) => {
    if (code === category) return;
    setSpecialty("");
    setCustomType("");
    onChange(code, "");
  };

  const selectSpecialty = (value: string) => {
    setSpecialty(value);
    if (value === OTHER_SPECIALTY) {
      onChange(category ?? "", customType.trim());
    } else {
      setCustomType("");
      onChange(category ?? "", value);
    }
  };

  const changeCustomType = (value: string) => {
    setCustomType(value);
    onChange(category ?? "", value.trim());
  };

  const activeCat = getCategoryDef(category);

  return (
    <div className="flex flex-col gap-3">
      {/* Categoría (rubro) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Rubro del negocio</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {BUSINESS_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.code] ?? LuEllipsis;
            const active = cat.code === category;
            return (
              <button
                key={cat.code}
                type="button"
                onClick={() => selectCategory(cat.code)}
                className={`flex items-center gap-2 h-9 px-3 rounded-md border text-xs font-semibold transition-all duration-200 ease-in-out cursor-pointer ${
                  active
                    ? "border-orange-600 bg-orange-600 text-white shadow-sm"
                    : "border-gray-200 bg-[rgb(235,235,235)] text-gray-700 hover:border-orange-600"
                }`}
              >
                <Icon size={15} className={active ? "text-white" : "text-orange-600"} />
                <span className="truncate">{cat.short}</span>
              </button>
            );
          })}
        </div>
        {categoryError && <span className="text-sm text-red-500">{categoryError}</span>}
      </div>

      {/* Especialidad */}
      {activeCat && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Especialidad</label>
          <Select value={specialty || undefined} onValueChange={selectSpecialty}>
            <SelectTrigger
              className={`h-9 w-full rounded-md bg-[rgb(235,235,235)] px-3 text-sm text-gray-800 shadow-none transition-all duration-200 ease-in-out focus:ring-0 focus:ring-offset-0 hover:border-orange-600 focus:border-orange-600 data-[state=open]:border-orange-600 ${
                !!typeError && specialty !== OTHER_SPECIALTY ? "border-red-500" : "border-gray-200"
              }`}
            >
              <SelectValue placeholder="Elegí una opción" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {activeCat.specialties.map((s) => (
                <SelectItem
                  key={s}
                  value={s}
                  className="cursor-pointer text-sm text-gray-700 focus:bg-orange-50 focus:text-orange-700 data-[state=checked]:font-medium data-[state=checked]:text-orange-700"
                >
                  {s}
                </SelectItem>
              ))}
              {activeCat.specialties.length > 0 && <SelectSeparator />}
              <SelectItem
                value={OTHER_SPECIALTY}
                className="cursor-pointer text-sm text-gray-700 focus:bg-orange-50 focus:text-orange-700 data-[state=checked]:font-medium data-[state=checked]:text-orange-700"
              >
                Otro
              </SelectItem>
            </SelectContent>
          </Select>

          {specialty === OTHER_SPECIALTY && (
            <input
              type="text"
              maxLength={35}
              value={customType}
              onChange={(e) => changeCustomType(e.target.value)}
              placeholder="Especificá tu rubro (ej. Peluquería infantil)"
              className={selectClass(!!typeError)}
            />
          )}
          {typeError && <span className="text-sm text-red-500">{typeError}</span>}
        </div>
      )}
    </div>
  );
};

export default RubroPicker;
