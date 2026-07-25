interface GrowthPoint {
  month: string;
  label: string;
  newUsers: number;
  newBusinesses: number;
  appointments: number;
  bookedAppointments: number;
}

const GrowthChart = ({ data }: { data: GrowthPoint[] | null }) => {
  const points = data ?? [];
  const maxValue = Math.max(1, ...points.map((p) => Math.max(p.newUsers, p.newBusinesses)));

  return (
    <div className="flex flex-col gap-0 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="text-sm font-semibold text-gray-800">Crecimiento (12 meses)</h2>
      </div>
      <div className="flex items-end gap-2 overflow-x-auto px-6 py-6" style={{ height: 180 }}>
        {points.map((p) => (
          <div key={p.month} className="flex min-w-[36px] flex-1 flex-col items-center justify-end gap-1">
            <div className="flex h-[120px] w-full items-end justify-center gap-0.5">
              <div
                className="w-2.5 rounded-t bg-orange-600"
                style={{ height: `${(p.newBusinesses / maxValue) * 100}%` }}
                title={`${p.newBusinesses} negocios nuevos`}
              />
              <div
                className="w-2.5 rounded-t bg-gray-300"
                style={{ height: `${(p.newUsers / maxValue) * 100}%` }}
                title={`${p.newUsers} usuarios nuevos`}
              />
            </div>
            <span className="text-[10px] text-gray-400">{p.label.slice(0, 3)}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 border-t border-gray-100 px-6 py-3 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-orange-600" /> Negocios nuevos
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-gray-300" /> Usuarios nuevos
        </span>
      </div>
    </div>
  );
};

export default GrowthChart;
