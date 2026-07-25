import { formatDate } from "./format";

interface ExpiringItem {
  businessID: string;
  expiracyDate: string;
  subscriptionType: string;
  business: { name: string; email?: string; phone?: number; slug: string } | null;
}

const ExpiringSubscriptionsList = ({ items }: { items: ExpiringItem[] | null }) => {
  const data = items ?? [];

  return (
    <div className="flex flex-col gap-0 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="text-sm font-semibold text-gray-800">Vencen en los próximos 7 días</h2>
      </div>
      <div className="flex flex-col divide-y divide-gray-50">
        {data.length === 0 && <p className="px-6 py-4 text-xs text-gray-400">No hay renovaciones próximas.</p>}
        {data.map((item) => (
          <div key={item.businessID} className="flex items-center justify-between px-6 py-3">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-800">{item.business?.name ?? "Negocio eliminado"}</span>
              <span className="text-xs text-gray-400">{item.business?.email}</span>
            </div>
            <span className="text-xs font-medium text-orange-600">{formatDate(item.expiracyDate)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpiringSubscriptionsList;
