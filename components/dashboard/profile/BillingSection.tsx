"use client";

import { useState } from "react";
import styles from "@/app/css-modules/FormMiPerfil.module.css";
import { IBusiness } from "@/interfaces/business.interface";
import { IPlanPayment } from "@/interfaces/planPayment.interface";
import ISubscriptionDisplay from "@/interfaces/subscriptionDisplay.interface";
import { FaMedal } from "react-icons/fa6";
import { IoMdAlert } from "react-icons/io";
import { LuCalendar, LuCalendarClock, LuCreditCard, LuInfo, LuSparkles } from "react-icons/lu";
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

  const isPaid = isPaidPlan(subscriptionData.subscriptionType);
  const isFree = subscriptionData.subscriptionType === "SC_FREE";
  const isExpired = subscriptionData.subscriptionType === "SC_EXPIRED";
  const isFull = subscriptionData.subscriptionType === "SC_FULL";

  return (
    <div className="flex flex-col gap-4 md:gap-6 w-full max-w-4xl">
      {/* Card: Mi plan */}
      <div className="relative flex flex-col bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden w-full">
        {/* accent bar for paid plans */}
        {isPaid && (
          <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-orange-600 to-[#d92f04]" />
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-50">
              <LuCreditCard className="w-4 h-4 text-orange-600" />
            </div>
            <h2 className="text-sm 2xl:text-base font-semibold text-gray-800">Mi plan</h2>
          </div>
          {isPaid && (
            <button
              onClick={() => setPickerOpen(true)}
              className="text-xs font-semibold text-orange-600 hover:text-[#d92f04] transition-colors duration-200 cursor-pointer"
            >
              Cambiar de plan
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 flex flex-col gap-5">
          {!isExpired && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-4 sm:p-5">
              {/* Plan actual */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Plan actual
                </span>
                <span className="text-sm 2xl:text-base font-bold text-gray-800 flex items-center gap-1.5">
                  {isFull && <FaMedal className="text-orange-600 flex-shrink-0" />}
                  <span className="truncate">{PLAN_LABELS[subscriptionData.subscriptionType]}</span>
                </span>
              </div>

              {/* Estado */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Estado
                </span>
                <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Activo
                </span>
              </div>

              {/* Fecha de pago / Activación */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {isPaid ? "Fecha de pago" : "Activación"}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <LuCalendar className="w-3.5 h-3.5 text-gray-400" />
                  {subscriptionData.paymentDate}
                </span>
              </div>

              {/* Vencimiento */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Vencimiento
                </span>
                <span className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <LuCalendarClock className="w-3.5 h-3.5 text-gray-400" />
                  {subscriptionData.expiracyDate}
                </span>
              </div>
            </div>
          )}

          {isExpired && (
            <div className="flex flex-col items-center gap-4 py-6 sm:py-8 rounded-xl border border-red-100 bg-red-50/30">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100">
                <IoMdAlert className="text-orange-600" size={30} />
              </div>
              <div className="flex flex-col items-center gap-1 text-center px-4">
                <span className="text-sm font-semibold text-gray-800">Tu suscripción venció</span>
                <span className="text-xs text-gray-500 max-w-sm">
                  Renová tu plan para seguir disfrutando de todas las funcionalidades de SacaTurno.
                </span>
              </div>
              <button
                onClick={() => setPickerOpen(true)}
                className="flex items-center gap-2 bg-orange-600 hover:bg-[#d92f04] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-lg transition-all duration-300 ease-in-out cursor-pointer shadow-sm hover:shadow-md"
              >
                Actualizar plan
              </button>
            </div>
          )}

          {isFree && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
              <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-100 flex-shrink-0">
                  <LuInfo className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-xs sm:text-sm font-semibold text-amber-900">
                    Estás en prueba gratuita
                  </span>
                  <span className="text-[11px] sm:text-xs text-amber-700/90">
                    Actualizá tu suscripción para desbloquear todas las funciones.
                  </span>
                </div>
              </div>
              <button
                onClick={() => setPickerOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-orange-600 hover:bg-[#d92f04] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-300 ease-in-out cursor-pointer shadow-sm"
              >
                <LuSparkles className="w-3.5 h-3.5" />
                Actualizar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Card: Historial de facturación */}
      <div className="flex flex-col bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden w-full">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-50">
              <LuCalendar className="w-4 h-4 text-orange-600" />
            </div>
            <h2 className="text-sm 2xl:text-base font-semibold text-gray-800">Historial de facturación</h2>
          </div>
          {paymentsData.length > 0 && (
            <span className="text-[11px] font-medium text-gray-400">
              {paymentsData.length} {paymentsData.length === 1 ? "pago" : "pagos"}
            </span>
          )}
        </div>

        <div className="flex flex-col">
          {paymentsData.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-10 px-6">
              <div className="flex items-center justify-center w-11 h-11 rounded-full bg-gray-50">
                <LuCreditCard className="w-5 h-5 text-gray-300" />
              </div>
              <p className="text-xs sm:text-sm text-gray-400 text-center">
                No hay pagos registrados.
              </p>
            </div>
          )}

          {paymentsData.length > 0 && (
            <>
              {/* Desktop table header */}
              <div className="hidden md:grid grid-cols-4 px-6 py-3 bg-gray-50/70 border-b border-gray-100">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Suscripción</span>
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Precio</span>
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Fecha de pago</span>
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Estado</span>
              </div>

              <div className={`${styles.paymentsCont} flex flex-col max-h-80 overflow-y-auto`}>
                {paymentsData.map((payment) => (
                  <div
                    key={payment._id}
                    className="grid grid-cols-2 md:grid-cols-4 gap-y-2 md:gap-y-0 items-start md:items-center px-5 sm:px-6 py-4 md:py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors duration-150"
                  >
                    {/* Suscripción */}
                    <div className="flex flex-col md:flex-row md:items-center gap-0.5 md:gap-1.5 order-1">
                      <span className="md:hidden text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Suscripción</span>
                      <span className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-800">
                        {payment.subscriptionType === "SC_FULL" && (
                          <FaMedal className="text-orange-600 flex-shrink-0" />
                        )}
                        <span className="truncate">
                          {PLAN_LABELS[payment.subscriptionType as SubscriptionType] ?? payment.subscriptionType}
                        </span>
                      </span>
                    </div>

                    {/* Precio */}
                    <div className="flex flex-col md:flex-row md:items-center gap-0.5 md:gap-1.5 order-3 md:order-2 text-right md:text-left">
                      <span className="md:hidden text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Precio</span>
                      <span className={`text-xs sm:text-sm font-semibold ${payment.price > 0 ? "text-gray-800" : "text-gray-500"}`}>
                        {payment.price > 0 ? `AR$ ${payment.price.toLocaleString("es-AR")}` : "Gratis"}
                      </span>
                    </div>

                    {/* Fecha */}
                    <div className="flex flex-col md:flex-row md:items-center gap-0.5 md:gap-1.5 order-2 md:order-3">
                      <span className="md:hidden text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Fecha</span>
                      <span className="text-xs sm:text-sm text-gray-500">
                        {dayjs(payment.paymentDate).format("DD/MM/YYYY")}
                      </span>
                    </div>

                    {/* Estado */}
                    <div className="flex flex-col md:flex-row md:items-center gap-0.5 md:gap-1.5 order-4 text-right md:text-left">
                      <span className="md:hidden text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Estado</span>
                      <span className="inline-flex items-center gap-1.5 self-end md:self-start rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700 ring-1 ring-inset ring-green-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Aprobado
                      </span>
                    </div>
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
