"use client";

import { useState } from "react";
import styles from "@/app/css-modules/FormMiPerfil.module.css";
import { IBusiness } from "@/interfaces/business.interface";
import { IPlanPayment } from "@/interfaces/planPayment.interface";
import ISubscriptionDisplay from "@/interfaces/subscriptionDisplay.interface";
import { FaMedal } from "react-icons/fa6";
import { IoMdAlert } from "react-icons/io";
import dayjs from "dayjs";
import { isPaidPlan, PLAN_LABELS, SubscriptionType } from "@/lib/planLimits";
import PlanPickerModal from "@/components/dashboard/subscription/PlanPickerModal";

interface Props {
  subscriptionData: ISubscriptionDisplay;
  businessData: IBusiness;
  paymentsData: IPlanPayment[];
}

const BillingSection: React.FC<Props> = ({ subscriptionData, businessData, paymentsData }) => {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 w-full max-w-4xl">
      {/* Card: Mi plan */}
      <div className="flex flex-col gap-0 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden w-full">
        <div className="flex items-center justify-between px-6 py-4 2xl:px-8 2xl:py-5 border-b border-gray-100">
          <h2 className="text-sm 2xl:text-base font-semibold text-gray-800">Mi plan</h2>
          {isPaidPlan(subscriptionData.subscriptionType) && (
            <button
              onClick={() => setPickerOpen(true)}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 cursor-pointer"
            >
              Cambiar de plan
            </button>
          )}
        </div>

        <div className="p-6 2xl:p-8 flex flex-col gap-6 2xl:gap-8">
          {subscriptionData.subscriptionType !== "SC_EXPIRED" && (
            <div className="grid grid-cols-2 bg-gray-50 rounded-xl border border-gray-100 px-4 py-3 md:grid-cols-4 gap-4 2xl:gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-xs 2xl:text-sm font-semibold text-gray-400 uppercase tracking-wide">Plan actual</span>
                <span className="text-xs 2xl:text-sm font-semibold flex items-center gap-1">
                  {subscriptionData.subscriptionType === "SC_FULL" && <FaMedal color="#dd4924" />}
                  {PLAN_LABELS[subscriptionData.subscriptionType]}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs 2xl:text-sm font-semibold text-gray-400 uppercase tracking-wide">Estado</span>
                <span className="text-xs 2xl:text-sm font-semibold text-green-600">● Activo</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs 2xl:text-sm font-semibold text-gray-400 uppercase tracking-wide">
                  {isPaidPlan(subscriptionData.subscriptionType) ? "Fecha de pago" : "Activación"}
                </span>
                <span className="text-xs 2xl:text-sm font-semibold">{subscriptionData.paymentDate}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs 2xl:text-sm font-semibold text-gray-400 uppercase tracking-wide">Vencimiento</span>
                <span className="text-xs 2xl:text-sm font-semibold">{subscriptionData.expiracyDate}</span>
              </div>
            </div>
          )}

          {subscriptionData.subscriptionType === "SC_EXPIRED" && (
            <div className="flex flex-col items-center gap-3 py-6">
              <IoMdAlert color="#dd4924" size={40} />
              <span className="text-xs 2xl:text-sm font-semibold text-center max-w-sm">
                Tu suscripción ha caducado. Hacé click en el botón debajo para renovar tu plan.
              </span>
              <button
                onClick={() => setPickerOpen(true)}
                className="flex items-center gap-2 bg-primary hover:bg-orange-500 text-white text-xs 2xl:text-sm font-semibold px-5 2xl:px-6 py-2.5 2xl:py-3 rounded-lg transition-all duration-300 ease-in-out cursor-pointer"
              >
                Actualizar plan
              </button>
            </div>
          )}

          {subscriptionData.subscriptionType === "SC_FREE" && (
            <div className="w-full notifications-container">
              <div className="alert">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 alert-svg">
                      <path clipRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" fillRule="evenodd"></path>
                    </svg>
                  </div>
                  <div className="alert-prompt-wrap">
                    <p className="text-sm text-yellow-700">
                      Estás utilizando una prueba gratuita.{" "}
                      <span className="cursor-pointer alert-prompt-link" onClick={() => setPickerOpen(true)}>
                        Actualizar suscripción
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card: Historial de facturación */}
      <div className="flex flex-col gap-0 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden w-full">
        <div className="px-6 py-4 2xl:px-8 2xl:py-5 border-b border-gray-100">
          <h2 className="text-sm 2xl:text-base font-semibold text-gray-800">Historial de facturación</h2>
        </div>

        <div className="p-6 2xl:p-8 flex flex-col gap-3">
          {paymentsData.length === 0 && (
            <p className="text-xs 2xl:text-sm text-gray-400 text-center py-6">No hay pagos registrados.</p>
          )}

          {paymentsData.length > 0 && (
            <>
              <div className="hidden lg:grid grid-cols-4 px-1 pb-2 border-b border-gray-100">
                <span className="text-xs 2xl:text-sm font-semibold text-gray-400 uppercase">Suscripción</span>
                <span className="text-xs 2xl:text-sm font-semibold text-gray-400 uppercase">Precio</span>
                <span className="text-xs 2xl:text-sm font-semibold text-gray-400 uppercase">Fecha de pago</span>
                <span className="text-xs 2xl:text-sm font-semibold text-gray-400 uppercase">Estado</span>
              </div>
              <div className={`${styles.paymentsCont} flex flex-col gap-2 max-h-72 overflow-y-auto`}>
                {paymentsData.map((payment) => (
                  <div
                    key={payment._id}
                    className="grid grid-cols-2 lg:grid-cols-4 items-center py-3 border-b border-gray-50 last:border-0 gap-2 lg:gap-0"
                  >
                    <span className="flex items-center gap-1.5 text-xs 2xl:text-sm font-medium">
                      {payment.subscriptionType === "SC_FULL" && <FaMedal color="#dd4924" />}
                      {PLAN_LABELS[payment.subscriptionType as SubscriptionType] ?? payment.subscriptionType}
                    </span>
                    <span className="text-xs 2xl:text-sm font-semibold">
                      {payment.price > 0 ? `AR$ ${payment.price.toLocaleString("es-AR")}` : "Gratis"}
                    </span>
                    <span className="text-xs 2xl:text-sm text-gray-500">
                      {dayjs(payment.paymentDate).format("DD/MM/YYYY")}
                    </span>
                    <span className="text-xs 2xl:text-sm font-semibold text-green-600">● Aprobado</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <PlanPickerModal open={pickerOpen} onOpenChange={setPickerOpen} businessData={businessData} />
    </div>
  );
};

export default BillingSection;
