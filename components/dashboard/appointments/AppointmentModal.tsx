"use client";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa6";
import { LuMapPin, LuUser, LuTrash2 } from "react-icons/lu";
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

const depositStatusConfig = {
  paid: {
    bg: "bg-green-50",
    border: "border-green-100",
    label: "text-green-700",
    value: "text-green-800",
    text: "Seña pagada",
  },
  pending: {
    bg: "bg-yellow-50",
    border: "border-yellow-100",
    label: "text-yellow-700",
    value: "text-yellow-800",
    text: "Seña pendiente",
  },
  failed: {
    bg: "bg-red-50",
    border: "border-red-100",
    label: "text-red-700",
    value: "text-red-800",
    text: "Pago fallido",
  },
};

const RailLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
    {children}
  </span>
);

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col gap-0.5 min-w-0">
    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
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

  const assignmentHeader = (action?: { label: string; onClick: () => void }) => (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
        Asignación
      </span>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="shrink-0 text-[11px] font-semibold text-orange-600 hover:underline transition-all duration-200 ease-in-out cursor-pointer"
        >
          {action.label}
        </button>
      )}
    </div>
  );

  // Función y no componente: definido acá adentro, un componente se remontaría
  // en cada render y cerraría el desplegable abierto.
  // `narrow`: el bloque va en la mitad de la columna derecha (turno reservado),
  // así que los selects se apilan en vez de ir a la par.
  const renderAssignment = (narrow = false) => {
    if (!hasTeam) return null;

    // En un turno reservado la asignación ya es un hecho: se lee como dato y los
    // selectores aparecen sólo si el dueño entra a cambiarla a propósito.
    if (canEditAssignment && (!isBooked || editingAssignment)) {
      return (
        <div className="flex flex-col gap-3 min-w-0">
          {assignmentHeader(
            isBooked
              ? { label: "Descartar", onClick: cancelAssignmentEdit }
              : undefined
          )}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${
              narrow ? "lg:grid-cols-1" : ""
            }`}
          >
            {activeBranches.length > 0 && (
              <div className="flex flex-col gap-1 min-w-0">
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
                  <SelectTrigger className="w-full h-9 text-xs bg-white">
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
              <div className="flex flex-col gap-1 min-w-0">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Profesional {assignmentRequired && <span className="text-primary">*</span>}
                </label>
                {assignmentRequired ? (
                  <Select
                    value={draftEmployeeID || undefined}
                    onValueChange={setDraftEmployeeID}
                  >
                    <SelectTrigger
                      className={`w-full h-9 text-xs bg-white ${
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
            <span className="text-[11px] text-orange-600">
              Ningún profesional coincide con la sucursal y el servicio de este turno.
            </span>
          ) : (
            <span className="text-[11px] text-gray-400">
              Los cambios se guardan al confirmar.
            </span>
          )}
        </div>
      );
    }

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
              className="w-full h-9 text-xs text-white bg-primary hover:bg-orange-500 border-none rounded-lg disabled:opacity-60"
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
    }

    // Lectura: turno reservado, o alguien sin permiso para reasignar.
    return (
      <div className="flex flex-col gap-3 min-w-0">
        {assignmentHeader(
          canEditAssignment
            ? { label: "Cambiar", onClick: () => setEditingAssignment(true) }
            : undefined
        )}
        {activeBranches.length > 0 && (
          <Field
            label="Sucursal"
            value={
              <span className="flex items-center gap-1.5">
                <LuMapPin className="text-gray-400 shrink-0" size={14} />
                {assignedBranch ? (
                  <span className="break-words">{assignedBranch.name}</span>
                ) : (
                  <span className="italic text-gray-400">Sin asignar</span>
                )}
              </span>
            }
          />
        )}
        {activeEmployees.length > 0 && (
          <Field
            label="Profesional"
            value={
              <span className="flex items-center gap-1.5">
                <LuUser className="text-gray-400 shrink-0" size={14} />
                {assignedEmployee ? (
                  <span className="break-words">
                    {assignedEmployee.name} {assignedEmployee.surname}
                  </span>
                ) : (
                  <span className="italic text-gray-400">Cualquiera del equipo</span>
                )}
              </span>
            }
          />
        )}
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
        <div className="flex flex-col gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3.5">
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
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-5">
          <div className="flex flex-col gap-3 min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
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
          {renderAssignment(true)}
        </div>
      );
    }

    return (
      renderAssignment() ?? (
        <p className="text-sm text-gray-400">
          Este turno queda disponible para que lo reserve un cliente.
        </p>
      )
    );
  };

  const renderFooter = () => {
    if (confirmReassign) {
      return (
        <>
          <Button
            disabled={assigning}
            onClick={() => setConfirmReassign(false)}
            className="h-9 px-4 text-xs bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-lg"
          >
            Volver
          </Button>
          <Button
            disabled={assigning}
            onClick={saveAssignment}
            className="h-9 px-4 text-xs text-white bg-primary hover:bg-orange-500 border-none rounded-lg disabled:opacity-60"
          >
            {assigning ? "Guardando..." : "Confirmar cambio"}
          </Button>
        </>
      );
    }

    if (confirmCancel) {
      return (
        <>
          <Button
            onClick={() => setConfirmCancel(false)}
            className="h-9 px-4 text-xs bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-lg"
          >
            Volver
          </Button>
          <Button
            onClick={handleCancel}
            className="h-9 px-4 text-xs text-white bg-red-600 hover:bg-red-700 border-none rounded-lg"
          >
            Confirmar cancelación
          </Button>
        </>
      );
    }

    return (
      <>
        {isBooked ? (
          <Link
            target="_blank"
            href={`https://wa.me/54${appointment?.phone}`}
            className="shrink-0"
          >
            <Button className="h-9 px-4 text-xs bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-lg">
              <FaWhatsapp size={14} /> WhatsApp
            </Button>
          </Link>
        ) : (
          <Button
            onClick={closeModalF}
            className="h-9 px-4 text-xs bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-lg"
          >
            Cerrar
          </Button>
        )}
        {canEditAssignment && assignDirty && (
          <Button
            disabled={assigning || employeeMissing}
            onClick={startSave}
            className="h-9 px-4 text-xs text-white bg-primary hover:bg-orange-500 border-none rounded-lg disabled:opacity-60"
          >
            Guardar asignación
          </Button>
        )}
      </>
    );
  };

  const destructiveAction = () => {
    if (confirming) return null;
    if (isBooked) {
      if (!onCancel || !canDelete) return null;
      return (
        <Button
          onClick={() => setConfirmCancel(true)}
          className="h-9 px-4 text-xs bg-white text-red-600 hover:bg-red-50 border border-red-200 rounded-lg"
        >
          Cancelar turno
        </Button>
      );
    }
    if (!canDelete) return null;
    return (
      <Button
        onClick={handleDelete}
        className="h-9 px-4 text-xs bg-white text-red-600 hover:bg-red-50 border border-red-200 rounded-lg"
      >
        <LuTrash2 size={14} /> Eliminar turno
      </Button>
    );
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-[auto_minmax(0,1fr)] w-full max-h-[85dvh] overflow-hidden">
      {/* Resumen: lo que no se edita desde acá. El riel se mide por su contenido
          (la fecha larga es la que manda) en vez de tener un ancho fijo, así no
          sobra aire con fechas cortas ni se corta "miércoles 30 de septiembre". */}
      <aside className="shrink-0 min-h-0 lg:min-w-[250px] lg:max-w-[340px] lg:overflow-y-auto flex flex-col gap-4 px-6 py-5 bg-orange-50/60 border-b lg:border-b-0 lg:border-r border-orange-100">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center justify-center w-11 h-11 bg-primary rounded-lg shrink-0">
            <span className="text-lg font-black text-white leading-none">
              {dayjs(appointment?.start).format("DD")}
            </span>
            <span className="text-[9px] font-bold text-orange-200 uppercase leading-none mt-0.5">
              {dayjs(appointment?.start).format("MMM")}
            </span>
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[15px] leading-tight font-semibold text-gray-800 capitalize whitespace-nowrap">
              {dayjs(appointment?.start).format("dddd DD [de] MMMM")}
            </span>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <Clock className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-sm leading-none font-medium text-gray-500">
                {dayjs(appointment?.start).format("HH:mm")} —{" "}
                {dayjs(appointment?.end).format("HH:mm [hs]")}
              </span>
            </div>
          </div>
        </div>

        <div className="h-px mt-1 bg-orange-100" />

        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3.5">
          <div className="flex flex-col gap-1 min-w-0">
            <RailLabel>Servicio</RailLabel>
            <span className="text-[13px] font-semibold text-gray-800 leading-snug break-words">
              {appointment?.service}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <RailLabel>Precio</RailLabel>
            <span className="text-lg font-bold text-gray-800 leading-none">
              $ {appointment?.price?.toLocaleString("es-AR")}
            </span>
          </div>
          {hasDeposit && !depositCfg && (
            <div className="flex flex-col gap-1">
              <RailLabel>Seña</RailLabel>
              <span className="text-[13px] font-semibold text-orange-600">
                $ {appointment!.depositAmount!.toLocaleString("es-AR")}
              </span>
            </div>
          )}
          {hasDeposit && depositCfg && (
            <div
              className={`flex flex-col gap-0.5 rounded-lg border px-2.5 py-2 ${depositCfg.bg} ${depositCfg.border}`}
            >
              <span
                className={`text-[10px] font-bold uppercase tracking-widest ${depositCfg.label}`}
              >
                Seña
              </span>
              <span className={`text-xs font-semibold ${depositCfg.value}`}>
                $ {appointment!.depositAmount!.toLocaleString("es-AR")} —{" "}
                {depositCfg.text}
              </span>
              {appointment?.depositStatus === "paid" && appointment.mpPaymentID && (
                <span className="text-[10px] tracking-wide text-gray-400 mt-0.5 break-all">
                  ID {appointment.mpPaymentID}
                </span>
              )}
            </div>
          )}
        </div>

        {!isBooked && (
          <div className="hidden lg:flex mt-auto items-center gap-1.5 w-fit rounded-full bg-gray-100 px-2.5 py-1">
            <Calendar className="w-3 h-3 text-gray-500 shrink-0" />
            <span className="text-[11px] font-medium text-gray-600">Sin reservar</span>
          </div>
        )}
      </aside>

      {/* Contenido y acciones */}
      <section className="flex flex-col min-h-0 flex-1">
        <div className="shrink-0 flex flex-col gap-0.5 px-6 py-6 pr-14 border-b border-gray-100">
          {isBooked ? (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 shrink-0">
                <Check size={13} className="text-white" strokeWidth={3} />
              </div>
              <h4 className="text-lg leading-none font-semibold text-gray-800">
                Turno reservado
              </h4>
            </div>
          ) : (
            <>
              <h4 className="text-lg leading-none font-semibold text-gray-800">
                Turno disponible
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Este turno aún no fue reservado
              </p>
            </>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
          {renderBody()}
        </div>

        <div className="shrink-0 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 px-6 py-4 border-t border-gray-100">
          {destructiveAction() ?? <span className="hidden sm:block" />}
          <div className="flex items-center justify-end gap-2">{renderFooter()}</div>
        </div>
      </section>
    </div>
  );
};

export default AppointmentModal;
