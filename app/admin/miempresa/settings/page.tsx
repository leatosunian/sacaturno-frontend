import { Metadata, NextPage } from "next";
import styles from "@/app/css-modules/miempresa.module.css";
import axiosReq from "@/config/axios";
import { IBusiness } from "@/interfaces/business.interface";
import { cookies } from "next/headers";
import Link from "next/link";
import { IService } from "@/interfaces/service.interface";
import { MdOutlineWorkHistory } from "react-icons/md";
import FormSettings from "@/components/FormSettings";
import { FaArrowLeft } from "react-icons/fa6";
import dayjs from "dayjs";
import ISubscription from "@/interfaces/subscription.interface";

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

async function getSubscriptionData() {
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
    const subscriptionData = await axiosReq.get(
      `/subscription/get/ownerID/${ownerID?.value}`,
      authHeader
    );

    if(subscriptionData.data) {
      const subscription = {
        businessID: subscriptionData.data.businessID,
        ownerID: subscriptionData.data.ownerID,
        subscriptionType: subscriptionData.data.subscriptionType,
        paymentDate: dayjs(subscriptionData.data.paymentDate).format('DD/MM/YYYY'),
        expiracyDate: dayjs(subscriptionData.data.expiracyDate).format('DD/MM/YYYY'),
        expiracyDay: subscriptionData.data.expiracyDay,
        expiracyMonth: subscriptionData.data.expiracyMonth
      }
      return subscription;
    }
    
  } catch (error) {
    const response_data = {
      businessID: "",
      ownerID: "",
      subscriptionType: "",
      paymentDate: '',
      expiracyDate: '',
    };
    return { response_data };
  }
}

const Settings: NextPage = async ({}) => {
  const services: IService[] = await getServicesData();
  const data: IBusiness = await getBusinessData();
  const subscription = await getSubscriptionData();

  return (
    <>
      {typeof data === "string" && (
        <div
          style={{ height: "calc(100vh - 64px)" }}
          className="flex flex-col items-center justify-center w-full gap-6 px-4 text-center min-w-40"
        >
          <MdOutlineWorkHistory color="#dd4924" size={100} />
          <span className="font-semibold sm:text-lg md:text-xl">
            No tenés una empresa creada.
          </span>
          <Link href="/admin/miempresa/create">
            <button className={styles.button}>Crear empresa</button>
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
          <div className="flex flex-col justify-center w-full mt-5 h-fit">
            <div className={`${styles.cont} mb-5`}>
              <FormSettings businessData={data} servicesData={services} subscriptionData={subscription} />
            </div>

            <div
              className={`mx-auto flex justify-start my-3 h-fit lg:my-4 ${styles.configArrows}`}
            >
              <Link
                className="flex items-center gap-2 text-xs font-semibold uppercase"
                style={{ color: "#dd4924" }}
                href="/admin/miempresa"
              >
                <FaArrowLeft />
                Datos de mi empresa
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Settings;
