import { Metadata, NextPage } from "next";
import FormBusiness from "@/components/dashboard/business/FormBusiness";
import axiosReq from "@/config/axios";
import { IBusiness } from "@/interfaces/business.interface";
import { cookies } from "next/headers";
import Link from "next/link";
import { IService } from "@/interfaces/service.interface";
import { MdOutlineAddBusiness, MdOutlineWorkHistory } from "react-icons/md";
import { FaArrowRight } from "react-icons/fa6";
import { Button } from "@/components/ui/button";

interface Props {}
export const metadata: Metadata = {
  title: "Mi Empresa | SacaTurno",
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

const BussinessConfigPage: NextPage<Props> = async ({}) => {
  const services: IService[] = await getServicesData();
  const data: IBusiness = await getBusinessData();

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
          <Link href="/admin/business/create">
            <Button className="w-full px-10 mt-1 text-white bg-orange-600 border-none rounded-lg shadow-2xl outline-none h-11 hover:bg-orange-700">
              <MdOutlineAddBusiness size={30} />
              Crear empresa
            </Button>
          </Link>
        </div>
      )}

      {typeof data !== "string" && (
        <div className="flex flex-col gap-6 w-full max-w-screen-md 2xl:max-w-screen-lg mx-auto px-4 py-4 2xl:py-10">
          <div className="flex items-center justify-between">
            <h1 className="text-lg 2xl:text-xl font-semibold text-gray-800">Mi empresa</h1>
            <Link
              href="/admin/business/services"
              className="flex items-center gap-1.5 text-xs 2xl:text-sm font-semibold text-orange-600 uppercase hover:underline transition-all duration-200"
            >
              Servicios
              <FaArrowRight size={11} />
            </Link>
          </div>

          <FormBusiness businessData={data} servicesData={services} />

          <div className="w-full h-10" />
        </div>
      )}
    </>
  );
};

export default BussinessConfigPage;
