"use client";

import { useEffect, useState } from "react";
import axiosReq from "@/config/axios";
import { PaidPlan, PLAN_DISPLAY_PRICES } from "./planLimits";

// Cache a nivel de módulo: el repo no usa SWR, así evitamos refetch entre
// PricingSection (home) y PlanPickerCards (admin).
let cache: Record<PaidPlan, number> | null = null;

// Devuelve los precios vigentes del backend, con PLAN_DISPLAY_PRICES como
// fallback (sin flash / layout shift, y funciona si el backend falla).
export const usePlanPrices = (): Record<PaidPlan, number> => {
  const [prices, setPrices] = useState<Record<PaidPlan, number>>(
    cache ?? PLAN_DISPLAY_PRICES
  );

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
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return prices;
};
