"use client";
import { useEffect, useState } from "react";
import styles from "@/app/css-modules/AppointmentModal.module.css";
import dayjs from "dayjs";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa6";
import { LuTag, LuBanknote, LuMapPin, LuUser } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IEmployee } from "@/interfaces/employee.interface";
import { IBranch } from "@/interfaces/branch.interface";
import { IService } from "@/interfaces/service.interface";
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
  employeeChosenByClient?: boolean;
}

interface props {
  appointment: eventType2 | undefined;
  onDelete: (id: string) => void;
  onCancel?: (id: string) => void;
  onAssign?: (
    id: string,
    fields: {
      employeeID?: string | null;
      branchID?: string | null;
      notifyClient?: boolean;
    }
  ) => Promise<boolean>;
  closeModalF: () => void;
  canDelete?: boolean;
  employees?: IEmployee[];
  branches?: IBranch[];
  services?: IService[];
  /** Dueño o empleado con manage_all: puede asignar a cualquiera. */
  canAssignAny?: boolean;
  /** Empleado con manage_own: sólo puede tomar o soltar el turno él mismo. */
  currentEmployeeID?: string | null;
  canClaim?: boolean;
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
  onAssign,
  closeModalF,
  canDelete = true,
  employees,
  branches,
  services,
  canAssignAny = false,
  currentEmployeeID,
  canClaim = false,
}) => {
  const [isBooked, setIsBooked] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [draftEmployeeID, setDraftEmployeeID] = useState("");
  const [draftBranchID, setDraftBranchID] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [confirmReassign, setConfirmReassign] = useState(false);
  const [notifyClient, setNotifyClient] = useState(true);

  useEffect(() => {
    setIsBooked(appointment?.status === "booked");
    setConfirmCancel(false);
    setDraftEmployeeID(appointment?.employeeID ?? "");
    setDraftBranchID(appointment?.branchID ?? "");
    setAssigning(false);
    setConfirmReassign(false);
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

  // ── Asignación ──────────────────────────────────────────────────────────────
  const activeEmployees = (employees ?? []).filter((e) => e.status === "active");
  const activeBranches = branches ?? [];
  const hasTeam = activeEmployees.length > 0 || activeBranches.length > 0;

  const serviceID = services?.find((s) => s.name === appointment?.service)?._id;
  // Elegibles: atienden en la sucursal elegida y prestan este servicio.
  const eligibleEmployees = activeEmployees
    .filter((e) => !draftBranchID || (e.branches ?? []).includes(draftBranchID))
    .filter((e) => !serviceID || (e.services ?? []).includes(serviceID));

  const employeeChanged = draftEmployeeID !== (appointment?.employeeID ?? "");
  const branchChanged = draftBranchID !== (appointment?.branchID ?? "");
  const assignDirty = employeeChanged || branchChanged;

  // Sólo un turno reservado tiene cliente a quien avisarle.
  const affectsClient = isBooked && assignDirty;
  // Cambiar de sucursal le cambia el lugar al que tiene que ir: no es opcional
  // avisarle. El profesional sí, y depende de si lo eligió.
  const notifyForced = isBooked && branchChanged;
  const clientPickedEmployee = !!appointment?.employeeChosenByClient;

  const isMine = !!currentEmployeeID && appointment?.employeeID === currentEmployeeID;
  const showClaim = canClaim && !canAssignAny && !!onAssign;

  const runAssign = async (fields: {
    employeeID?: string | null;
    branchID?: string | null;
    notifyClient?: boolean;
  }) => {
    if (!appointment?._id || !onAssign) return;
    setAssigning(true);
    const ok = await onAssign(appointment._id, fields);
    setAssigning(false);
    setConfirmReassign(false);
    if (!ok) {
      setDraftEmployeeID(appointment.employeeID ?? "");
      setDraftBranchID(appointment.branchID ?? "");
    }
  };

  const saveAssignment = () =>
    runAssign({
      employeeID: draftEmployeeID || null,
      branchID: draftBranchID || null,
      notifyClient: affectsClient && (notifyForced || notifyClient),
    });

  const startSave = () => {
    if (affectsClient) {
      setNotifyClient(notifyForced || clientPickedEmployee);
      setConfirmReassign(true);
      return;
    }
    saveAssignment();
  };

  // Función y no componente: definido acá adentro, un componente se remontaría
  // en cada render y cerraría el desplegable abierto.
  const renderAssignment = () => {
    if (!onAssign || !hasTeam) return null;

    if (showClaim) {
      if (!appointment?.employeeID) {
        return (
          <div className="flex flex-col gap-2.5 p-4 rounded-xl border border-orange-200 bg-orange-50/60">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-gray-800">
                Este turno no tiene profesional
              </span>
              <span className="text-xs text-gray-500">
                Cualquiera del equipo puede atenderlo. Tomalo si lo vas a hacer vos.
              </span>
            </div>
            <Button
              disabled={assigning}
              onClick={() => runAssign({ employeeID: currentEmployeeID })}
              className="w-full h-10 text-white bg-primary hover:bg-orange-500 border-none rounded-lg disabled:opacity-60"
            >
              {assigning ? "Asignando..." : "Asignarme el turno"}
            </Button>
          </div>
        );
      }
      if (isMine) {
        return (
          <div className="flex items-center justify-between gap-3 p-4 rounded-xl border border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2 min-w-0">
              <LuUser className="text-primary shrink-0" size={15} />
              <span className="text-sm font-medium text-gray-700">
                Este turno es tuyo
              </span>
            </div>
            <button
              disabled={assigning}
              onClick={() => runAssign({ employeeID: null })}
              className="text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors shrink-0 disabled:opacity-60"
            >
              Soltar turno
            </button>
          </div>
        );
      }
      return null;
    }

    if (!canAssignAny) return null;

    return (
      <div className="flex flex-col gap-3 p-4 rounded-xl border border-gray-200 bg-gray-50">
        <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
          Asignación
        </span>

        {activeBranches.length > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Sucursal
            </label>
            <Select
              value={draftBranchID || "none"}
              onValueChange={(v) => {
                setDraftBranchID(v === "none" ? "" : v);
                setDraftEmployeeID("");
              }}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Sin asignar" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Sucursales</SelectLabel>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {activeBranches.map((b) => (
                    <SelectItem key={b._id} value={b._id!}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}

        {activeEmployees.length > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Profesional
            </label>
            <Select
              value={draftEmployeeID || "none"}
              onValueChange={(v) => setDraftEmployeeID(v === "none" ? "" : v)}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Cualquier profesional" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Profesionales</SelectLabel>
                  <SelectItem value="none">Cualquier profesional</SelectItem>
                  {eligibleEmployees.map((e) => (
                    <SelectItem key={e._id} value={e._id!}>
                      {e.name} {e.surname}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {eligibleEmployees.length === 0 && (
              <span className="text-[11px] text-orange-600 mt-0.5">
                Ningún profesional coincide con la sucursal y el servicio de este turno.
              </span>
            )}
          </div>
        )}

        {assignDirty && !confirmReassign && (
          <Button
            disabled={assigning}
            onClick={startSave}
            className="w-full h-9 text-xs text-white bg-primary hover:bg-orange-500 border-none rounded-lg disabled:opacity-60"
          >
            Guardar asignación
          </Button>
        )}

        {confirmReassign && (
          <div
            className={`flex flex-col gap-3 rounded-xl border px-4 py-3.5 ${
              notifyForced
                ? "border-red-200 bg-red-50"
                : "border-orange-200 bg-orange-50"
            }`}
          >
            <div className="flex flex-col gap-1">
              <span
                className={`text-sm font-semibold ${
                  notifyForced ? "text-red-700" : "text-orange-800"
                }`}
              >
                {notifyForced
                  ? "Le cambia el lugar de atención al cliente"
                  : clientPickedEmployee
                    ? "El cliente eligió a este profesional"
                    : "Este turno ya está reservado"}
              </span>
              <p
                className={`text-xs leading-relaxed ${
                  notifyForced ? "text-red-600" : "text-orange-700"
                }`}
              >
                {notifyForced
                  ? "El día y la hora no cambian, pero el cliente va a tener que ir a otra dirección. Se le avisa siempre."
                  : clientPickedEmployee
                    ? `${appointment?.name} reservó pidiendo a esta persona en particular, así que conviene avisarle del cambio.`
                    : `${appointment?.name} no eligió profesional al reservar, así que el cambio probablemente le sea indistinto.`}
              </p>
            </div>

            <label
              className={`flex items-start gap-2.5 text-xs ${
                notifyForced ? "text-red-700" : "text-orange-800"
              } ${notifyForced ? "" : "cursor-pointer"}`}
            >
              <input
                type="checkbox"
                checked={notifyForced || notifyClient}
                disabled={notifyForced}
                onChange={(e) => setNotifyClient(e.target.checked)}
                className="mt-0.5 size-3.5 accent-orange-600 shrink-0 disabled:opacity-70"
              />
              <span>
                Avisarle al cliente por email.
                {(notifyForced || notifyClient) && (
                  <span className="block mt-0.5 opacity-80">
                    Si el cambio no le sirve va a poder cancelar
                    {hasDeposit ? " y se le devuelve la seña" : " sin costo"}.
                  </span>
                )}
              </span>
            </label>

            <div className="flex gap-2">
              <Button
                disabled={assigning}
                onClick={() => setConfirmReassign(false)}
                className="flex-1 h-9 text-xs bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-lg"
              >
                Volver
              </Button>
              <Button
                disabled={assigning}
                onClick={saveAssignment}
                className="flex-1 h-9 text-xs text-white bg-primary hover:bg-orange-500 border-none rounded-lg disabled:opacity-60"
              >
                {assigning ? "Guardando..." : "Confirmar cambio"}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

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
            {activeBranches.length > 0 && (
              <Field
                label="Sucursal"
                value={
                  assignedBranch ? (
                    <span className="break-words">{assignedBranch.name}</span>
                  ) : (
                    <span className="italic text-gray-400">Sin asignar</span>
                  )
                }
              />
            )}
            {activeEmployees.length > 0 && (
              <Field
                label="Profesional"
                value={
                  assignedEmployee ? (
                    <span className="break-words">
                      {assignedEmployee.name} {assignedEmployee.surname}
                    </span>
                  ) : (
                    <span className="italic text-gray-400">Cualquiera del equipo</span>
                  )
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

        {renderAssignment()}

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
          <Button className="w-full text-white bg-primary border-none rounded-lg h-11 hover:bg-orange-500">
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

        {/* Branch row */}
        {activeBranches.length > 0 && (
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-2">
              <LuMapPin className="text-gray-400 shrink-0" size={15} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Sucursal
              </span>
            </div>
            <span
              className={
                assignedBranch
                  ? "text-sm font-semibold text-gray-700"
                  : "text-sm font-medium text-gray-400 italic"
              }
            >
              {assignedBranch?.name ?? "Sin asignar"}
            </span>
          </div>
        )}

        {/* Employee row */}
        {activeEmployees.length > 0 && (
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-2">
              <LuUser className="text-gray-400 shrink-0" size={15} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Profesional
              </span>
            </div>
            <span
              className={
                assignedEmployee
                  ? "text-sm font-semibold text-gray-700"
                  : "text-sm font-medium text-gray-400 italic"
              }
            >
              {assignedEmployee
                ? `${assignedEmployee.name} ${assignedEmployee.surname}`
                : "Cualquiera del equipo"}
            </span>
          </div>
        )}
      </div>

      {renderAssignment()}

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
            className="w-full text-white bg-red-600 border-none rounded-lg h-11 hover:bg-red-700"
          >
            Eliminar turno
          </Button>
        </>
      )}
    </div>
  );
};

export default AppointmentModal;
