"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosReq from "@/config/axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { CircleCheck, Clock, CircleAlert, XCircle, Loader } from "lucide-react";
import {
  MPReturnResult,
  MPReturnStatus,
  parseMPReturn,
  stripMPParams,
} from "@/lib/mpReturn";

type Variant = "subscription" | "deposit";

// "checking" mientras confirmamos contra nuestra base; "taken" cuando el pago
// aprobó pero el horario ya se lo había llevado otro cliente.
type DisplayStatus = MPReturnStatus | "checking" | "taken";

interface Props {
  variant: Variant;
  // Acción del CTA cuando el pago fue rechazado (ej. reabrir el selector de planes).
  onRetry?: () => void;
}

interface Copy {
  title: string;
  description: string;
  cta: string;
}

const SHARED: Record<"checking" | "taken", Copy> = {
  checking: {
    title: "Confirmando tu reserva",
    description: "Estamos verificando el pago con Mercado Pago. Un segundo.",
    cta: "Esperar",
  },
  taken: {
    title: "No pudimos confirmar tu turno",
    description:
      "Mientras se procesaba tu pago, alguien más reservó ese horario. Ya te devolvimos la seña y te enviamos un email con el detalle.",
    cta: "Elegir otro turno",
  },
};

const COPY: Record<Variant, Record<MPReturnStatus, Copy>> = {
  subscription: {
    approved: {
      title: "¡Pago aprobado!",
      description:
        "Ya activamos tu plan. Puede tardar unos segundos en verse reflejado acá.",
      cta: "Entendido",
    },
    pending: {
      title: "Pago pendiente",
      description:
        "Mercado Pago todavía está procesando el pago. Cuando se acredite activamos tu plan automáticamente y te avisamos por email.",
      cta: "Entendido",
    },
    rejected: {
      title: "Pago rechazado",
      description:
        "No se pudo procesar el pago, así que no se realizó ningún cargo. Podés intentarlo de nuevo con otro medio de pago.",
      cta: "Volver a intentar",
    },
    unknown: {
      title: "Pago en revisión",
      description:
        "Mercado Pago no informó un estado definitivo. Si el pago se acredita, tu plan se activa automáticamente.",
      cta: "Entendido",
    },
  },
  deposit: {
    approved: {
      title: "¡Seña pagada!",
      description:
        "Tu turno quedó reservado. Vas a recibir un email de confirmación en breve.",
      cta: "Listo",
    },
    pending: {
      title: "Pago pendiente",
      description:
        "Mercado Pago todavía está procesando el pago. Te guardamos el horario un rato: si se acredita, el turno queda reservado y te avisamos por email.",
      cta: "Entendido",
    },
    rejected: {
      title: "Pago rechazado",
      description:
        "No se pudo procesar el pago de la seña, así que el turno no fue reservado. Podés elegir un horario e intentarlo de nuevo.",
      cta: "Elegir otro turno",
    },
    unknown: {
      title: "Pago en revisión",
      description:
        "Mercado Pago no informó un estado definitivo. Si el pago se acredita, el turno queda reservado y te llega un email.",
      cta: "Entendido",
    },
  },
};

const ICONS: Record<
  DisplayStatus,
  { Icon: typeof CircleCheck; wrapper: string; color: string; spin?: boolean }
> = {
  approved: { Icon: CircleCheck, wrapper: "bg-green-50", color: "text-green-600" },
  pending: { Icon: Clock, wrapper: "bg-amber-50", color: "text-amber-600" },
  rejected: { Icon: XCircle, wrapper: "bg-red-50", color: "text-red-600" },
  unknown: { Icon: CircleAlert, wrapper: "bg-gray-100", color: "text-gray-500" },
  taken: { Icon: CircleAlert, wrapper: "bg-amber-50", color: "text-amber-600" },
  checking: {
    Icon: Loader,
    wrapper: "bg-gray-100",
    color: "text-gray-400",
    spin: true,
  },
};

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  credit_card: "Tarjeta de crédito",
  debit_card: "Tarjeta de débito",
  account_money: "Dinero en cuenta",
  ticket: "Efectivo",
  atm: "Cajero automático",
  bank_transfer: "Transferencia",
};

// La seña se muestra en la web pública, que usa una escala tipográfica más
// grande que el panel admin (ver DESIGN.md, sección 1).
const TEXT: Record<
  Variant,
  { title: string; description: string; label: string; value: string; cta: string }
> = {
  subscription: {
    title: "text-lg",
    description: "text-xs max-w-xs",
    label: "text-[11px]",
    value: "text-xs",
    cta: "text-sm",
  },
  deposit: {
    title: "text-xl",
    description: "text-sm max-w-sm",
    label: "text-xs",
    value: "text-sm",
    cta: "text-sm",
  },
};

// Parámetros propios que agregamos a las back_urls y que también hay que limpiar.
const OWN_PARAMS: Record<Variant, string[]> = {
  subscription: [],
  deposit: ["appointmentID"],
};

