import { Metadata, NextPage } from "next";
import axiosReq from "@/config/axios";
import { IBusiness } from "@/interfaces/business.interface";
import { cookies } from "next/headers";
import Link from "next/link";
import { IService } from "@/interfaces/service.interface";
import { MdOutlineWorkHistory } from "react-icons/md";
import { FaArrowLeft } from "react-icons/fa6";
import dayjs from "dayjs";
import FormServices from "@/components/dashboard/services/FormServices";
import MercadoPagoConnect from "@/components/dashboard/business/MercadoPagoConnect";

export const metadata: Metadata = {
  title: "Servicios | SacaTurno",
  description: "Aplicación de turnos online",
};

async function getBusinessData() {
  const cookieStore = cookies();
  const token = cookieStore.get("sacaturno_token");
  const ownerID = cookieStore.get("sacaturno_userID");
  try {
    const authHeader = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token?.value}`,
      },
    };
    const res = await axiosReq.get(`/business/get/${ownerID?.value}`, authHeader);
    return res.data;
  } catch (error: any) {
    const response_data = {
      businessExists: false,
      name: "",
      businessType: "",
      address: "",
      appointmentDuration: "",
      dayStart: "",
      dayEnd: "",
    };
    return { response_data };
  }
}

async function getServicesData() {
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
    const allServices = await axiosReq.get(
      `/business/service/get/user/${ownerID?.value}`,
      authHeader
    );
    return allServices.data;
  } catch (error) {
    const response_data = { _id: "", name: "", businessID: "", owner: "" };
    return { response_data };
  }
}

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
    const subscriptionData = await axiosReq.get(
      `/subscription/get/ownerID/${ownerID?.value}`,
      authHeader
    );
    if (subscriptionData.data) {
      return {
        businessID: subscriptionData.data.businessID,
        ownerID: subscriptionData.data.ownerID,
        subscriptionType: subscriptionData.data.subscriptionType,
        paymentDate: dayjs(subscriptionData.data.paymentDate).format("DD/MM/YYYY"),
        expiracyDate: dayjs(subscriptionData.data.expiracyDate).format("DD/MM/YYYY"),
        expiracyDay: subscriptionData.data.expiracyDay,
        expiracyMonth: subscriptionData.data.expiracyMonth,
      };
    }
  } catch (error) {
    const response_data = {
      businessID: "",
      ownerID: "",
      subscriptionType: "",
      paymentDate: "",
      expiracyDate: "",
    };
    return { response_data };
  }
}

const SettingsPage: NextPage = async ({}) => {
  const services: IService[] = await getServicesData();
  const data: IBusiness = await getBusinessData();
  const subscription = await getSubscriptionData();

  return (
    <>
      {typeof data === "string" && (
        <div
          style={{ height: "calc(100vh - 64px)" }}
          className="flex flex-col items-center justify-center w-full gap-6 px-4 text-center"
        >
          <MdOutlineWorkHistory color="#dd4924" size={100} />
          <span className="font-semibold sm:text-lg md:text-xl">
            No tenés una empresa creada.
          </span>
          <Link
            href="/admin/business/create"
            className="flex items-center gap-2 bg-orange-600 hover:bg-[#d92f04] text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition-all duration-300 ease-in-out"
          >
            Crear empresa
          </Link>
        </div>
      )}

      {typeof data !== "string" && (
        <div className="flex flex-col gap-5 w-full max-w-screen-md 2xl:max-w-screen-lg mx-auto px-4 py-4 2xl:py-10">
          <div className="flex items-center justify-between">
            <h1 className="text-lg 2xl:text-xl font-semibold text-gray-800">Servicios</h1>
            <Link
              href="/admin/business"
              className="flex items-center gap-1.5 text-xs 2xl:text-sm font-semibold text-orange-600 uppercase hover:underline transition-all duration-200"
            >
              <FaArrowLeft size={11} />
              Mi empresa
            </Link>
          </div>

          <FormServices
            businessData={data}
            servicesData={services}
            subscriptionData={subscription}
          />

          <MercadoPagoConnect businessData={data} subscriptionData={subscription} />

          <div className="w-full h-10" />
        </div>
      )}
    </>
  );
};

export default SettingsPage;
