import FormCreateBusiness from "@/components/dashboard/business/FormCreateBusiness";
import { Metadata } from "next";
import { cookies } from "next/headers";
import axiosReq from "@/config/axios";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Crear empresa | SacaTurno",
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
      authHeader
    );

    // si backend responde string BUSINESS_NOT_FOUND
    if (res.data === "BUSINESS_NOT_FOUND") {
      return {
        business: null,
        businessExists: false,
      };
    }

    // si existe 
    return {
      businessExists: true,
    };
  } catch (error) {
    return {
      businessExists: false,
    };
  }
}

const CreateBusiness = async () => {
  // get business data to check if it exists
  const { businessExists } = await getBusinessData();
  // if business exists, redirect to edit business page
  if (businessExists) {
    redirect("/admin/business");
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-screen-md mx-auto px-4 py-8">
      <h1 className="text-lg font-semibold text-gray-800">Crear empresa</h1>
      <FormCreateBusiness />
      <div className="w-full h-10" />
    </div>
  );
};

export default CreateBusiness;
