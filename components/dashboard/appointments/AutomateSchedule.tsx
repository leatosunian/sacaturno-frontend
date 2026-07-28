"use client";
import dayjs from "dayjs";
import "dayjs/locale/es-mx";
import { useEffect, useMemo, useRef, useState } from "react";
import { IBusiness } from "@/interfaces/business.interface";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import advanced from "dayjs/plugin/advancedFormat";
import { useRouter } from "next/navigation";
import { IService } from "@/interfaces/service.interface";
import NoServicesModal from "../services/NoServicesModal";
import ISubscription from "@/interfaces/subscription.interface";
import ExpiredPlanModal from "./ExpiredPlanModal";
import { LuSave, LuUser, LuMapPin, LuZap, LuCalendarDays, LuTimer, LuCalendarCog, LuActivity } from "react-icons/lu";
import TutorialAutomateModal from "./TutorialAutomateModal";
import { FaArrowLeft, FaCircleInfo } from "react-icons/fa6";
import { LuBookOpen } from "react-icons/lu";
import CreateScheduleAppointmentModal from "./CreateScheduleAppointmentModal";
import ScheduleAppointmentModal from "./ScheduleAppointmentModal";
import axiosReq from "@/config/axios";
import AlertInterface from "@/interfaces/alert.interface";
import Alert from "@/components/Alert";
import Link from "next/link";
import { IDaySchedule } from "@/interfaces/daySchedule.interface";
import { IAppointmentSchedule } from "@/interfaces/appointmentSchedule.interface";
import { IEmployee } from "@/interfaces/employee.interface";
import { IBranch } from "@/interfaces/branch.interface";
import TimeRangeControls from "./TimeRangeControls";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

dayjs.locale("es-mx");
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advanced);

const HOUR_HEIGHT = 78;
const TIME_GUTTER = 60;
const CARD_GUTTER = 4;
const CARD_GAP = 5;

const cardShadow = { boxShadow: "5px 5px 8px hsla(0, 0%, 12%, 0.17)" };

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);

function computeClusters(events: IAppointmentSchedule[]): IAppointmentSchedule[][] {
  const sorted = [...events].sort((a, b) => dayjs(a.start).diff(dayjs(b.start)));
  const visited = new Set<string>();
  const clusters: IAppointmentSchedule[][] = [];

  for (const event of sorted) {
    const key = event._id ?? String(dayjs(event.start).valueOf());
    if (visited.has(key)) continue;

    const cluster: IAppointmentSchedule[] = [];
    const queue: IAppointmentSchedule[] = [event];

    while (queue.length > 0) {
      const curr = queue.shift()!;
      const currKey = curr._id ?? String(dayjs(curr.start).valueOf());
      if (visited.has(currKey)) continue;
      visited.add(currKey);
      cluster.push(curr);

      for (const other of sorted) {
        const otherKey = other._id ?? String(dayjs(other.start).valueOf());
        if (
          !visited.has(otherKey) &&
          dayjs(curr.start).valueOf() < dayjs(other.end).valueOf() &&
          dayjs(other.start).valueOf() < dayjs(curr.end).valueOf()
        ) {
          queue.push(other);
        }
      }
    }

    clusters.push(cluster);
  }

  return clusters;
}

interface TimeSlot {
  index: number;
  hour: number;
  minute: number;
  label: string;
  isHourBoundary: boolean;
}

const daysOfWeek = [
  { dayName: "LUN", dayNumber: 1 },
  { dayName: "MAR", dayNumber: 2 },
  { dayName: "MIE", dayNumber: 3 },
  { dayName: "JUE", dayNumber: 4 },
  { dayName: "VIE", dayNumber: 5 },
  { dayName: "SAB", dayNumber: 6 },
  { dayName: "DOM", dayNumber: 0 },
];

const parseAppointments = (
  appointments: IAppointmentSchedule[] | undefined
): IAppointmentSchedule[] => {
  if (!appointments || !appointments[0]) return [];
  const todayDate = dayjs().format("YYYY-MM-DD");
  return appointments.map(({ start, end, ...rest }) => {
    const startTime = dayjs(start).format("HH:mm");
    const endTime = dayjs(end).format("HH:mm");
    return {
      ...rest,
      start: dayjs(`${todayDate} ${startTime}`)
        .tz("America/Argentina/Buenos_Aires")
        .toDate(),
      end: dayjs(`${todayDate} ${endTime}`)
        .tz("America/Argentina/Buenos_Aires")
        .toDate(),
      title: rest.service,
    };
  });
};

interface Props {
  businessData: IBusiness;
  servicesData: IService[];
  daysAndAppointments: {
    days: IDaySchedule[];
    appointments: IAppointmentSchedule[];
  };
  subscriptionData: ISubscription | undefined;
  employees?: IEmployee[];
  branches?: IBranch[];
}

