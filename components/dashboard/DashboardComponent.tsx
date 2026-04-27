"use client";
import { IBusiness } from "@/interfaces/business.interface";
import { IUser } from "@/interfaces/user.interface";
import {
  LuCalendarDays,
  LuCalendarCheck,
  LuTrendingUp,
  LuUsers,
} from "react-icons/lu";
import { MdOutlineWorkOutline } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import Link from "next/link";
import { IoMdMore } from "react-icons/io";
import { IAppointment } from "@/interfaces/appointment.interface";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/es-mx";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import advanced from "dayjs/plugin/advancedFormat";
import AppointmentModal from "./appointments/AppointmentModal";
import { TbCalendarCog } from "react-icons/tb";
import GuideDialog from "./GuideDialog";
import { IoInformationCircle } from "react-icons/io5";
import axiosReq from "@/config/axios";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Separator } from "../ui/separator";

interface IDashboardStats {
  todayRemaining: number;
  weekBooked: number;
  monthBooked: number;
  monthRevenue: number;
}

interface Props {
  businessData:
  | {
    business: IBusiness | undefined;
    appointments: IAppointment[] | undefined;
  }
  | undefined;
  userData: IUser | undefined;
}

interface eventType extends IAppointment {
  start: Date;
  end: Date;
  title: string | undefined;
  businessID?: string | undefined;
  clientID: string | "" | undefined;
  _id?: string | undefined;
  name: string | undefined;
  email: string | undefined;
  phone: number | undefined;
  service: string | undefined;
  status?: "booked" | "unbooked" | undefined;
  price: number | undefined;
}

const cardShadow = { boxShadow: "5px 5px 8px hsla(0, 0%, 12%, 0.17)" };

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);

