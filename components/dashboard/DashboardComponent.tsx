"use client";
import { IBusiness } from "@/interfaces/business.interface";
import { IUser } from "@/interfaces/user.interface";
import {
  LuCalendarDays,
  LuCalendarCheck,
  LuTrendingUp,
  LuUsers,
  LuMapPin,
  LuUser,
  LuCheck,
  LuClock,
  LuX,
  LuRefreshCw,
} from "react-icons/lu";
import { MdOutlineWorkOutline } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import Link from "next/link";
import { IoMdMore } from "react-icons/io";
import { IAppointment } from "@/interfaces/appointment.interface";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import "dayjs/locale/es-mx";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import advanced from "dayjs/plugin/advancedFormat";
import AppointmentModal from "./appointments/AppointmentModal";
import { TbCalendarCog } from "react-icons/tb";
import GuideDialog from "./GuideDialog";
import EmployeeGuideDialog from "./EmployeeGuideDialog";
import { usePermissions } from "@/components/dashboard/PermissionsProvider";
import { IoInformationCircle } from "react-icons/io5";
import axiosReq from "@/config/axios";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Separator } from "../ui/separator";
import { PLAN_LABELS, SubscriptionType } from "@/lib/planLimits";
import { IBranch } from "@/interfaces/branch.interface";
import { IEmployee } from "@/interfaces/employee.interface";
import { IService } from "@/interfaces/service.interface";

interface IDashboardStats {
  todayRemaining: number;
  weekBooked: number;
  monthBooked: number;
  monthRevenue: number;
}

const PLAN_BADGE_CLASSES: Record<SubscriptionType, string> = {
  SC_FREE: "bg-gray-100 text-gray-500",
  SC_BASIC: "bg-blue-100 text-blue-600",
  SC_PRO: "bg-purple-100 text-purple-600",
  SC_FULL: "bg-primary text-white",
  SC_EXPIRED: "bg-red-100 text-red-500",
};

interface Props {
  businessData:
    | {
        business: IBusiness | undefined;
        subscription: { subscriptionType: SubscriptionType } | undefined;
        appointments: IAppointment[] | undefined;
        stats: IDashboardStats | null;
        employees?: IEmployee[];
        branches?: IBranch[];
        services?: IService[];
      }
    | undefined;
  userData: IUser | undefined;
  isEmployee?: boolean;
  currentEmployeeID?: string | null;
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
  depositAmount?: number;
}

const cardShadow = { boxShadow: "5px 5px 8px hsla(0, 0%, 12%, 0.17)" };

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);

const DEPOSIT_BADGES = {
  paid: {
    label: "Seña abonada",
    className: "bg-green-50 text-green-700 border-green-200",
    Icon: LuCheck,
  },
  pending: {
    label: "Seña pendiente",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    Icon: LuClock,
  },
  failed: {
    label: "Seña rechazada",
    className: "bg-red-50 text-red-600 border-red-200",
    Icon: LuX,
  },
} as const;

const MetaChip = ({
  Icon,
  children,
  className = "bg-gray-100 text-gray-600 border-gray-200",
}: {
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
  className?: string;
}) => (
  <span
    className={`inline-flex items-center gap-1 max-w-[160px] px-1.5 py-0.5 text-[11px] font-medium leading-none border rounded-md ${className}`}
  >
    <Icon size={11} className="shrink-0" />
    <span className="truncate">{children}</span>
  </span>
);

