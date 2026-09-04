"use client";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/es-mx";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa6";
import { LuMapPin, LuUser, LuTrash2, LuPhone, LuMail } from "react-icons/lu";
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
import { Clock, Check, Calendar } from "lucide-react";

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

// Botones: las mismas piezas que el resto del panel (DESIGN.md §8.1).
const BTN =
  "inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg text-xs font-semibold transition-all duration-200 ease-in-out cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed";
const BTN_PRIMARY = `${BTN} bg-primary text-white hover:bg-orange-500`;
const BTN_OUTLINE = `${BTN} border border-primary text-primary bg-white hover:bg-primary hover:text-white`;
const BTN_NEUTRAL = `${BTN} border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 hover:border-gray-300`;
const BTN_DANGER_SOFT = `${BTN} border border-red-200 text-red-600 bg-white hover:bg-red-50 hover:border-red-300`;
const BTN_DANGER = `${BTN} bg-red-600 text-white hover:bg-red-700`;

const depositStatusConfig = {
  paid: {
    bg: "bg-green-50",
    border: "border-green-200",
    label: "text-green-700",
    value: "text-green-800",
    chip: "bg-green-100 text-green-700",
    text: "Pagada",
  },
  pending: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    label: "text-amber-700",
    value: "text-amber-900",
    chip: "bg-amber-100 text-amber-800",
    text: "Pendiente",
  },
  failed: {
    bg: "bg-red-50",
    border: "border-red-200",
    label: "text-red-700",
    value: "text-red-800",
    chip: "bg-red-100 text-red-700",
    text: "Fallida",
  },
  none: {
    bg: "bg-white/70",
    border: "border-orange-200",
    label: "text-orange-600",
    value: "text-gray-800",
    chip: "bg-orange-100 text-orange-700",
    text: "A cobrar",
  },
};

const d = (value?: Date) => dayjs(value).locale("es-mx");
const capFirst = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const Label = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
    {children}
  </span>
);

const SectionTitle = ({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: { label: string; onClick: () => void };
}) => (
  <div className="flex items-center justify-between gap-3 mb-3">
    <span className="flex items-center gap-2 min-w-0">
      <span className="w-[3px] h-4 rounded-full bg-primary shrink-0" />
      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700">
        {children}
      </span>
    </span>
    {action && (
      <button
        type="button"
        onClick={action.onClick}
        className="shrink-0 text-[11px] font-semibold text-primary hover:underline transition-all duration-200 ease-in-out cursor-pointer"
      >
        {action.label}
      </button>
    )}
  </div>
);

