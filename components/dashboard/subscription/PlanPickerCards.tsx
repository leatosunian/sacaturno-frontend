"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { FaCheck, FaMedal, FaRocket, FaGem } from "react-icons/fa6";
import { IBusiness } from "@/interfaces/business.interface";
import { PAID_PLAN_CARDS, PaidPlan } from "@/lib/planLimits";
import { usePlanPrices } from "@/lib/usePlanPrices";
import { createSubscriptionPreference } from "@/lib/subscriptionPreference";

interface Props {
  businessData: IBusiness;
}

const getPlanIcon = (plan: PaidPlan, isPro: boolean) => {
  const color = isPro ? "white" : "#dd4924";
  if (plan === "SC_BASIC") return <FaRocket color={color} size={15} />;
  if (plan === "SC_PRO") return <FaGem color={color} size={15} />;
  return <FaMedal color={color} size={15} />;
};

// Grilla de 3 tarjetas de plan reutilizada por PlanPickerModal (dialog propio) y por
// componentes que ya viven dentro de un Dialog ajeno (ExpiredPlanModal, UpgradePlanModal).
const PlanPickerCards: React.FC<Props> = ({ businessData }) => {
  const router = useRouter();
  const prices = usePlanPrices();
  const [loadingPlan, setLoadingPlan] = useState<PaidPlan | null>(null);

  const handleSelectPlan = async (targetPlan: PaidPlan) => {
    setLoadingPlan(targetPlan);
    try {
      const initPoint = await createSubscriptionPreference({
        targetPlan,
        businessID: businessData._id ?? "",
        ownerID: businessData.ownerID,
        email: businessData.email,
      });
      router.push(initPoint);
    } catch {
      toast.error("No se pudo generar el pago. Intentá de nuevo.");
      setLoadingPlan(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 items-stretch gap-6 md:gap-4 2xl:gap-5 w-full pt-4">
      {PAID_PLAN_CARDS.map((card) => {
        const isPro = card.plan === "SC_PRO";
        const isLoading = loadingPlan === card.plan;
        const disabled = loadingPlan !== null;
        return (
          <div
            key={card.plan}
            className={`relative flex flex-col w-full rounded-2xl p-5 2xl:p-6 transition-shadow duration-300 ${
              isPro
                ? "bg-primary text-white shadow-2xl shadow-orange-300/40"
                : "bg-white border border-black/[0.09] shadow-md hover:shadow-lg text-black"
            }`}
          >
            {isPro && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-white text-primary text-[10px] font-bold px-3 py-1 rounded-full shadow-md whitespace-nowrap tracking-widest">
                MÁS ELEGIDO
              </span>
            )}

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${
                    isPro ? "bg-white/20" : "bg-orange-50"
                  }`}
                >
                  {getPlanIcon(card.plan, isPro)}
                </span>
                <h4
                  className={`text-xl 2xl:text-2xl font-bold ${isPro ? "text-white" : "text-black"}`}
                >
                  {card.label}
                </h4>
              </div>
              <div className="flex items-end gap-1.5">
                <span
                  className={`text-2xl 2xl:text-3xl font-bold ${isPro ? "text-white" : "text-black"}`}
                >
                  ${prices[card.plan].toLocaleString("es-AR")}
                </span>
                <span
                  className={`text-xs mb-1 ${isPro ? "text-orange-100" : "text-gray-500"}`}
                >
                  ARS/mes
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 flex-1">
              {card.features.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span
                    className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                      isPro ? "bg-white/25" : "bg-orange-50"
                    }`}
                  >
                    <FaCheck color={isPro ? "white" : "#dd4924"} size={8} />
                  </span>
                  <span
                    className={`text-xs 2xl:text-sm ${isPro ? "text-orange-50" : "text-gray-600"}`}
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <button
                onClick={() => handleSelectPlan(card.plan)}
                disabled={disabled}
                className={`flex items-center justify-center gap-2 w-full py-3 px-6 font-bold text-sm rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${
                  isPro
                    ? "bg-white text-primary hover:bg-orange-50 hover:-translate-y-px"
                    : "bg-primary text-white hover:bg-primary/90"
                }`}
              >
                {isLoading && <Loader2 size={14} className="animate-spin" />}
                Elegir {card.label}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PlanPickerCards;
