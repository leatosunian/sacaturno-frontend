import { LuChevronRight } from "react-icons/lu";
import { formatDate } from "./format";
import { getCategoryLabel } from "@/lib/businessCategories";
import { PLAN_SHORT_LABELS } from "@/lib/planLimits";
import BusinessPlanEditor from "./BusinessPlanEditor";
import { PLAN_BADGE_STYLES, normalizePlan } from "./planBadge";

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

const CategoryBadge = ({ category }: { category?: string | null }) =>
  category ? (
    <span className="w-fit rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-700">
      {getCategoryLabel(category)}
    </span>
  ) : (
    <span className="w-fit rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
      Sin categoría
    </span>
  );

const Metric = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</span>
    <span className="text-sm font-semibold text-gray-800">{value}</span>
  </div>
);

const BusinessesTable = ({ businesses }: { businesses: BusinessRow[] }) => {
  return (
    <>
      {/* MOBILE: tarjetas — tocar abre el editor de plan */}
      <div className="flex flex-col gap-3 md:hidden">
        {businesses.length === 0 && (
          <p className="rounded-xl border border-gray-100 bg-white px-4 py-8 text-center text-sm text-gray-400 shadow-sm">
            Sin resultados.
          </p>
        )}
        {businesses.map((b) => {
          const plan = normalizePlan(b.subscription?.subscriptionType);
          return (
            <BusinessPlanEditor
              key={b._id}
              businessId={b._id}
              businessName={b.name}
              subscriptionType={b.subscription?.subscriptionType}
              expiracyDate={b.subscription?.expiracyDate}
              employeeCount={b.employeeCount}
              branchCount={b.branchCount}
              triggerClassName="w-full cursor-pointer rounded-xl border border-gray-100 bg-white p-4 text-left shadow-sm transition-all duration-200 ease-in-out active:scale-[0.99] active:bg-gray-50"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="truncate text-sm font-semibold text-gray-800">{b.name}</span>
                    <span className="truncate text-xs text-gray-500">{b.businessType}</span>
                    <CategoryBadge category={b.businessCategory} />
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-1">
                    <StatusBadge active={b.isActive} />
                    <LuChevronRight size={16} className="text-gray-300" />
                  </div>
                </div>

                <div className="h-px w-full bg-gray-100" />

                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${PLAN_BADGE_STYLES[plan]}`}
                  >
                    {PLAN_SHORT_LABELS[plan]}
                  </span>
                  <span className="text-[11px] text-gray-400">Tocá para cambiar el plan</span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <Metric label="Turnos" value={b.appointmentsCount} />
                  <Metric label="Emple." value={b.employeeCount} />
                  <Metric label="Suc." value={b.branchCount} />
                  <Metric label="MP" value={b.mpLinked ? "Sí" : "No"} />
                </div>

                <span className="text-[11px] text-gray-400">Alta: {formatDate(b.createdAt)}</span>
              </div>
            </BusinessPlanEditor>
          );
        })}
      </div>

      {/* DESKTOP: tabla */}
      <div className="hidden w-full overflow-x-auto rounded-xl border border-gray-100 shadow-lg md:block">
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
                    <CategoryBadge category={b.businessCategory} />
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
    </>
  );
};

export default BusinessesTable;
