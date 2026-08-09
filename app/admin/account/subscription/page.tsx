import { Metadata } from "next";
import axiosReq from "@/config/axios";
import { cookies } from "next/headers";
import dayjs from "dayjs";
import BillingSection from "@/components/dashboard/profile/BillingSection";
import MercadoPagoResultModal from "@/components/payments/MercadoPagoResultModal";

export const metadata: Metadata = {
  title: "Suscripción y facturación | SacaTurno",
  description: "Gestioná tu suscripción y facturación",
};

async function getSubscriptionData() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("sacaturno_token");
    const ownerID = cookieStore.get("sacaturno_userID");
    const authHeader = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token?.value}`,
      },
    };
    const res = await axiosReq.get(
      `/subscription/get/ownerID/${ownerID?.value}`,
      authHeader,
    );
    if (res.data) {
      return {
        businessID: res.data.businessID,
        ownerID: res.data.ownerID,
        subscriptionType: res.data.subscriptionType,
        paymentDate: dayjs(res.data.paymentDate).format("DD/MM/YYYY"),
        expiracyDate: dayjs(res.data.expiracyDate).format("DD/MM/YYYY"),
      };
    }
    return null;
  } catch {
    return null;
  }
}

async function getBusinessData() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("sacaturno_token");
    const ownerID = cookieStore.get("sacaturno_userID");
    const authHeader = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token?.value}`,
      },
    };
    const res = await axiosReq.get(
      `/business/get/${ownerID?.value}`,
      authHeader,
    );
    return res.data;
  } catch {
    return null;
  }
}

async function getPaymentsData() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("sacaturno_token");
    const ownerID = cookieStore.get("sacaturno_userID");
    const authHeader = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token?.value}`,
      },
    };
    const res = await axiosReq.get(
      `/subscription/payments/get/all/${ownerID?.value}`,
      authHeader,
    );
    return res.data ?? [];
  } catch {
    return [];
  }
}

export default async function SubscriptionPage() {
  const [subscription, business, payments] = await Promise.all([
    getSubscriptionData(),
    getBusinessData(),
    getPaymentsData(),
  ]);

  return (
    <div className="w-full py-4 2xl:py-3 flex flex-col gap-4 2xl:gap-6 px-4 sm:px-6 md:px-8 max-w-screen-2xl mx-auto">
      <h1 className="text-lg 2xl:text-xl font-semibold text-gray-800">
        Suscripción y facturación
      </h1>

      {subscription && business ? (
        <BillingSection
          subscriptionData={subscription}
          businessData={business}
          paymentsData={payments}
        />
      ) : (
        <>
          {/* Sin datos de suscripción no se monta BillingSection, pero el
              resultado del pago igual tiene que verse. */}
          <MercadoPagoResultModal variant="subscription" />
          <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm text-center">
            <p className="text-sm text-gray-400">
              No se encontró información de suscripción.
            </p>
          </div>
        </>
      )}

      <div className="w-full h-10" />
    </div>
  );
}