const AutomateSchedule: React.FC<Props> = ({
  businessData,
  servicesData,
  subscriptionData,
  daysAndAppointments,
  employees,
  branches,
}) => {
  const { isMobile, open: sidebarOpen } = useSidebar();
  const [alert, setAlert] = useState<AlertInterface>();
  const [business, setBusiness] = useState<IBusiness>();
  const [services, setServices] = useState<IService[]>();
  const [eventModal, setEventModal] = useState(false);
  const [eventData, setEventData] = useState<IAppointmentSchedule | undefined>();
  const [createAppointmentModal, setCreateAppointmentModal] = useState(false);
  const [createAppointmentData, setCreateAppointmentData] = useState<IAppointmentSchedule>();
  const [tutorialModal, setTutorialModal] = useState(false);
  const [expiredModal, setExpiredModal] = useState(false);
  const [loadingNewAppointments, setLoadingNewAppointments] = useState(true);
  const [selectedDay, setSelectedDay] = useState<{ dayName: string; dayNumber: number }>({
    dayName: "LUN",
    dayNumber: 1,
  });
  const [selectedDayStart, setSelectedDayStart] = useState<number>(0);
  const [selectedDayEnd, setSelectedDayEnd] = useState<number>(0);
  const [selectedAnticipation, setSelectedAnticipation] = useState<number>(0);
  const [selectedDaysToCreate, setSelectedDaysToCreate] = useState<number>(0);
  const [selectedAutomaticSchedule, setSelectedAutomaticSchedule] = useState<boolean>(false);
  const [daysSchedule, setDaysSchedule] = useState<IDaySchedule[]>([]);
  const [appointmentsSchedule, setAppointmentsSchedule] = useState<IAppointmentSchedule[]>();
  const [selectedAppointmentDuration, setSelectedAppointmentDuration] = useState<number>(30);
  const [daysChanged, setDaysChanged] = useState<IDaySchedule[]>([]);
  const [selectedDayAppointments, setSelectedDayAppointments] = useState<
    IAppointmentSchedule[] | undefined
  >();
  const [selectedDayID, setSelectedDayID] = useState<string>("");
  const [loadingButton, setLoadingButton] = useState(false);
  const [leaveModal, setLeaveModal] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pendingNavRef = useRef<(() => void) | null>(null);
  const bypassGuardRef = useRef(false);
  const originalDaysRef = useRef<
    Record<string, { dayStart: number; dayEnd: number; appointmentDuration: number }> | null
  >(null);

  const hideAlert = () => {
    setTimeout(() => {
      setAlert({ error: false, alertType: "ERROR_ALERT", msg: "" });
    }, 3300);
  };

  const handleSelectDay = ({
    dayName,
    dayNumber,
  }: {
    dayName: string;
    dayNumber: number;
  }) => {
    setSelectedDay({ dayName, dayNumber });
  };

  const onSelectDay = ({ dayName }: { dayName: string }) => {
    const dayObj = daysSchedule?.find((d) => d.day === dayName);
    if (dayObj) {
      setSelectedAppointmentDuration(dayObj.appointmentDuration);
      setSelectedDayEnd(dayObj.dayEnd);
      setSelectedDayStart(dayObj.dayStart);
      setSelectedDayID(dayObj._id!);
    }
    const dayAppointments = appointmentsSchedule?.filter((a) => a.day === dayName);
    setSelectedDayAppointments(dayAppointments);
  };

  useEffect(() => {
    onSelectDay(selectedDay);
  }, [selectedDay]);

  useEffect(() => {
    onSelectDay(selectedDay);
  }, [selectedDayStart, selectedDayEnd]);

  useEffect(() => {
    if (!originalDaysRef.current) {
      originalDaysRef.current = Object.fromEntries(
        daysAndAppointments.days.map((d) => [
          d.day,
          { dayStart: d.dayStart, dayEnd: d.dayEnd, appointmentDuration: d.appointmentDuration },
        ])
      );
    }
    setDaysSchedule(daysAndAppointments.days);
    setAppointmentsSchedule(daysAndAppointments.appointments);
    setSelectedAppointmentDuration(daysAndAppointments.days[0].appointmentDuration);
    setSelectedDayEnd(daysAndAppointments.days[0].dayEnd);
    setSelectedDayStart(daysAndAppointments.days[0].dayStart);
    setBusiness(businessData);
    setServices(servicesData);
    setSelectedAnticipation(businessData.scheduleAnticipation);
    setSelectedDaysToCreate(businessData.scheduleDaysToCreate);
    setSelectedAutomaticSchedule(businessData.automaticSchedule);
  }, [businessData, services, servicesData, subscriptionData, daysAndAppointments]);

  useEffect(() => {
    if (servicesData.length === 0) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [servicesData.length]);

  useEffect(() => {
    setLoadingNewAppointments(false);
  }, [appointmentsSchedule]);

  useEffect(() => {
    setSelectedDay({ dayName: "LUN", dayNumber: 1 });
    onSelectDay({ dayName: "LUN" });
    setSelectedDayEnd(daysSchedule[0]?.dayEnd);
    setSelectedDayStart(daysSchedule[0]?.dayStart);
  }, []);

  const createNewAppointment = async ({
    start,
    end,
  }: {
    start: Date;
    end: Date;
  }) => {
    if (subscriptionData?.subscriptionType === "SC_EXPIRED") {
      setExpiredModal(true);
      return;
    }
    const startDate = dayjs(start).tz("America/Argentina/Buenos_Aires").toDate();
    const endDate = dayjs(end).tz("America/Argentina/Buenos_Aires").toDate();
    const userID = localStorage.getItem("sacaturno_userID");

    const appointmentData: IAppointmentSchedule = {
      businessID: business?._id!,
      start: startDate,
      end: endDate,
      service: "",
      day: selectedDay.dayName,
      dayScheduleID: selectedDayID,
      description: "",
      ownerID: userID!,
      price: 0,
      dayNumber: selectedDay.dayNumber,
    };

    setCreateAppointmentModal(true);
    setCreateAppointmentData(appointmentData);
  };

  const handleSelectEvent = (event: IAppointmentSchedule) => {
    setEventData(event);
    setEventModal(true);
  };

  const handleSelectAppointmentDuration = (val: number) => {
    setSelectedAppointmentDuration(val);
    editDaySchedule({
      day: selectedDay.dayName,
      dayStart: selectedDayStart,
      dayEnd: selectedDayEnd,
      appointmentDuration: val,
    });
  };

  const handleSelectDayStart = (val: number) => {
    if (val >= selectedDayEnd) {
      setAlert({ msg: "El horario de inicio debe ser menor al horario de fin", error: true, alertType: "ERROR_ALERT" });
      hideAlert();
      return;
    }
    if (parsedSelectedAppointments.length) {
      const earliestHour = Math.min(...parsedSelectedAppointments.map((a) => dayjs(a.start).hour()));
      if (val > earliestHour) {
        setAlert({ msg: `Hay turnos desde las ${String(earliestHour).padStart(2, "0")}:00 hs`, error: true, alertType: "ERROR_ALERT" });
        hideAlert();
        return;
      }
    }
    setSelectedDayStart(val);
    editDaySchedule({
      day: selectedDay.dayName,
      dayStart: val,
      dayEnd: selectedDayEnd,
      appointmentDuration: selectedAppointmentDuration,
    });
  };

  const handleSelectDayEnd = (val: number) => {
    if (val <= selectedDayStart) {
      setAlert({ msg: "El horario de fin debe ser mayor al horario de inicio", error: true, alertType: "ERROR_ALERT" });
      hideAlert();
      return;
    }
    if (parsedSelectedAppointments.length) {
      const latestHour = Math.max(
        ...parsedSelectedAppointments.map((a) => dayjs(a.end).hour() + (dayjs(a.end).minute() > 0 ? 1 : 0))
      );
      if (val < latestHour) {
        setAlert({ msg: `Hay turnos hasta las ${String(latestHour).padStart(2, "0")}:00 hs`, error: true, alertType: "ERROR_ALERT" });
        hideAlert();
        return;
      }
    }
    setSelectedDayEnd(val);
    editDaySchedule({
      day: selectedDay.dayName,
      dayStart: selectedDayStart,
      dayEnd: val,
      appointmentDuration: selectedAppointmentDuration,
    });
  };

  const editDaySchedule = ({
    day,
    dayStart,
    dayEnd,
    appointmentDuration,
  }: {
    day: string;
    dayStart: number;
    dayEnd: number;
    appointmentDuration: number;
  }) => {
    const dayToEdit = daysSchedule?.find((d) => d.day === day);
    if (!dayToEdit) return;
    const dayEdited: IDaySchedule = { ...dayToEdit, dayStart, dayEnd, appointmentDuration };

    setDaysChanged((days) => {
      const index = days.findIndex((d) => d.day === selectedDay.dayName);
      if (index !== -1) {
        const updated = [...days];
        updated[index].dayEnd = dayEnd;
        updated[index].dayStart = dayStart;
        updated[index].appointmentDuration = appointmentDuration;
        return updated;
      }
      return [...days, dayEdited];
    });

    setDaysSchedule((days) => {
      const index = days.findIndex((d) => d.day === selectedDay.dayName);
      const updated = [...days];
      updated[index].dayEnd = dayEnd;
      updated[index].dayStart = dayStart;
      updated[index].appointmentDuration = appointmentDuration;
      return updated;
    });
  };

  const saveChanges = async (onSaved?: () => void) => {
    setLoadingButton(true);
    if (selectedAnticipation >= selectedDaysToCreate) {
      setAlert({
        msg: "Elige una anticipación menor a los dias a crear",
        error: true,
        alertType: "ERROR_ALERT",
      });
      hideAlert();
      setLoadingButton(false);
      return;
    }
    const token = localStorage.getItem("sacaturno_token");
    const authHeader = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-store",
      },
    };
    try {
      await axiosReq.put(
        "/business/schedule/parameters/" + business?._id,
        {
          scheduleAnticipation: selectedAnticipation,
          scheduleDaysToCreate: selectedDaysToCreate,
          automaticSchedule: selectedAutomaticSchedule,
        },
        authHeader
      );
      if (daysChanged.length > 0) await saveModifiedScheduleDays();
      setAlert({ msg: "Cambios guardados con éxito", error: true, alertType: "OK_ALERT" });
      hideAlert();
      setLoadingButton(false);
      if (onSaved) {
        onSaved();
        return;
      }
      // Ya guardamos: evitar que el guard beforeunload dispare el prompt nativo
      // "¿Volver a cargar?" en este reload programático.
      bypassGuardRef.current = true;
      window.location.reload();
    } catch {
      setAlert({ msg: "Error al guardar cambios", error: true, alertType: "ERROR_ALERT" });
      hideAlert();
      setLoadingButton(false);
      setLoadingNewAppointments(false);
    }
  };

  const saveModifiedScheduleDays = async () => {
    try {
      const token = localStorage.getItem("sacaturno_token");
      const authHeader = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-store",
        },
      };
      await axiosReq.put("/schedule/appointment/editmany", daysChanged, authHeader);
    } catch { }
  };

  // ── Calendar grid helpers ────────────────────────────────────────────────

  const slots = useMemo<TimeSlot[]>(() => {
    const dur = Math.max(selectedAppointmentDuration, 1);
    const count = Math.floor(((selectedDayEnd - selectedDayStart) * 60) / dur);
    return Array.from({ length: Math.max(count, 1) }, (_, i) => {
      const absMin = selectedDayStart * 60 + i * dur;
      const hour = Math.floor(absMin / 60);
      const minute = absMin % 60;
      return {
        index: i,
        hour,
        minute,
        label: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
        isHourBoundary: minute === 0,
      };
    });
  }, [selectedDayStart, selectedDayEnd, selectedAppointmentDuration]);

  const parsedSelectedAppointments = useMemo(
    () => parseAppointments(selectedDayAppointments),
    [selectedDayAppointments]
  );

  const appointmentCountByDay = useMemo(() => {
    const counts = new Map<string, number>();
    (appointmentsSchedule ?? []).forEach((a) =>
      counts.set(a.day, (counts.get(a.day) ?? 0) + 1)
    );
    return counts;
  }, [appointmentsSchedule]);

  const weeklyAppointmentsTotal = useMemo(
    () => Array.from(appointmentCountByDay.values()).reduce((sum, n) => sum + n, 0),
    [appointmentCountByDay]
  );

  const getEventTop = (event: IAppointmentSchedule): number => {
    const eventMins = dayjs(event.start).hour() * 60 + dayjs(event.start).minute();
    return ((eventMins - selectedDayStart * 60) / selectedAppointmentDuration) * HOUR_HEIGHT;
  };

  const getEventHeight = (event: IAppointmentSchedule): number => {
    const mins = dayjs(event.end).diff(dayjs(event.start), "minute");
    return (Math.max(mins, selectedAppointmentDuration) / selectedAppointmentDuration) * HOUR_HEIGHT;
  };

  const handleTimeGutterPlusClick = (slot: TimeSlot, e: React.MouseEvent) => {
    e.stopPropagation();
    const start = dayjs().hour(slot.hour).minute(slot.minute).second(0).millisecond(0).toDate();
    const end = dayjs(start).add(selectedAppointmentDuration, "minute").toDate();
    createNewAppointment({ start, end });
  };

  const handleSlotClick = (slot: TimeSlot, e: React.MouseEvent<HTMLDivElement>) => {
    const start = dayjs().hour(slot.hour).minute(slot.minute).second(0).millisecond(0).toDate();
    const end = dayjs(start).add(selectedAppointmentDuration, "minute").toDate();
    createNewAppointment({ start, end });
  };

  const getEmployeeName = (employeeID: string | null | undefined): string | null => {
    if (!employeeID || !employees?.length) return null;
    const emp = employees.find((e) => e._id === employeeID);
    if (!emp) return null;
    return emp.surname ? `${emp.name} ${emp.surname[0]}.` : emp.name;
  };

  const getBranchName = (branchID: string | null | undefined): string | null => {
    if (!branchID || !branches?.length) return null;
    const branch = branches.find((b) => b._id === branchID);
    return branch?.name ?? null;
  };

  const totalHeight = slots.length * HOUR_HEIGHT;

  // Summary panel (reflects last-saved state)
  const savedAuto = businessData.automaticSchedule;

  const daysDirty = useMemo(() => {
    const original = originalDaysRef.current;
    if (!original) return false;
    return daysChanged.some((d) => {
      const o = original[d.day];
      return (
        !o ||
        o.dayStart !== d.dayStart ||
        o.dayEnd !== d.dayEnd ||
        o.appointmentDuration !== d.appointmentDuration
      );
    });
  }, [daysChanged]);

  const hasUnsavedChanges =
    selectedAutomaticSchedule !== businessData.automaticSchedule ||
    selectedDaysToCreate !== businessData.scheduleDaysToCreate ||
    selectedAnticipation !== businessData.scheduleAnticipation ||
    daysDirty;
  const discardChanges = () => {
    setSelectedAutomaticSchedule(businessData.automaticSchedule);
    setSelectedDaysToCreate(businessData.scheduleDaysToCreate);
    setSelectedAnticipation(businessData.scheduleAnticipation);
    const original = originalDaysRef.current;
    if (original) {
      setDaysSchedule((days) => days.map((d) => ({ ...d, ...(original[d.day] ?? {}) })));
      const current = original[selectedDay.dayName];
      if (current) {
        setSelectedDayStart(current.dayStart);
        setSelectedDayEnd(current.dayEnd);
        setSelectedAppointmentDuration(current.appointmentDuration);
      }
    }
    setDaysChanged([]);
  };

  // Unsaved-changes navigation guard
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const askBeforeLeaving = (proceed: () => void) => {
      pendingNavRef.current = proceed;
      setLeaveModal(true);
    };

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (bypassGuardRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };

    const onClickCapture = (e: MouseEvent) => {
      if (bypassGuardRef.current) return;
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;
      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || anchor.target === "_blank") return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;
      e.preventDefault();
      e.stopPropagation();
      askBeforeLeaving(() => {
        bypassGuardRef.current = true;
        router.replace(url.pathname + url.search);
      });
    };

    // Sentinel entry so browser back/forward can be intercepted
    window.history.pushState(null, "", window.location.href);

    const onPopState = () => {
      if (bypassGuardRef.current) return;
      window.history.pushState(null, "", window.location.href);
      askBeforeLeaving(() => {
        bypassGuardRef.current = true;
        window.history.go(-2);
      });
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("popstate", onPopState);
    document.addEventListener("click", onClickCapture, true);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("click", onClickCapture, true);
    };
  }, [hasUnsavedChanges, router]);

  const handleLeaveDiscard = () => {
    const proceed = pendingNavRef.current;
    pendingNavRef.current = null;
    setLeaveModal(false);
    discardChanges();
    proceed?.();
  };

  const handleLeaveSave = () => {
    const proceed = pendingNavRef.current;
    saveChanges(() => {
      pendingNavRef.current = null;
      setLeaveModal(false);
      proceed?.();
    });
  };

  const scheduleEndLabel = businessData.scheduleEnd
    ? dayjs(businessData.scheduleEnd).format("DD/MM/YYYY")
    : "—";
  const nextGenLabel = businessData.scheduleEnd
    ? dayjs(businessData.scheduleEnd)
        .subtract(businessData.scheduleAnticipation, "day")
        .format("ddd DD/MM")
    : "—";

  // Render

  return (
    <>
      {loadingNewAppointments && (
        <div
          style={{ height: "calc(100vh - 64px)" }}
          className="absolute z-50 flex items-center justify-center w-full bg-white"
        >
          <div className="loader" />
        </div>
      )}

      {/* Dialogs */}
      {/* <Dialog open={subscriptionData?.subscriptionType === "SC_EXPIRED"}>
        <DialogContent className="sm:w-[460px] w-[93vw]">
          <ExpiredPlanModal onCloseModal={() => setExpiredModal(false)} businessData={business} />
        </DialogContent>
      </Dialog> */}

      <Dialog open={eventModal} onOpenChange={() => setEventModal(false)}>
        <DialogContent className="md:w-[510px] w-[93vw]">
          <DialogTitle className="sr-only">Detalle del turno</DialogTitle>
          <ScheduleAppointmentModal
            onDeleteAppointment={(deleted) => {
              setSelectedDayAppointments((prev) =>
                prev?.filter((a) => a._id !== deleted._id)
              );
              setLoadingNewAppointments(true);
              setAppointmentsSchedule((prev) =>
                prev?.filter((a) => a._id !== deleted._id)
              );
            }}
            appointment={eventData}
            closeModalF={() => setEventModal(false)}
            employees={employees}
            branches={branches}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={createAppointmentModal} onOpenChange={() => setCreateAppointmentModal(false)}>
        <DialogContent className="sm:w-[400px] w-[93vw]">
          <DialogTitle className="sr-only">Crear turno</DialogTitle>
          <CreateScheduleAppointmentModal
            onNewAppointment={(newAppt) => {
              setSelectedDayAppointments([...selectedDayAppointments!, newAppt]);
              setAppointmentsSchedule([...appointmentsSchedule!, newAppt]);
            }}
            appointmentData={createAppointmentData}
            servicesData={services}
            employees={employees}
            branches={branches}
            closeModalF={() => setCreateAppointmentModal(false)}
          />
        </DialogContent>
      </Dialog>

      {servicesData.length === 0 && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Sin servicios"
          className="z-50 flex items-center justify-center bg-black/80 p-4"
          style={{
            position: "fixed",
            top: isMobile ? "4rem" : 0,
            left: !isMobile && sidebarOpen ? "var(--sidebar-width)" : 0,
            right: 0,
            height: isMobile ? "calc(100svh - 4rem)" : "100svh",
          }}
        >
          <div className="w-full max-w-[460px] rounded-2xl border bg-background p-6 shadow-lg">
            <NoServicesModal />
          </div>
        </div>
      )}

      <Dialog open={expiredModal} onOpenChange={() => setExpiredModal(false)}>
        <DialogTitle />
        <DialogContent className="max-w-3xl max-h-[90dvh] overflow-y-auto w-[calc(100%-2rem)] sm:w-full px-4 sm:px-6">
          <ExpiredPlanModal onCloseModal={() => setExpiredModal(false)} businessData={business} />
        </DialogContent>
      </Dialog>


      <Dialog
        open={leaveModal}
        onOpenChange={(open) => {
          if (!open && !loadingButton) {
            pendingNavRef.current = null;
            setLeaveModal(false);
          }
        }}
      >
        <DialogContent className="rounded-2xl sm:w-[460px] w-[93vw]">
          <DialogTitle className="sr-only">Cambios sin guardar</DialogTitle>
          <div className="flex flex-col w-full gap-4">
            <div className="pb-4 border-b border-gray-100 flex flex-col gap-1">
              <h4 className="text-lg leading-none font-semibold text-gray-800">
                Tenés cambios sin guardar
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Si salís de esta página vas a perder los cambios que hiciste en la configuración de
                la agenda.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <button
                onClick={handleLeaveDiscard}
                disabled={loadingButton}
                className="border border-gray-200 text-gray-600 text-xs font-medium px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Descartar cambios
              </button>
              <button
                onClick={handleLeaveSave}
                disabled={loadingButton}
                className="flex items-center justify-center gap-1.5 bg-orange-600 hover:bg-[#d92f04] text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loadingButton ? (
                  <div className="loaderSmall" />
                ) : (
                  <>
                    <LuSave size={14} />
                    Guardar y salir
                  </>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={tutorialModal} onOpenChange={() => setTutorialModal(false)}>
        <DialogContent className="sm:w-[460px] md:w-[700px] w-[93vw]">
          <TutorialAutomateModal onClose={() => setTutorialModal(false)} />
        </DialogContent>
      </Dialog>

      {/* Page layout */}
      <div
        className={cn(
          "flex flex-col w-full gap-5 md:pb-10 transition-[padding] duration-300 ease-out",
          hasUnsavedChanges ? "pb-24" : "pb-6"
        )}
      >

        {/* Page header */}
        <div className="flex items-center justify-between mt-4 xl:mt-2">
          <div className="flex items-center gap-3">
            <h1 className="text-lg 2xl:text-xl font-semibold text-gray-800">Automatizar agenda</h1>
          </div>

          <button
            onClick={() => setTutorialModal(true)}
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 text-primary text-xs font-semibold transition-colors duration-200"
            title="Ver tutorial paso a paso"
          >
            <LuBookOpen size={14} />
            <span>Tutorial</span>
          </button>
        </div>

        {/* Expired subscription banner */}
        {subscriptionData?.subscriptionType === "SC_EXPIRED" && (
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
            <FaCircleInfo size={16} className="text-red-500 mt-0.5 shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-red-700">Suscripción vencida</span>
              <span className="text-sm text-red-600">
                Tu suscripción está vencida. La agenda automática está suspendida y no se generarán nuevos turnos hasta que renueves tu plan.
              </span>
            </div>
          </div>
        )}

        {/* Card 1: Automatic schedule config */}
        <Card className="p-0 overflow-hidden">
          <div className="flex flex-col">

            {/* Header */}
            <div className="flex items-start gap-3 px-5 md:px-6 py-4 md:py-5 border-b border-gray-100">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-50 text-primary shrink-0">
                <LuCalendarCog size={20} />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold text-gray-800">
                  Frecuencia y cantidad de días
                </h2>
                <p className="text-sm text-gray-500">
                  Activá la agenda automática para que los turnos se generen sin intervención manual.
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-col gap-4 p-5 md:p-6">
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <FaCircleInfo size={13} className="text-blue-400 mt-0.5 shrink-0" />
                <p className="text-sm text-blue-500 leading-relaxed">
                  Ingresá la cantidad de días que querés crear turnos y cuántos días antes del último
                  turno querés que se vuelvan a generar los turnos programados.
                </p>
              </div>

              {/* Two columns: controls (left) + summary (right) */}
              <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-4">

                {/* Left — controls */}
                <div className="flex flex-col gap-3">
                  {/* Days to create + anticipation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5 p-3.5 rounded-xl border border-gray-200 bg-gray-50">
                      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                        <LuCalendarDays size={14} className="text-gray-400 shrink-0" />
                        Días con turnos disponibles
                      </label>
                      <select
                        value={selectedDaysToCreate}
                        onChange={(e) => setSelectedDaysToCreate(Number(e.target.value))}
                        className="h-9 rounded-md border border-gray-200 bg-gray-100 px-3 text-sm text-gray-700 hover:border-orange-600 focus:border-orange-600 focus:outline-none transition-all duration-200 cursor-pointer"
                      >
                        <option value="7">Crear 7 días</option>
                        <option value="15">Crear 15 días</option>
                        <option value="30">Crear 30 días</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5 p-3.5 rounded-xl border border-gray-200 bg-gray-50">
                      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                        <LuTimer size={14} className="text-gray-400 shrink-0" />
                        ¿Con qué anticipación crear turnos?
                      </label>
                      <select
                        value={selectedAnticipation}
                        onChange={(e) => setSelectedAnticipation(Number(e.target.value))}
                        className="h-9 rounded-md border border-gray-200 bg-gray-100 px-3 text-sm text-gray-700 hover:border-orange-600 focus:border-orange-600 focus:outline-none transition-all duration-200 cursor-pointer"
                      >
                        {Array.from({ length: 16 }, (_, i) => (
                          <option key={i} value={i}>
                            {i === 0 ? "0 días antes" : `${i} ${i === 1 ? "día" : "días"} antes`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Master toggle */}
                  <div
                    className={cn(
                      "flex items-center justify-between gap-3 p-4 rounded-xl border transition-colors duration-200",
                      selectedAutomaticSchedule
                        ? "bg-orange-50/60 border-orange-200"
                        : "bg-gray-50 border-gray-200"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "flex items-center justify-center w-9 h-9 rounded-full shrink-0 transition-colors duration-200",
                          selectedAutomaticSchedule
                            ? "bg-primary text-white"
                            : "bg-white text-gray-400 border border-gray-200"
                        )}
                      >
                        <LuZap size={16} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-gray-800">
                          Crear turnos automáticamente
                        </span>
                        <span className="text-xs text-gray-500">
                          {selectedAutomaticSchedule
                            ? "La agenda se completa sola, sin que hagas nada."
                            : "Vas a tener que generar los turnos de forma manual."}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span
                        className={cn(
                          "text-xs font-semibold hidden sm:inline",
                          selectedAutomaticSchedule ? "text-primary" : "text-gray-400"
                        )}
                      >
                        {selectedAutomaticSchedule ? "Activado" : "Desactivado"}
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={selectedAutomaticSchedule}
                        aria-label="Crear turnos automáticamente"
                        onClick={() => setSelectedAutomaticSchedule(!selectedAutomaticSchedule)}
                        className={cn(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 shrink-0",
                          selectedAutomaticSchedule ? "bg-primary" : "bg-gray-300"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
                            selectedAutomaticSchedule ? "translate-x-5" : "translate-x-0.5"
                          )}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right — automation summary (last-saved state) */}
                <div
                  className={cn(
                    "flex flex-col rounded-xl border p-4 transition-colors duration-200",
                    savedAuto ? "bg-orange-50/50 border-orange-100" : "bg-gray-50 border-gray-200"
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <LuActivity size={15} className={savedAuto ? "text-primary" : "text-gray-400"} />
                    <span className="text-sm font-semibold text-gray-800">
                      Resumen de tu automatización
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-[11px] mt-0.5",
                      hasUnsavedChanges ? "text-orange-500 font-medium" : "text-gray-400"
                    )}
                  >
                    {hasUnsavedChanges ? "Tenés cambios sin guardar" : "Según lo último guardado"}
                  </span>

                  <div
                    className={cn(
                      "flex flex-col mt-3 divide-y",
                      savedAuto ? "divide-orange-100" : "divide-gray-200"
                    )}
                  >
                    <div className="flex items-center justify-between py-2.5 first:pt-0">
                      <span className="text-xs text-gray-500">Estado</span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
                          savedAuto
                            ? "bg-orange-50 border-orange-200 text-orange-700"
                            : "bg-gray-100 border-gray-200 text-gray-500"
                        )}
                      >
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            savedAuto ? "bg-primary" : "bg-gray-400"
                          )}
                        />
                        {savedAuto ? "Activada" : "Desactivada"}
                      </span>
                    </div>

                    {savedAuto && (
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-xs text-gray-500">Agenda cargada hasta</span>
                        <span className="text-xs font-semibold text-gray-800 tabular-nums">
                          {scheduleEndLabel}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-xs text-gray-500">Próxima generación</span>
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          savedAuto ? "text-gray-800 capitalize" : "text-gray-400"
                        )}
                      >
                        {savedAuto ? nextGenLabel : "Se genera al activar"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-xs text-gray-500">Turnos por semana</span>
                      <span className="text-xs font-semibold text-gray-800 tabular-nums">
                        {weeklyAppointmentsTotal}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2.5 last:pb-0">
                      <span className="text-xs text-gray-500">Ventana</span>
                      <span className="text-xs font-semibold text-gray-800">
                        {businessData.scheduleDaysToCreate} días · {businessData.scheduleAnticipation} antes
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer — save action, revealed only when there are unsaved changes
                (desktop expands downward; mobile uses the fixed bottom bar) */}
            <div
              aria-hidden={!hasUnsavedChanges}
              className={cn(
                "hidden md:grid transition-all duration-300 ease-out",
                hasUnsavedChanges
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0 pointer-events-none"
              )}
            >
              <div className="overflow-hidden">
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                  <span className="text-xs text-orange-500 font-medium mr-auto">
                    Tenés cambios sin guardar
                  </span>
                  {!loadingButton ? (
                    <button
                      onClick={() => saveChanges()}
                      disabled={!hasUnsavedChanges}
                      className="flex items-center gap-1.5 h-9 bg-primary hover:bg-orange-500 text-white text-xs font-semibold px-4 rounded-lg transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-primary"
                    >
                      <LuSave size={14} />
                      Guardar cambios
                    </button>
                  ) : (
                    <div className="flex items-center justify-center w-32 h-9">
                      <div className="loaderSmall" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* ── Card 2: Day schedule ── */}
        <Card className="p-5 md:p-6">
          <div className="flex flex-col gap-4">

            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold text-gray-800">Horario de atención</h2>
                <p className="text-sm text-gray-500">
                  Por cada día de la semana, configurá el horario y agregá los turnos en cada horario deseado.
                </p>
              </div>
              {/* <button
                onClick={() => setHelpModal(true)}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-500 transition-colors duration-200 shrink-0 ml-4"
              >
                <FaCircleInfo size={13} />
                <span className="hidden sm:inline">Tutorial</span>
              </button> */}
            </div>

            {/* Day selector tabs */}
            <div className="flex gap-1.5 flex-wrap">
              {daysOfWeek.map((day) => {
                const count = appointmentCountByDay.get(day.dayName) ?? 0;
                const isActive = selectedDay.dayName === day.dayName;
                return (
                  <button
                    key={day.dayName}
                    onClick={() => handleSelectDay(day)}
                    className={cn(
                      "relative px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all duration-200",
                      isActive
                        ? "bg-primary border-orange-600 text-white shadow-md"
                        : "border-gray-200 text-gray-600 hover:border-orange-600 hover:text-orange-600 bg-white"
                    )}
                  >
                    {day.dayName}
                    {count > 0 && (
                      <span
                        className={cn(
                          "absolute -top-1.5 -right-1.5 flex items-center justify-center h-4 w-4 rounded-full text-[9px] font-bold",
                          isActive ? "bg-white text-primary" : "bg-primary text-white"
                        )}
                      >
                        {count > 9 ? "9+" : count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Time controls */}
            <div className="flex flex-col gap-2 border-t border-gray-50 pt-4">
              <TimeRangeControls
                dayStart={selectedDayStart}
                dayEnd={selectedDayEnd}
                appointmentDuration={selectedAppointmentDuration}
                onDayStartChange={handleSelectDayStart}
                onDayEndChange={handleSelectDayEnd}
                onDurationChange={handleSelectAppointmentDuration}
              />
              <span className="text-xs text-gray-400 hidden sm:block">
                Hacé clic en un horario para agregar un turno
              </span>
            </div>

            {/* Calendar grid */}
            <div className="rounded-xl border border-gray-100 overflow-hidden">

              {/* Day header */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
                <span className="text-xs font-semibold capitalize text-primary">
                  {selectedDay.dayName}
                </span>
                <span className="text-xs text-gray-400">
                  — {selectedDayStart}:00 a {selectedDayEnd}:00 hs
                </span>
                <span className="ml-auto text-xs text-gray-400">
                  {parsedSelectedAppointments.length} turno
                  {parsedSelectedAppointments.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Scrollable grid */}
              <div ref={gridRef} className="flex">

                {/* Time gutter */}
                <div
                  style={{ width: TIME_GUTTER, flexShrink: 0 }}
                  className="border-r border-gray-100 bg-white"
                >
                  {slots.map((slot) => (
                    <div
                      key={slot.index}
                      style={{ height: HOUR_HEIGHT }}
                      className="flex flex-col items-center pt-1.5 gap-0 justify-center"
                    >
                      <span
                        className={cn(
                          "text-xs select-none tabular-nums",
                          slot.isHourBoundary ? "text-gray-400" : "text-gray-300"
                        )}
                      >
                        {slot.label}
                      </span>
                      <button
                        onClick={(e) => handleTimeGutterPlusClick(slot, e)}
                        className="w-5 h-5 flex items-center justify-center rounded-full text-orange-500 hover:text-white hover:bg-orange-500 transition-colors duration-150 text-sm font-bold leading-none select-none"
                        aria-label={`Agregar turno a las ${slot.label}`}
                      >
                        +
                      </button>
                    </div>
                  ))}
                </div>

                {/* Day column */}
                <div className="relative flex-1 bg-white">

                  {/* Slot rows — one per appointment duration unit */}
                  {slots.map((slot) => (
                    <div
                      key={slot.index}
                      style={{ height: HOUR_HEIGHT }}
                      className={cn(
                        "relative hover:bg-orange-50/40 transition-colors duration-150 cursor-pointer group",
                        slot.isHourBoundary
                          ? "border-b border-gray-50"
                          : "border-b border-dashed border-gray-100"
                      )}
                      onClick={(e) => handleSlotClick(slot, e)}
                    >
                      {/* Hover hint */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <span className="text-xs text-orange-400 font-medium">+ Nuevo turno</span>
                      </div>
                    </div>
                  ))}

                  {/* Appointment blocks — grouped into overlap clusters, rendered as flex rows */}
                  {computeClusters(parsedSelectedAppointments).map((cluster, clusterIdx) => {
                    const minTop = Math.min(...cluster.map((e) => getEventTop(e)));
                    return (
                      <div
                        key={`cluster-${clusterIdx}`}
                        style={{
                          position: "absolute",
                          top: Math.max(minTop, 0) + 1,
                          left: CARD_GUTTER,
                          display: "flex",
                          flexDirection: "row",
                          gap: CARD_GAP,
                          zIndex: 5,
                          overflow: "visible",
                        }}
                      >
                        {cluster.map((event, eventIdx) => {
                          const top = getEventTop(event);
                          const height = getEventHeight(event);
                          if (top + height < 0 || top > totalHeight) return null;
                          const offsetTop = Math.max(top, 0) - Math.max(minTop, 0);
                          const empName = getEmployeeName(event.employeeID);
                          const branchName = getBranchName(event.branchID);
                          const hasExtra = !!(empName || branchName);
                          return (
                            <div
                              key={event._id ?? eventIdx}
                              className="rounded-md overflow-hidden cursor-pointer transition-opacity duration-150 hover:opacity-80 select-none bg-primary border-l-[3px] border-orange-800"
                              style={{
                                marginTop: offsetTop,
                                height: Math.max(height - 2, 20),
                                width: "fit-content",
                                minWidth: 90,
                                flexShrink: 0,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectEvent(event);
                              }}
                            >
                              <div className="px-1.5 pt-1 pb-1 h-full flex flex-col min-h-0">
                                <span className="text-xs font-semibold text-white leading-tight whitespace-nowrap shrink-0">
                                  {event.service || "Turno"}
                                </span>
                                {height >= 36 && (
                                  <span className="text-[10px] text-orange-100 leading-tight whitespace-nowrap shrink-0 tabular-nums">
                                    {dayjs(event.start).format("HH:mm")} –{" "}
                                    {dayjs(event.end).format("HH:mm")}
                                  </span>
                                )}
                                {height >= 54 && hasExtra && (
                                  <div className="flex items-center gap-1 shrink-0 text-orange-200 min-w-0">
                                    {empName && (
                                      <span className="flex items-center gap-0.5 min-w-0">
                                        <LuUser size={9} className="shrink-0" />
                                        <span className="text-[10px] leading-tight truncate">{empName}</span>
                                      </span>
                                    )}
                                    {empName && branchName && (
                                      <span className="text-[10px] shrink-0 opacity-50">·</span>
                                    )}
                                    {branchName && (
                                      <span className="flex items-center gap-0.5 min-w-0">
                                        <LuMapPin size={9} className="shrink-0" />
                                        <span className="text-[10px] leading-tight truncate">{branchName}</span>
                                      </span>
                                    )}
                                  </div>
                                )}
                                {height >= 70 && event.price > 0 && (
                                  <span className="text-[10px] text-orange-200 mt-auto whitespace-nowrap shrink-0">
                                    {formatCurrency(event.price)}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 px-4 py-2 border-t border-gray-100 bg-gray-50">
                <span className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span className="w-3 h-3 rounded-sm bg-primary border-l-2 border-orange-800 inline-block" />
                  Turno configurado
                </span>
                <span className="text-xs text-gray-400">
                  Clic en franja vacía para agregar turno
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Mobile bottom save bar — slides up when there are unsaved changes */}
      <div
        aria-hidden={!hasUnsavedChanges}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-200 p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] transition-transform duration-300 ease-out",
          hasUnsavedChanges ? "translate-y-0" : "translate-y-full pointer-events-none"
        )}
      >
        {!loadingButton ? (
          <button
            onClick={() => saveChanges()}
            disabled={!hasUnsavedChanges}
            className="flex items-center justify-center gap-1.5 w-full h-11 bg-primary hover:bg-orange-500 text-white text-sm font-semibold rounded-lg transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-primary"
          >
            <LuSave size={16} />
            Guardar cambios
          </button>
        ) : (
          <div className="flex items-center justify-center w-full h-11">
            <div className="loaderSmall" />
          </div>
        )}
      </div>

      {/* Alert */}
      {alert?.error && (
        <div className="absolute flex justify-center w-full h-fit">
          <Alert error={alert.error} msg={alert.msg} alertType={alert.alertType} />
        </div>
      )}
    </>
  );
};

export default AutomateSchedule;
