import { formatCurrency } from "./format";

interface RevenuePoint {
  month: string;
  label: string;
  revenue: number;
  payments: number;
}

interface RevenueData {
  monthly: RevenuePoint[];
  byPlan: { subscriptionType: string; revenue: number }[];
}

const RevenueChart = ({ data }: { data: RevenueData | null }) => {
  const points = data?.monthly ?? [];
  const maxValue = Math.max(1, ...points.map((p) => p.revenue));

  return (
    <div className="flex flex-col gap-0 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="text-sm font-semibold text-gray-800">Ingresos por suscripción (12 meses)</h2>
      </div>
      <div className="flex items-end gap-2 overflow-x-auto px-6 py-6" style={{ height: 180 }}>
        {points.map((p) => (
          <div key={p.month} className="flex min-w-[36px] flex-1 flex-col items-center justify-end gap-1">
            <div className="flex h-[120px] w-full items-end justify-center">
              <div
                className="w-4 rounded-t bg-orange-600"
                style={{ height: `${(p.revenue / maxValue) * 100}%` }}
                title={formatCurrency(p.revenue)}
              />
            </div>
            <span className="text-[10px] text-gray-400">{p.label.slice(0, 3)}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1.5 border-t border-gray-100 px-6 py-3 text-xs text-gray-600">
        {data?.byPlan.map((p) => (
          <div key={p.subscriptionType} className="flex items-center justify-between">
            <span>{p.subscriptionType}</span>
            <span className="font-medium text-gray-800">{formatCurrency(p.revenue)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevenueChart;
