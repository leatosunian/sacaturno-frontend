"use client";
import { useState } from "react";
import { IBranch } from "@/interfaces/branch.interface";
import { IEmployee } from "@/interfaces/employee.interface";
import { IBusiness } from "@/interfaces/business.interface";
import ISubscription from "@/interfaces/subscription.interface";
import { LuBuilding2, LuPlus, LuLock } from "react-icons/lu";
import axiosReq from "@/config/axios";
import { toast } from "sonner";
import BranchCard from "./BranchCard";
import CreateBranchModal from "./CreateBranchModal";
import EditBranchModal from "./EditBranchModal";
import { getPlanLimits } from "@/lib/planLimits";

interface Props {
  businessData: IBusiness;
  initialBranches: IBranch[];
  initialEmployees: IEmployee[];
  subscriptionData?: ISubscription | { response_data: object };
}

const BranchesSection: React.FC<Props> = ({
  businessData,
  initialBranches,
  initialEmployees,
  subscriptionData,
}) => {
  const [branches, setBranches] = useState<IBranch[]>(initialBranches);
  const [employees, setEmployees] = useState<IEmployee[]>(initialEmployees);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [targetBranch, setTargetBranch] = useState<IBranch | null>(null);
  const [loadingEmployee, setLoadingEmployee] = useState<{ empID: string; branchID: string } | null>(null);

  const subscription =
    subscriptionData && "subscriptionType" in subscriptionData
      ? (subscriptionData as ISubscription)
      : null;
  const { maxBranches } = getPlanLimits(subscription?.subscriptionType);

  const toggleEmployeeInBranch = async (employee: IEmployee, branchID: string) => {
    const empID = employee._id!;
    const currentBranches = employee.branches ?? [];
    const isAssigned = currentBranches.includes(branchID);
    const newBranches = isAssigned
      ? currentBranches.filter((id) => id !== branchID)
      : [...currentBranches, branchID];

    setLoadingEmployee({ empID, branchID });
    try {
      const token = localStorage.getItem("sacaturno_token");
      const res = await axiosReq.put(
        `/employee/${empID}`,
        { ownerID: businessData.ownerID, branches: newBranches },
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
      );
      setEmployees((prev) =>
        prev.map((e) => (e._id === empID ? { ...e, branches: res.data.branches } : e))
      );
    } catch {
      toast.error("No se pudo actualizar la asignación", { position: "top-center" });
    } finally {
      setLoadingEmployee(null);
    }
  };

  const activeEmployees = employees.filter((e) => e.status === "active");

  if (maxBranches === 0) {
    return (
      <div className="flex flex-col gap-0 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden w-full max-w-4xl">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm 2xl:text-base font-semibold text-gray-800">Sucursales</h2>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 py-10 px-6 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center">
            <LuLock size={20} className="text-gray-400" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-gray-700">Función disponible en los planes Pro y Full</p>
            <p className="text-xs text-gray-400 max-w-xs">
              Activá el Plan Pro o el Plan Full para gestionar múltiples sucursales y asignar empleados a cada una.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-0 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden w-full max-w-4xl">
        <div className="flex items-center justify-between px-6 py-4 2xl:px-8 2xl:py-5 border-b border-gray-100">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm 2xl:text-base font-semibold text-gray-800">Sucursales</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500 border border-gray-200">
              {branches.length} / {maxBranches}
            </span>
          </div>
          {branches.length < maxBranches && (
            <button
              type="button"
              onClick={() => setAddModal(true)}
              className="flex items-center gap-1.5 bg-primary hover:bg-orange-500 text-white text-[11px] 2xl:text-xs font-semibold px-3 2xl:px-4 py-1.5 2xl:py-2 rounded-lg transition-all duration-300 ease-in-out cursor-pointer"
            >
              <LuPlus size={14} />
              Nueva sucursal
            </button>
          )}
        </div>

        <div className="px-4 py-4">
          {branches.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center">
                <LuBuilding2 size={20} className="text-gray-400" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-gray-600">No tenés sucursales</p>
                <p className="text-xs text-gray-400">
                  Si tu negocio opera desde un solo local, la dirección se configura en los ajustes de empresa.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-orange-500 text-white text-xs font-semibold transition-colors"
              >
                <LuPlus size={13} />
                Crear primera sucursal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {branches.map((branch) => (
                <BranchCard
                  key={branch._id}
                  branch={branch}
                  activeEmployees={activeEmployees}
                  loadingEmployee={loadingEmployee}
                  onEdit={() => { setTargetBranch(branch); setEditModal(true); }}
                  onToggleEmployee={(emp) => toggleEmployeeInBranch(emp, branch._id!)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateBranchModal
        open={addModal}
        onClose={() => setAddModal(false)}
        businessData={businessData}
        onCreated={(branch) => setBranches((prev) => [...prev, branch])}
      />

      <EditBranchModal
        open={editModal}
        onClose={() => { setEditModal(false); setTargetBranch(null); }}
        branch={targetBranch}
        businessData={businessData}
        onEdited={(updated) =>
          setBranches((prev) => prev.map((b) => (b._id === updated._id ? updated : b)))
        }
        onDeleted={(id) => {
          setBranches((prev) => prev.filter((b) => b._id !== id));
          setEmployees((prev) =>
            prev.map((e) => ({
              ...e,
              branches: (e.branches ?? []).filter((bid) => bid !== id),
            }))
          );
          setEditModal(false);
          setTargetBranch(null);
        }}
      />
    </>
  );
};

export default BranchesSection;
