import { Metadata, NextPage } from "next";
import FormBusiness from "@/components/dashboard/business/FormBusiness";
import EmployeesSection from "@/components/dashboard/employees/EmployeesSection";
import axiosReq from "@/config/axios";
import { IBusiness } from "@/interfaces/business.interface";
import { IEmployee } from "@/interfaces/employee.interface";
import ISubscription from "@/interfaces/subscription.interface";
import { cookies } from "next/headers";
import Link from "next/link";
import { IService } from "@/interfaces/service.interface";
import { FaArrowRight } from "react-icons/fa6";
import { Separator } from "@/components/ui/separator";
import { getPlanLimits } from "@/lib/planLimits";
import NoBusinessEmptyState from "@/components/dashboard/NoBusinessEmptyState";

interface Props {}
export const metadata: Metadata = {
  title: "Configuración | SacaTurno",
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
    const res = await axiosReq.get(
      `/business/get/${ownerID?.value}`,
      authHeader,
    );
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

async function getSubscriptionData(businessID: string, token: string) {
  try {
    const res = await axiosReq.get(`/subscription/get/businessID/${businessID}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data as ISubscription;
  } catch {
    return null;
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
      authHeader,
    );
    return allServices.data;
  } catch (error) {
    const response_data = { _id: "", name: "", businessID: "", owner: "" };
    return { response_data };
  }
}

const BussinessConfigPage: NextPage<Props> = async ({}) => {
  const services: IService[] = await getServicesData();
  const data: IBusiness = await getBusinessData();
  const cookieStore = cookies();
  const subscription: ISubscription | null =
    typeof data !== "string" && data?._id
      ? await getSubscriptionData(data._id, cookieStore.get("sacaturno_token")?.value ?? "")
      : null;
  const branchesEnabled = getPlanLimits(subscription?.subscriptionType).maxBranches > 0;

  return (
    <>
      {typeof data === "string" && <NoBusinessEmptyState />}

      {typeof data !== "string" && (
        <div className="w-full py-4 2xl:py-3 flex flex-col gap-4 2xl:gap-6 px-4 sm:px-6 md:px-8 max-w-screen-2xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-lg 2xl:text-xl font-semibold text-gray-800">
              Configuración
            </h1>
            {/* <Link
              href="/admin/services"
              className="flex items-center gap-1.5 text-xs 2xl:text-sm font-semibold text-primary uppercase hover:underline transition-all duration-200"
            >
              Servicios
              <FaArrowRight size={11} />
            </Link> */}
          </div>

          <FormBusiness businessData={data} servicesData={services} branchesEnabled={branchesEnabled} />
        </div>
      )}
    </>
  );
};

export default BussinessConfigPage;