// Ficha de dato: el icono ancla la lectura y las dos columnas quedan a la misma
// altura, así el bloque no se desarma cuando un mail es largo.
const InfoTile = ({
  icon,
  label,
  value,
  href,
  muted = false,
  breakAll = false,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  href?: string;
  muted?: boolean;
  breakAll?: boolean;
  className?: string;
}) => {
  const base = `group flex items-start gap-2.5 rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-2.5 min-w-0 h-full ${className}`;
  const body = (
    <>
      <span className="flex items-center justify-center w-8 h-8 shrink-0 rounded-lg bg-white border border-gray-200 text-gray-400 group-hover:text-primary group-hover:border-orange-200 transition-colors duration-200">
        {icon}
      </span>
      <span className="flex flex-col gap-0.5 min-w-0 pt-0.5">
        <Label>{label}</Label>
        <span
          className={`text-[13px] font-medium leading-snug ${
            breakAll ? "break-all" : "break-words"
          } ${muted ? "italic text-gray-400" : "text-gray-800"}`}
        >
          {value}
        </span>
      </span>
    </>
  );

  if (!href) return <div className={base}>{body}</div>;
  return (
    <a
      href={href}
      className={`${base} hover:border-orange-200 hover:bg-orange-50/50 transition-colors duration-200`}
    >
      {body}
    </a>
  );
};

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
  const [editingAssignment, setEditingAssignment] = useState(false);

  useEffect(() => {
    setIsBooked(appointment?.status === "booked");
    setConfirmCancel(false);
    setDraftEmployeeID(appointment?.employeeID ?? "");
    setDraftBranchID(appointment?.branchID ?? "");
    setAssigning(false);
    setConfirmReassign(false);
    setEditingAssignment(false);
  }, [appointment]);

  const handleDelete = () => {
    if (!appointment?._id) return;
    onDelete(appointment._id);
  };

  const handleCancel = () => {
    if (!appointment?._id || !onCancel) return;
    onCancel(appointment._id);
  };

  // Cancelar desde el panel siempre devuelve la seña, pero sólo si llegó a
  // acreditarse: una seña pendiente o fallida no tiene plata que devolver.
  const willRefund =
    appointment?.depositStatus === "paid" &&
    appointment?.depositAmount !== undefined &&
    appointment.depositAmount > 0;

  const depositNotSettled =
    !willRefund &&
    appointment?.depositAmount !== undefined &&
    appointment.depositAmount > 0;

  const hasDeposit =
    appointment?.depositAmount !== undefined && appointment.depositAmount > 0;
  const depositCfg =
    appointment?.depositStatus && appointment.depositStatus !== "none"
      ? depositStatusConfig[
          appointment.depositStatus as keyof typeof depositStatusConfig
        ]
      : depositStatusConfig.none;

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

  // Con dos o más profesionales elegibles hay una decisión real que tomar y el
  // turno no se guarda sin ella. Con uno solo no hay nada que elegir: se
  // autoasigna y el selector queda como dato.
  const assignmentRequired = eligibleEmployees.length >= 2;
  const soleEligible = eligibleEmployees.length === 1 ? eligibleEmployees[0] : null;
  const soleEligibleID = soleEligible?._id ?? "";
  const resolvedEmployeeID = assignmentRequired
    ? draftEmployeeID
    : draftEmployeeID || soleEligibleID;
  const employeeMissing = assignmentRequired && !draftEmployeeID;

  // Compara el borrador, no el valor resuelto: si no, la autoasignación del
  // único profesional dejaría "sucio" el turno apenas se abre el modal.
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
  const canEditAssignment = !!onAssign && hasTeam && canAssignAny;

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
    if (ok) {
      setEditingAssignment(false);
    } else {
      setDraftEmployeeID(appointment.employeeID ?? "");
      setDraftBranchID(appointment.branchID ?? "");
    }
  };

  const cancelAssignmentEdit = () => {
    setDraftEmployeeID(appointment?.employeeID ?? "");
    setDraftBranchID(appointment?.branchID ?? "");
    setEditingAssignment(false);
  };

  const saveAssignment = () =>
    runAssign({
      employeeID: resolvedEmployeeID || null,
      branchID: draftBranchID || null,
      notifyClient: affectsClient && (notifyForced || notifyClient),
    });

  const startSave = () => {
    if (employeeMissing) return;
    if (affectsClient) {
      setNotifyClient(notifyForced || clientPickedEmployee);
      setConfirmReassign(true);
      return;
    }
    saveAssignment();
  };

  // Los paneles de confirmación reemplazan el cuerpo en vez de empujarlo hacia
  // abajo: en horizontal el alto es el recurso escaso.
  const confirming = confirmReassign || confirmCancel;

  const clientInitials = (appointment?.name ?? "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();

  // Distancia en días: lo primero que se quiere saber al abrir un turno.
  const dayDiff = d(appointment?.start)
    .startOf("day")
    .diff(dayjs().startOf("day"), "day");
  const relativeLabel =
    dayDiff === 0
      ? "Hoy"
      : dayDiff === 1
        ? "Mañana"
        : dayDiff === -1
          ? "Ayer"
          : dayDiff > 1
            ? `En ${dayDiff} días`
            : `Hace ${Math.abs(dayDiff)} días`;

  const selectTriggerClass =
    "w-full h-9 text-xs bg-gray-50 border-gray-200 hover:border-orange-600 focus:border-orange-600 transition-colors duration-200";

  // Función y no componente: definido acá adentro, un componente se remontaría
  // en cada render y cerraría el desplegable abierto.
  const renderAssignment = () => {
    if (!hasTeam) return null;

    // En un turno reservado la asignación ya es un hecho: se lee como dato y los
    // selectores aparecen sólo si el dueño entra a cambiarla a propósito.
    if (canEditAssignment && (!isBooked || editingAssignment)) {
      return (
        <div className="min-w-0">
          <SectionTitle
            action={
              isBooked
                ? { label: "Descartar", onClick: cancelAssignmentEdit }
                : undefined
            }
          >
            Asignación
          </SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeBranches.length > 0 && (
              <div className="flex flex-col gap-1.5 min-w-0">
                <Label>Sucursal</Label>
                <Select
                  value={draftBranchID || "none"}
                  onValueChange={(v) => {
                    setDraftBranchID(v === "none" ? "" : v);
                    setDraftEmployeeID("");
                  }}
                >
                  <SelectTrigger className={selectTriggerClass}>
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
              <div className="flex flex-col gap-1.5 min-w-0">
                <Label>
                  Profesional{" "}
                  {assignmentRequired && <span className="text-primary">*</span>}
                </Label>
                {assignmentRequired ? (
                  <Select
                    value={draftEmployeeID || undefined}
                    onValueChange={setDraftEmployeeID}
                  >
                    <SelectTrigger
                      className={`${selectTriggerClass} ${
                        employeeMissing ? "border-orange-400" : ""
                      }`}
                    >
                      <SelectValue placeholder="Elegí un profesional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Profesionales</SelectLabel>
                        {eligibleEmployees.map((e) => (
                          <SelectItem key={e._id} value={e._id!}>
                            {e.name} {e.surname}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center h-9 px-3 rounded-md border border-gray-200 bg-gray-50 text-xs text-gray-600 truncate">
                    {soleEligible
                      ? `${soleEligible.name} ${soleEligible.surname}`.trim()
                      : "Sin profesional disponible"}
                  </div>
                )}
                {employeeMissing && (
                  <span className="text-[10px] text-orange-600">
                    Elegí quién atiende este turno.
                  </span>
                )}
              </div>
            )}
          </div>

          {activeEmployees.length > 0 && eligibleEmployees.length === 0 ? (
            <span className="block mt-2.5 text-[11px] text-orange-600">
              Ningún profesional coincide con la sucursal y el servicio de este turno.
            </span>
          ) : (
            <span className="block mt-2.5 text-[11px] text-gray-400">
              Los cambios se guardan al confirmar.
            </span>
          )}
        </div>
      );
    }

    if (showClaim) {
      if (!appointment?.employeeID) {
        return (
          <div className="flex flex-col gap-3 p-4 rounded-xl border border-orange-200 bg-orange-50/60">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-gray-800">
                Este turno no tiene profesional
              </span>
              <span className="text-xs text-gray-500 leading-relaxed">
                Cualquiera del equipo puede atenderlo. Tomalo si lo vas a hacer vos.
              </span>
            </div>
            <button
              type="button"
              disabled={assigning}
              onClick={() => runAssign({ employeeID: currentEmployeeID })}
              className={`${BTN_PRIMARY} w-full`}
            >
              {assigning ? "Asignando..." : "Asignarme el turno"}
            </button>
          </div>
        );
      }
      if (isMine) {
        return (
          <div className="flex items-center justify-between gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/70">
            <span className="flex items-center gap-2.5 min-w-0">
              <span className="flex items-center justify-center w-8 h-8 shrink-0 rounded-lg bg-white border border-gray-200 text-primary">
                <LuUser size={15} />
              </span>
              <span className="text-sm font-medium text-gray-700">
                Este turno es tuyo
              </span>
            </span>
            <button
              type="button"
              disabled={assigning}
              onClick={() => runAssign({ employeeID: null })}
              className="shrink-0 text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors duration-200 disabled:opacity-60 cursor-pointer"
            >
              Soltar turno
            </button>
          </div>
        );
      }
    }

    // Lectura: turno reservado, o alguien sin permiso para reasignar.
    return (
      <div className="min-w-0">
        <SectionTitle
          action={
            canEditAssignment
              ? { label: "Cambiar", onClick: () => setEditingAssignment(true) }
              : undefined
          }
        >
          Asignación
        </SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {activeBranches.length > 0 && (
            <InfoTile
              icon={<LuMapPin size={15} />}
              label="Sucursal"
              value={assignedBranch ? assignedBranch.name : "Sin asignar"}
              muted={!assignedBranch}
            />
          )}
          {activeEmployees.length > 0 && (
            <InfoTile
              icon={<LuUser size={15} />}
              label="Profesional"
              value={
                assignedEmployee
                  ? `${assignedEmployee.name} ${assignedEmployee.surname}`
                  : "Cualquiera del equipo"
              }
              muted={!assignedEmployee}
            />
          )}
        </div>
      </div>
    );
  };

  const renderBody = () => {
    if (confirmReassign) {
      return (
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
        </div>
      );
    }

    if (confirmCancel) {
      return (
        <div className="flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">
          <span className="text-sm font-semibold text-red-700">
            Cancelar este turno
          </span>
          <p className="text-[13px] leading-relaxed text-red-600">
            Se liberará este turno y se le avisará al cliente por email.
            {willRefund && (
              <>
                {" "}Como la cancelación la hacés vos, se le{" "}
                <strong>
                  reembolsará la seña de $
                  {appointment!.depositAmount!.toLocaleString("es-AR")}
                </strong>{" "}
                vía Mercado Pago.
              </>
            )}
            {depositNotSettled && (
              <>
                {" "}La seña de $
                {appointment!.depositAmount!.toLocaleString("es-AR")} nunca se
                acreditó, así que no hay nada que reembolsar.
              </>
            )}
          </p>
        </div>
      );
    }

    if (isBooked) {
      const assignment = renderAssignment();
      return (
        <div className="flex flex-col gap-5">
          <div className="min-w-0">
            <SectionTitle>Cliente</SectionTitle>
            <div className="flex items-center gap-3 mb-3 min-w-0">
              <span className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-orange-100 text-primary text-[13px] font-bold">
                {clientInitials || "?"}
              </span>
              <span className="flex flex-col min-w-0">
                <span className="text-[15px] font-semibold text-gray-800 leading-tight break-words">
                  {appointment?.name}
                </span>
                <span className="text-[11px] text-gray-400 mt-0.5">
                  Reservó este turno
                </span>
              </span>
            </div>
            {/* El mail es siempre más largo que el teléfono: se lleva 3/5 del
                ancho para no partirse al medio de una palabra. */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              <InfoTile
                className="sm:col-span-2"
                icon={<LuPhone size={15} />}
                label="Teléfono"
                value={`+54 ${appointment?.phone}`}
                href={`tel:+54${appointment?.phone}`}
              />
              <InfoTile
                className="sm:col-span-3"
                icon={<LuMail size={15} />}
                label="Email"
                value={appointment?.email}
                href={`mailto:${appointment?.email}`}
                breakAll
              />
            </div>
          </div>

          {assignment && (
            <>
              <div className="h-px bg-gray-100" />
              {assignment}
            </>
          )}
        </div>
      );
    }

    return (
      renderAssignment() ?? (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <span className="flex items-center justify-center w-11 h-11 rounded-full bg-gray-50 border border-gray-100 text-gray-300">
            <Calendar className="w-5 h-5" />
          </span>
          <span className="text-sm font-semibold text-gray-700">Turno libre</span>
          <p className="text-xs text-gray-400 max-w-[280px] leading-relaxed">
            Queda publicado en tu perfil para que lo reserve un cliente.
          </p>
        </div>
      )
    );
  };

  const renderFooter = () => {
    if (confirmReassign) {
      return (
        <>
          <button
            type="button"
            disabled={assigning}
            onClick={() => setConfirmReassign(false)}
            className={`${BTN_NEUTRAL} w-full sm:w-auto`}
          >
            Volver
          </button>
          <button
            type="button"
            disabled={assigning}
            onClick={saveAssignment}
            className={`${BTN_PRIMARY} w-full sm:w-auto`}
          >
            {assigning ? "Guardando..." : "Confirmar cambio"}
          </button>
        </>
      );
    }

    if (confirmCancel) {
      return (
        <>
          <button
            type="button"
            onClick={() => setConfirmCancel(false)}
            className={`${BTN_NEUTRAL} w-full sm:w-auto`}
          >
            Volver
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className={`${BTN_DANGER} w-full sm:w-auto`}
          >
            Confirmar cancelación
          </button>
        </>
      );
    }

    return (
      <>
        {isBooked ? (
          <Link
            target="_blank"
            href={`https://wa.me/54${appointment?.phone}`}
            className={`${BTN_OUTLINE} w-full sm:w-auto`}
          >
            <FaWhatsapp size={15} /> Escribirle por WhatsApp
          </Link>
        ) : (
          <button
            type="button"
            onClick={closeModalF}
            className={`${BTN_NEUTRAL} w-full sm:w-auto`}
          >
            Cerrar
          </button>
        )}
        {canEditAssignment && assignDirty && (
          <button
            type="button"
            disabled={assigning || employeeMissing}
            onClick={startSave}
            className={`${BTN_PRIMARY} w-full sm:w-auto`}
          >
            Guardar asignación
          </button>
        )}
      </>
    );
  };

  const destructiveAction = () => {
    if (confirming) return null;
    if (isBooked) {
      if (!onCancel || !canDelete) return null;
      return (
        <button
          type="button"
          onClick={() => setConfirmCancel(true)}
          className={`${BTN_DANGER_SOFT} w-full sm:w-auto`}
        >
          Cancelar turno
        </button>
      );
    }
    if (!canDelete) return null;
    return (
      <button
        type="button"
        onClick={handleDelete}
        className={`${BTN_DANGER_SOFT} w-full sm:w-auto`}
      >
        <LuTrash2 size={14} /> Eliminar turno
      </button>
    );
  };

  return (
    <div className="flex flex-col w-full max-h-[85dvh] overflow-hidden bg-white">
      {/* Encabezado: el estado del turno, a lo ancho de todo el modal. */}
      <header className="shrink-0 flex items-center gap-3 px-5 sm:px-6 py-4 pr-14 border-b border-gray-100">
        <span
          className={`flex items-center justify-center w-9 h-9 shrink-0 rounded-xl border ${
            isBooked
              ? "bg-green-50 text-green-600 border-green-100"
              : "bg-gray-50 text-gray-400 border-gray-100"
          }`}
        >
          {isBooked ? (
            <Check size={17} strokeWidth={3} />
          ) : (
            <Calendar className="w-4 h-4" />
          )}
        </span>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <h4 className="text-base sm:text-lg leading-none font-semibold text-gray-800 truncate">
              {isBooked ? "Turno reservado" : "Turno disponible"}
            </h4>
            <span
              className={`shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                dayDiff === 0
                  ? "bg-orange-100 text-orange-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {relativeLabel}
            </span>
          </div>
          {!isBooked && (
            <p className="text-xs text-gray-400 mt-1.5 truncate">
              Todavía no lo reservó nadie
            </p>
          )}
        </div>
      </header>

      {/* Cuerpo: resumen inmutable a la izquierda, detalle editable a la derecha. */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        <aside className="shrink-0 lg:w-[272px] lg:overflow-y-auto flex flex-col gap-4 px-5 sm:px-6 py-5 bg-orange-50/60 border-b lg:border-b-0 lg:border-r border-orange-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex flex-col items-center justify-center w-12 h-12 bg-primary rounded-xl shrink-0 shadow-sm">
              <span className="text-lg font-black text-white leading-none">
                {d(appointment?.start).format("DD")}
              </span>
              <span className="text-[9px] font-bold text-orange-100 uppercase leading-none mt-0.5">
                {d(appointment?.start).format("MMM").replace(".", "")}
              </span>
            </div>
            <div className="flex flex-col gap-1.5 min-w-0">
              <span className="text-sm leading-snug font-semibold text-gray-800">
                {capFirst(d(appointment?.start).format("dddd D [de] MMMM"))}
              </span>
              <span className="flex items-center gap-1.5 min-w-0">
                <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="text-[13px] leading-none font-medium text-gray-500">
                  {d(appointment?.start).format("HH:mm")} —{" "}
                  {d(appointment?.end).format("HH:mm [hs]")}
                </span>
              </span>
            </div>
          </div>

          <div className="h-px bg-orange-100" />

          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="flex flex-col gap-1 min-w-0">
              <Label>Servicio</Label>
              <span className="text-[13px] font-semibold text-gray-800 leading-snug break-words">
                {appointment?.service}
              </span>
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <Label>Precio</Label>
              <span className="text-xl font-bold text-gray-800 leading-none">
                $ {appointment?.price?.toLocaleString("es-AR")}
              </span>
            </div>
          </div>

          {hasDeposit && (
            <div
              className={`flex flex-col gap-1.5 rounded-xl border px-3 py-2.5 ${depositCfg.bg} ${depositCfg.border}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest ${depositCfg.label}`}
                >
                  Seña
                </span>
                <span
                  className={`shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${depositCfg.chip}`}
                >
                  {depositCfg.text}
                </span>
              </div>
              <span
                className={`text-[15px] font-bold leading-none ${depositCfg.value}`}
              >
                $ {appointment!.depositAmount!.toLocaleString("es-AR")}
              </span>
              {appointment?.depositStatus === "paid" && appointment.mpPaymentID && (
                <span
                  title={`Pago de Mercado Pago ${appointment.mpPaymentID}`}
                  className="text-[10px] leading-tight tracking-wide text-gray-400 truncate"
                >
                  MP · {appointment.mpPaymentID}
                </span>
              )}
            </div>
          )}
        </aside>

        <section className="flex-1 min-w-0 lg:min-h-0 lg:overflow-y-auto px-5 sm:px-6 py-5">
          {renderBody()}
        </section>
      </div>

      {/* Acciones: a lo ancho del modal, la destructiva separada del resto. */}
      <footer className="shrink-0 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 px-5 sm:px-6 py-3.5 border-t border-gray-100 bg-gray-50/60">
        {destructiveAction() ?? <span className="hidden sm:block" />}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-2">
          {renderFooter()}
        </div>
      </footer>
    </div>
  );
};

export default AppointmentModal;
