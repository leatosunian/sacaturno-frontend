import { Metadata, NextPage } from "next";
import styles from "../../css-modules/miempresa.module.css";
import FormMiEmpresa from "@/components/FormMiEmpresa";
import axiosReq from "@/config/axios";
import { IBusiness } from "@/interfaces/business.interface";
import { cookies } from "next/headers";
import Link from "next/link";
import { IService } from "@/interfaces/service.interface";
import { MdOutlineWorkHistory } from "react-icons/md";



interface Props {}
export const metadata: Metadata = {
  title: "Mi Empresa - SacaTurno",
  description: "IT-related blog for devs",
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
    const response_data = {
      _id: "",
      name: "",
      businessID: "",
      owner: "",
    };
    return { response_data };
  }
}

const MiEmpresa: NextPage<Props> = async ({}) => {
  const services: IService[] = await getServicesData();
  const data: IBusiness = await getBusinessData();

  return (
    <>
      {typeof data === "string" && (
        <div
              style={{ height: "calc(100vh - 64px)" }}
              className="flex flex-col items-center justify-center w-full gap-6 px-4 text-center min-w-40"
            >
              <MdOutlineWorkHistory color="#dd4924" size={100}/>
              <span className="font-semibold sm:text-lg md:text-xl">
                No tenés una empresa creada.
              </span>
              <Link href="/admin/miempresa/create">
                <button className={styles.button} >Crear empresa</button>              
              </Link>
            </div>
      )}
      {typeof data !== "string" && (
        <>
          <header className="flex justify-center w-full mt-5 mb-5 md:mt-7 md:mb-7 h-fit">
            <h4 style={{ fontSize: "22px" }} className="font-bold uppercase ">
              Mi Empresa
            </h4>
          </header>
          <div className="flex justify-center w-full mt-5 h-fit">
            <div className={`${styles.cont} mb-5`}>
              <FormMiEmpresa businessData={data} servicesData={services} />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MiEmpresa;
