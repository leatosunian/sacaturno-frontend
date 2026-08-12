import { Metadata, NextPage } from "next";
import axiosReq from "@/config/axios";
import { IBusiness } from "@/interfaces/business.interface";
import { IEmployee } from "@/interfaces/employee.interface";
import { IService } from "@/interfaces/service.interface";
import { IBranch } from "@/interfaces/branch.interface";
import ISubscription from "@/interfaces/subscription.interface";
import { cookies } from "next/headers";
import Link from "next/link";
import EmployeesSection from "@/components/dashboard/employees/EmployeesSection";
import NoBusinessEmptyState from "@/components/dashboard/NoBusinessEmptyState";

export const metadata: Metadata = {
  title: "Mi equipo | SacaTurno",
  description: "Gestioná los empleados de tu negocio",
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
    return res.data as IBusiness;
  } catch {
    return null;
  }
}

async function getEmployeesData(businessID: string, token: string) {
  try {
    const res = await axiosReq.get(`/employee/list/${businessID}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return (res.data ?? []) as IEmployee[];
  } catch {
    return [] as IEmployee[];
  }
}

async function getServicesData(businessID: string, token: string) {
  try {
    const res = await axiosReq.get(`/business/service/get/${businessID}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return (res.data ?? []) as IService[];
  } catch {
    return [] as IService[];
  }
}

async function getBranchesData(businessID: string, token: string) {
  try {
    const res = await axiosReq.get(`/branch/list/${businessID}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return (res.data ?? []) as IBranch[];
  } catch {
    return [] as IBranch[];
  }
}

async function getSubscriptionData(businessID: string, token: string) {
  try {
    const res = await axiosReq.get(
      `/subscription/get/businessID/${businessID}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return res.data as ISubscription;
  } catch {
    return null;
  }
}

const EmployeesPage: NextPage = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get("sacaturno_token");
  const business = await getBusinessData();

  if (!business || typeof business === "string") {
    return <NoBusinessEmptyState />;
  }

  const [employees, services, branches, subscription] = await Promise.all([
    getEmployeesData(business._id!, token?.value ?? ""),
    getServicesData(business._id!, token?.value ?? ""),
    getBranchesData(business._id!, token?.value ?? ""),
    getSubscriptionData(business._id!, token?.value ?? ""),
  ]);

  return (
    <div className="w-full py-4 2xl:py-3 flex flex-col gap-4 2xl:gap-6 px-4 sm:px-6 md:px-8 max-w-screen-2xl mx-auto">
      <h1 className="text-lg 2xl:text-xl font-semibold text-gray-800">
        Mi equipo
      </h1>

      <EmployeesSection
        businessData={business}
        initialEmployees={employees}
        initialServices={services}
        initialBranches={branches}
        subscriptionData={subscription ?? undefined}
      />

      <div className="w-full h-10" />
    </div>
  );
};

export default EmployeesPage;
