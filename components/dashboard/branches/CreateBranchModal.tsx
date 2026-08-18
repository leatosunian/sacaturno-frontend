"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { branchSchema, BranchFormData } from "@/app/schemas/branchSchema";
import { IBranch } from "@/interfaces/branch.interface";
import { IBusiness } from "@/interfaces/business.interface";
import { IEmployee } from "@/interfaces/employee.interface";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LuUsers } from "react-icons/lu";
import { toast } from "sonner";
import axiosReq from "@/config/axios";
import BranchFormFields from "./BranchFormFields";

import { BranchAssignmentResult } from "./BranchAssignmentModal";

interface Props {
  open: boolean;
  onClose: () => void;
  businessData: IBusiness;
  activeEmployees: IEmployee[];
  isFirstBranch: boolean;
  onCreated: (branch: IBranch, assignment: BranchAssignmentResult) => void;
}

const EMPTY: BranchFormData = { name: "", street: "", number: "", city: "", province: "", phone: "", email: "" };

const CreateBranchModal: React.FC<Props> = ({
  open,
  onClose,
  businessData,
  activeEmployees,
  isFirstBranch,
  onCreated,
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  // El padre recrea el array de empleados en cada render, así que la dependencia
  // del efecto es la lista de IDs serializada: si no, cada render pisaría lo tildado.
  const employeeIDsKey = activeEmployees.map((e) => e._id).filter(Boolean).join(",");

  // El dueño publicado como prestador arranca tildado: una sucursal que no
  // marque lo dejaría fuera del filtro público de esa sucursal sin aviso.
  const ownerID = activeEmployees.find((e) => e.isOwner)?._id ?? "";

  // Con la primera sucursal el negocio entero se muda ahí, así que arranca con
  // todos tildados. De la segunda en adelante la asignación es una decisión.
  useEffect(() => {
    if (!open) return;
    setSelectedEmployees(
      isFirstBranch
        ? employeeIDsKey.split(",").filter(Boolean)
        : [ownerID].filter(Boolean)
    );
  }, [open, isFirstBranch, employeeIDsKey, ownerID]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<BranchFormData>({
    resolver: zodResolver(branchSchema),
    mode: "onChange",
  });

  const toggleEmployee = (empID: string) =>
    setSelectedEmployees((prev) =>
      prev.includes(empID) ? prev.filter((id) => id !== empID) : [...prev, empID]
    );

  const allSelected =
    activeEmployees.length > 0 && selectedEmployees.length === activeEmployees.length;

  const toggleAll = () =>
    setSelectedEmployees(allSelected ? [] : employeeIDsKey.split(",").filter(Boolean));

  const handleClose = () => {
    reset(EMPTY);
    setSelectedEmployees([]);
    onClose();
  };

  const onSubmit = handleSubmit(async (data) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("sacaturno_token");
      const res = await axiosReq.post(
        "/branch/create",
        {
          businessID: businessData._id,
          ownerID: businessData.ownerID,
          name: data.name.trim(),
          street: data.street.trim(),
          number: data.number.trim(),
          city: data.city?.trim() || undefined,
          province: data.province?.trim() || undefined,
          phone: data.phone?.trim() ? Number(data.phone) : null,
          email: data.email?.trim() || undefined,
          employeeIDs: selectedEmployees,
        },
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
      );
      const {
        branch,
        isFirstBranch: wasFirstBranch,
        assignedSchedules,
        assignedAppointments,
        assignedEmployees,
        assignedEmployeeIDs,
        totalSchedules,
      } = res.data;
      onCreated(branch, {
        branchName: branch.name,
        isFirstBranch: !!wasFirstBranch,
        assignedSchedules: assignedSchedules ?? 0,
        assignedAppointments: assignedAppointments ?? 0,
        assignedEmployees: assignedEmployees ?? 0,
        assignedEmployeeIDs: assignedEmployeeIDs ?? [],
        totalSchedules: totalSchedules ?? 0,
      });
      handleClose();
      toast.success("Sucursal creada correctamente", { position: "top-center" });
    } catch (error: any) {
      if (error?.response?.status === 402) {
        toast.error("Necesitás el plan completo para crear sucursales", { position: "top-center" });
      } else if (error?.response?.status === 400) {
        toast.error("Alcanzaste el límite máximo de 10 sucursales", { position: "top-center" });
      } else if (error?.response?.status === 409) {
        toast.error("Ya existe una sucursal con ese nombre", { position: "top-center" });
      } else {
        toast.error("No se pudo crear la sucursal", { position: "top-center" });
      }
    } finally {
      setLoading(false);
    }
  });

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:w-[440px] w-[93vw] max-h-[85vh] overflow-y-auto">
        <div className="flex flex-col w-full gap-4">
          <div className="pb-4 border-b border-gray-100 flex flex-col gap-1">
            <h4 className="text-lg leading-none font-semibold text-gray-800">Nueva sucursal</h4>
          </div>
          <BranchFormFields register={register} errors={errors} />

          {activeEmployees.length > 0 && (
            <div className="flex flex-col gap-2 pt-1 border-t border-gray-100">
              <div className="flex items-center justify-between pt-3">
                <span className="text-xs font-bold uppercase text-gray-700 flex items-center gap-1.5">
                  <LuUsers size={11} /> Empleados que atienden acá
                </span>
                <button
                  type="button"
                  onClick={toggleAll}
                  className="text-[11px] font-semibold text-orange-600 hover:underline cursor-pointer"
                >
                  {allSelected ? "Ninguno" : "Todos"}
                </button>
              </div>
              <div className="flex flex-col gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5">
                {activeEmployees.map((emp) => (
                  <label
                    key={emp._id}
                    className="flex items-center gap-2.5 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(emp._id!)}
                      onChange={() => toggleEmployee(emp._id!)}
                      className="accent-orange-600 w-4 h-4 rounded cursor-pointer shrink-0"
                    />
                    <span className="text-sm text-gray-700 leading-tight">
                      {emp.isOwner ? "Vos" : `${emp.name} ${emp.surname}`}
                    </span>
                  </label>
                ))}
              </div>
              <span className="text-xs text-gray-400">
                Podés cambiarlo después desde la tarjeta de la sucursal.
              </span>
            </div>
          )}

          <Button
            disabled={!isValid || loading}
            onClick={onSubmit}
            className="w-full h-10 text-white bg-primary hover:bg-orange-500 border-none rounded-lg shadow-lg"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Creando...
              </span>
            ) : "Crear sucursal"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBranchModal;
