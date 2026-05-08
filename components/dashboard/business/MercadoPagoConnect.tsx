"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axiosReq from "@/config/axios";
import { IBusiness } from "@/interfaces/business.interface";
import ISubscription from "@/interfaces/subscription.interface";
import { CheckCircle2, Loader2, Lock, ShieldCheck, Unlink } from "lucide-react";
import { toast } from "sonner";
import { SiMercadopago } from "react-icons/si";

interface Props {
  businessData: IBusiness;
  subscriptionData?: ISubscription | { response_data: object };
}

const MercadoPagoConnect: React.FC<Props> = ({ businessData, subscriptionData }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLinked, setIsLinked] = useState<boolean>(businessData.mpLinked ?? false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingPlan, setLoadingPlan] = useState<boolean>(false);

  const subscription = subscriptionData && "subscriptionType" in subscriptionData
    ? subscriptionData as ISubscription
    : null;

  const isFullPlan = subscription?.subscriptionType === "SC_FULL";

  useEffect(() => {
    const mpStatus = searchParams.get("mp");
    if (mpStatus === "success") {
      setIsLinked(true);
      toast.success("Mercado Pago vinculado correctamente");
      router.replace("/admin/business/services");
    } else if (mpStatus === "error") {
      toast.error("Error al vincular Mercado Pago. Intentá de nuevo.");
      router.replace("/admin/business/services");
    }
  }, [searchParams, router]);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("sacaturno_token");
      const res = await axiosReq.get(`/mp/oauth/connect?businessID=${businessData._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.location.href = res.data.url;
    } catch {
      toast.error("No se pudo iniciar la vinculación. Intentá de nuevo.");
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("sacaturno_token");
      await axiosReq.delete(`/mp/oauth/disconnect?businessID=${businessData._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsLinked(false);
      toast.success("Mercado Pago desvinculado");
    } catch {
      toast.error("Error al desvincular. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleBuyFullPlan = async () => {
    setLoadingPlan(true);
    try {
      const token = localStorage.getItem("sacaturno_token");
      const authHeader = {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      };
      const data = {
        title: "Plan Full",
        businessID: businessData._id,
        ownerID: businessData.ownerID,
        email: businessData.email,
        quantity: 1,
        currency_id: "ARS",
      };
      const preference = await axiosReq.post("/subscription/pay/full", data, authHeader);
      router.push(preference.data.init_point);
    } catch {
      toast.error("No se pudo generar el pago. Intentá de nuevo.");
      setLoadingPlan(false);
    }
  };

  return (
    <div className="flex flex-col gap-0 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 2xl:px-8 2xl:py-5 border-b border-gray-100">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
          style={{ backgroundColor: "#009ee3" }}
        >
          <SiMercadopago size={18} className="text-white" />
        </div>
        <div className="flex flex-col">
          <h2 className="text-sm 2xl:text-base font-semibold text-gray-800 leading-tight">Mercado Pago</h2>
          <span className="text-xs text-gray-400 font-medium">Cobro de señas</span>
        </div>
      </div>

      {!isFullPlan ? (
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 2xl:py-12">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 shrink-0">
            <Lock size={18} className="text-accent" />
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
                <span className="text-sm 2xl:text-base font-semibold text-gray-800">
              Función exclusiva del Plan Full</span>
            <span className="text-xs 2xl:text-sm text-gray-500 leading-relaxed">
              El cobro de señas está disponible solo para cuentas con Plan Full.
            </span>
          </div>
          <button
            onClick={handleBuyFullPlan}
            disabled={loadingPlan}
            className="mt-1 flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-lg transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loadingPlan && <Loader2 size={13} className="animate-spin" />}
            Comprar Plan Full
          </button>
        </div>
      ) : (
        <div className="p-6 2xl:p-8 flex flex-col gap-4">
          {/* Info box */}
          <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-gray-50 border border-gray-100">
            <ShieldCheck size={15} className="shrink-0 text-gray-400 mt-px" />
            <p className="text-xs sm:text-[13px] text-gray-500 leading-relaxed">
              Vinculá tu cuenta de Mercado Pago para habilitar el cobro de señas cuando tus clientes reserven un turno.
            </p>
          </div>

          {isLinked ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-100 rounded-lg">
                <CheckCircle2 size={16} className="shrink-0 text-green-500" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-green-700">Cuenta vinculada</span>
                  <span className="text-xs text-green-600 opacity-80">Tu cuenta de Mercado Pago está activa</span>
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                disabled={loading}
                className="flex items-center md:max-w-56 justify-center gap-2 w-full px-4 py-2.5 border border-red-200 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 transition-all duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? <Loader2 className="animate-spin" size={14} /> : <Unlink size={14} />}
                Desvincular cuenta
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={loading}
              className="flex items-center md:max-w-56 justify-center gap-2.5 w-full px-4 py-2.5 text-white text-xs font-semibold rounded-lg transition-all duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer bg-[#009ee3] hover:bg-[#0081c0]"
            >
              {loading ? <Loader2 className="animate-spin" size={15} /> : <SiMercadopago size={17} />}
              Vincular Mercado Pago
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MercadoPagoConnect;
