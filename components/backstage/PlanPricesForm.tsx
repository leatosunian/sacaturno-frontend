"use client";

import { useState } from "react";

type Prices = { SC_BASIC: number; SC_PRO: number; SC_FULL: number };

const PLANS: { key: keyof Prices; label: string }[] = [
  { key: "SC_BASIC", label: "Plan Básico" },
  { key: "SC_PRO", label: "Plan Pro" },
  { key: "SC_FULL", label: "Plan Full" },
];

const EMPTY: Prices = { SC_BASIC: 0, SC_PRO: 0, SC_FULL: 0 };

const formatARS = (n: number) =>
  Number.isFinite(n) ? new Intl.NumberFormat("es-AR").format(n) : "";

const parseARS = (s: string) => {
  const digits = s.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
};

const PlanPricesForm = ({ initialPrices }: { initialPrices: Prices | null }) => {
  const [prices, setPrices] = useState<Prices>(initialPrices ?? EMPTY);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"" | "ok" | "error">("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("");
    setLoading(true);
    try {
      const res = await fetch("/api/backstage/plan-prices", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(prices),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as Prices;
      setPrices(data);
      setStatus("ok");
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      {PLANS.map(({ key, label }) => (
        <div key={key} className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase text-gray-400">
            {label} (ARS/mes)
          </label>
          <input
            type="text"
            inputMode="numeric"
            required
            value={formatARS(prices[key])}
            onChange={(e) =>
              setPrices((p) => ({ ...p, [key]: parseARS(e.target.value) }))
            }
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition-colors focus:border-orange-600"
          />
        </div>
      ))}

      {status === "ok" && (
        <p className="text-xs text-green-600">Precios actualizados.</p>
      )}
      {status === "error" && (
        <p className="text-xs text-red-500">No se pudieron guardar los precios.</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 h-10 w-full rounded-lg bg-orange-600 text-sm font-semibold text-white transition-colors hover:bg-orange-700 disabled:opacity-60"
      >
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
};

export default PlanPricesForm;
