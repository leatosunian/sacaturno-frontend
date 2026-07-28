import axiosReq from "@/config/axios";
import CalendarTurnos from "@/components/dashboard/appointments/CalendarTurnos";
import { cookies } from "next/headers";
import { IBusiness } from "@/interfaces/business.interface";
import { IService } from "@/interfaces/service.interface";
import { IEmployee } from "@/interfaces/employee.interface";
import { IBranch } from "@/interfaces/branch.interface";
import dayjs from "dayjs";
import ISubscription from "@/interfaces/subscription.interface";
import NoBusinessEmptyState from "@/components/dashboard/NoBusinessEmptyState";
import { Metadata } from "next";
import { getTokenPayload } from "@/lib/getTokenPayload";

export const metadata: Metadata = {
  title: "Mi agenda | SacaTurno",
  description: "IT-related blog for devs",
};

const getAppointments = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get("sacaturno_token");
  const ownerID = cookieStore.get("sacaturno_userID");
  const payload = getTokenPayload();
  const isEmployee = payload?.role === "employee";
  const contextBusinessID = payload?.businessID;
  const contextEmployeeID = payload?.employeeID;
  const authHeader = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token?.value}`,
      "Cache-Control": "no-store",
      cache: "no-store"
    },
  };

  const businessFetch = isEmployee && contextBusinessID
    ? await axiosReq.get(`/business/getbyid/${contextBusinessID}`, authHeader)
    : await axiosReq.get(`/business/get/${ownerID?.value}`, authHeader);
  const businessData: IBusiness = businessFetch.data;

  const appointmentsFetch = await axiosReq.get(
    `/appointment/get/${businessData._id}`,
    authHeader
  );

  const servicesFetch = await axiosReq.get(
    `/business/service/get/${businessData._id}`,
    authHeader
  );
  const services: IService[] = servicesFetch.data;

  const daysAndAppointmentsFetch = await axiosReq.get(
    `/schedule/get/${businessData._id}`,
    authHeader
  );
  const scheduleDays = daysAndAppointmentsFetch.data.days;

  let employees: IEmployee[] = [];
  try {
    const employeesFetch = await axiosReq.get(
      `/employee/list/${businessData._id}`,
      authHeader
    );
    employees = employeesFetch.data ?? [];
  } catch {}

  let branches: IBranch[] = [];
  try {
    const branchesFetch = await axiosReq.get(
      `/branch/list/${businessData._id}`,
      authHeader
    );
    branches = branchesFetch.data ?? [];
  } catch {}

  return {
    appointments: appointmentsFetch.data,
    businessData,
    services,
    scheduleDays,
    employees,
    branches,
    currentEmployeeID: isEmployee ? (contextEmployeeID ?? null) : null,
    employeePermissions: isEmployee ? (payload?.permissions ?? []) : [],
  };
};

async function getSubscriptionData(ownerID: string) {
  const cookieStore = cookies();
  const token = cookieStore.get("sacaturno_token");
  const authHeader = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token?.value}`,
    },
  };
  const subscriptionData = await axiosReq.get(
    `/subscription/get/ownerID/${ownerID}`,
    authHeader
  );

  if (subscriptionData.data) {
    const subscription: ISubscription = {
      businessID: subscriptionData.data.businessID,
      ownerID: subscriptionData.data.ownerID,
      subscriptionType: subscriptionData.data.subscriptionType,
      paymentDate: dayjs(subscriptionData.data.paymentDate).format(
        "DD/MM/YYYY"
      ),
      expiracyDate: dayjs(subscriptionData.data.expiracyDate).format(
        "DD/MM/YYYY"
      ),
    };
    return subscription;
  }
}

const MisTurnos: React.FC = async () => {
  const data = await getAppointments();
  const subscription: ISubscription | undefined = await getSubscriptionData(data.businessData.ownerID);

  return (
    <>
      <div className="w-full px-4 sm:px-6 md:px-8 max-w-screen-2xl mx-auto">
        {data.businessData.name && (
          <CalendarTurnos
            appointments={data.appointments}
            businessData={data.businessData}
            servicesData={data.services}
            subscriptionData={subscription}
            scheduleDays={data.scheduleDays}
            employees={data.employees}
            branches={data.branches}
            currentEmployeeID={data.currentEmployeeID}
            employeePermissions={data.employeePermissions}
          />
        )}
        {!data.businessData.name && <NoBusinessEmptyState />}
      </div>
    </>
  );
};

export default MisTurnos;
