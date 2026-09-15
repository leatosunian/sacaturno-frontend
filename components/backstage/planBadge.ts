import { PLAN_SHORT_LABELS, SubscriptionType } from "@/lib/planLimits";

// Fuera del módulo "use client" de BusinessPlanEditor: BusinessesTable es un
// Server Component y no puede invocar funciones exportadas desde el cliente.
export const PLAN_BADGE_STYLES: Record<SubscriptionType, string> = {
  SC_FREE: "bg-gray-100 text-gray-700",
  SC_BASIC: "bg-blue-100 text-blue-700",
  SC_PRO: "bg-purple-100 text-purple-700",
  SC_FULL: "bg-orange-100 text-orange-700",
  SC_EXPIRED: "bg-red-100 text-red-700",
};

export const normalizePlan = (type?: string): SubscriptionType =>
  type && type in PLAN_SHORT_LABELS ? (type as SubscriptionType) : "SC_FREE";
