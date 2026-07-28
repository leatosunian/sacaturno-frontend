import { Metadata, NextPage } from "next";
import axiosReq from "@/config/axios";
import { IBusiness } from "@/interfaces/business.interface";
import ISubscription from "@/interfaces/subscription.interface";
import { cookies } from "next/headers";
import dayjs from "dayjs";
import MercadoPagoConnect from "@/components/dashboard/business/MercadoPagoConnect";
import NoBusinessEmptyState from "@/components/dashboard/NoBusinessEmptyState";

export const metadata: Metadata = {
  title: "MercadoPago para señas | SacaTurno",
  description: "Vinculá tu cuenta de MercadoPago para cobrar señas online",
};

async function getBusinessData(): Promise<IBusiness | null> {
  const cookieStore = cookies();
  const token = cookieStore.get("sacaturno_token");
  const ownerID = cookieStore.get("sacaturno_userID");
  try {
    const res = await axiosReq.get(`/business/get/${ownerID?.value}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token?.value}`,
      },
    });
    return res.data as IBusiness;
  } catch {
    return null;
  }
}

async function getSubscriptionData(
  ownerID: string,
  token: string,
): Promise<ISubscription | null> {
  try {
    const res = await axiosReq.get(`/subscription/get/ownerID/${ownerID}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
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

const MercadoPagoPage: NextPage = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get("sacaturno_token");
  const ownerID = cookieStore.get("sacaturno_userID");

  const business = await getBusinessData();

  if (!business || typeof business === "string") {
    return <NoBusinessEmptyState />;
  }

  const subscription = await getSubscriptionData(
    ownerID?.value ?? "",
    token?.value ?? "",
  );

  return (
    <div className="w-full py-4 2xl:py-3 flex flex-col gap-4 2xl:gap-6 px-4 sm:px-6 md:px-8 max-w-screen-2xl mx-auto">
      <h1 className="text-lg 2xl:text-xl font-semibold text-gray-800">
        Mercado Pago para señas
      </h1>

      <MercadoPagoConnect
        businessData={business}
        subscriptionData={subscription ?? undefined}
      />

      <div className="w-full h-10" />
    </div>
  );
};

export default MercadoPagoPage;
