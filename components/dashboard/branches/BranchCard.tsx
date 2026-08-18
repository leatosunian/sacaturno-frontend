"use client";
import { IBranch } from "@/interfaces/branch.interface";
import { IEmployee } from "@/interfaces/employee.interface";
import { LuBuilding2, LuUser } from "react-icons/lu";

interface Props {
  branch: IBranch;
  activeEmployees: IEmployee[];
  loadingEmployee: { empID: string; branchID: string } | null;
  onEdit: () => void;
  onToggleEmployee: (employee: IEmployee) => void;
}

const BranchCard: React.FC<Props> = ({
  branch,
  activeEmployees,
  loadingEmployee,
  onEdit,
  onToggleEmployee,
}) => {
  const assignedCount = activeEmployees.filter((e) =>
    (e.branches ?? []).includes(branch._id!)
  ).length;

  return (
    <div
      className="rounded-lg border border-gray-100 overflow-hidden bg-white [@media(hover:hover)]:hover:border-orange-200 [@media(hover:hover)]:hover:bg-orange-50 transition-all cursor-pointer"
      onClick={onEdit}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
            <LuBuilding2 size={14} className="text-primary" />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-sm font-semibold text-gray-800 truncate">{branch.name}</span>
            <span className="text-xs text-gray-400 truncate">
              {branch.street} {branch.number}{branch.city ? `, ${branch.city}` : ""}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-md text-gray-500 flex-shrink-0 ml-3">
          <LuUser size={12} />
          <span className="text-[10px]">{assignedCount}</span>
        </div>
      </div>

      <div className="px-4 pb-3 pt-2 border-t border-gray-100 bg-gray-50">
        <p className="text-[10px] font-semibold uppercase text-gray-400 mb-2">
          Empleados asignados
        </p>
        {activeEmployees.length === 0 ? (
          <p className="text-xs text-gray-400">No hay empleados activos en el negocio.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {activeEmployees.map((emp) => {
              const isAssigned = (emp.branches ?? []).includes(branch._id!);
              const isLoading = loadingEmployee?.empID === emp._id && loadingEmployee?.branchID === branch._id;
              return (
                <label
                  key={emp._id}
                  className="flex items-center gap-2.5 cursor-pointer select-none"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={isAssigned}
                    disabled={isLoading}
                    onChange={() => onToggleEmployee(emp)}
                    className="accent-orange-600 w-4 h-4 rounded cursor-pointer shrink-0"
                  />
                  <span className="text-sm text-gray-700 leading-tight">
                    {emp.isOwner ? "Vos" : `${emp.name} ${emp.surname}`}
                  </span>
                  {isLoading && (
                    <span className="w-3 h-3 rounded-full border border-orange-600 border-t-transparent animate-spin" />
                  )}
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchCard;
