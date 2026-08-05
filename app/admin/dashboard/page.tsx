import DashboardComponent from "@/components/dashboard/DashboardComponent";
import axiosReq from "@/config/axios";
import { IAppointment } from "@/interfaces/appointment.interface";
import { IBusiness } from "@/interfaces/business.interface";
import { IBranch } from "@/interfaces/branch.interface";
import { IEmployee } from "@/interfaces/employee.interface";
import { IService } from "@/interfaces/service.interface";
import { cookies } from "next/headers";
import { getTokenPayload } from "@/lib/getTokenPayload";

async function getBusinessData() {
  const cookieStore = cookies();
  const token = cookieStore.get("sacaturno_token");
  const ownerID = cookieStore.get("sacaturno_userID");
  const payload = getTokenPayload();
  const isEmployee = payload?.role === "employee";
  const contextBusinessID = payload?.businessID;

  try {
    const authHeader = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token?.value}`,
      },
    };

    const businessReq = isEmployee && contextBusinessID
      ? await axiosReq.get(`/business/getbyid/${contextBusinessID}`, authHeader)
      : await axiosReq.get(`/business/get/${ownerID?.value}`, authHeader);
    const business: IBusiness = businessReq.data;

    const [appointmentsRes, statsRes, employeesRes, branchesRes, servicesRes] =
      await Promise.all([
        axiosReq.get(`/appointment/get/today/${business._id}`, authHeader),
        axiosReq.get(`/appointment/stats/${business._id}`, authHeader),
        axiosReq
          .get(`/employee/list/${business._id}`, authHeader)
          .catch(() => null),
        axiosReq
          .get(`/branch/list/${business._id}`, authHeader)
          .catch(() => null),
        axiosReq
          .get(`/business/service/get/${business._id}`, authHeader)
          .catch(() => null),
      ]);

    const appList: IAppointment[] = appointmentsRes.data;
    const stats = statsRes.data ?? null;
    const employees: IEmployee[] = employeesRes?.data ?? [];
    const branches: IBranch[] = branchesRes?.data ?? [];
    const services: IService[] = servicesRes?.data ?? [];

    return { business, appointments: appList, stats, employees, branches, services };
  } catch (error: any) {
    return undefined;
  }
}

const getUser = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get("sacaturno_token");
  const userID = cookieStore.get("sacaturno_userID");
  const authHeader = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token?.value}`,
    },
  };
  try {
    const res = await axiosReq.get(`/user/get/${userID?.value}`, authHeader);
    const userData = res.data.response_data;

    const subscriptionReq = await axiosReq.get(
      `/subscription/get/ownerID/${userData._id}`,
      authHeader
    );
    const subscription = subscriptionReq.data;

    return { user: userData, subscription };
  } catch (error: any) {
    return { user: { name: "", surname: "", phone: "", email: "" }, subscription: undefined };
  }
};

const DashboardPage: React.FC = async () => {
  const payload = getTokenPayload();
  const isEmployee = payload?.role === "employee";
  const data = await getBusinessData();
  const { user, subscription } = await getUser();
  return (
    <>
      <div>
        <DashboardComponent
          businessData={data ? { ...data, subscription } : undefined}
          userData={user}
          isEmployee={isEmployee}
          currentEmployeeID={isEmployee ? payload?.employeeID ?? null : null}
        />
      </div>
    </>
  );
};

export default DashboardPage;