const DashboardComponent: React.FC<Props> = ({
  businessData,
  userData,
  isEmployee,
  currentEmployeeID,
}) => {
  const { can } = usePermissions();
  const [loading, setLoading] = useState<boolean>(true);
  const [appointmentsData, setAppointmentsData] = useState<eventType[]>();
  const [appointmentInfoModal, setAppointmentInfoModal] =
    useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = useState<eventType>();
  const [openGuideDialog, setOpenGuideDialog] = useState<boolean>(false);
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [isRefreshing, startRefresh] = useTransition();
  const [newAppointmentIds, setNewAppointmentIds] = useState<Set<string>>(
    new Set(),
  );
  // IDs conocidos del render anterior: null en el primer render (nada es "nuevo")
  const knownIdsRef = useRef<Set<string> | null>(null);

  const stats = businessData?.stats ?? null;
  const employees = businessData?.employees ?? [];
  const branches = businessData?.branches ?? [];

  useEffect(() => {
    parseAppointments(businessData?.appointments);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessData, isEmployee, currentEmployeeID]);

  useEffect(() => {
    if (userData?.isFirstLogin) {
      setOpenGuideDialog(true);
    }
  }, [userData]);

  // El resaltado de "nuevo" es temporal: se apaga solo a los 6 segundos
  useEffect(() => {
    if (newAppointmentIds.size === 0) return;
    const timer = setTimeout(() => setNewAppointmentIds(new Set()), 6000);
    return () => clearTimeout(timer);
  }, [newAppointmentIds]);

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
      depositAmount: event.depositAmount,
      mpPaymentID: event.mpPaymentID,
      employeeID: event.employeeID,
      branchID: event.branchID,
    });
    setAppointmentInfoModal(true);
  };

  const parseAppointments = (appointments: IAppointment[] | undefined) => {
    dayjs.extend(timezone);
    dayjs.extend(utc);
    dayjs.extend(advanced);

    const list: eventType[] = [];
    appointments?.forEach((appt) => {
      if (appt.status !== "booked") return;
      // El empleado sólo ve los turnos asignados a sí mismo
      if (isEmployee && appt.employeeID !== currentEmployeeID) return;
      list.push({
        ...appt,
        title: appt.title,
        clientID: appt.clientID,
        name: appt.name,
        email: appt.email,
        phone: appt.phone,
        service: appt.service,
        price: appt.price,
        depositAmount: businessData?.services?.find(
          (s) => s.name === appt.service,
        )?.depositAmount,
        start: dayjs(appt.start).tz("America/Argentina/Buenos_Aires").toDate(),
        end: dayjs(appt.end).tz("America/Argentina/Buenos_Aires").toDate(),
      });
    });
    list.sort((a, b) => a.start.getTime() - b.start.getTime());

    const currentIds = new Set(
      list.map((a) => a._id).filter((id): id is string => !!id),
    );
    const knownIds = knownIdsRef.current;
    const freshIds = knownIds
      ? list
          .map((a) => a._id)
          .filter((id): id is string => !!id && !knownIds.has(id))
      : [];
    knownIdsRef.current = currentIds;
    setNewAppointmentIds(new Set(freshIds));

    setAppointmentsData(list);
    setLoading(false);
  };

  const handleRefresh = () => {
    if (isRefreshing) return;
    startRefresh(() => router.refresh());
  };

  // Nombre + inicial del apellido: el chip es una referencia rápida,
  // el nombre completo se ve al abrir el turno.
  const getEmployeeName = (employeeID: string | null | undefined) => {
    if (!employeeID) return null;
    const emp = employees.find((e) => e._id === employeeID);
    if (!emp) return null;
    const initial = emp.surname?.trim()?.[0];
    return initial ? `${emp.name} ${initial}.` : emp.name;
  };

  const getBranchName = (branchID: string | null | undefined) => {
    if (!branchID) return null;
    return branches.find((b) => b._id === branchID)?.name ?? null;
  };

  const todayCount = appointmentsData?.length ?? 0;
  const todayTotal =
    appointmentsData?.reduce((sum, a) => sum + (a.price ?? 0), 0) ?? 0;
  const pendingDeposits =
    appointmentsData?.filter((a) => a.depositStatus === "pending").length ?? 0;
  // El empleado sólo cuenta sus propios turnos; el dueño, los de todo el negocio
  const todayPending = isEmployee ? todayCount : stats?.todayRemaining ?? 0;

  async function checkFirstLogin() {
    setOpenGuideDialog(false);
    try {
      if (userData?.isFirstLogin === false) return; // si ya no es el primer login
      const token = localStorage.getItem("sacaturno_token");
      await axiosReq.put(
        `/user/firstlogin/${userData?._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (error) {
      console.error("Error updating first login status:", error);
    }
  }

  const subscriptionType = businessData?.subscription?.subscriptionType ?? "SC_FREE";
  const subscriptionLabel = PLAN_LABELS[subscriptionType];
  const subscriptionClass = PLAN_BADGE_CLASSES[subscriptionType];

  return (
    <>
      <Dialog
        open={appointmentInfoModal}
        onOpenChange={() => setAppointmentInfoModal(false)}
      >
        <DialogContent className="w-[93vw] md:w-[560px] lg:w-[800px] p-0 overflow-hidden">
          <AppointmentModal
            appointment={selectedAppointment}
            closeModalF={() => setAppointmentInfoModal(false)}
            onDelete={() => {}}
            employees={employees}
            branches={branches}
          />
        </DialogContent>
      </Dialog>

      {isEmployee ? (
        <EmployeeGuideDialog open={openGuideDialog} onClose={checkFirstLogin} />
      ) : (
        <GuideDialog
          onClose={checkFirstLogin}
          openGuideDialog={openGuideDialog}
          isFirstLogin={userData?.isFirstLogin}
        />
      )}

      <div className="w-full pt-4 2xl:pt-3 pb-12 md:pb-16 mt-2 flex flex-col gap-6 px-4 sm:px-6 md:px-8 max-w-screen-2xl mx-auto">
        <div className="flex flex-col w-full gap-8 h-fit">
          {/* HEADER */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1">
              <h4 className="text-2xl font-bold md:text-3xl">
                {(() => {
                  const h = new Date().getHours();
                  if (h >= 6 && h < 13) return "¡Buenos días";
                  if (h >= 13 && h < 20) return "¡Buenas tardes";
                  return "¡Buenas noches";
                })()}
                , {userData?.name}!
              </h4>
              {businessData?.business && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm sm:text-lg font-medium text-gray-500">
                    {isEmployee
                      ? `Empleado de ${businessData.business.name}`
                      : businessData.business.name}
                  </span>
                  {!isEmployee && (
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${subscriptionClass}`}
                    >
                      {subscriptionLabel}
                    </span>
                  )}
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
              <div
                style={cardShadow}
                className="flex flex-col gap-3 p-4 bg-white rounded-xl"
              >
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
                {loading ? (
                  <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
                ) : (
                  <span className="text-2xl font-bold">
                    {todayPending}{" "}
                    <span className="text-gray-400 text-sm font-normal">
                      {todayPending === 1 ? "turno" : "turnos"}
                    </span>
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  {todayPending === 1 ? "pendiente hoy" : "pendientes hoy"}
                </span>
              </div>

              {/* Semana */}
              <div
                style={cardShadow}
                className="flex flex-col gap-3 p-4 bg-white rounded-xl"
              >
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
                {false ? (
                  <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
                ) : (
                  <span className="text-2xl font-bold">
                    {stats?.weekBooked ?? 0}{" "}
                    <span className="text-gray-400 text-sm font-normal">
                      turnos
                    </span>
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  reservados esta semana
                </span>
              </div>

              {/* Mes */}
              <div
                style={cardShadow}
                className="flex flex-col gap-3 p-4 bg-white rounded-xl"
              >
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
                {false ? (
                  <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
                ) : (
                  <span className="text-2xl font-bold">
                    {stats?.monthBooked ?? 0}{" "}
                    <span className="text-gray-400 text-sm font-normal">
                      turnos
                    </span>
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  reservados este mes
                </span>
              </div>

              {/* Ingresos → link to analytics (solo si tiene permiso) */}
              {!isEmployee || can("view_stats") ? (
                <Link href="/admin/analytics">
                  <div
                    style={cardShadow}
                    className="flex flex-col gap-3 p-4 bg-white rounded-xl hover:shadow-md transition-shadow duration-200 cursor-pointer"
                  >
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
                    {false ? (
                      <div className="h-8 w-24 bg-gray-100 rounded animate-pulse" />
                    ) : (
                      <span className="text-xl font-bold leading-tight">
                        {formatCurrency(stats?.monthRevenue ?? 0)}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      durante mes de {dayjs().locale("es-mx").format("MMMM")}
                    </span>
                    <span className="text-xs text-primary font-medium -mt-1">
                      Ver estadísticas →
                    </span>
                  </div>
                </Link>
              ) : (
                <div
                  style={cardShadow}
                  className="flex flex-col gap-3 p-4 bg-white rounded-xl"
                >
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
                  <span className="text-xl font-bold leading-tight">
                    {formatCurrency(stats?.monthRevenue ?? 0)}
                  </span>
                  <span className="text-xs text-gray-500">
                    durante mes de {dayjs().locale("es-mx").format("MMMM")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* QUICK ACCESS */}
          <div className="flex flex-col gap-3">
            <span className="text-lg font-semibold">Acceso rápido</span>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
              <Link href="/admin/schedule">
                <div
                  style={{ backgroundColor: "#dd4924" }}
                  className="flex items-center justify-between p-4 rounded-xl h-14 md:h-20 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <span className="text-sm font-semibold text-white">
                    Turnos
                  </span>
                  <LuCalendarDays size={22} color="white" />
                </div>
              </Link>
              {(!isEmployee || can("manage_schedule")) && (
                <Link href="/admin/schedule/automate">
                  <div
                    style={{ backgroundColor: "#dd4924" }}
                    className="flex items-center justify-between p-4 rounded-xl h-14 md:h-20 cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <span className="text-sm font-semibold text-white">
                      Automatizar agenda
                    </span>
                    <TbCalendarCog size={22} color="white" />
                  </div>
                </Link>
              )}
              {!isEmployee && (
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
              )}
              {(!isEmployee || can("manage_services")) && (
                <Link href="/admin/services">
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
              )}
              {(!isEmployee || can("view_stats")) && (
                <Link href="/admin/analytics" className="hidden md:block">
                  <div
                    style={{ backgroundColor: "#dd4924" }}
                    className="flex items-center justify-between p-4 rounded-xl h-14 md:h-20 cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <span className="text-sm font-semibold text-white">
                      Estadísticas
                    </span>
                    <LuTrendingUp size={22} color="white" />
                  </div>
                </Link>
              )}
            </div>
          </div>

          <Separator className="mt-2" />

          {/* TODAY'S APPOINTMENTS */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-baseline gap-2 min-w-0">
                <span className="text-lg font-semibold">Turnos de hoy</span>
                {!loading && todayCount > 0 && (
                  <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">
                    {todayCount} {todayCount === 1 ? "turno" : "turnos"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!loading && (
                  <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    aria-label="Actualizar turnos"
                    title="Actualizar turnos"
                    className="flex items-center justify-center gap-1.5 h-8 min-w-8 px-2.5 text-gray-500 border border-gray-200 rounded-md transition-all duration-200 ease-in-out hover:text-primary hover:border-orange-300 hover:bg-orange-50 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <LuRefreshCw
                      size={13}
                      className={isRefreshing ? "animate-spin" : ""}
                    />
                    <span className="hidden text-xs font-medium sm:inline">
                      {isRefreshing ? "Actualizando…" : "Actualizar"}
                    </span>
                  </button>
                )}
                {!loading && todayCount > 0 && (
                  <Link
                    href="/admin/schedule"
                    className="text-xs font-medium text-primary hover:underline whitespace-nowrap"
                  >
                    Ver agenda →
                  </Link>
                )}
              </div>
            </div>

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

            <div className="relative" aria-busy={isRefreshing}>
              <AnimatePresence>
                {isRefreshing && !loading && (
                  <motion.div
                    key="refresh-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-xl bg-white/75"
                  >
                    <div className="loaderSmall" />
                    <span className="text-xs font-medium text-gray-500">
                      Actualizando turnos…
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {!loading && appointmentsData && appointmentsData.length > 0 && (
              <div
                style={cardShadow}
                className="bg-white rounded-xl overflow-hidden"
              >
                {/* Resumen del día */}
                <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    {isEmployee ? "Tu jornada" : "Resumen del día"}
                  </span>
                  <div className="flex items-center gap-3">
                    {pendingDeposits > 0 && (
                      <span className="text-[11px] font-medium text-amber-600">
                        {pendingDeposits}{" "}
                        {pendingDeposits === 1
                          ? "seña pendiente"
                          : "señas pendientes"}
                      </span>
                    )}
                    <span className="text-xs font-bold text-gray-700 tabular-nums">
                      {formatCurrency(todayTotal)}
                    </span>
                  </div>
                </div>

                {appointmentsData.map((appointment, idx) => {
                  const branchName = getBranchName(appointment.branchID);
                  const employeeName = isEmployee
                    ? null
                    : getEmployeeName(appointment.employeeID);
                  const deposit =
                    appointment.depositStatus &&
                    appointment.depositStatus !== "none"
                      ? DEPOSIT_BADGES[appointment.depositStatus]
                      : null;
                  const isNext = idx === 0;
                  const isNew = !!(
                    appointment._id && newAppointmentIds.has(appointment._id)
                  );
                  const hasMeta = !!(branchName || employeeName || deposit);

                  return (
                    <motion.div
                      key={appointment._id}
                      initial={
                        isNew && !reduceMotion
                          ? { opacity: 0, y: -14, scaleY: 0.9 }
                          : false
                      }
                      animate={{ opacity: 1, y: 0, scaleY: 1 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      role="button"
                      tabIndex={0}
                      className={`flex items-start gap-3 px-4 py-3 border-l-[3px] cursor-pointer transition-colors duration-200 hover:bg-gray-50 focus:outline-none focus-visible:bg-gray-50 ${
                        isNew
                          ? "border-l-primary bg-orange-50"
                          : isNext
                            ? "border-l-primary bg-orange-50/40"
                            : "border-l-transparent"
                      } ${
                        idx !== appointmentsData.length - 1
                          ? "border-b border-b-gray-100"
                          : ""
                      }`}
                      onClick={() => handleSelectEvent(appointment)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSelectEvent(appointment);
                        }
                      }}
                    >
                      {/* Horario */}
                      <div className="flex flex-col items-center w-[42px] sm:w-[46px] shrink-0 pt-0.5">
                        <span
                          className={`text-sm font-bold tabular-nums leading-none ${
                            isNext ? "text-primary" : "text-gray-700"
                          }`}
                        >
                          {dayjs(appointment.start).format("HH:mm")}
                        </span>
                        <span className="mt-1 text-[11px] leading-none text-gray-400 tabular-nums">
                          {dayjs(appointment.end).format("HH:mm")}
                        </span>
                      </div>

                      <div className="hidden sm:block w-px self-stretch bg-gray-200 shrink-0" />

                      {/* Cliente + metadatos */}
                      <div className="flex flex-col flex-1 min-w-0 gap-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm font-semibold text-gray-800 truncate">
                            {appointment.name}
                          </span>
                          {isNew ? (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide leading-none text-white rounded bg-primary shrink-0">
                              Nuevo
                            </span>
                          ) : (
                            isNext && (
                              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide leading-none rounded text-primary bg-orange-100 shrink-0">
                                Próximo
                              </span>
                            )
                          )}
                          {appointment.price != null && appointment.price > 0 && (
                            <span className="ml-auto text-xs font-semibold text-gray-700 tabular-nums shrink-0">
                              {formatCurrency(appointment.price)}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 truncate">
                          {appointment.service}
                        </span>
                        {hasMeta && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            {branchName && (
                              <MetaChip Icon={LuMapPin}>{branchName}</MetaChip>
                            )}
                            {employeeName && (
                              <MetaChip Icon={LuUser}>{employeeName}</MetaChip>
                            )}
                            {deposit && (
                              <MetaChip
                                Icon={deposit.Icon}
                                className={deposit.className}
                              >
                                {deposit.label}
                              </MetaChip>
                            )}
                          </div>
                        )}
                      </div>

                      <IoMdMore
                        size={20}
                        color="#9ca3af"
                        className="shrink-0 mt-0.5"
                      />
                    </motion.div>
                  );
                })}
              </div>
              )}

            {!loading &&
              (!appointmentsData || appointmentsData.length === 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  style={cardShadow}
                  className="flex flex-col items-center justify-center gap-4 px-6 py-10 md:py-16 text-center bg-white rounded-xl"
                >
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-orange-50 border border-orange-100">
                    <LuCalendarCheck size={28} className="text-primary" />
                  </div>
                  <div className="flex flex-col items-center gap-1.5 max-w-md">
                    <h5 className="text-base font-bold text-gray-800">
                      Estás al día
                    </h5>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {isEmployee
                        ? "No tenés más turnos asignados para hoy. Revisá tu agenda para ver los próximos días."
                        : "No tenés más turnos reservados para hoy. Revisá tu agenda o generá nuevos turnos disponibles para tus clientes."}
                    </p>
                  </div>
                  <div className="flex flex-col w-full gap-2.5 mt-1 sm:flex-row sm:w-auto">
                    <Link href="/admin/schedule" className="w-full sm:w-auto">
                      <button className="flex items-center justify-center w-full gap-2 px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-200 rounded-lg shadow-sm bg-primary hover:bg-orange-500">
                        <LuCalendarDays size={16} />
                        Ver agenda
                      </button>
                    </Link>
                    {(!isEmployee || can("manage_schedule")) && (
                      <Link
                        href="/admin/schedule/automate"
                        className="w-full sm:w-auto"
                      >
                        <button className="flex items-center justify-center w-full gap-2 px-6 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-200 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 hover:text-primary">
                          <TbCalendarCog size={16} />
                          Automatizar agenda
                        </button>
                      </Link>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardComponent;
