import { formatCurrency, formatPercent } from "./format";

interface TopBusiness {
  businessID: string;
  appointments: number;
  business: { name: string; slug: string; businessType: string } | null;
}

interface FeatureAdoption {
  depositAdoption: number;
  servicesWithDeposit: number;
  totalServices: number;
  businessesUsingEmployees: number;
  businessesUsingBranches: number;
  totalBusinesses: number;
  byBusinessType: { businessType: string; count: number }[];
}

interface OverviewData {
  windowDays: number;
  totalUsers: number;
  totalBusinesses: number;
  activeBusinesses: number;
  activeUsers: number;
  paidSubscriptions: number;
  freeSubscriptions: number;
  conversionRate: number;
  totalRevenue: number;
  monthRevenue: number;
  mpLinkedBusinesses: number;
  mpAdoptionRate: number;
  topBusinesses: TopBusiness[];
  featureAdoption: FeatureAdoption;
}

const StatCard = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div className="flex flex-col gap-1 rounded-xl border border-gray-100 bg-white p-5 shadow-lg">
    <span className="text-xs font-medium uppercase text-gray-500">{label}</span>
    <span className="text-2xl font-semibold text-gray-800">{value}</span>
    {hint && <span className="text-xs text-gray-400">{hint}</span>}
  </div>
);

const PlatformOverview = ({ data }: { data: OverviewData | null }) => {
  if (!data) {
    return <div className="rounded-xl border border-gray-100 bg-white p-6 text-sm text-gray-500 shadow-lg">No se pudieron cargar las métricas.</div>;
  }

  const { featureAdoption } = data;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Usuarios" value={String(data.totalUsers)} />
        <StatCard label="Negocios" value={String(data.totalBusinesses)} />
        <StatCard
          label="Activos"
          value={String(data.activeBusinesses)}
          hint={`negocios, últimos ${data.windowDays}d`}
        />
        <StatCard label="Planes pagos" value={String(data.paidSubscriptions)} hint={formatPercent(data.conversionRate)} />
        <StatCard label="Ingreso total" value={formatCurrency(data.totalRevenue)} />
        <StatCard label="Ingreso del mes" value={formatCurrency(data.monthRevenue)} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-0 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-sm font-semibold text-gray-800">Negocios con más actividad (30d)</h2>
          </div>
          <div className="flex flex-col divide-y divide-gray-50">
            {data.topBusinesses.length === 0 && (
              <p className="px-6 py-4 text-xs text-gray-400">Sin datos todavía.</p>
            )}
            {data.topBusinesses.map((tb) => (
              <div key={tb.businessID} className="flex items-center justify-between px-6 py-3">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-800">{tb.business?.name ?? "Negocio eliminado"}</span>
                  <span className="text-xs text-gray-400">{tb.business?.businessType}</span>
                </div>
                <span className="text-sm font-semibold text-orange-600">{tb.appointments} turnos</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-0 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-sm font-semibold text-gray-800">Adopción de features</h2>
          </div>
          <div className="flex flex-col gap-3 px-6 py-4 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span>Depósitos configurados</span>
              <span className="font-semibold">
                {formatPercent(featureAdoption.depositAdoption)} ({featureAdoption.servicesWithDeposit}/{featureAdoption.totalServices} servicios)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>MercadoPago vinculado</span>
              <span className="font-semibold">
                {formatPercent(data.mpAdoptionRate)} ({data.mpLinkedBusinesses}/{data.totalBusinesses} negocios)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Usan empleados</span>
              <span className="font-semibold">{featureAdoption.businessesUsingEmployees} negocios</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Usan sucursales</span>
              <span className="font-semibold">{featureAdoption.businessesUsingBranches} negocios</span>
            </div>
            <div className="mt-2 flex flex-col gap-1 border-t border-gray-100 pt-3">
              <span className="text-xs font-medium uppercase text-gray-400">Por rubro</span>
              {featureAdoption.byBusinessType.slice(0, 5).map((t) => (
                <div key={t.businessType} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">{t.businessType}</span>
                  <span className="font-medium text-gray-800">{t.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformOverview;
