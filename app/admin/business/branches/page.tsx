import { Metadata, NextPage } from "next";
import axiosReq from "@/config/axios";
import { IBusiness } from "@/interfaces/business.interface";
import { IBranch } from "@/interfaces/branch.interface";
import { IEmployee } from "@/interfaces/employee.interface";
import ISubscription from "@/interfaces/subscription.interface";
import { cookies } from "next/headers";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";
import BranchesSection from "@/components/dashboard/branches/BranchesSection";
import NoBusinessEmptyState from "@/components/dashboard/NoBusinessEmptyState";

export const metadata: Metadata = {
  title: "Sucursales | SacaTurno",
  description: "Gestión de sucursales",
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

const BranchesPage: NextPage = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get("sacaturno_token");

  const business = await getBusinessData();

  if (!business || typeof business === "string") {
    return <NoBusinessEmptyState />;
  }

  const [branches, employees, subscription] = await Promise.all([
    getBranchesData(business._id!, token?.value ?? ""),
    getEmployeesData(business._id!, token?.value ?? ""),
    getSubscriptionData(business._id!, token?.value ?? ""),
  ]);

  return (
    <div className="w-full py-4 2xl:py-3 flex flex-col gap-4 2xl:gap-6 px-4 sm:px-6 md:px-8 max-w-screen-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-lg 2xl:text-xl font-semibold text-gray-800">
          Sucursales
        </h1>
        {/* <Link
          href="/admin/business"
          className="flex items-center gap-1.5 text-xs 2xl:text-sm font-semibold text-primary uppercase hover:underline transition-all duration-200"
        >
          <FaArrowLeft size={11} />
          Mi empresa
        </Link> */}
      </div>

      <BranchesSection
        businessData={business}
        initialBranches={branches}
        initialEmployees={employees}
        subscriptionData={subscription ?? undefined}
      />

      <div className="w-full h-10" />
    </div>
  );
};

export default BranchesPage;
