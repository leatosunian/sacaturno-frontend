import { cookies } from "next/headers";
import PlatformOverview from "@/components/backstage/PlatformOverview";
import GrowthChart from "@/components/backstage/GrowthChart";
import RevenueChart from "@/components/backstage/RevenueChart";
import ActivationFunnel from "@/components/backstage/ActivationFunnel";
import ExpiringSubscriptionsList from "@/components/backstage/ExpiringSubscriptionsList";

const backendUrl = process.env.BACKEND_URL || "http://localhost:4000/api";

async function fetchBackstage(path: string) {
  const token = cookies().get("sacaturno_hq_token")?.value;
  const res = await fetch(`${backendUrl}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function BackstageDashboardPage() {
  const [overview, growth, revenue, funnel, expiring] = await Promise.all([
    fetchBackstage("/superadmin/overview"),
    fetchBackstage("/superadmin/growth?months=12"),
    fetchBackstage("/superadmin/revenue?months=12"),
    fetchBackstage("/superadmin/funnel"),
    fetchBackstage("/superadmin/subscriptions/expiring"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PlatformOverview data={overview} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GrowthChart data={growth} />
        <RevenueChart data={revenue} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ActivationFunnel steps={funnel} />
        <ExpiringSubscriptionsList items={expiring} />
      </div>
    </div>
  );
}
