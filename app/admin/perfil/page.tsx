import FormMiPerfil from "@/components/FormMiPerfil";
import axiosReq from "@/config/axios";
import { IBusiness } from "@/interfaces/business.interface";
import dayjs from "dayjs";
import { Metadata } from "next";
import { cookies } from "next/headers";
export const metadata: Metadata = {
  title: "Mi perfil | SacaTurno",
  description: "IT-related blog for devs",
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
  } catch (error: any) {
    const response_data = {
      name: "",
      surname: "",
      phone: "",
      email: "",
    };
    return { response_data };
  }
};

const getPaymentsData = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get("sacaturno_token");
  const userID = cookieStore.get("sacaturno_userID");
  try {
    const res = await axiosReq.get(`/subscription/payments/get/all/${'aslkjhbgsa98oiugas9'}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token?.value}`,
      },
    });    
    return res.data;
  } catch (error: any) {
    return [];
  }
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

const MiPerifl = async () => {
  const data = await getUser();
  const subscription = await getSubscriptionData();
  const business = await getBusinessData();
  const payments = await getPaymentsData();

  return (
    <>
      <header className="flex justify-center w-full mt-5 mb-5 md:mt-7 md:mb-7 h-fit">
        <h4 style={{ fontSize: "22px" }} className="font-bold uppercase ">
          Mi Perfil
        </h4>
      </header>

      <div className="flex justify-center w-full mt-5 h-fit">
        <div className="mb-10 perfilPageCont md:mb-20">
          <FormMiPerfil businessData={business} subscriptionData={subscription} profileData={data} paymentsData={payments} />
        </div>
      </div>
    </>
  );
};

export default MiPerifl;
