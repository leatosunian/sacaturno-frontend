import FormCreateBusiness from "@/components/dashboard/business/FormCreateBusiness";
import { Metadata } from "next";
import { cookies } from "next/headers";
import axiosReq from "@/config/axios";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Crear empresa | SacaTurno",
  description: "Aplicación de turnos online",
};

async function getBusinessData(token: string, ownerID: string) {
  try {
    const authHeader = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    const res = await axiosReq.get(`/business/get/${ownerID}`, authHeader);
    if (res.data === "BUSINESS_NOT_FOUND") return { businessExists: false };
    return { businessExists: true };
  } catch {
    return { businessExists: false };
  }
}

async function getUserData(token: string, ownerID: string) {
  try {
    const authHeader = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    const res = await axiosReq.get(`/user/get/${ownerID}`, authHeader);
    return res.data?.response_data ?? null;
  } catch {
    return null;
  }
}

const CreateBusiness = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get("sacaturno_token")?.value ?? "";
  const ownerID = cookieStore.get("sacaturno_userID")?.value ?? "";

  const { businessExists } = await getBusinessData(token, ownerID);
  if (businessExists) redirect("/admin/business");

  const userData = await getUserData(token, ownerID);

  return (
    <div className="w-full py-4 2xl:py-3 flex flex-col gap-4 2xl:gap-6 px-4 sm:px-6 md:px-8 max-w-screen-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800">Crear empresa</h1>
      </div>
      <FormCreateBusiness userEmail={userData?.email ?? ""} />
      {/* <div className="w-full h-10" /> */}
    </div>
  );
};

export default CreateBusiness;
