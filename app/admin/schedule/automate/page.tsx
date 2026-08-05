import axiosReq from "@/config/axios";
import { cookies } from "next/headers";
import { IBusiness } from "@/interfaces/business.interface";
import { IService } from "@/interfaces/service.interface";
import { IEmployee } from "@/interfaces/employee.interface";
import { IBranch } from "@/interfaces/branch.interface";
import dayjs from "dayjs";
import ISubscription from "@/interfaces/subscription.interface";
import { Metadata } from "next";
import { IDaySchedule } from "@/interfaces/daySchedule.interface";
import { IAppointmentSchedule } from "@/interfaces/appointmentSchedule.interface";
import AutomateSchedule from "@/components/dashboard/appointments/AutomateSchedule";
import NoBusinessEmptyState from "@/components/dashboard/NoBusinessEmptyState";

export const metadata: Metadata = {
  title: "Mis turnos | SacaTurno",
  description: "IT-related blog for devs",
};

// Los datos de agenda cambian con cada guardado y con el cron de automatización:
// nunca deben servirse desde una render cacheada.
export const dynamic = "force-dynamic";

const getAppointments = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get("sacaturno_token");
  const ownerID = cookieStore.get("sacaturno_userID");
  const authHeader = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token?.value}`,
      "Cache-Control": "no-store",
    },
  };

  const businessFetch = await axiosReq.get(
    `/business/get/${ownerID?.value}`,
    authHeader,
  );
  const businessData: IBusiness = businessFetch.data;

  const servicesFetch = await axiosReq.get(
    `/business/service/get/${businessData._id}`,
    authHeader,
  );
  const services: IService[] = servicesFetch.data;

  const daysAndAppointmentsFetch = await axiosReq.get(
    `/schedule/get/${businessData._id}`,
    authHeader,
  );
  const daysAndAppointments: {
    days: IDaySchedule[];
    appointments: IAppointmentSchedule[];
  } = {
    days: [],
    appointments: [],
  };
  daysAndAppointments.days = daysAndAppointmentsFetch.data.days;
  daysAndAppointments.appointments = daysAndAppointmentsFetch.data.appointments;

  let employees: IEmployee[] = [];
  try {
    const employeesFetch = await axiosReq.get(
      `/employee/list/${businessData._id}`,
      authHeader,
    );
    employees = employeesFetch.data ?? [];
  } catch {}

  let branches: IBranch[] = [];
  try {
    const branchesFetch = await axiosReq.get(
      `/branch/list/${businessData._id}`,
      authHeader,
    );
    branches = branchesFetch.data ?? [];
  } catch {}

  return { businessData, services, daysAndAppointments, employees, branches };
};

async function getSubscriptionData() {
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
    authHeader,
  );

  if (subscriptionData.data) {
    const subscription: ISubscription = {
      businessID: subscriptionData.data.businessID,
      ownerID: subscriptionData.data.ownerID,
      subscriptionType: subscriptionData.data.subscriptionType,
      paymentDate: dayjs(subscriptionData.data.paymentDate).format(
        "DD/MM/YYYY",
      ),
      expiracyDate: dayjs(subscriptionData.data.expiracyDate).format(
        "DD/MM/YYYY",
      ),
    };
    return subscription;
  }
}

const AutomateSchedulePage: React.FC = async () => {
  const data = await getAppointments();
  const subscription: ISubscription | undefined = await getSubscriptionData();

  return (
    <>
      <div className="w-full px-4 sm:px-6 md:px-8 max-w-screen-2xl mx-auto">
        {data.businessData.name && (
          <AutomateSchedule
            businessData={data.businessData}
            servicesData={data.services}
            subscriptionData={subscription}
            daysAndAppointments={data.daysAndAppointments}
            employees={data.employees}
            branches={data.branches}
          />
        )}
        {!data.businessData.name && <NoBusinessEmptyState />}
      </div>
    </>
  );
};

export default AutomateSchedulePage;
