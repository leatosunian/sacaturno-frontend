"use client";

import { useEffect, useState } from "react";
import axiosReq from "@/config/axios";
import { PaidPlan, PLAN_DISPLAY_PRICES } from "./planLimits";

// Cache a nivel de módulo: el repo no usa SWR, así evitamos refetch entre
// PricingSection (home) y PlanPickerCards (admin).
let cache: Record<PaidPlan, number> | null = null;

export interface UsePlanPricesResult {
  prices: Record<PaidPlan, number>;
  loading: boolean;
}

// Devuelve los precios vigentes del backend, con PLAN_DISPLAY_PRICES como
// fallback (sin flash / layout shift, y funciona si el backend falla).
export const usePlanPrices = (): UsePlanPricesResult => {
  const [prices, setPrices] = useState<Record<PaidPlan, number>>(
    cache ?? PLAN_DISPLAY_PRICES
  );
  const [loading, setLoading] = useState<boolean>(cache === null);

  useEffect(() => {
    if (cache) return;
    let active = true;
    axiosReq
      .get("/subscription/plan-prices")
      .then(({ data }) => {
        if (!active) return;
        const merged = { ...PLAN_DISPLAY_PRICES, ...data };
        cache = merged;
        setPrices(merged);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { prices, loading };
};
