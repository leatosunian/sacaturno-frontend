import { formatDate } from "./format";
import { getCategoryLabel } from "@/lib/businessCategories";
import BusinessPlanEditor from "./BusinessPlanEditor";

interface BusinessRow {
  _id: string;
  name: string;
  slug: string;
  businessType: string;
  businessCategory?: string | null;
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
              <td className="px-4 py-3">
                <div className="flex flex-col gap-1">
                  <span className="text-gray-700">{b.businessType}</span>
                  {b.businessCategory ? (
                    <span className="w-fit rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-700">
                      {getCategoryLabel(b.businessCategory)}
                    </span>
                  ) : (
                    <span className="w-fit rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                      Sin categoría
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <BusinessPlanEditor
                  businessId={b._id}
                  businessName={b.name}
                  subscriptionType={b.subscription?.subscriptionType}
                  expiracyDate={b.subscription?.expiracyDate}
                  employeeCount={b.employeeCount}
                  branchCount={b.branchCount}
                />
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
