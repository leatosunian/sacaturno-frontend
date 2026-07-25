import { formatDate } from "./format";
import { PLAN_SHORT_LABELS, SubscriptionType } from "@/lib/planLimits";

interface BusinessRow {
  _id: string;
  name: string;
  slug: string;
  businessType: string;
  email?: string;
  phone?: number;
  createdAt: string;
  mpLinked?: boolean;
  subscription: { subscriptionType: string; expiracyDate: string } | null;
  appointmentsCount: number;
  lastActivity: string | null;
  isActive: boolean;
  employeeCount: number;
  branchCount: number;
}

const StatusBadge = ({ active }: { active: boolean }) =>
  active ? (
    <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">Activo</span>
  ) : (
    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">Inactivo</span>
  );

const PLAN_BADGE_STYLES: Record<string, string> = {
  SC_FREE: "bg-gray-100 text-gray-700",
  SC_BASIC: "bg-blue-100 text-blue-700",
  SC_PRO: "bg-purple-100 text-purple-700",
  SC_FULL: "bg-orange-100 text-orange-700",
  SC_EXPIRED: "bg-red-100 text-red-700",
};

const PlanBadge = ({ type }: { type?: string }) => {
  const key = (type && type in PLAN_SHORT_LABELS ? type : "SC_FREE") as SubscriptionType;
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${PLAN_BADGE_STYLES[key]}`}>
      {PLAN_SHORT_LABELS[key]}
    </span>
  );
};

const BusinessesTable = ({ businesses }: { businesses: BusinessRow[] }) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-gray-100 shadow-lg">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Negocio</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Rubro</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Plan</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Estado</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Turnos</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Empleados</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Sucursales</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">MP</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Alta</th>
          </tr>
        </thead>
        <tbody>
          {businesses.length === 0 && (
            <tr>
              <td colSpan={9} className="px-4 py-6 text-center text-gray-400">
                Sin resultados.
              </td>
            </tr>
          )}
          {businesses.map((b) => (
            <tr key={b._id} className="border-b border-gray-50 transition-colors duration-150 hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-800">{b.name}</td>
              <td className="px-4 py-3 text-gray-600">{b.businessType}</td>
              <td className="px-4 py-3">
                <PlanBadge type={b.subscription?.subscriptionType} />
              </td>
              <td className="px-4 py-3">
                <StatusBadge active={b.isActive} />
              </td>
              <td className="px-4 py-3 text-gray-600">{b.appointmentsCount}</td>
              <td className="px-4 py-3 text-gray-600">{b.employeeCount}</td>
              <td className="px-4 py-3 text-gray-600">{b.branchCount}</td>
              <td className="px-4 py-3 text-gray-600">{b.mpLinked ? "Sí" : "No"}</td>
              <td className="px-4 py-3 text-gray-500">{formatDate(b.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BusinessesTable;
