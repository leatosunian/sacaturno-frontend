"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { toast } from "sonner";
import { LuLoader, LuPencil } from "react-icons/lu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PLAN_LIMITS, PLAN_SHORT_LABELS, SubscriptionType } from "@/lib/planLimits";

const PLAN_BADGE_STYLES: Record<SubscriptionType, string> = {
  SC_FREE: "bg-gray-100 text-gray-700",
  SC_BASIC: "bg-blue-100 text-blue-700",
  SC_PRO: "bg-purple-100 text-purple-700",
  SC_FULL: "bg-orange-100 text-orange-700",
  SC_EXPIRED: "bg-red-100 text-red-700",
};

const PLAN_OPTIONS = Object.keys(PLAN_SHORT_LABELS) as SubscriptionType[];

const normalizePlan = (type?: string): SubscriptionType =>
  type && type in PLAN_SHORT_LABELS ? (type as SubscriptionType) : "SC_FREE";

interface Props {
  businessId: string;
  businessName: string;
  subscriptionType?: string;
  expiracyDate?: string | null;
  employeeCount: number;
  branchCount: number;
}

const BusinessPlanEditor = ({
  businessId,
  businessName,
  subscriptionType,
  expiracyDate,
  employeeCount,
  branchCount,
}: Props) => {
  const router = useRouter();
  const currentPlan = normalizePlan(subscriptionType);
  const currentExpiracy = expiracyDate
    ? dayjs(expiracyDate).format("YYYY-MM-DD")
    : dayjs().add(1, "month").format("YYYY-MM-DD");

  const [open, setOpen] = useState(false);
  const [plan, setPlan] = useState<SubscriptionType>(currentPlan);
  const [expiracy, setExpiracy] = useState(currentExpiracy);
  const [loading, setLoading] = useState(false);

  // El listado se re-renderiza tras router.refresh(): resincronizamos el form
  // con los datos nuevos para no dejar valores viejos si se reabre el modal.
  useEffect(() => {
    if (!open) {
      setPlan(currentPlan);
      setExpiracy(currentExpiracy);
    }
  }, [open, currentPlan, currentExpiracy]);

  const limits = PLAN_LIMITS[plan];
  const overEmployees = employeeCount > limits.maxEmployees;
  const overBranches = branchCount > limits.maxBranches;
  const isDirty = plan !== currentPlan || expiracy !== currentExpiracy;

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/backstage/businesses/${businessId}/subscription`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ subscriptionType: plan, expiracyDate: expiracy }),
      });
      if (!res.ok) throw new Error();
      toast.success(`${businessName}: ${PLAN_SHORT_LABELS[plan]}`);
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("No se pudo actualizar el plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Cambiar plan"
        className={`group flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-200 ease-in-out hover:brightness-95 cursor-pointer ${PLAN_BADGE_STYLES[currentPlan]}`}
      >
        {PLAN_SHORT_LABELS[currentPlan]}
        <LuPencil size={11} className="opacity-40 transition-opacity duration-200 group-hover:opacity-100" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <div className="flex w-full flex-col gap-4">
            <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
              <h4 className="text-lg font-semibold leading-none text-gray-800">Asignar plan</h4>
              <p className="mt-0.5 text-xs text-gray-400">{businessName}</p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">Plan</label>
              <Select value={plan} onValueChange={(v) => setPlan(v as SubscriptionType)}>
                <SelectTrigger className="h-8 border-gray-200 bg-gray-50 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLAN_OPTIONS.map((key) => (
                    <SelectItem key={key} value={key} className="text-xs">
                      {PLAN_SHORT_LABELS[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">Vence el</label>
              <input
                type="date"
                value={expiracy}
                onChange={(e) => setExpiracy(e.target.value)}
                className="h-8 w-full rounded-md border border-gray-200 bg-gray-50 px-3 text-xs transition-all duration-200 ease-in-out hover:border-orange-600 focus:border-orange-600 focus:bg-gray-100 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
              <span>
                Empleados: {employeeCount} / {limits.maxEmployees} · Sucursales: {branchCount} /{" "}
                {limits.maxBranches}
              </span>
              <span>El cambio no genera un pago ni suma a los ingresos del panel.</span>
            </div>

            {(overEmployees || overBranches) && (
              <p className="text-xs text-red-500">
                El negocio supera el límite del plan elegido. No se borra nada, pero no va a poder crear
                más {overEmployees ? "empleados" : "sucursales"} hasta quedar dentro del límite.
              </p>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={loading || !isDirty}
              className="mt-2 flex w-full cursor-pointer items-center justify-center rounded-lg bg-orange-600 py-2.5 text-sm font-semibold text-white transition-all duration-300 ease-in-out hover:bg-[#d92f04] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <LuLoader size={16} className="animate-spin" /> : "Guardar plan"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BusinessPlanEditor;
