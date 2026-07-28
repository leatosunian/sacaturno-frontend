import axiosReq from "@/config/axios";
import { PaidPlan } from "@/lib/planLimits";

interface CreatePreferenceParams {
  targetPlan: PaidPlan;
  businessID: string;
  ownerID: string;
  email: string;
}

// Crea la preferencia de pago de Mercado Pago para el plan elegido y devuelve
// la URL de checkout (init_point) para redirigir al usuario.
export const createSubscriptionPreference = async ({
  targetPlan,
  businessID,
  ownerID,
  email,
}: CreatePreferenceParams): Promise<string> => {
  const token = localStorage.getItem("sacaturno_token");
  const { data } = await axiosReq.post(
    "/subscription/pay/create-preference",
    { targetPlan, businessID, ownerID, email, quantity: 1, currency_id: "ARS" },
    { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
  );
  return data.init_point;
};
