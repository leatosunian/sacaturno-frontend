import { formatPercent } from "./format";

interface FunnelStep {
  label: string;
  count: number;
  percentOfTotal: number;
}

const ActivationFunnel = ({ steps }: { steps: FunnelStep[] | null }) => {
  const data = steps ?? [];
  const maxCount = Math.max(1, ...data.map((s) => s.count));

  return (
    <div className="flex flex-col gap-0 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="text-sm font-semibold text-gray-800">Embudo de activación</h2>
      </div>
      <div className="flex flex-col gap-3 px-6 py-4">
        {data.map((step) => (
          <div key={step.label} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">{step.label}</span>
              <span className="font-medium text-gray-800">
                {step.count} ({formatPercent(step.percentOfTotal)})
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-orange-600"
                style={{ width: `${(step.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
        {data.length === 0 && <p className="text-xs text-gray-400">Sin datos todavía.</p>}
      </div>
    </div>
  );
};

export default ActivationFunnel;
