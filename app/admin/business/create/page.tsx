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

    // 👇 si backend responde string BUSINESS_NOT_FOUND
    if (res.data === "BUSINESS_NOT_FOUND") {
      return {
        business: null,
        businessExists: false,
      };
    }

    // 👇 si existe negocio
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
    <>
      <header className="flex flex-col items-center justify-center w-full mt-5 mb-4 md:mt-5 md:mb-6 h-fit">
        <h4
          className="relative inline-block px-2 font-bold text-center uppercase"
          style={{ fontSize: 20 }}
        >
          Crear empresa
          <span
            className="absolute left-0 right-0 mx-auto"
            style={{
              bottom: -2,
              height: 2,
              background: "#dd4924",
              width: "60%",
            }}
          />
        </h4>
      </header>

      <div className="flex max-w-[95vw] mx-auto flex-col justify-center w-full mt-7 h-fit">
        <div className="w-full max-w-xl px-5 mx-auto border md:px-0 rounded-xl">
          <FormCreateBusiness/>
        </div>

        <div className="w-full h-2 md:h-20"></div>
      </div>
    </>
  );
};

export default CreateBusiness;
