"use client";

import { useState } from "react";
import { CreditCard, Lock, ShieldCheck, X } from "lucide-react";
import { demoMoney } from "./demoData";

/*
  Checkout simulado.

  En la reserva real, un servicio con seña manda al Checkout Pro de Mercado Pago
  y vuelve por webhook. Acá no se cobra nada: la pantalla existe para mostrar el
  circuito completo —seña, pago, vuelta al turno confirmado— sin sacar al
  visitante del sitio. Va rotulada como simulación en todo momento.
*/

interface Props {
  amount: number;
  service: string;
  dateLabel: string;
  timeLabel: string;
  businessName: string;
  onPay: () => void;
  onCancel: () => void;
}

export default function DemoCheckout({
  amount,
  service,
  dateLabel,
  timeLabel,
  businessName,
  onPay,
  onCancel,
}: Props) {
  const [paying, setPaying] = useState(false);

  const pay = async () => {
    setPaying(true);
    await new Promise((resolve) => setTimeout(resolve, 1100));
    onPay();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-[420px] my-auto rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-3 bg-[#009ee3] text-white">
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight">Mercado Pago</span>
            <span className="text-[11px] text-white/80 leading-tight">
              Pago de seña · simulación
            </span>
          </div>
          <button
            onClick={onCancel}
            disabled={paying}
            aria-label="Cancelar el pago"
            className="size-8 rounded-full flex items-center justify-center hover:bg-white/15 transition-colors disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="px-5 py-3 bg-amber-50 border-b border-amber-200 flex items-start gap-2">
          <ShieldCheck className="size-4 text-amber-700 mt-0.5 shrink-0" />
          <p className="text-[12px] leading-snug text-amber-900">
            Esto es una demostración: <b>no se cobra nada</b> ni se pide ningún
            dato de tarjeta. En un negocio real, la plata va directo a su cuenta
            de Mercado Pago.
          </p>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Seña a pagar
            </span>
            <span className="text-3xl font-black text-neutral-900 tracking-tight">
              {demoMoney(amount)}
            </span>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <span className="text-xs text-neutral-500">Negocio</span>
              <span className="text-xs font-semibold text-neutral-800 text-right">
                {businessName}
              </span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-xs text-neutral-500">Servicio</span>
              <span className="text-xs font-semibold text-neutral-800 text-right">
                {service}
              </span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-xs text-neutral-500">Turno</span>
              <span className="text-xs font-semibold text-neutral-800 text-right capitalize-first-letter">
                {dateLabel} · {timeLabel} hs
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 p-4 flex items-center gap-3">
            <div className="size-9 rounded-lg bg-[#009ee3]/10 flex items-center justify-center shrink-0">
              <CreditCard className="size-4.5 text-[#009ee3]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-semibold text-neutral-800">
                Tarjeta de ejemplo
              </span>
              <span className="text-xs text-neutral-500">
                Visa •••• 4242 · titular de prueba
              </span>
            </div>
          </div>

          <button
            onClick={pay}
            disabled={paying}
            className="h-12 rounded-xl bg-[#009ee3] hover:bg-[#0089c7] text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
          >
            {paying ? (
              <>
                <span className="size-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Procesando el pago…
              </>
            ) : (
              <>
                <Lock className="size-4" /> Pagar {demoMoney(amount)}
              </>
            )}
          </button>

          <button
            onClick={onCancel}
            disabled={paying}
            className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 transition-colors disabled:opacity-50"
          >
            Volver sin pagar
          </button>
        </div>
      </div>
    </div>
  );
}
