"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axiosReq from "@/config/axios";
import { IBusiness } from "@/interfaces/business.interface";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { SiMercadopago } from "react-icons/si";

interface Props {
  businessData: IBusiness;
}

const MercadoPagoConnect: React.FC<Props> = ({ businessData }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLinked, setIsLinked] = useState<boolean>(businessData.mpLinked ?? false);
  const [loading, setLoading] = useState<boolean>(false);

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
  }, [searchParams]);

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

  return (
    <div className="flex flex-col gap-0 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
      <div className="px-6 py-4 2xl:px-8 2xl:py-5 border-b border-gray-100">
        <h2 className="text-sm 2xl:text-base font-semibold text-gray-800">Señas</h2>
      </div>

      <div className="p-6 2xl:p-8 flex flex-col gap-4 2xl:gap-5">
        <p className="text-xs 2xl:text-sm text-gray-500 flex items-start gap-2">
          <ShieldCheck size={14} className="shrink-0 text-gray-400 mt-0.5" />
          Vinculá de manera segura tu cuenta de Mercado Pago para el cobro de señas a la hora de reservar un turno.
        </p>

        {isLinked ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-3 py-2.5">
              <CheckCircle2 size={14} className="shrink-0 text-green-500" />
              <span className="text-xs 2xl:text-sm font-semibold text-green-700">Cuenta vinculada</span>
            </div>
            <button
              onClick={handleDisconnect}
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full h-9 2xl:h-10 border border-red-200 text-red-600 text-xs 2xl:text-sm font-semibold rounded-lg hover:bg-red-50 transition-all duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? <Loader2 className="animate-spin" size={14} /> : <SiMercadopago size={14} />}
              Desvincular Mercado Pago
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full h-9 2xl:h-10 bg-[#009ee3] hover:bg-[#0081c0] text-white text-xs 2xl:text-sm font-semibold rounded-lg transition-all duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? <Loader2 className="animate-spin" size={14} /> : <SiMercadopago size={18} />}
            Vincular Mercado Pago
          </button>
        )}
      </div>
    </div>
  );
};

export default MercadoPagoConnect;
