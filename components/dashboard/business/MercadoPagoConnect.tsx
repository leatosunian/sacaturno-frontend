"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axiosReq from "@/config/axios";
import { IBusiness } from "@/interfaces/business.interface";
import ISubscription from "@/interfaces/subscription.interface";
import { CheckCircle2, Info, Loader2, Lock, ShieldCheck, Unlink } from "lucide-react";
import { toast } from "sonner";
import { SiMercadopago } from "react-icons/si";
import { getPlanLimits } from "@/lib/planLimits";
import PlanPickerModal from "@/components/dashboard/subscription/PlanPickerModal";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  businessData: IBusiness;
  subscriptionData?: ISubscription | { response_data: object };
}

const MercadoPagoConnect: React.FC<Props> = ({
  businessData,
  subscriptionData,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLinked, setIsLinked] = useState<boolean>(
    businessData.mpLinked ?? false,
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [pickerOpen, setPickerOpen] = useState<boolean>(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState<boolean>(false);

  const subscription =
    subscriptionData && "subscriptionType" in subscriptionData
      ? (subscriptionData as ISubscription)
      : null;

  const depositsEnabled = getPlanLimits(subscription?.subscriptionType).depositsEnabled;

  useEffect(() => {
    const mpStatus = searchParams.get("mp");
    if (mpStatus === "success") {
      setIsLinked(true);
      toast.success("Mercado Pago vinculado correctamente");
      router.replace("/admin/account/mercadopago");
    } else if (mpStatus === "error") {
      toast.error("Error al vincular Mercado Pago. Intentá de nuevo.");
      router.replace("/admin/account/mercadopago");
    }
  }, [searchParams, router]);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("sacaturno_token");
      const res = await axiosReq.get(
        `/mp/oauth/connect?businessID=${businessData._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
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
      await axiosReq.delete(
        `/mp/oauth/disconnect?businessID=${businessData._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setIsLinked(false);
      setConfirmDisconnect(false);
      toast.success("Mercado Pago desvinculado");
    } catch {
      toast.error("Error al desvincular. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gap-0 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden  flex flex-col w-full max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 2xl:px-8 2xl:py-5 border-b border-gray-100">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
          style={{ backgroundColor: "#009ee3" }}
        >
          <SiMercadopago size={18} className="text-white" />
        </div>
        <div className="flex flex-col">
          <h2 className="text-sm 2xl:text-base font-semibold text-gray-800 leading-tight">
            Mercado Pago
          </h2>
          <span className="text-xs text-gray-400 font-medium">
            Cobro de señas
          </span>
        </div>
      </div>

      {!depositsEnabled ? (
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 2xl:py-12">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 shrink-0">
            <Lock size={18} className="text-accent" />
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <span className="text-sm 2xl:text-base font-semibold text-gray-800">
              Función disponible en los planes pagos
            </span>
            <span className="text-xs 2xl:text-sm text-gray-500 leading-relaxed">
              El cobro de señas está disponible en los planes Básico, Pro y Full.
            </span>
          </div>
          <button
            onClick={() => setPickerOpen(true)}
            className="mt-1 flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-orange-500 rounded-lg transition-colors duration-200 cursor-pointer"
          >
            Elegir un plan
          </button>
        </div>
      ) : (
        <div className="p-6 2xl:p-8 flex flex-col gap-4">
          {/* Info box */}
          <div className="flex flex-col gap-3 px-4 py-4 rounded-lg bg-gray-50 border border-gray-100">
            <div className="flex items-start gap-3">
              <ShieldCheck size={15} className="shrink-0 text-gray-400 mt-px" />
              <p className="text-xs sm:text-[13px] text-gray-600 font-semibold leading-relaxed">
                Vinculá tu cuenta de Mercado Pago de forma segura para cobrar señas cuando tus clientes reserven un turno.
              </p>
            </div>
            <ul className="flex flex-col gap-2 pl-1">
              <li className="flex items-start gap-2 text-[13px] text-gray-500 leading-relaxed">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#009ee3] shrink-0" />
                Los pagos de señas se acreditan directamente en tu cuenta de Mercado Pago, sin intermediarios.
              </li>
              <li className="flex items-start gap-2 text-[13px] text-gray-500 leading-relaxed">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#009ee3] shrink-0" />
                Necesitás tener una cuenta vinculada para poder activar el cobro de señas en tus servicios.
              </li>
              <li className="flex items-start gap-2 text-[13px] text-gray-500 leading-relaxed">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#009ee3] shrink-0" />
                La vinculación usa OAuth de Mercado Pago: nunca almacenamos tu contraseña.
              </li>
            </ul>
          </div>

          {/* No commission card */}
          <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-orange-50 border border-orange-200">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 shrink-0">
              <Info size={15} className="text-orange-600" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-700">
                Sin comisiones
              </span>
              <p className="text-[13px] text-orange-900/80 leading-relaxed">
                SacaTurno <span className="font-semibold">no cobra ninguna comisión</span> por las señas — el 100% va directo a tu cuenta.
              </p>
            </div>
          </div>

          {isLinked ? (
            <div className="flex flex-col gap-3">
              <div
                className="relative flex flex-col gap-2 px-4 py-3 rounded-lg border overflow-hidden"
                style={{ backgroundColor: "#e6f4fb", borderColor: "#b3e0f4" }}
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ backgroundColor: "#009ee3" }}
                />
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="shrink-0" style={{ color: "#009ee3" }} />
                    <span
                      className="text-[11px] font-bold uppercase tracking-wider"
                      style={{ color: "#007bb0" }}
                    >
                      Cuenta vinculada
                    </span>
                  </div>
                  <span
                    className="inline-flex items-center h-5 px-2 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shrink-0"
                    style={{ backgroundColor: "#009ee3" }}
                  >
                    Activa
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  {businessData.mpAccountName && (
                    <span className="text-sm font-semibold text-gray-800 truncate">
                      {businessData.mpAccountName}
                    </span>
                  )}
                  {businessData.mpAccountEmail && (
                    <span className="text-xs text-gray-500 truncate">
                      {businessData.mpAccountEmail}
                    </span>
                  )}
                  {!businessData.mpAccountName && !businessData.mpAccountEmail && (
                    <span className="text-xs text-gray-500">
                      Tu cuenta de Mercado Pago está activa
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setConfirmDisconnect(true)}
                disabled={loading}
                className="flex items-center md:max-w-56 justify-center gap-2 w-full px-4 py-2.5 border border-red-200 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 transition-all duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                <Unlink size={14} />
                Desvincular cuenta
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={loading}
              className="flex items-center md:max-w-56 justify-center gap-2.5 w-full px-4 py-2.5 text-white text-xs font-semibold rounded-lg transition-all duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer bg-[#009ee3] hover:bg-[#0081c0]"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={15} />
              ) : (
                <SiMercadopago size={17} />
              )}
              Vincular Mercado Pago
            </button>
          )}
        </div>
      )}

      <PlanPickerModal open={pickerOpen} onOpenChange={setPickerOpen} businessData={businessData} />

      <Dialog
        open={confirmDisconnect}
        onOpenChange={(o) => {
          if (!o && !loading) setConfirmDisconnect(false);
        }}
      >
        <DialogContent className="sm:w-[440px] w-[93vw]">
          <div className="flex flex-col w-full gap-4">
            <div className="pb-4 border-b border-gray-100 flex flex-col gap-1">
              <h4 className="text-lg leading-none font-semibold text-gray-800">
                Desvincular cuenta
              </h4>
            </div>
            <p className="text-base text-gray-700 mt-1">
              ¿Desvincular tu cuenta de <strong>Mercado Pago</strong>?
            </p>
            <p className="text-sm text-gray-500 -mt-2 mb-2 leading-relaxed">
              No podrás cobrar nuevas señas hasta que vuelvas a vincular una cuenta. Los turnos ya
              pagados no se modifican.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setConfirmDisconnect(false)}
                disabled={loading}
                className="flex-1 h-10 bg-gray-100 text-gray-700 hover:bg-gray-200 border-none rounded-lg"
              >
                Cancelar
              </Button>
              <Button
                disabled={loading}
                onClick={handleDisconnect}
                className="flex-1 h-10 text-white bg-red-600 hover:bg-red-700 border-none rounded-lg"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Desvinculando...
                  </span>
                ) : (
                  "Desvincular"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MercadoPagoConnect;