const DashboardComponent: React.FC<Props> = ({ businessData, userData }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [appointmentsData, setAppointmentsData] = useState<eventType[]>();
  const [appointmentInfoModal, setAppointmentInfoModal] =
    useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = useState<eventType>();
  const [openGuideDialog, setOpenGuideDialog] = useState<boolean>(false);
  const [stats, setStats] = useState<IDashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);

  useEffect(() => {
    parseAppointments(businessData?.appointments);
  }, [businessData]);

  useEffect(() => {
    if (userData?.isFirstLogin) {
      setOpenGuideDialog(true);
    }
  }, [userData]);

  useEffect(() => {
    if (businessData?.business?._id) {
      fetchStats(businessData.business._id);
    } else if (businessData !== undefined) {
      setStatsLoading(false);
    }
  }, [businessData]);

  const fetchStats = async (businessID: string) => {
    try {
      const token = localStorage.getItem("sacaturno_token");
      const res = await axiosReq.get(`/appointment/stats/${businessID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSelectEvent = (event: eventType) => {
    setSelectedAppointment({
      _id: event._id,
      start: event.start,
      end: event.end,
      clientID: event.clientID,
      title: event.title,
      status: event.status,
      name: event.name,
      phone: event.phone,
      email: event.email,
      service: event.service,
      price: event.price,
      depositStatus: event.depositStatus,
    });
    setAppointmentInfoModal(true);
  };

  const parseAppointments = (appointments: IAppointment[] | undefined) => {
    dayjs.extend(timezone);
    dayjs.extend(utc);
    dayjs.extend(advanced);

    const list: eventType[] = [];
    appointments?.forEach((appt) => {
      if (appt.status === "booked") {
        list.push({
          ...appt,
          title: appt.title,
          clientID: appt.clientID,
          name: appt.name,
          email: appt.email,
          phone: appt.phone,
          service: appt.service,
          price: appt.price,
          start: dayjs(appt.start)
            .tz("America/Argentina/Buenos_Aires")
            .toDate(),
          end: dayjs(appt.end).tz("America/Argentina/Buenos_Aires").toDate(),
        });
      }
    });
    list.sort((a, b) => a.start.getTime() - b.start.getTime());
    setAppointmentsData(list);
    setLoading(false);
  };

  async function checkFirstLogin() {
    setOpenGuideDialog(false);
    try {
      if (userData?.isFirstLogin === false) return; // si ya no es el primer login
      const token = localStorage.getItem("sacaturno_token");
      await axiosReq.put(
        `/user/firstlogin/${userData?._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

    } catch (error) {
      console.error("Error updating first login status:", error);
    }
  }

  const subscriptionLabel =
    businessData?.business?.subscription === "SC_FULL"
      ? "Plan Premium"
      : "Plan Gratuito";
  const subscriptionClass =
    businessData?.business?.subscription === "SC_FULL"
      ? "bg-orange-600 text-white"
      : "bg-gray-100 text-gray-500";

  return (
    <>
      <Dialog
        open={appointmentInfoModal}
        onOpenChange={() => setAppointmentInfoModal(false)}
      >
        <DialogContent className="md:w-[700px] w-[93vw]">
          <AppointmentModal
            appointment={selectedAppointment}
            closeModalF={() => setAppointmentInfoModal(false)}
            onDelete={() => { }}
          />
        </DialogContent>
      </Dialog>

      <GuideDialog
        onClose={checkFirstLogin}
        openGuideDialog={openGuideDialog}
        isFirstLogin={userData?.isFirstLogin}
      />

      <div className="flex h-fit mx-auto w-full px-[25px] pt-[35px] md:w-4/5 md:pt-10 2xl:pt-14 md:px-0">
        <div className="flex flex-col w-full gap-8 h-fit">

          {/* HEADER */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1">
              <h4 className="text-2xl font-bold md:text-3xl">
                ¡Bienvenido, {userData?.name}!
              </h4>
              {businessData?.business && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm sm:text-lg font-medium text-gray-500">
                    {businessData.business.name}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${subscriptionClass}`}
                  >
                    {subscriptionLabel}
                  </span>
                </div>
              )}
            </div>
            <button
              className="flex items-center gap-1.5 text-blue-400 text-sm font-medium whitespace-nowrap mt-1"
              onClick={() => setOpenGuideDialog(true)}
            >
              <IoInformationCircle size={20} color="#60a5fa" />
              <span className="hidden sm:inline">¿Cómo uso la plataforma?</span>
            </button>
          </div>

          {/* STATS CARDS */}
          <div className="flex flex-col gap-3">
            <span className="text-lg font-semibold">Resumen</span>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">

              {/* Turnos restantes hoy */}
              <div style={cardShadow} className="flex flex-col gap-3 p-4 bg-white rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Hoy
                  </span>
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg"
                    style={{ backgroundColor: "#fff3ef" }}
                  >
                    <LuCalendarCheck size={15} color="#dd4924" />
                  </div>
                </div>
                {statsLoading ? (
                  <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
                ) : (
                  <span className="text-2xl font-bold">
                    {stats?.todayRemaining ?? 0} <span className="text-gray-400 text-sm font-normal">turnos</span>
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  pendientes hoy
                </span>
              </div>

              {/* Semana */}
              <div style={cardShadow} className="flex flex-col gap-3 p-4 bg-white rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Semana
                  </span>
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg"
                    style={{ backgroundColor: "#fff3ef" }}
                  >
                    <LuCalendarDays size={15} color="#dd4924" />
                  </div>
                </div>
                {statsLoading ? (
                  <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
                ) : (
                  <span className="text-2xl font-bold">
                    {stats?.weekBooked ?? 0} <span className="text-gray-400 text-sm font-normal">turnos</span>
                  </span>
                )}
                <span className="text-xs text-gray-500">reservados esta semana</span>
              </div>

              {/* Mes */}
              <div style={cardShadow} className="flex flex-col gap-3 p-4 bg-white rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Mes
                  </span>
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg"
                    style={{ backgroundColor: "#fff3ef" }}
                  >
                    <LuUsers size={15} color="#dd4924" />
                  </div>
                </div>
                {statsLoading ? (
                  <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
                ) : (
                  <span className="text-2xl font-bold">
                    {stats?.monthBooked ?? 0} <span className="text-gray-400 text-sm font-normal">turnos</span>
                  </span>
                )}
                <span className="text-xs text-gray-500">reservados este mes</span>
              </div>

              {/* Ingresos */}
              <div style={cardShadow} className="flex flex-col gap-3 p-4 bg-white rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Ingresos
                  </span>
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg"
                    style={{ backgroundColor: "#fff3ef" }}
                  >
                    <LuTrendingUp size={15} color="#dd4924" />
                  </div>
                </div>
                {statsLoading ? (
                  <div className="h-8 w-24 bg-gray-100 rounded animate-pulse" />
                ) : (
                  <span className="text-xl font-bold leading-tight">
                    {formatCurrency(stats?.monthRevenue ?? 0)}
                  </span>
                )}
                <span className="text-xs text-gray-500">durante mes de {dayjs().locale("es-mx").format("MMMM")}</span>
              </div>

            </div>
          </div>

          {/* QUICK ACCESS */}
          <div className="flex flex-col gap-3">
            <span className="text-lg font-semibold">Acceso rápido</span>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              <Link href="/admin/schedule">
                <div
                  style={{ backgroundColor: "#dd4924" }}
                  className="flex items-center justify-between p-4 rounded-xl h-14 md:h-20 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <span className="text-sm font-semibold text-white">
                    Mi agenda
                  </span>
                  <LuCalendarDays size={22} color="white" />
                </div>
              </Link>
              <Link href="/admin/schedule/settings">
                <div
                  style={{ backgroundColor: "#dd4924" }}
                  className="flex items-center justify-between p-4 rounded-xl h-14 md:h-20 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <span className="text-sm font-semibold text-white">
                    Configurar agenda
                  </span>
                  <TbCalendarCog size={22} color="white" />
                </div>
              </Link>
              <Link href="/admin/business">
                <div
                  style={{ backgroundColor: "#dd4924" }}
                  className="flex items-center justify-between p-4 rounded-xl h-14 md:h-20 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <span className="text-sm font-semibold text-white">
                    Mi empresa
                  </span>
                  <MdOutlineWorkOutline size={22} color="white" />
                </div>
              </Link>
              <Link href="/admin/business/settings">
                <div
                  style={{ backgroundColor: "#dd4924" }}
                  className="flex items-center justify-between p-4 rounded-xl h-14 md:h-20 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <span className="text-sm font-semibold text-white">
                    Mis servicios
                  </span>
                  <FaRegEdit size={20} color="white" />
                </div>
              </Link>
            </div>
          </div>

          <Separator className="mt-2" />

          {/* TODAY'S APPOINTMENTS */}
          <div className="flex flex-col gap-3">
            <span className="text-lg font-semibold">Turnos de hoy</span>

            <AnimatePresence>
              {loading && (
                <motion.div
                  key="dashboard-loader"
                  className="flex items-center justify-center py-12"
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <div className="loader" />
                </motion.div>
              )}
            </AnimatePresence>

            {!loading && appointmentsData && appointmentsData.length > 0 && (
              <div style={cardShadow} className="bg-white rounded-xl overflow-hidden">
                {appointmentsData.map((appointment, idx) => (
                  <div
                    key={appointment._id}
                    className={`flex items-center px-4 py-3 gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${idx !== appointmentsData.length - 1
                      ? "border-b border-gray-100"
                      : ""
                      }`}
                    onClick={() => handleSelectEvent(appointment)}
                  >
                    <div className="flex flex-col items-center min-w-[44px]">
                      <span
                        className="text-sm font-bold"
                        style={{ color: "#dd4924" }}
                      >
                        {dayjs(appointment.start).format("HH:mm")}
                      </span>
                      <span className="text-xs text-gray-400">hs</span>
                    </div>
                    <div
                      style={{
                        width: "1px",
                        height: "32px",
                        backgroundColor: "#e5e7eb",
                      }}
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-sm font-semibold truncate">
                        {appointment.name}
                      </span>
                      <span className="text-xs text-gray-500 truncate">
                        {appointment.service}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                      {appointment.price != null && appointment.price > 0 && (
                        <span className="text-xs font-semibold text-gray-600 hidden sm:block">
                          {formatCurrency(appointment.price)}
                        </span>
                      )}
                      {appointment.depositStatus === "paid" && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 hidden sm:block">
                          Seña abonada
                        </span>
                      )}
                      <IoMdMore size={20} color="#9ca3af" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading &&
              (!appointmentsData || appointmentsData.length === 0) && (
                <div className="flex flex-col items-center justify-center py-8 gap-4">
                  <span className="text-sm text-gray-500 text-center">
                    No tenés turnos reservados para el resto del día.
                  </span>
                  <Link href="/admin/schedule">
                    <button className="bg-orange-600 hover:bg-[#d92f04] text-white text-xs font-semibold px-7 py-2 rounded-lg transition-all duration-300 ease-in-out cursor-pointer">
                      Ver agenda
                    </button>
                  </Link>
                </div>
              )}
          </div>

        </div>
      </div>
    </>
  );
};

export default DashboardComponent;
