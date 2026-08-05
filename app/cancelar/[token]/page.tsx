"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { CircleCheck, CircleX, Loader2, CalendarClock, CreditCard } from "lucide-react";
import axiosReq from "@/config/axios";
import HeaderPublicBlack from "@/components/home/HeaderPublic";
import Footer from "@/components/home/Footer";
import styles from "@/app/css-modules/AuthCentered.module.css";
import stylesHome from "@/app/css-modules/HomeWhite.module.css";

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
      <main className={styles.authBgScreen}>
        <div className="relative z-[2] flex flex-col items-center w-full max-w-[460px] px-4">
          {screen === "loading" && (
            <Loader2 className="text-[#dd4924] animate-spin" size={40} />
          )}

          {screen !== "loading" && (
            <div className="w-full bg-white rounded-[15px] shadow-[-10px_10px_25px_1px_rgba(0,0,0,0.12)] border border-black/[0.06] overflow-hidden">
              <div className="h-[3px] w-full bg-gradient-to-r from-[#dd4924] to-[#ff8a5c]" />

              <div className="flex flex-col items-center gap-5 px-7 py-8 text-center">
                {screen === "notfound" && (
                  <>
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-black/[0.04]">
                      <CircleX className="text-[#9a9a9a]" size={30} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <h1 className="text-[24px] font-bold tracking-[-0.7px] text-[#1a1a1a] leading-[1.15]">
                        Turno no disponible
                      </h1>
                      <p className="text-[14px] text-[#7a7a7a] leading-[1.55]">
                        No encontramos este turno. Es posible que ya haya sido cancelado o
                        que el link no sea válido.
                      </p>
                    </div>
                    <Link
                      href="/"
                      className="flex items-center justify-center w-full py-[11px] rounded-lg bg-primary hover:bg-orange-600 text-white text-[13px] font-semibold tracking-[.5px] transition-all duration-300 ease-in-out"
                    >
                      Volver al inicio
                    </Link>
                  </>
                )}

                {screen === "cancelled" && (
                  <>
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-50">
                      <CircleCheck className="text-green-500" size={30} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <h1 className="text-[24px] font-bold tracking-[-0.7px] text-[#1a1a1a] leading-[1.15]">
                        Turno cancelado
                      </h1>
                      <p className="text-[14px] text-[#7a7a7a] leading-[1.55]">
                        Cancelaste tu turno correctamente. Te enviamos un email de
                        confirmación.
                        {hasPaidDeposit && " Recordá que la seña no se reembolsa al cancelar."}
                      </p>
                    </div>
                    <Link
                      href="/"
                      className="flex items-center justify-center w-full py-[11px] rounded-lg bg-primary hover:bg-orange-600 text-white text-[13px] font-semibold tracking-[.5px] transition-all duration-300 ease-in-out"
                    >
                      Volver al inicio
                    </Link>
                  </>
                )}

                {screen === "window" && info && (
                  <>
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-orange-50">
                      <CalendarClock className="text-[#dd4924]" size={30} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <h1 className="text-[24px] font-bold tracking-[-0.7px] text-[#1a1a1a] leading-[1.15]">
                        Fuera de plazo
                      </h1>
                      <p className="text-[14px] text-[#7a7a7a] leading-[1.55]">
                        Ya no se puede cancelar online (el turno es en menos de{" "}
                        {info.cancellationWindowHours} horas). Contactate directamente con{" "}
                        <span className="font-semibold text-[#1a1a1a]">{info.businessName}</span>
                        {info.businessPhone ? ` al ${info.businessPhone}` : ""}.
                      </p>
                    </div>
                    <Link
                      href="/"
                      className="flex items-center justify-center w-full py-[11px] rounded-lg bg-primary hover:bg-orange-600 text-white text-[13px] font-semibold tracking-[.5px] transition-all duration-300 ease-in-out"
                    >
                      Volver al inicio
                    </Link>
                  </>
                )}

                {screen === "error" && (
                  <>
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50">
                      <CircleX className="text-red-500" size={30} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <h1 className="text-[24px] font-bold tracking-[-0.7px] text-[#1a1a1a] leading-[1.15]">
                        Ocurrió un error
                      </h1>
                      <p className="text-[14px] text-[#7a7a7a] leading-[1.55]">
                        No pudimos procesar la cancelación. Intentá de nuevo en unos minutos.
                      </p>
                    </div>
                    <button
                      onClick={() => setScreen("ready")}
                      className="flex items-center justify-center w-full py-[11px] rounded-lg bg-primary hover:bg-orange-600 text-white text-[13px] font-semibold tracking-[.5px] transition-all duration-300 ease-in-out"
                    >
                      Reintentar
                    </button>
                  </>
                )}

                {screen === "ready" && info && (
                  <>
                    <span className="inline-flex items-center gap-[7px] px-[13px] py-[5px] rounded-[20px] bg-[#ffe9dc] text-[#dd4924] text-[10.5px] font-semibold tracking-[0.7px] uppercase">
                      Cancelación de turno
                    </span>

                    <div className="flex flex-col gap-1.5">
                      <h1 className="text-[26px] font-bold tracking-[-0.8px] text-[#1a1a1a] leading-[1.15]">
                        Cancelar turno
                      </h1>
                      <p className="text-[14px] text-[#7a7a7a] leading-[1.55]">
                        Estás por cancelar tu turno en{" "}
                        <span className="font-semibold text-[#1a1a1a]">{info.businessName}</span>.
                      </p>
                    </div>

                    <div className="flex flex-col w-full gap-3 p-4 text-left border rounded-[10px] border-black/[0.06] bg-black/[0.025]">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-semibold tracking-[0.5px] text-[#9a9a9a] uppercase">
                          Servicio
                        </span>
                        <span className="text-[14px] font-semibold text-[#1a1a1a]">
                          {info.appointment.service}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-semibold tracking-[0.5px] text-[#9a9a9a] uppercase">
                          Fecha y hora
                        </span>
                        <span className="text-[14px] font-semibold text-[#1a1a1a] capitalize">
                          {dateLabel}
                        </span>
                      </div>
                    </div>

                    {hasPaidDeposit && (
                      <div className="flex items-start w-full gap-3 p-3.5 text-left border rounded-[10px] bg-orange-50 border-orange-200">
                        <CreditCard className="text-[#dd4924] shrink-0 mt-0.5" size={17} />
                        <span className="text-[13px] text-orange-700 leading-[1.5]">
                          Si cancelás, la seña de{" "}
                          <b>$ {info.depositAmount.toLocaleString("es-AR")}</b> no se
                          reembolsa.
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col w-full gap-3 mt-1">
                      <button
                        onClick={handleCancel}
                        disabled={submitting}
                        className={`${stylesHome.btnAnimatedDanger} rounded-lg w-full ${
                          submitting ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                        style={{ fontSize: "13px", letterSpacing: ".5px", padding: "11px 0px" }}
                      >
                        {submitting ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          "Sí, cancelar mi turno"
                        )}
                      </button>
                      <Link
                        href="/"
                        className="text-[13px] font-semibold text-[#8a8a8a] hover:text-[#dd4924] transition-colors duration-300"
                      >
                        No, volver al inicio
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