const CONFIRM_ATTEMPTS = 4;
const CONFIRM_DELAY_MS = 1500;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Muestra el resultado de una transacción al volver del Checkout Pro de Mercado
// Pago. Si el usuario volvió sin pagar ("Volver a SacaTurno") no se muestra
// nada y la página se ve con normalidad.
const MercadoPagoResultModal: React.FC<Props> = ({ variant, onRetry }) => {
  const router = useRouter();
  const [result, setResult] = useState<MPReturnResult | null>(null);
  const [resolved, setResolved] = useState<DisplayStatus | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const parsed = parseMPReturn(params);
    const appointmentID = params.get("appointmentID");
    const preferenceID = params.get("preference_id");
    const cleanedQuery = stripMPParams(params, OWN_PARAMS[variant]);

    // Limpiamos la URL para que un refresh no vuelva a mostrar el modal.
    if (cleanedQuery !== params.toString()) {
      router.replace(
        cleanedQuery
          ? `${window.location.pathname}?${cleanedQuery}`
          : window.location.pathname,
        { scroll: false }
      );
    }

    if (!parsed) {
      // Volvió del checkout sin pagar: soltamos el turno en el acto en vez de
      // dejarlo reservado hasta que venza solo.
      if (variant === "deposit" && appointmentID && preferenceID) {
        axiosReq
          .post("/mp/deposit/release-hold", { appointmentID, preferenceID })
          .then(() => router.refresh())
          .catch(() => {});
      }
      return;
    }

    setResult(parsed);
    setOpen(true);

    // MP dice si cobró, pero quien decide si el turno quedó reservado es nuestro
    // webhook. Para la seña preguntamos a nuestra base antes de dar un veredicto.
    if (variant !== "deposit" || !appointmentID || parsed.status === "rejected") {
      return;
    }

    let cancelled = false;
    setResolved("checking");

    (async () => {
      for (let attempt = 0; attempt < CONFIRM_ATTEMPTS; attempt++) {
        try {
          const { data } = await axiosReq.get(
            `/mp/deposit/status/${appointmentID}`,
            { params: { paymentID: parsed.paymentID ?? "" } }
          );
          if (cancelled) return;

          if (data.status === "booked") {
            setResolved(data.matchesPayment ? "approved" : "taken");
            return;
          }
          if (data.depositStatus === "failed") {
            setResolved("rejected");
            return;
          }
        } catch {
          if (cancelled) return;
          setResolved(parsed.status);
          return;
        }
        await wait(CONFIRM_DELAY_MS);
      }
      // El webhook todavía no llegó: no afirmamos que el turno esté reservado.
      if (!cancelled) setResolved("pending");
    })();

    return () => {
      cancelled = true;
    };
  }, [router, variant]);

  // El estado final lo escribe el webhook, que puede llegar unos segundos después
  // del redirect. Refrescar acá —y no al cerrar— deja que los botones del modal
  // no hagan nada más que cerrarlo.
  useEffect(() => {
    if (!result || resolved === "checking") return;
    const timer = setTimeout(() => router.refresh(), 2500);
    return () => clearTimeout(timer);
  }, [resolved, result, router]);

  if (!result) return null;

  const display: DisplayStatus = resolved ?? result.status;
  const copy =
    display === "checking" || display === "taken"
      ? SHARED[display]
      : COPY[variant][display];
  const text = TEXT[variant];
  const { Icon, wrapper, color, spin } = ICONS[display];
  const checking = display === "checking";
  const showDetails = !checking && (result.paymentType || result.paymentID);

  const handleClose = () => setOpen(false);

  const handleCta = () => {
    if (display === "rejected" && onRetry) {
      setOpen(false);
      onRetry();
      return;
    }
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (next ? setOpen(true) : handleClose())}
    >
      <DialogContent className="rounded-2xl max-w-md w-[calc(100%-2rem)] sm:w-full">
        <div className="flex flex-col w-full gap-4">
          <div className="flex flex-col items-center gap-3 pb-4 border-b border-gray-100">
            <div
              className={`flex items-center justify-center w-14 h-14 rounded-full ${wrapper}`}
            >
              <Icon className={`${color} ${spin ? "animate-spin" : ""}`} size={30} />
            </div>
            <DialogTitle
              className={`${text.title} leading-none font-semibold text-gray-800 text-center`}
            >
              {copy.title}
            </DialogTitle>
            <DialogDescription
              className={`${text.description} text-gray-400 text-center leading-relaxed`}
            >
              {copy.description}
            </DialogDescription>
          </div>

          {showDetails && (
            <div className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50/70 p-4">
              {result.paymentType && (
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`${text.label} font-semibold text-gray-400 uppercase tracking-wider`}
                  >
                    Medio de pago
                  </span>
                  <span className={`${text.value} font-medium text-gray-700 text-right`}>
                    {PAYMENT_TYPE_LABELS[result.paymentType] ?? result.paymentType}
                  </span>
                </div>
              )}
              {result.paymentID && (
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`${text.label} font-semibold text-gray-400 uppercase tracking-wider`}
                  >
                    N° de operación
                  </span>
                  <span
                    className={`${text.value} font-medium text-gray-700 text-right break-all`}
                  >
                    {result.paymentID}
                  </span>
                </div>
              )}
            </div>
          )}

          {!checking && (
            <button
              onClick={handleCta}
              className={`w-full flex mt-2 items-center justify-center bg-primary hover:bg-primary/90 text-white ${text.cta} font-semibold py-2.5 rounded-lg transition-all duration-300 ease-in-out cursor-pointer`}
            >
              {copy.cta}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MercadoPagoResultModal;
