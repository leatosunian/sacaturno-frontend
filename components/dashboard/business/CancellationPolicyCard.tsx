"use client";

import { FaCircleInfo } from "react-icons/fa6";
import { LuCreditCard } from "react-icons/lu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CANCELLATION_OPTIONS = [
  { value: "0", label: "Sin restricción (siempre permitido)" },
  { value: "2", label: "Hasta 2 horas antes" },
  { value: "6", label: "Hasta 6 horas antes" },
  { value: "12", label: "Hasta 12 horas antes" },
  { value: "24", label: "Hasta 24 horas antes" },
  { value: "48", label: "Hasta 48 horas antes" },
  { value: "72", label: "Hasta 72 horas antes" },
];

// Reglas de reembolso de la seña. Son fijas en el backend (SCancelBooking) e
// iguales para todos los negocios: la antelación configurable de abajo sólo
// decide hasta cuándo el cliente puede autocancelar online, nunca quién se
// queda con la seña. Si estos textos cambian, tienen que cambiar también en el
// mail de reserva y en la pantalla pública de cancelación.
const DEPOSIT_RULES: { refunds: boolean; text: string }[] = [
  {
    refunds: false,
    text: "Si cancela el cliente, la seña no se reembolsa: queda para vos.",
  },
  {
    refunds: true,
    text: "Si cancelás vos o un empleado desde la agenda, se le reembolsa la seña automáticamente por Mercado Pago.",
  },
  {
    refunds: true,
    text: "Si el cliente cancela dentro de los 15 minutos de haber reservado, también se le reembolsa: está deshaciendo una reserva recién hecha.",
  },
  {
    refunds: true,
    text: "Si el cliente cancela después de que le cambiaste el profesional o la sucursal, también se le reembolsa: el cambio no lo hizo él.",
  },
];

const windowHint = (hours: number) =>
  hours === 0
    ? "Tus clientes van a poder cancelar su turno online en cualquier momento, hasta la hora de inicio. Vos siempre podés cancelar cualquier turno desde tu agenda."
    : `Tus clientes van a poder cancelar su turno online hasta ${hours} horas antes. Pasado ese plazo van a tener que contactarte para cancelar. Vos siempre podés cancelar cualquier turno desde tu agenda.`;

interface Props {
  value?: number;
  onChange: (hours: number) => void;
  error?: string;
  /** Tipografía compacta del panel de edición (`/admin/business`). */
  dense?: boolean;
}

const CancellationPolicyCard: React.FC<Props> = ({
  value,
  onChange,
  error,
  dense = false,
}) => {
  const hasValue = value !== undefined && value !== null && !Number.isNaN(value);

  const text = dense ? "text-xs 2xl:text-sm" : "text-sm";
  const smallText = dense ? "text-xs" : "text-xs sm:text-sm";

  return (
    <div className="flex flex-col gap-0 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
      <div
        className={`border-b border-gray-100 ${
          dense ? "px-6 py-4 2xl:px-8 2xl:py-5" : "px-4 sm:px-6 py-4"
        }`}
      >
        <h2 className={`${dense ? "text-sm 2xl:text-base" : "text-base"} font-semibold text-gray-800`}>
          Política de cancelación
        </h2>
        <p className={`${dense ? "text-xs" : "text-sm"} text-gray-500 mt-0.5`}>
          Definí con cuánta anticipación un cliente puede cancelar su turno por su cuenta.
        </p>
      </div>

      <div
        className={`flex flex-col gap-5 ${
          dense ? "p-6 2xl:p-8 2xl:gap-6" : "p-4 sm:p-6"
        }`}
      >
        <div className="flex flex-col gap-1 w-full">
          <div className="flex flex-col gap-1 w-full sm:max-w-sm">
            <label className={`${text} font-medium text-gray-700`}>
              Antelación mínima para cancelar
            </label>
            <Select
              value={hasValue ? String(value) : undefined}
              onValueChange={(v) => onChange(Number(v))}
            >
              <SelectTrigger
                className={`${
                  dense ? "h-8 2xl:h-10" : "h-9"
                } ${text} w-full rounded-md border px-3 bg-gray-50 text-gray-800 shadow-none transition-all duration-200 ease-in-out focus:ring-0 focus:ring-offset-0 hover:border-orange-600 focus:border-orange-600 data-[state=open]:border-orange-600 ${
                  error ? "border-red-500" : "border-gray-200"
                }`}
              >
                <SelectValue placeholder="Elegí una opción" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {CANCELLATION_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className={`cursor-pointer ${text} text-gray-700 focus:bg-orange-50 focus:text-orange-700 data-[state=checked]:font-medium data-[state=checked]:text-orange-700`}
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error ? (
            <span className="text-xs text-red-500">{error}</span>
          ) : hasValue ? (
            <div className="mt-2 flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <FaCircleInfo size={13} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 leading-relaxed">
                {windowHint(value as number)}
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 p-3.5 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center gap-2">
            <LuCreditCard size={15} className="text-blue-500 shrink-0" />
            <p className={`${text} font-semibold text-blue-700`}>
              Qué pasa con la seña
            </p>
          </div>

          <ul className="flex flex-col gap-2">
            {DEPOSIT_RULES.map((rule) => (
              <li key={rule.text} className="flex items-start gap-2">
                <span
                  className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                    rule.refunds ? "bg-green-500" : "bg-blue-400"
                  }`}
                />
                <span className={`${smallText} text-blue-600 leading-relaxed`}>
                  {rule.text}
                </span>
              </li>
            ))}
          </ul>

          <p className="text-xs text-blue-400 leading-relaxed">
            Estas reglas son iguales para todos los negocios de SacaTurno y no dependen
            del plazo que elijas arriba. Sólo aplican a servicios que tengan una seña
            configurada.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CancellationPolicyCard;
