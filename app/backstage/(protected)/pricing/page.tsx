import { cookies } from "next/headers";
import PlanPricesForm from "@/components/backstage/PlanPricesForm";

const backendUrl = process.env.BACKEND_URL || "http://localhost:4000/api";

async function fetchPlanPrices() {
  const token = cookies().get("sacaturno_hq_token")?.value;
  const res = await fetch(`${backendUrl}/superadmin/plan-prices`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function BackstagePricingPage() {
  const prices = await fetchPlanPrices();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-gray-800">Planes</h1>
        <p className="text-sm text-gray-400">
          Precios de los planes pagos. Impactan en la web pública, el modal de
          suscripción y el cobro por Mercado Pago.
        </p>
      </div>
      <div className="max-w-md rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
        <PlanPricesForm initialPrices={prices} />
      </div>
    </div>
  );
}
