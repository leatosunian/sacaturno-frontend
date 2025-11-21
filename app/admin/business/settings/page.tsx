import { Metadata, NextPage } from "next";
import styles from "@/app/css-modules/miempresa.module.css";
import axiosReq from "@/config/axios";
import { IBusiness } from "@/interfaces/business.interface";
import { cookies } from "next/headers";
import Link from "next/link";
import { IService } from "@/interfaces/service.interface";
import { MdOutlineWorkHistory } from "react-icons/md";
import { FaArrowLeft } from "react-icons/fa6";
import dayjs from "dayjs";
import FormSettings from "@/components/dashboard/services/FormSettings";

export const metadata: Metadata = {
  title: "Servicios y suscripciones | SacaTurno",
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

    if (subscriptionData.data) {
      const subscription = {
        businessID: subscriptionData.data.businessID,
        ownerID: subscriptionData.data.ownerID,
        subscriptionType: subscriptionData.data.subscriptionType,
        paymentDate: dayjs(subscriptionData.data.paymentDate).format(
          "DD/MM/YYYY"
        ),
        expiracyDate: dayjs(subscriptionData.data.expiracyDate).format(
          "DD/MM/YYYY"
        ),
        expiracyDay: subscriptionData.data.expiracyDay,
        expiracyMonth: subscriptionData.data.expiracyMonth,
      };
      return subscription;
    }
  } catch (error) {
    const response_data = {
      businessID: "",
      ownerID: "",
      subscriptionType: "",
      paymentDate: "",
      expiracyDate: "",
    };
    return { response_data };
  }
}

const Settings: NextPage = async ({ }) => {
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
          <Link href="/admin/business/create">
            <button className={styles.button}>Crear empresa</button>
          </Link>
        </div>
      )}
      {typeof data !== "string" && (
        <>
          <header className="flex flex-col items-center justify-center w-full mt-5 mb-4 md:mt-5 md:mb-6 h-fit">
            <h4
              className="relative inline-block px-2 font-bold text-center uppercase"
              style={{ fontSize: 20 }}
            >
              mi empresa

              {/* linea */}
              <span
                className="absolute left-0 right-0 mx-auto"
                style={{
                  bottom: -2,    // gap entre texto y linea (ajustalo)
                  height: 2,     // grosor de la linea (ajustalo)
                  background: "#dd4924",
                  width: "60%",  // ancho opcional de la linea
                }}
              />
            </h4>
          </header>
          <div className="flex flex-col justify-center w-full mt-5 h-fit">
            <div className={`${styles.cont} w-fit mb-5`}>
              <FormSettings
                businessData={data}
                servicesData={services}
                subscriptionData={subscription}
              />
            </div>

            <div
              className={`mx-auto flex justify-start my-3 h-fit lg:my-4 ${styles.configArrows}`}
            >
              <Link
                className="flex items-center gap-2 text-xs font-semibold uppercase"
                style={{ color: "#dd4924" }}
                href="/admin/business"
              >
                <FaArrowLeft />
                General
              </Link>
            </div>
            {/* SPACER */}
            <div className="w-full h-5 md:h-20 "></div>
          </div>
        </>
      )}
    </>
  );
};

export default Settings;
