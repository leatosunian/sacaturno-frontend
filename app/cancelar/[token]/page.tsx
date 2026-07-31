"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { CircleCheck, CircleX, Loader2, CalendarClock, CreditCard } from "lucide-react";
import axiosReq from "@/config/axios";
import { Button } from "@/components/ui/button";
import HeaderPublicBlack from "@/components/home/HeaderPublic";

dayjs.locale("es");

interface CancelInfo {
  appointment: {
    _id: string;
    start: string;
    end: string;
    service: string;
    price: number;
    name: string;
    status: "booked" | "unbooked";
    depositStatus?: "none" | "pending" | "paid" | "failed";
  };
  businessName: string;
  businessPhone: number | null;
  cancellationWindowHours: number;
  depositAmount: number;
}

type Screen = "loading" | "ready" | "notfound" | "cancelled" | "window" | "error";

export default function CancelAppointmentPage() {
  const params = useParams();
  const token = params.token as string;
  const [info, setInfo] = useState<CancelInfo | null>(null);
  const [screen, setScreen] = useState<Screen>("loading");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await axiosReq.get(`/appointment/cancel/info/${token}`);
        if (!active) return;
        if (!data?.appointment || data.appointment.status !== "booked") {
          setScreen("notfound");
          return;
        }
        setInfo(data);
        setScreen("ready");
      } catch {
        if (active) setScreen("notfound");
      }
    })();
    return () => {
      active = false;
    };
  }, [token]);

  const hasPaidDeposit =
    info?.appointment.depositStatus === "paid" && info?.depositAmount > 0;

  const handleCancel = async () => {
    setSubmitting(true);
    try {
      await axiosReq.put("/appointment/book/cancel/token", { token });
      setScreen("cancelled");
    } catch (error: any) {
      const msg = error?.response?.data?.msg;
      if (msg === "CANCELLATION_WINDOW_CLOSED") setScreen("window");
      else if (msg === "APPOINTMENT_NOT_FOUND" || msg === "NOT_BOOKED")
        setScreen("notfound");
      else setScreen("error");
    } finally {
      setSubmitting(false);
    }
  };

  const dateLabel = info
    ? dayjs(info.appointment.start).format("dddd D [de] MMMM [·] HH:mm [hs]")
    : "";

  return (
    <>
      <HeaderPublicBlack />
      <main className="flex flex-col items-center justify-center min-h-[80vh] gap-6 px-4 py-16 text-center">
        {screen === "loading" && (
          <Loader2 className="animate-spin text-orange-500" size={40} />
        )}

        {screen === "notfound" && (
          <>
            <CircleX className="text-gray-400" size={64} />
            <h1 className="text-2xl font-bold uppercase">Turno no disponible</h1>
            <p className="max-w-sm text-muted-foreground">
              No encontramos este turno. Es posible que ya haya sido cancelado o que
              el link no sea válido.
            </p>
            <Link href="/" className="text-sm font-semibold text-orange-600 hover:underline">
              Volver al inicio
            </Link>
          </>
        )}

        {screen === "cancelled" && (
          <>
            <CircleCheck className="text-green-500" size={64} />
            <h1 className="text-2xl font-bold uppercase">Turno cancelado</h1>
            <p className="max-w-sm text-muted-foreground">
              Cancelaste tu turno correctamente. Te enviamos un email de confirmación.
              {hasPaidDeposit && " Recordá que la seña no se reembolsa al cancelar."}
            </p>
            <Link href="/" className="text-sm font-semibold text-orange-600 hover:underline">
              Volver al inicio
            </Link>
          </>
        )}

        {screen === "window" && info && (
          <>
            <CalendarClock className="text-orange-500" size={64} />
            <h1 className="text-2xl font-bold uppercase">Fuera de plazo</h1>
            <p className="max-w-sm text-muted-foreground">
              Ya no se puede cancelar online (el turno es en menos de{" "}
              {info.cancellationWindowHours} horas). Contactate directamente con{" "}
              <b>{info.businessName}</b>
              {info.businessPhone ? ` al ${info.businessPhone}` : ""}.
            </p>
            <Link href="/" className="text-sm font-semibold text-orange-600 hover:underline">
              Volver al inicio
            </Link>
          </>
        )}

        {screen === "error" && (
          <>
            <CircleX className="text-red-500" size={64} />
            <h1 className="text-2xl font-bold uppercase">Ocurrió un error</h1>
            <p className="max-w-sm text-muted-foreground">
              No pudimos procesar la cancelación. Intentá de nuevo en unos minutos.
            </p>
            <Button
              onClick={() => setScreen("ready")}
              className="text-white bg-orange-600 hover:bg-orange-700"
            >
              Reintentar
            </Button>
          </>
        )}

        {screen === "ready" && info && (
          <div className="flex flex-col w-full max-w-md gap-5">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold uppercase">Cancelar turno</h1>
              <p className="text-sm text-muted-foreground">
                Estás por cancelar tu turno en <b>{info.businessName}</b>.
              </p>
            </div>

            <div className="flex flex-col gap-3 p-5 text-left border rounded-xl bg-muted/40 border-border">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
                  Servicio
                </span>
                <span className="text-sm font-semibold">{info.appointment.service}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
                  Fecha y hora
                </span>
                <span className="text-sm font-semibold capitalize">{dateLabel}</span>
              </div>
            </div>

            {hasPaidDeposit && (
              <div className="flex items-start gap-3 p-3.5 text-left border rounded-xl bg-orange-50 border-orange-200">
                <CreditCard className="text-orange-500 shrink-0 mt-0.5" size={18} />
                <span className="text-sm text-orange-700">
                  Si cancelás, la seña de{" "}
                  <b>$ {info.depositAmount.toLocaleString("es-AR")}</b> no se reembolsa.
                </span>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button
                onClick={handleCancel}
                disabled={submitting}
                className="w-full h-11 text-white bg-red-600 hover:bg-red-700"
              >
                {submitting ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  "Sí, cancelar mi turno"
                )}
              </Button>
              <Link
                href="/"
                className="text-sm font-semibold text-center text-muted-foreground hover:underline"
              >
                No, volver al inicio
              </Link>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
