"use client";
import { useEffect, useState } from "react";
import styles from "@/app/css-modules/AppointmentModal.module.css";
import dayjs from "dayjs";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa6";
import { LuTag, LuBanknote, LuMapPin, LuUser } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { IEmployee } from "@/interfaces/employee.interface";
import { IBranch } from "@/interfaces/branch.interface";
import { Clock, Check } from "lucide-react";

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
  employeeID?: string | null;
  branchID?: string | null;
}

interface props {
  appointment: eventType2 | undefined;
  onDelete: (id: string) => void;
  onCancel?: (id: string) => void;
  closeModalF: () => void;
  canDelete?: boolean;
  employees?: IEmployee[];
  branches?: IBranch[];
}

const depositStatusConfig = {
  paid: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    label: "✓ Seña pagada vía Mercado Pago",
  },
  pending: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-700",
    label: "⏳ Pendiente de confirmación",
  },
  failed: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    label: "✗ Pago fallido",
  },
};

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs font-bold uppercase tracking-wide text-gray-400">
      {label}
    </span>
    <span className="text-sm font-medium text-gray-800">{value}</span>
  </div>
);

const AppointmentModal: React.FC<props> = ({
  appointment,
  onDelete,
  onCancel,
  closeModalF,
  canDelete = true,
  employees,
  branches,
}) => {
  const [isBooked, setIsBooked] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    setIsBooked(appointment?.status === "booked");
    setConfirmCancel(false);
  }, [appointment]);

  const handleDelete = () => {
    if (!appointment?._id) return;
    onDelete(appointment._id);
  };

  const handleCancel = () => {
    if (!appointment?._id || !onCancel) return;
    onCancel(appointment._id);
  };

  const willRefund =
    appointment?.depositStatus === "paid" &&
    appointment?.depositAmount !== undefined &&
    appointment.depositAmount > 0;

  const hasDeposit =
    appointment?.depositAmount !== undefined && appointment.depositAmount > 0;
  const depositCfg =
    appointment?.depositStatus && appointment.depositStatus !== "none"
      ? depositStatusConfig[
          appointment.depositStatus as keyof typeof depositStatusConfig
        ]
      : null;

  const assignedEmployee = appointment?.employeeID
    ? employees?.find((e) => e._id === appointment.employeeID)
    : null;
  const assignedBranch = appointment?.branchID
    ? branches?.find((b) => b._id === appointment.branchID)
    : null;

  // ── BOOKED ──────────────────────────────────────────────────────────────────
  if (isBooked) {
    return (
      <div className="flex flex-col w-full gap-4 pb-1">
        {/* Title */}
        <div className="pb-4 border-b border-gray-100 flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-green-500 shadow-sm shrink-0">
              <Check size={14} className="text-white" strokeWidth={3} />
            </div>
            <h4 className="text-lg leading-none font-semibold text-gray-800">Turno reservado</h4>
          </div>
          {/* <p className="text-xs text-gray-400 mt-0.5">Información de la reserva</p> */}
        </div>

        {/* Date/time — full width */}
        <div className="flex items-center border-l-[3px] bg-orange-50/70 border-l-orange-400 w-full gap-4 py-3 px-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex flex-col items-center justify-center w-12 h-12 bg-primary rounded-lg shrink-0">
            <span className="text-xl font-black text-white leading-none">
              {dayjs(appointment?.start).format("DD")}
            </span>
            <span className="text-[10px] font-bold text-orange-200 uppercase leading-none mt-0.5">
              {dayjs(appointment?.start).format("MMM")}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[15px] leading-none font-semibold text-gray-800 capitalize">
              {dayjs(appointment?.start).format("dddd DD [de] MMMM")}
            </span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="text-[12.5px] mt-[1.5px] leading-none font-medium text-gray-500">
                {dayjs(appointment?.start).format("HH:mm [hs]")} —{" "}
                {dayjs(appointment?.end).format("HH:mm [hs]")}
              </span>
            </div>
          </div>
        </div>

        {/* Two-column grid (single column on mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Left: appointment details */}
          <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 min-w-0 overflow-hidden">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Turno
            </span>
            <Field
              label="Servicio"
              value={
                <span className="break-words">{appointment?.service}</span>
              }
            />
            <Field
              label="Precio"
              value={`$ ${appointment?.price?.toLocaleString("es-AR")}`}
            />
            {hasDeposit && (
              <Field
                label="Seña"
                value={
                  <span className="text-orange-600">
                    $ {appointment!.depositAmount!.toLocaleString("es-AR")}
                  </span>
                }
              />
            )}
            {assignedBranch && (
              <Field
                label="Sucursal"
                value={
                  <span className="break-words">{assignedBranch.name}</span>
                }
              />
            )}
            {assignedEmployee && (
              <Field
                label="Empleado"
                value={
                  <span className="break-words">
                    {assignedEmployee.name} {assignedEmployee.surname}
                  </span>
                }
              />
            )}
          </div>

          {/* Right: client details */}
          <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 min-w-0 overflow-hidden">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Cliente
            </span>
            <Field
              label="Nombre"
              value={<span className="break-words">{appointment?.name}</span>}
            />
            <Field label="Teléfono" value={`+54 ${appointment?.phone}`} />
            <Field
              label="Email"
              value={<span className="break-all">{appointment?.email}</span>}
            />
          </div>
        </div>

        {/* Deposit status — full width */}
        {depositCfg && (
          <div
            className={`flex flex-col gap-1 py-2 px-3 rounded-xl border ${depositCfg.bg} ${depositCfg.border}`}
          >
            {/* <span className="text-xs font-bold uppercase tracking-wide text-gray-500">Estado de la seña</span> */}
            <span
              className={`text-xs md:text-sm font-semibold ${depositCfg.text}`}
            >
              {depositCfg.label}
            </span>
            {appointment?.depositStatus === "paid" &&
              appointment.mpPaymentID && (
                <div className="flex flex-row md:items-end justify-between gap-0.5 mt-1 pt-2 border-t border-green-200">
                  <span className="text-[11px] font-bold uppercase  text-gray-400">
                    ID de pago{" "}
                  </span>
                  <span className="text-xs md:text-xs tracking-wider font-semibold text-gray-400">
                    {appointment.mpPaymentID}
                  </span>
                </div>
              )}
          </div>
        )}

        {/* WhatsApp CTA */}
        <div
          className="my-1"
          style={{
            width: "100%",
            height: "1px",
            backgroundColor: "rgb(178 178 178 / 40%)",
          }}
        />
        <Link
          target="_blank"
          href={`https://wa.me/54${appointment?.phone}`}
          className="w-full"
        >
          <Button className="w-full text-white bg-primary border-none rounded-lg h-11 hover:bg-orange-700">
            <FaWhatsapp color="white" /> Contactar cliente por WhatsApp
          </Button>
        </Link>

        {/* Cancelar turno */}
        {onCancel && canDelete && (
          <>
            {!confirmCancel ? (
              <Button
                onClick={() => setConfirmCancel(true)}
                className="w-full bg-white text-red-600 border border-red-200 rounded-lg h-11 hover:bg-red-50"
              >
                Cancelar turno
              </Button>
            ) : (
              <div className="flex flex-col gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3.5">
                <p className="text-[13px] leading-relaxed text-red-600 text-center font-medium">
                  Se liberará este turno y se le avisará al cliente por email.
                  {willRefund && (
                    <>
                      {" "}Se le <strong>reembolsará la seña de $
                      {appointment!.depositAmount!.toLocaleString("es-AR")}</strong>{" "}
                      vía Mercado Pago.
                    </>
                  )}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setConfirmCancel(false)}
                    className="flex-1 h-9 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 border-none rounded-lg"
                  >
                    Volver
                  </Button>
                  <Button
                    onClick={handleCancel}
                    className="flex-1 h-9 text-xs text-white bg-red-600 hover:bg-red-700 border-none rounded-lg"
                  >
                    Confirmar cancelación
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // ── UNBOOKED ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col w-full gap-4 pb-1">
      <div className="pb-4 border-b border-gray-100 flex flex-col gap-1">
        <h4 className="text-lg leading-none font-semibold text-gray-800">Turno disponible</h4>
        <p className="text-xs text-gray-400 mt-0.5">Este turno aún no fue reservado</p>
      </div>

        {/* fecha + horario */}
        <div className="flex items-center border-l-[3px] bg-orange-50/70 border-l-orange-400 w-full gap-4 py-3 px-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex flex-col items-center justify-center w-12 h-12 bg-primary rounded-lg shrink-0">
            <span className="text-xl font-black text-white leading-none">
              {dayjs(appointment?.start).format("DD")}
            </span>
            <span className="text-[10px] font-bold text-orange-200 uppercase leading-none mt-0.5">
              {dayjs(appointment?.start).format("MMM")}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[15px] leading-none font-semibold text-gray-800 capitalize">
              {dayjs(appointment?.start).format("dddd DD [de] MMMM")}
            </span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="text-[12.5px] mt-[1.5px] leading-none font-medium text-gray-500">
                {dayjs(appointment?.start).format("HH:mm [hs]")} —{" "}
                {dayjs(appointment?.end).format("HH:mm [hs]")}
              </span>
            </div>
          </div>
        </div>

      {/* Details card */}
      <div className="flex flex-col rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm divide-y divide-gray-100">
        {/* Service — hero row */}
        <div className="flex items-center gap-3 px-4 py-3.5 bg-gray-50">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-50 shrink-0">
            <LuTag className="text-orange-600" size={15} />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Servicio
            </span>
            <span className="text-sm font-semibold text-gray-800 leading-tight">
              {appointment?.service}
            </span>
          </div>
        </div>

        {/* Price row */}
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <LuBanknote className="text-gray-400 shrink-0" size={15} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Precio
            </span>
          </div>
          <span className="text-sm font-bold text-gray-800">
            $ {appointment?.price?.toLocaleString("es-AR")}
          </span>
        </div>

        {/* Deposit row (conditional) */}
        {hasDeposit && (
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-2">
              <LuBanknote className="text-orange-400 shrink-0" size={15} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Seña
              </span>
            </div>
            <span className="text-sm font-semibold text-orange-600">
              $ {appointment!.depositAmount!.toLocaleString("es-AR")}
            </span>
          </div>
        )}

        {/* Branch row (conditional) */}
        {assignedBranch && (
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-2">
              <LuMapPin className="text-gray-400 shrink-0" size={15} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Sucursal
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {assignedBranch.name}
            </span>
          </div>
        )}

        {/* Employee row (conditional) */}
        {assignedEmployee && (
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-2">
              <LuUser className="text-gray-400 shrink-0" size={15} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Empleado
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {assignedEmployee.name} {assignedEmployee.surname}
            </span>
          </div>
        )}
      </div>

      {canDelete && (
        <>
          <div
            style={{
              width: "100%",
              height: "1px",
              backgroundColor: "rgb(178 178 178 / 40%)",
            }}
          />
          <Button
            onClick={handleDelete}
            className="w-full text-white bg-red-600 border-none rounded-lg h-11 hover:bg-orange-700"
          >
            Eliminar turno
          </Button>
        </>
      )}
    </div>
  );
};

export default AppointmentModal;
