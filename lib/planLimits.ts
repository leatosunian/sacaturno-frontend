import ISubscription from "@/interfaces/subscription.interface";

export type SubscriptionType = ISubscription["subscriptionType"];
export type PaidPlan = "SC_BASIC" | "SC_PRO" | "SC_FULL";

export interface IPlanLimits {
  maxEmployees: number;
  maxBranches: number;
  depositsEnabled: boolean;
  reminderWindows: string[];
}

// Espejo de server/src/config/planLimits.ts — mantener sincronizado a mano.
export const PLAN_LIMITS: Record<SubscriptionType, IPlanLimits> = {
  SC_FREE: { maxEmployees: 0, maxBranches: 0, depositsEnabled: true, reminderWindows: ["24h"] },
  SC_BASIC: { maxEmployees: 0, maxBranches: 0, depositsEnabled: true, reminderWindows: ["24h"] },
  SC_PRO: { maxEmployees: 6, maxBranches: 3, depositsEnabled: true, reminderWindows: ["24h", "5h"] },
  SC_FULL: { maxEmployees: 10, maxBranches: 5, depositsEnabled: true, reminderWindows: ["24h", "5h", "1h"] },
  SC_EXPIRED: { maxEmployees: 0, maxBranches: 0, depositsEnabled: false, reminderWindows: [] },
};

export const PLAN_LABELS: Record<SubscriptionType, string> = {
  SC_FREE: "Plan Prueba",
  SC_BASIC: "Plan Básico",
  SC_PRO: "Plan Pro",
  SC_FULL: "Plan Full",
  SC_EXPIRED: "Suscripción vencida",
};

// Etiquetas para badges (tablas, sidebar de admin).
export const PLAN_SHORT_LABELS: Record<SubscriptionType, string> = {
  SC_FREE: "Prueba gratuita",
  SC_BASIC: "Plan Básico",
  SC_PRO: "Plan Pro",
  SC_FULL: "Plan Full",
  SC_EXPIRED: "Expirado",
};

export const PAID_PLANS: PaidPlan[] = ["SC_BASIC", "SC_PRO", "SC_FULL"];

export const isPaidPlan = (value: unknown): value is PaidPlan =>
  typeof value === "string" && (PAID_PLANS as string[]).includes(value);

// Fallback de display. La fuente real de precios es el doc singleton en Mongo,
// editable desde /backstage/pricing y expuesto en GET /subscription/plan-prices
// (ver usePlanPrices). Estos valores solo se usan si el fetch falla o mientras
// carga. El cobro real siempre lo resuelve el backend (getPlanPrice → cache DB).
export const PLAN_DISPLAY_PRICES: Record<PaidPlan, number> = {
  SC_BASIC: 9990,
  SC_PRO: 19990,
  SC_FULL: 29990,
};

export interface IPlanFeatureCard {
  plan: PaidPlan;
  label: string;
  price: number;
  features: string[];
}

export const PAID_PLAN_CARDS: IPlanFeatureCard[] = [
  {
    plan: "SC_BASIC",
    label: PLAN_LABELS.SC_BASIC,
    price: PLAN_DISPLAY_PRICES.SC_BASIC,
    features: [
      "Servicios ilimitados",
      "Turnos ilimitados",
      "Señas con Mercado Pago",
      "Recordatorio por email 24hs antes",
    ],
  },
  {
    plan: "SC_PRO",
    label: PLAN_LABELS.SC_PRO,
    price: PLAN_DISPLAY_PRICES.SC_PRO,
    features: [
      "Servicios ilimitados",
      "Turnos ilimitados",
      "Señas con Mercado Pago",
      "Recordatorios frecuentes",
      "Hasta 6 empleados",
      "Hasta 3 sucursales",
    ],
  },
  {
    plan: "SC_FULL",
    label: PLAN_LABELS.SC_FULL,
    price: PLAN_DISPLAY_PRICES.SC_FULL,
    features: [
      "Servicios ilimitados",
      "Turnos ilimitados",
      "Señas con Mercado Pago",
      "Recordatorios frecuentes",
      "Hasta 10 empleados",
      "Hasta 5 sucursales",
    ],
  },
];

export const getPlanLimits = (subscriptionType: SubscriptionType | undefined | null): IPlanLimits =>
  PLAN_LIMITS[subscriptionType ?? "SC_FREE"] ?? PLAN_LIMITS.SC_FREE;
