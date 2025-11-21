import FormMiPerfil from "@/components/dashboard/profile/FormMiPerfil";
import axiosReq from "@/config/axios";
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
    const res = await axiosReq.get(`/subscription/payments/get/all/${userID?.value}`, {
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
           <header className="flex flex-col items-center justify-center w-full mt-5 mb-4 md:mt-5 md:mb-6 h-fit">
            <h4
              className="relative inline-block px-2 font-bold text-center uppercase"
              style={{ fontSize: 20 }}
            >
              mi perfil

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

      <div className="flex justify-center w-full mt-5 h-fit">
        <div className="mb-10 perfilPageCont md:mb-20">
          <FormMiPerfil businessData={business} subscriptionData={subscription} profileData={data} paymentsData={payments} />
        </div>
      </div>
    </>
  );
};

export default MiPerifl;
