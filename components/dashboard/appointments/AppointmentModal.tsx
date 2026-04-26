"use client";
import { useEffect, useState } from "react";
import styles from "@/app/css-modules/AppointmentModal.module.css";
import dayjs from "dayjs";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa6";
import { Button } from "@/components/ui/button";

interface eventType2 {
  start: Date;
  end: Date;
  title: string | undefined;
  clientID: string | "" | undefined;
  _id?: string | undefined;
  name: string | undefined;
  email: string | undefined;
  phone: number | undefined;
  service: string | undefined;
  status?: "booked" | "unbooked" | undefined;
  price: number | undefined;
  depositStatus?: "none" | "pending" | "paid" | "failed";
  mpPaymentID?: string | null;
  depositAmount?: number;
}

interface props {
  appointment: eventType2 | undefined;
  onDelete: (id: string) => void;
  closeModalF: () => void;
}

const depositStatusConfig = {
  paid:    { bg: "bg-green-50",  border: "border-green-200",  text: "text-green-700",  label: "✓ Pagada vía Mercado Pago" },
  pending: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", label: "⏳ Pendiente de confirmación" },
  failed:  { bg: "bg-red-50",    border: "border-red-200",    text: "text-red-700",    label: "✗ Pago fallido" },
};

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs font-bold uppercase tracking-wide text-gray-400">{label}</span>
    <span className="text-sm font-medium text-gray-800">{value}</span>
  </div>
);

const AppointmentModal: React.FC<props> = ({ appointment, onDelete, closeModalF }) => {
  const [isBooked, setIsBooked] = useState(false);

  useEffect(() => {
    setIsBooked(appointment?.status === "booked");
  }, [appointment]);

  const handleDelete = () => {
    if (!appointment?._id) return;
    onDelete(appointment._id);
  };

  const hasDeposit = appointment?.depositAmount !== undefined && appointment.depositAmount > 0;
  const depositCfg = appointment?.depositStatus && appointment.depositStatus !== "none"
    ? depositStatusConfig[appointment.depositStatus as keyof typeof depositStatusConfig]
    : null;

  // ── BOOKED ──────────────────────────────────────────────────────────────────
  if (isBooked) {
    return (
      <div className="flex flex-col w-full gap-4 pb-1">

        {/* Title */}
        <h4 className="relative inline-block w-full px-2 mx-auto font-bold text-center uppercase" style={{ fontSize: 20 }}>
          Turno reservado
          <span className="absolute left-0 right-0 mx-auto" style={{ bottom: -2, height: 2, background: "#dd4924", width: "30%" }} />
        </h4>

        {/* Date/time — full width */}
        <div className="flex flex-col items-center gap-0.5 py-3 bg-gray-50 rounded-xl border border-gray-100">
          <span className="text-sm font-bold text-gray-800 capitalize">
            &#128197; {dayjs(appointment?.start).format("dddd DD [de] MMMM")}
          </span>
          <span className="text-base font-semibold text-gray-700">
            {dayjs(appointment?.start).format("HH:mm")} — {dayjs(appointment?.end).format("HH:mm")} hs
          </span>
        </div>

        {/* Two-column grid (single column on mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

          {/* Left: appointment details */}
          <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Turno</span>
            <Field label="Servicio" value={appointment?.service} />
            <Field label="Precio" value={`$ ${appointment?.price?.toLocaleString()}`} />
            {hasDeposit && (
              <Field label="Seña" value={`$ ${appointment!.depositAmount!.toLocaleString()}`} />
            )}
          </div>

          {/* Right: client details */}
          <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Cliente</span>
            <Field label="Nombre" value={appointment?.name} />
            <Field label="Teléfono" value={`+54 ${appointment?.phone}`} />
            <Field label="Email" value={appointment?.email} />
          </div>
        </div>

        {/* Deposit status — full width */}
        {depositCfg && (
          <div className={`flex flex-col gap-1 p-3 rounded-xl border ${depositCfg.bg} ${depositCfg.border}`}>
            <span className="text-xs font-bold uppercase tracking-wide text-gray-500">Estado de la seña</span>
            <span className={`text-sm font-semibold ${depositCfg.text}`}>{depositCfg.label}</span>
            {appointment?.depositStatus === "paid" && appointment.mpPaymentID && (
              <span className="text-xs text-gray-400">ID de pago: {appointment.mpPaymentID}</span>
            )}
          </div>
        )}

        {/* WhatsApp CTA */}
        <div style={{ width: "100%", height: "1px", backgroundColor: "rgb(178 178 178 / 40%)" }} />
        <Link target="_blank" href={`https://wa.me/54${appointment?.phone}`} className="w-full">
          <Button className="w-full text-white bg-orange-600 border-none rounded-lg h-11 hover:bg-orange-700">
            <FaWhatsapp color="white" /> Iniciar chat en WhatsApp
          </Button>
        </Link>
      </div>
    );
  }

  // ── UNBOOKED ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col w-full gap-4 pb-1">
      <h4 className="relative inline-block w-full px-2 mx-auto font-bold text-center uppercase" style={{ fontSize: 20 }}>
        Datos del turno
        <span className="absolute left-0 right-0 mx-auto" style={{ bottom: -2, height: 2, background: "#dd4924", width: "30%" }} />
      </h4>

      {/* Date/time — full width */}
      <div className="flex flex-col items-center gap-0.5 py-3 bg-gray-50 rounded-xl border border-gray-100">
        <span className="text-sm font-bold text-gray-800 capitalize">
          &#128197; {dayjs(appointment?.start).format("dddd DD [de] MMMM")}
        </span>
        <span className="text-xs font-medium text-gray-500">
          {dayjs(appointment?.start).format("HH:mm [hs]")} — {dayjs(appointment?.end).format("HH:mm [hs]")}
        </span>
      </div>

      {/* Details card */}
      <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Turno</span>
        <Field label="Servicio" value={appointment?.service} />
        <Field label="Precio" value={`$ ${appointment?.price?.toLocaleString("es-AR")}`} />
        {hasDeposit && (
          <Field label="Seña" value={`$ ${appointment!.depositAmount!.toLocaleString()}`} />
        )}
      </div>

      <div style={{ width: "100%", height: "1px", backgroundColor: "rgb(178 178 178 / 40%)" }} />
      <Button
        onClick={handleDelete}
        className="w-full text-white bg-orange-600 border-none rounded-lg h-11 hover:bg-orange-700"
      >
        Eliminar turno
      </Button>
    </div>
  );
};

export default AppointmentModal;
