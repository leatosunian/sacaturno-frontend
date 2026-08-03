"use client";
import { useState } from "react";
import { IEmployee } from "@/interfaces/employee.interface";
import { IBusiness } from "@/interfaces/business.interface";
import { IService } from "@/interfaces/service.interface";
import ISubscription from "@/interfaces/subscription.interface";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LuUserPlus, LuUserX, LuUserCheck, LuMail, LuUser, LuMailCheck, LuCheck, LuPlus, LuLock } from "react-icons/lu";
import axiosReq from "@/config/axios";
import { toast } from "sonner";
import { getPlanLimits } from "@/lib/planLimits";

interface Props {
  businessData: IBusiness;
  initialEmployees: IEmployee[];
  initialServices: IService[];
  subscriptionData?: ISubscription | { response_data: object };
}

const StatusBadge = ({ status }: { status: IEmployee["status"] }) => {
  if (status === "active")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200">
        Activo
      </span>
    );
  if (status === "inactive")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500 border border-gray-200">
        Inactivo
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-50 text-primary border border-orange-200">
      Pendiente
    </span>
  );
};

const EmployeesSection: React.FC<Props> = ({ businessData, initialEmployees, initialServices, subscriptionData }) => {
  const [employees, setEmployees] = useState<IEmployee[]>(initialEmployees);

  const subscription =
    subscriptionData && "subscriptionType" in subscriptionData
      ? (subscriptionData as ISubscription)
      : null;
  const { maxEmployees } = getPlanLimits(subscription?.subscriptionType);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<IEmployee | null>(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<{ employee: IEmployee; action: "deactivate" | "activate" } | null>(null);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false);
  const [togglingService, setTogglingService] = useState<string | null>(null);

  // add form state
  const [newName, setNewName] = useState("");
  const [newSurname, setNewSurname] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPermissions, setNewPermissions] = useState<string[]>([]);

  // edit form state
  const [editPermissions, setEditPermissions] = useState<string[]>([]);

  const PERMISSION_LABELS: { key: string; label: string; description?: string }[] = [
    { key: "manage_own_appointments", label: "Gestionar propios turnos", description: "Puede crear y eliminar sus propios turnos" },
    { key: "manage_all_appointments", label: "Gestionar todos los turnos", description: "Puede crear y eliminar turnos de cualquier empleado" },
    { key: "view_stats", label: "Ver estadísticas del negocio" },
    { key: "manage_services", label: "Gestionar servicios" },
    { key: "manage_schedule", label: "Modificar agenda automática" },
  ];

  const getAuthHeader = () => {
    const token = localStorage.getItem("sacaturno_token");
    return {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const openEdit = (emp: IEmployee) => {
    setEditingEmployee(emp);
    setEditPermissions(emp.permissions ?? []);
    setEditModal(true);
  };

  const togglePermission = (key: string) => {
    setEditPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const toggleNewPermission = (key: string) => {
    setNewPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const handleResendInvite = async () => {
    if (!editingEmployee) return;
    setLoadingResend(true);
    try {
      await axiosReq.post(`/employee/${editingEmployee._id}/resend-invite`, {}, getAuthHeader());
      toast.success("Invitación reenviada correctamente", { position: "top-center" });
    } catch {
      toast.error("No se pudo reenviar la invitación", { position: "top-center" });
    } finally {
      setLoadingResend(false);
    }
  };

  const openConfirm = (employee: IEmployee, action: "deactivate" | "activate") => {
    setConfirmTarget({ employee, action });
    setConfirmModal(true);
  };

  const handleAdd = async () => {
    if (!newName.trim() || !newSurname.trim() || !newEmail.trim()) return;
    setLoadingAdd(true);
    try {
      const res = await axiosReq.post(
        "/employee/create",
        {
          businessID: businessData._id,
          ownerID: businessData.ownerID,
          name: newName.trim(),
          surname: newSurname.trim(),
          email: newEmail.trim(),
          permissions: newPermissions,
        },
        getAuthHeader()
      );
      setEmployees((prev) => [...prev, res.data]);
      setNewName("");
      setNewSurname("");
      setNewEmail("");
      setNewPermissions([]);
      setAddModal(false);
      toast.success("Invitación enviada correctamente", { position: "top-center" });
    } catch (error: any) {
      if (error?.response?.status === 409) {
        toast.error("Ya existe un empleado con ese email", { position: "top-center" });
      } else if (error?.response?.status === 400) {
        toast.error("Se alcanzó el límite máximo de empleados permitidos", { position: "top-center" });
      } else {
        toast.error("No se pudo enviar la invitación", { position: "top-center" });
      }
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleEdit = async () => {
    if (!editingEmployee) return;
    setLoadingAction(true);
    try {
      const res = await axiosReq.put(
        `/employee/${editingEmployee._id}`,
        {
          ownerID: businessData.ownerID,
          permissions: editPermissions,
        },
        getAuthHeader()
      );
      setEmployees((prev) =>
        prev.map((e) => (e._id === editingEmployee._id ? res.data : e))
      );
      setEditModal(false);
      setEditingEmployee(null);
      toast.success("Empleado actualizado", { position: "top-center" });
    } catch {
      toast.error("No se pudo actualizar el empleado", { position: "top-center" });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleToggleService = async (emp: IEmployee, svcId: string) => {
    const key = `${emp._id}:${svcId}`;
    if (togglingService === key) return;

    const current = emp.services ?? [];
    const updated = current.includes(svcId)
      ? current.filter((s) => s !== svcId)
      : [...current, svcId];

    setEmployees((prev) =>
      prev.map((e) => (e._id === emp._id ? { ...e, services: updated } : e))
    );
    setTogglingService(key);

    try {
      await axiosReq.put(
        `/employee/${emp._id}`,
        { ownerID: businessData.ownerID, services: updated },
        getAuthHeader()
      );
    } catch {
      setEmployees((prev) =>
        prev.map((e) => (e._id === emp._id ? { ...e, services: current } : e))
      );
      toast.error("No se pudo actualizar el servicio", { position: "top-center" });
    } finally {
      setTogglingService(null);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmTarget) return;
    const { employee, action } = confirmTarget;
    setLoadingAction(true);
    try {
      const res = await axiosReq.put(
        `/employee/${employee._id}`,
        {
          ownerID: businessData.ownerID,
          status: action === "deactivate" ? "inactive" : "active",
        },
        getAuthHeader()
      );
      setEmployees((prev) =>
        prev.map((e) => (e._id === employee._id ? res.data : e))
      );
      setConfirmModal(false);
      setConfirmTarget(null);
      toast.success(
        action === "deactivate" ? "Empleado desactivado" : "Empleado reactivado",
        { position: "top-center" }
      );
    } catch {
      toast.error("No se pudo completar la acción", { position: "top-center" });
    } finally {
      setLoadingAction(false);
    }
  };

  const activeCount = employees.filter((e) => e.status === "active").length;
  const pendingCount = employees.filter((e) => e.status === "pending").length;
  const atLimit = employees.length >= maxEmployees;

  const editPermissionsDirty = (() => {
    const original = (editingEmployee?.permissions ?? []) as string[];
    if (original.length !== editPermissions.length) return true;
    const originalSet = new Set(original);
    return editPermissions.some((p) => !originalSet.has(p));
  })();

  if (maxEmployees === 0) {
    return (
      <div className="flex flex-col gap-0 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden w-full max-w-4xl">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm 2xl:text-base font-semibold text-gray-800">Empleados</h2>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 py-10 px-6 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center">
            <LuLock size={20} className="text-gray-400" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-gray-700">Función disponible en los planes Pro y Full</p>
            <p className="text-xs text-gray-400 max-w-xs">
              Activá el Plan Pro o el Plan Full para invitar empleados a gestionar tu agenda.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-0 w-full max-w-4xl bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 2xl:px-8 2xl:py-5 border-b border-gray-100">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm 2xl:text-base font-semibold text-gray-800">Empleados</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500 border border-gray-200">
              {employees.length} / {maxEmployees}
            </span>
            {activeCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200">
                {activeCount} activo{activeCount !== 1 ? "s" : ""}
              </span>
            )}
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-50 text-primary border border-orange-200">
                {pendingCount} pendiente{pendingCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          {!atLimit && (
            <button
              type="button"
              onClick={() => setAddModal(true)}
              className="flex items-center gap-1.5 bg-primary hover:bg-orange-500 text-white text-[11px] 2xl:text-xs font-semibold px-3 2xl:px-4 py-1.5 2xl:py-2 rounded-lg transition-all duration-300 ease-in-out cursor-pointer"
            >
              <LuUserPlus size={14} />
              Invitar empleado
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center">
                <LuUser size={20} className="text-gray-400" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-gray-600">No tenés empleados</p>
                <p className="text-xs text-gray-400">
                  Agregá un empleado para asignarle turnos desde tu agenda.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-orange-500 text-white text-xs font-semibold transition-colors"
              >
                <LuUserPlus size={13} />
                Invitar empleado
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {employees.map((emp) => (
                <div
                  key={emp._id}
                  className="border border-gray-100 rounded-lg overflow-hidden"
                >
                  {/* Top row: info + actions */}
                  <div
                    onClick={() => openEdit(emp)}
                    className="flex items-center justify-between py-3 px-4 hover:bg-orange-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {emp.profileImage && emp.profileImage !== "user.png" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/getprofilepic/${emp.profileImage}`}
                            alt={emp.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <LuUser size={14} className="text-primary" />
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-800 truncate">{emp.name} {emp.surname}</span>
                          <StatusBadge status={emp.status} />
                        </div>
                        <span className="text-xs text-gray-400 truncate">{emp.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-3" onClick={(e) => e.stopPropagation()}>
                      {emp.status === "active" && (
                        <button
                          type="button"
                          title="Desactivar"
                          onClick={() => openConfirm(emp, "deactivate")}
                          className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LuUserX size={14} />
                        </button>
                      )}
                      {emp.status === "inactive" && (
                        <button
                          type="button"
                          title="Reactivar"
                          onClick={() => openConfirm(emp, "activate")}
                          className="p-1.5 rounded-md text-gray-500 hover:text-green-600 hover:bg-green-50 transition-colors"
                        >
                          <LuUserCheck size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Services row — only for active employees when there are services */}
                  {emp.status === "active" && initialServices.length > 0 && (
                    <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/60 flex flex-col gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Servicios asignados</span>
                    <div className="flex flex-wrap gap-1.5">
                      {initialServices.map((svc) => {
                        const assigned = (emp.services ?? []).includes(svc._id!);
                        const key = `${emp._id}:${svc._id}`;
                        const toggling = togglingService === key;
                        return (
                          <button
                            key={svc._id}
                            type="button"
                            disabled={toggling}
                            onClick={() => handleToggleService(emp, svc._id!)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                              assigned
                                ? "bg-primary text-white border-primary"
                                : "bg-white text-gray-400 border-gray-200 hover:border-orange-300 hover:text-gray-600"
                            } ${toggling ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                          >
                            {toggling ? (
                              <span className="w-2.5 h-2.5 rounded-full border border-current border-t-transparent animate-spin" />
                            ) : assigned ? (
                              <LuCheck size={10} strokeWidth={3} />
                            ) : (
                              <LuPlus size={10} strokeWidth={2.5} />
                            )}
                            {svc.name}
                          </button>
                        );
                      })}
                    </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Employee Modal */}
      <Dialog open={addModal} onOpenChange={(open) => { if (!open) { setAddModal(false); setNewName(""); setNewSurname(""); setNewEmail(""); setNewPermissions([]); } }}>
        <DialogContent className="sm:w-[400px] w-[93vw]">
          <div className="flex flex-col w-full gap-4">
            <div className="pb-4 border-b border-gray-100 flex flex-col gap-1">
              <h4 className="text-lg leading-none font-semibold text-gray-800">Nuevo empleado</h4>
              <p className="text-xs text-gray-400 mt-0.5">Se enviará un email de invitación. El empleado quedará como pendiente hasta que acepte la invitación.</p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-xs font-bold uppercase text-gray-700">
                    <span className="flex items-center gap-1.5"><LuUser size={11} /> Nombre</span>
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nombre"
                    maxLength={40}
                    className="h-9 w-full rounded-md border border-gray-200 px-3 text-sm bg-[rgb(245,245,245)] focus:border-orange-600 focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-xs font-bold uppercase text-gray-700">Apellido</label>
                  <input
                    type="text"
                    value={newSurname}
                    onChange={(e) => setNewSurname(e.target.value)}
                    placeholder="Apellido"
                    maxLength={40}
                    className="h-9 w-full rounded-md border border-gray-200 px-3 text-sm bg-[rgb(245,245,245)] focus:border-orange-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase text-gray-700">
                  <span className="flex items-center gap-1.5"><LuMail size={11} /> Email</span>
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="email@ejemplo.com"
                  maxLength={60}
                  className="h-9 w-full rounded-md border border-gray-200 px-3 text-sm bg-[rgb(245,245,245)] focus:border-orange-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase text-gray-700">Permisos</label>
              <div className="flex flex-col gap-2.5 rounded-lg border border-gray-100 bg-gray-50 p-3">
                {PERMISSION_LABELS.map(({ key, label, description }) => (
                  <label key={key} className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newPermissions.includes(key)}
                      onChange={() => toggleNewPermission(key)}
                      className="accent-orange-600 w-4 h-4 rounded cursor-pointer mt-0.5 shrink-0"
                    />
                    <div className="flex flex-col gap-0">
                      <span className="text-sm text-gray-700 leading-tight">{label}</span>
                      {description && <span className="text-[10px] text-gray-400 leading-tight">{description}</span>}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <Button
              disabled={!newName.trim() || !newSurname.trim() || !newEmail.trim() || loadingAdd}
              onClick={handleAdd}
              className="w-full h-10 text-white bg-primary hover:bg-orange-500 border-none rounded-lg shadow-lg"
            >
              {loadingAdd ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Enviando...
                </span>
              ) : "Enviar invitación"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Modal */}
      <Dialog open={editModal} onOpenChange={(open) => { if (!open) { setEditModal(false); setEditingEmployee(null); } }}>
        <DialogContent className="sm:w-[400px] w-[93vw]">
          <div className="flex flex-col w-full gap-4">
            <div className="pb-4 border-b border-gray-100 flex flex-col gap-1">
              <h4 className="text-lg leading-none font-semibold text-gray-800">Editar empleado</h4>
            </div>

            {editingEmployee?.status === "active" && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase text-gray-700">Permisos</label>
                <div className="flex flex-col gap-2.5 rounded-lg border border-gray-100 bg-gray-50 p-3">
                  {PERMISSION_LABELS.map(({ key, label, description }) => (
                    <label key={key} className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editPermissions.includes(key)}
                        onChange={() => togglePermission(key)}
                        className="accent-orange-600 w-4 h-4 rounded cursor-pointer mt-0.5 shrink-0"
                      />
                      <div className="flex flex-col gap-0">
                        <span className="text-sm text-gray-700 leading-tight">{label}</span>
                        {description && <span className="text-[10px] text-gray-400 leading-tight">{description}</span>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {editingEmployee?.status === "pending" && (
              <button
                type="button"
                disabled={loadingResend}
                onClick={handleResendInvite}
                className="flex items-center justify-center gap-2 w-full h-9 rounded-lg border border-orange-200 bg-orange-50 text-primary hover:bg-orange-100 transition-colors text-xs font-semibold disabled:opacity-60"
              >
                {loadingResend ? <span className="loaderSmall" /> : <><LuMailCheck size={14} /> Reenviar invitación</>}
              </button>
            )}

            <Button
              disabled={loadingAction || editingEmployee?.status !== "active" || !editPermissionsDirty}
              onClick={handleEdit}
              className="w-full h-10 text-white bg-primary hover:bg-orange-500 border-none rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
            >
              {loadingAction ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Guardando...
                </span>
              ) : "Guardar cambios"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm deactivate/activate Modal */}
      <Dialog open={confirmModal} onOpenChange={(open) => { if (!open) { setConfirmModal(false); setConfirmTarget(null); } }}>
        <DialogContent className="sm:w-[380px] w-[93vw]">
          <div className="flex flex-col gap-5 pb-1">
            <div className="flex flex-col gap-2 text-center">
              <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${confirmTarget?.action === "deactivate" ? "bg-red-50" : "bg-green-50"}`}>
                {confirmTarget?.action === "deactivate"
                  ? <LuUserX size={22} className="text-red-500" />
                  : <LuUserCheck size={22} className="text-green-600" />
                }
              </div>
              <h4 className="text-base font-semibold text-gray-800">
                {confirmTarget?.action === "deactivate" ? "Desactivar empleado" : "Reactivar empleado"}
              </h4>
              <p className="text-sm text-gray-500">
                {confirmTarget?.action === "deactivate"
                  ? `¿Desactivás a ${confirmTarget?.employee.name} ${confirmTarget?.employee.surname}? No aparecerá en el dropdown de asignación de turnos.`
                  : `¿Reactivás a ${confirmTarget?.employee.name} ${confirmTarget?.employee.surname}? Volvería a estar disponible para asignación de turnos.`
                }
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => { setConfirmModal(false); setConfirmTarget(null); }}
                className="flex-1 h-9 text-sm"
              >
                Cancelar
              </Button>
              <Button
                disabled={loadingAction}
                onClick={handleConfirmAction}
                className={`flex-1 h-9 text-sm text-white border-none ${confirmTarget?.action === "deactivate" ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"}`}
              >
                {loadingAction ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  </span>
                ) : confirmTarget?.action === "deactivate" ? "Desactivar" : "Reactivar"
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmployeesSection;
