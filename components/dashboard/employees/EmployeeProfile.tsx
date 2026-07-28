"use client";
import { EmployeePermission } from "@/interfaces/employee.interface";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { LuShieldCheck, LuShieldOff, LuWrench, LuMapPin } from "react-icons/lu";

interface ResolvedService {
  _id: string;
  name: string;
}

interface ResolvedBranch {
  _id: string;
  name: string;
  street?: string;
  number?: string;
  city?: string;
}

interface Props {
  employeeData: {
    status?: string;
    permissions?: EmployeePermission[];
    services?: ResolvedService[];
    branches?: ResolvedBranch[];
  } | null;
  businessData: {
    name?: string;
  } | null;
}

const PERMISSION_LABELS: Record<EmployeePermission, string> = {
  manage_own_appointments: "Gestionar mis turnos",
  manage_all_appointments: "Gestionar todos los turnos",
  view_stats: "Ver estadísticas",
  manage_services: "Gestionar servicios",
  manage_schedule: "Configurar agenda automática",
};

const ALL_PERMISSIONS: EmployeePermission[] = [
  "manage_own_appointments",
  "manage_all_appointments",
  "view_stats",
  "manage_services",
  "manage_schedule",
];

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  active: { label: "Activo", className: "bg-green-50 text-green-700 border-green-200" },
  inactive: { label: "Inactivo", className: "bg-gray-100 text-gray-500 border-gray-200" },
  pending: { label: "Pendiente", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
};

export default function EmployeeProfile({ employeeData, businessData }: Props) {
  const permissions = employeeData?.permissions ?? [];
  const services = employeeData?.services ?? [];
  const branches = employeeData?.branches ?? [];
  const status = employeeData?.status ?? "active";
  const statusInfo = STATUS_MAP[status] ?? STATUS_MAP.active;

  return (
    <div className="flex flex-col gap-0 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden w-full max-w-4xl">
      <div className="px-6 py-4 2xl:px-8 2xl:py-5 border-b border-gray-100 flex items-center gap-2.5">
        <h2 className="text-sm 2xl:text-base font-semibold text-gray-800">Mi trabajo</h2>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">
          Empleado
        </span>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusInfo.className}`}>
          {statusInfo.label}
        </span>
      </div>

      <div className="p-6 2xl:p-8 flex flex-col gap-6">

        {/* Empresa */}
        {businessData?.name && (
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-50 shrink-0">
              <HiOutlineBuildingOffice2 size={16} className="text-orange-500" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-gray-400 uppercase font-medium tracking-wide">Empresa</span>
              <span className="text-sm font-medium text-gray-800">{businessData.name}</span>
            </div>
          </div>
        )}

        {/* Permisos */}
        <div className="flex flex-col gap-3">
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Permisos asignados</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ALL_PERMISSIONS.map((perm) => {
              const enabled = permissions.includes(perm);
              return (
                <div
                  key={perm}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-xs font-medium ${
                    enabled
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-gray-50 border-gray-200 text-gray-400"
                  }`}
                >
                  {enabled ? (
                    <LuShieldCheck size={14} className="shrink-0 text-green-500" />
                  ) : (
                    <LuShieldOff size={14} className="shrink-0 text-gray-300" />
                  )}
                  {PERMISSION_LABELS[perm]}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400">
            Los permisos son configurados por el administrador del negocio.
          </p>
        </div>

        {/* Servicios */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <LuWrench size={13} className="text-gray-400" />
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Servicios habilitados</span>
          </div>
          {services.length === 0 ? (
            <p className="text-xs text-gray-400 italic">Todos los servicios del negocio</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {services.map((svc) => (
                <span
                  key={svc._id}
                  className="px-3 py-1.5 rounded-lg border border-orange-200 bg-orange-50 text-orange-700 text-xs font-medium"
                >
                  {svc.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Sucursales */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <LuMapPin size={13} className="text-gray-400" />
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Sucursales asignadas</span>
          </div>
          {branches.length === 0 ? (
            <p className="text-xs text-gray-400 italic">Todas las sucursales del negocio</p>
          ) : (
            <div className="flex flex-col gap-2">
              {branches.map((branch) => {
                const address = [branch.street, branch.number, branch.city]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <div
                    key={branch._id}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50"
                  >
                    <LuMapPin size={13} className="text-gray-400 shrink-0" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-gray-700">{branch.name}</span>
                      {address && (
                        <span className="text-xs text-gray-400">{address}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
