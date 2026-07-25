import { Metadata, NextPage } from "next";
import axiosReq from "@/config/axios";
import { IBusiness } from "@/interfaces/business.interface";
import { cookies } from "next/headers";
import Link from "next/link";
import { IService } from "@/interfaces/service.interface";
import NoBusinessEmptyState from "@/components/dashboard/NoBusinessEmptyState";
import dayjs from "dayjs";
import ServicesComponent from "@/components/dashboard/services/ServicesComponent";
import { getTokenPayload } from "@/lib/getTokenPayload";

export const metadata: Metadata = {
  title: "Servicios | SacaTurno",
  description: "Aplicación de turnos online",
};

async function getBusinessData() {
  const cookieStore = cookies();
  const token = cookieStore.get("sacaturno_token");
  const ownerID = cookieStore.get("sacaturno_userID");
  const payload = getTokenPayload();
  const isEmployee = payload?.role === "employee";
  const contextBusinessID = payload?.businessID;
  try {
    const authHeader = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token?.value}`,
      },
    };
    const res =
      isEmployee && contextBusinessID
        ? await axiosReq.get(
            `/business/getbyid/${contextBusinessID}`,
            authHeader,
          )
        : await axiosReq.get(`/business/get/${ownerID?.value}`, authHeader);
    return res.data;
  } catch {
    return {
      businessExists: false,
      name: "",
      businessType: "",
      address: "",
      appointmentDuration: "",
      dayStart: "",
      dayEnd: "",
    };
  }
}

async function getServicesData() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("sacaturno_token");
    const ownerID = cookieStore.get("sacaturno_userID");
    const payload = getTokenPayload();
    const isEmployee = payload?.role === "employee";
    const contextBusinessID = payload?.businessID;
    const authHeader = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token?.value}`,
      },
    };
    const allServices =
      isEmployee && contextBusinessID
        ? await axiosReq.get(
            `/business/service/get/${contextBusinessID}`,
            authHeader,
          )
        : await axiosReq.get(
            `/business/service/get/user/${ownerID?.value}`,
            authHeader,
          );
    return allServices.data;
  } catch {
    return { _id: "", name: "", businessID: "", owner: "" };
  }
}

async function getSubscriptionData() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("sacaturno_token");
    const ownerID = cookieStore.get("sacaturno_userID");
    const payload = getTokenPayload();
    const isEmployee = payload?.role === "employee";
    const contextBusinessID = payload?.businessID;
    const authHeader = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token?.value}`,
      },
    };
    const subscriptionData =
      isEmployee && contextBusinessID
        ? await axiosReq.get(
            `/subscription/get/businessID/${contextBusinessID}`,
            authHeader,
          )
        : await axiosReq.get(
            `/subscription/get/ownerID/${ownerID?.value}`,
            authHeader,
          );
    if (subscriptionData.data) {
      return {
        businessID: subscriptionData.data.businessID,
        ownerID: subscriptionData.data.ownerID,
        subscriptionType: subscriptionData.data.subscriptionType,
        paymentDate: dayjs(subscriptionData.data.paymentDate).format(
          "DD/MM/YYYY",
        ),
        expiracyDate: dayjs(subscriptionData.data.expiracyDate).format(
          "DD/MM/YYYY",
        ),
      };
    }
  } catch {
    return {
      businessID: "",
      ownerID: "",
      subscriptionType: "",
      paymentDate: "",
      expiracyDate: "",
    };
  }
}

const ServicesPage: NextPage = async () => {
  const services: IService[] = await getServicesData();
  const data: IBusiness = await getBusinessData();
  const subscription = await getSubscriptionData();
  const payload = getTokenPayload();
  const isEmployee = payload?.role === "employee";

  return (
    <>
      {typeof data === "string" && <NoBusinessEmptyState />}

      {typeof data !== "string" && (
        <div className="w-full py-4 2xl:py-3 flex flex-col gap-4 2xl:gap-6 px-4 sm:px-6 md:px-8 max-w-screen-2xl mx-auto">
          <h1 className="text-lg 2xl:text-xl font-semibold text-gray-800">
            Mis servicios
          </h1>

          <ServicesComponent 
            businessData={data}
            servicesData={services}
            subscriptionData={subscription}
            isEmployee={isEmployee}
          />

          <div className="w-full h-10" />
        </div>
      )}
    </>
  );
};

export default ServicesPage;
