import type { ReactNode } from "react";
import { toast as sonner, type ExternalToast } from "sonner";

// Las duraciones vivían repartidas en cada llamada (o quedaban en el default de
// Sonner). Acá quedan en un solo lugar y la llamada solo las pisa si tiene un
// motivo puntual.
const DURATION = {
  success: 3500,
  error: 5000,
  warning: 8000,
  loading: Infinity,
} as const;

type Message = ReactNode;

const withDefaults = (
  type: keyof typeof DURATION,
  options?: ExternalToast
): ExternalToast => ({ duration: DURATION[type], ...options });

export const toast = {
  success: (message: Message, options?: ExternalToast) =>
    sonner.success(message, withDefaults("success", options)),
  error: (message: Message, options?: ExternalToast) =>
    sonner.error(message, withDefaults("error", options)),
  warning: (message: Message, options?: ExternalToast) =>
    sonner.warning(message, withDefaults("warning", options)),
  loading: (message: Message, options?: ExternalToast) =>
    sonner.loading(message, withDefaults("loading", options)),
  dismiss: (id?: string | number) => sonner.dismiss(id),
};
