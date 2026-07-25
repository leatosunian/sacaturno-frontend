import FormProfileConfig from "@/components/dashboard/profile/FormProfileConfig";
import EmployeeProfile from "@/components/dashboard/employees/EmployeeProfile";
import axiosReq from "@/config/axios";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { getTokenPayload } from "@/lib/getTokenPayload";

export const metadata: Metadata = {
  title: "Mi perfil | SacaTurno",
  description: "Aplicación de turnos online",
};

const getUser = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get("sacaturno_token");
  const userID = cookieStore.get("sacaturno_userID");
  try {
    const res = await axiosReq.get(`/user/get/${userID?.value}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token?.value}`,
      },
    });
    return res.data;
  } catch {
    const response_data = { name: "", surname: "", phone: "", email: "" };
    return { response_data };
  }
};

async function getEmployeeBusinessData(businessID: string, token: string) {
  try {
    const res = await axiosReq.get(`/business/getbyid/${businessID}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch {
    return null;
  }
}

async function getEmployeeData(token: string) {
  try {
    const res = await axiosReq.get("/employee/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch {
    return null;
  }
}

const ProfileConfigPage = async () => {
  const cookieStore = cookies();
  const payload = getTokenPayload();
  const role = payload?.role;
  const contextBusinessID = payload?.businessID;
  const token = cookieStore.get("sacaturno_token")?.value ?? "";

  if (role === "employee") {
    const [userData, businessData, employeeData] = await Promise.all([
      getUser(),
      contextBusinessID ? getEmployeeBusinessData(contextBusinessID, token) : null,
      getEmployeeData(token),
    ]);
    return (
      <div className="w-full py-4 2xl:py-3 flex flex-col gap-4 2xl:gap-6 px-4 sm:px-6 md:px-8 max-w-screen-2xl mx-auto">
        <h1 className="text-lg 2xl:text-xl font-semibold text-gray-800">Mi perfil</h1>
        <FormProfileConfig profileData={userData} />
        <EmployeeProfile employeeData={employeeData} businessData={businessData} />
        <div className="w-full h-10" />
      </div>
    );
  }

  const data = await getUser();

  return (
    <div className="w-full py-4 2xl:py-3 flex flex-col gap-4 2xl:gap-6 px-4 sm:px-6 md:px-8 max-w-screen-2xl mx-auto">
      <h1 className="text-lg 2xl:text-xl font-semibold text-gray-800">Mi perfil</h1>
      <FormProfileConfig profileData={data} />
      <div className="w-full h-10" />
    </div>
  );
};

export default ProfileConfigPage;
