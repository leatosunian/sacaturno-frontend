import styles from "@/app/css-modules/Dashboard.module.css";
import DashboardComponent from "@/components/DashboardComponent";
import axiosReq from "@/config/axios";
import { IAppointment } from "@/interfaces/appointment.interface";
import { IBusiness } from "@/interfaces/business.interface";
import { cookies } from "next/headers";

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

    const businessReq = await axiosReq.get(
      `/business/get/${ownerID?.value}`,
      authHeader
    );
    const business:IBusiness = businessReq.data
    const appointments = await axiosReq.get(`/appointment/get/today/${business._id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token?.value}`,
      },
    });
    const appList:IAppointment[] = appointments.data
    console.log(appList);
    
    return { business: business, appointments: appList };
  } catch (error: any) {
    return undefined
  }
}

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
    return res.data.response_data;
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

const Dashboard: React.FC = async () => {
  const data = await getBusinessData();
  const user = await getUser();
  return (
    <>
      <div>
        <DashboardComponent businessData={data} userData={user} />
      </div>
    </>
  );
};

export default Dashboard;
