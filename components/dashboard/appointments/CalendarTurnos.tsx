"use client";
import dayjs from "dayjs";
import "dayjs/locale/es-mx";
import { IAppointment } from "@/interfaces/appointment.interface";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { IBusiness } from "@/interfaces/business.interface";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import advanced from "dayjs/plugin/advancedFormat";
import { useRouter } from "next/navigation";
import { IService } from "@/interfaces/service.interface";
import NoServicesModal from "../services/NoServicesModal";
import ISubscription from "@/interfaces/subscription.interface";
import ExpiredPlanModal from "./ExpiredPlanModal";
import { LuCalendar, LuCalendarPlus, LuCalendarCheck, LuCalendarX, LuChevronLeft, LuChevronRight, LuClock, LuUser, LuMapPin } from "react-icons/lu";
import { IoInformationCircle } from "react-icons/io5";
import { IoMdMore, IoIosAlert } from "react-icons/io";
import { MdEditCalendar } from "react-icons/md";
import { IDaySchedule } from "@/interfaces/daySchedule.interface";
import { IEmployee } from "@/interfaces/employee.interface";
import { IBranch } from "@/interfaces/branch.interface";
import Link from "next/link";
import MonthCalendarPicker from "./MonthCalendarPicker";
import TimeRangeControls from "./TimeRangeControls";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useSidebar } from "@/components/ui/sidebar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import axiosReq from "@/config/axios";
import { cn } from "@/lib/utils";

// Placeholder shown while a lazy modal's JS chunk is still downloading (first open only)
const ModalSkeleton = () => (
  <div className="flex flex-col gap-2 sm:gap-4 p-4 sm:p-6">
    <Skeleton className="h-3.5 sm:h-5 w-24 sm:w-40" />
    <Skeleton className="h-7 sm:h-9 w-full" />
    <Skeleton className="h-7 sm:h-9 w-full" />
    <Skeleton className="h-12 sm:h-24 w-full" />
    <div className="flex gap-2 pt-0.5 sm:pt-1">
      <Skeleton className="h-8 sm:h-10 flex-1" />
      <Skeleton className="h-8 sm:h-10 flex-1" />
    </div>
  </div>
);

// on-demand-loaded modals. js is downloaded when opening, not in initial bundle
const AppointmentModal = dynamic(() => import("./AppointmentModal"), {
  loading: () => <ModalSkeleton />,
});

import CreateAppointmentModal from "./CreateAppointmentModal"
//const CreateAppointmentModal = dynamic(() => import("./CreateAppointmentModal"), {
//loading: () => <ModalSkeleton />,
//});

const AllDayAppointmentsModal = dynamic(() => import("./AllDayAppointmentsModal"), {
  loading: () => <ModalSkeleton />,
});

const HelpModal = dynamic(() => import("./HelpModal"), {
  loading: () => <ModalSkeleton />,
});

const CancelledAppointments = dynamic(() => import("./CancelledAppointments"), {
  loading: () => <ModalSkeleton />,
});

const ALL_FILTER_VALUE = "__all__";

dayjs.locale("es-mx");
dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.extend(advanced);

const HOUR_HEIGHT = 78; // px per slot in the time grid
const TIME_GUTTER = 60; // px width of the hour-label column
const CARD_GUTTER = 4; // px from day-column edge to card
const CARD_GAP = 5;    // px between side-by-side cards

// Groups events into clusters of transitively-overlapping events.
function computeClusters(events: CalendarEvent[]): CalendarEvent[][] {
  const sorted = [...events].sort((a, b) => dayjs(a.start).diff(dayjs(b.start)));
  const visited = new Set<string>();
  const clusters: CalendarEvent[][] = [];

  for (const event of sorted) {
    const key = event._id ?? String(dayjs(event.start).valueOf());
    if (visited.has(key)) continue;

    const cluster: CalendarEvent[] = [];
    const queue: CalendarEvent[] = [event];

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

interface Props {
  appointments: IAppointment[];
  businessData: IBusiness;
  servicesData: IService[];
  scheduleDays: IDaySchedule[];
  subscriptionData: ISubscription | undefined;
  employees?: IEmployee[];
  branches?: IBranch[];
  currentEmployeeID?: string | null;
  employeePermissions?: string[];
}

interface TimeSlot {
  index: number;
  hour: number;
  minute: number;
  label: string;
  isHourBoundary: boolean;
}

// Matches AppointmentModal's eventType2 shape (required fields, values may be undefined)
interface CalendarEvent {
  start: Date;
  end: Date;
  title: string | undefined;
  businessID?: string;
  clientID: string | "" | undefined;
  _id?: string;
  name: string | undefined;
  email: string | undefined;
  phone: number | undefined;
  service: string | undefined;
  status?: "booked" | "unbooked";
  price: number | undefined;
  depositStatus?: "none" | "pending" | "paid" | "failed";
  mpPaymentID?: string | null;
  depositAmount?: number;
  employeeID?: string | null;
  branchID?: string | null;
}

const getAuthHeader = () => {
  const token = localStorage.getItem("sacaturno_token");
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "Cache-Control": "no-store",
    },
  };
};

// Returns the Monday of the week containing `date`
// Maps dayjs .day() (0 = Sunday) to IDaySchedule.day name
const DAY_MAP: Record<number, string> = {
  0: "DOM",
  1: "LUN",
  2: "MAR",
  3: "MIE",
  4: "JUE",
  5: "VIE",
  6: "SAB",
};

const CalendarTurnos: React.FC<Props> = ({
  appointments,
  businessData,
  servicesData,
  scheduleDays,
  subscriptionData,
  employees,
  branches,
  currentEmployeeID,
  employeePermissions = [],
}) => {
  const { isMobile, open: sidebarOpen } = useSidebar();
  const isEmployee = !!currentEmployeeID;
  const canManageAll = !isEmployee || employeePermissions.includes("manage_all_appointments");
  const canManageOwn = employeePermissions.includes("manage_own_appointments");
  const canCreateAppointments = !isEmployee || canManageAll || canManageOwn;
  const now = dayjs();
  const activeBranches = branches ?? [];
  const showBranchFilter = activeBranches.length >= 2;
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>("");
  const activeEmployees = (employees ?? []).filter((e) => e.status === "active");
  const showEmployeeFilter = activeEmployees.length >= 2;
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string>("");
  const employeeFilterOptions = selectedBranchFilter
    ? activeEmployees.filter((e) => (e.branches ?? []).includes(selectedBranchFilter))
    : activeEmployees;

  const handleBranchFilterChange = (branchID: string) => {
    setSelectedBranchFilter(branchID);
    if (
      branchID &&
      selectedEmployeeFilter &&
      !activeEmployees.find(
        (e) => e._id === selectedEmployeeFilter && (e.branches ?? []).includes(branchID)
      )
    ) {
      setSelectedEmployeeFilter("");
    }
  };
  const [appointmentsData, setAppointmentsData] = useState<IAppointment[]>(appointments);
  const [business, setBusiness] = useState<IBusiness>(businessData);
  const [services, setServices] = useState<IService[]>(servicesData);
  const [eventModal, setEventModal] = useState(false);
  const [eventData, setEventData] = useState<CalendarEvent | undefined>();
  const [eventCanDelete, setEventCanDelete] = useState(true);
  const [createAppointmentModal, setCreateAppointmentModal] = useState(false);
  const [createAppointmentData, setCreateAppointmentData] = useState<IAppointment>();
  const [createAppointmentTabMode, setCreateAppointmentTabMode] = useState<"pending" | "booked">("pending");
  const [allDayAppointmentsModal, setAllDayAppointmentsModal] = useState(false);
  const [helpModal, setHelpModal] = useState(false);
  const [cancelledModal, setCancelledModal] = useState(false);
  const [date, setDate] = useState<Date>(now.toDate());
  const [expiredModal, setExpiredModal] = useState(false);
  const [loadingNewAppointments, setLoadingNewAppointments] = useState(true);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const [bookingsEnabled, setBookingsEnabled] = useState<boolean>(businessData.bookingsEnabled ?? true);
  const [disableBookingsModal, setDisableBookingsModal] = useState(false);
  const [bookingsSaving, setBookingsSaving] = useState(false);
  const canToggleBookings = !isEmployee || canManageAll;
  // El historial de cancelaciones expone datos de contacto y montos: mismo permiso
  // que el resto de las vistas de estadísticas del backend.
  const canViewCancelled = !isEmployee || employeePermissions.includes("view_stats");
  const bookingsToggleLabel = bookingsEnabled ? "Deshabilitar reservas" : "Habilitar reservas";
  const [selectedDaySchedule, setSelectedDaySchedule] = useState({
    dayStart: 8,
    dayEnd: 22,
    appointmentDuration: 30,
  });
  const gridRef = useRef<HTMLDivElement>(null);
  const calendarCardRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const swipeDir = useRef<"left" | "right">("left");
  const touchInScrollableGrid = useRef(false);
  const initialGridScrollLeft = useRef(0);
  const router = useRouter();

  useEffect(() => {
    setAppointmentsData(appointments);
    setBusiness(businessData);
    setServices(servicesData);
    setBookingsEnabled(businessData.bookingsEnabled ?? true);
  }, [appointments, businessData, servicesData]);

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
  }, []);

  useEffect(() => {
    const el = calendarCardRef.current;
    if (!el) return;
    const onTouchMove = (e: TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return;
      const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
      const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
      if (dx > dy && !touchInScrollableGrid.current) e.preventDefault();
    };
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", onTouchMove);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowSwipeHint(false), 1100);
    return () => clearTimeout(t);
  }, []);

  const parsedEvents = useMemo<CalendarEvent[]>(() => {
    const filtered = appointmentsData
      .filter((a) => !selectedBranchFilter || (a as any).branchID === selectedBranchFilter)
      .filter((a) => !selectedEmployeeFilter || (a as any).employeeID === selectedEmployeeFilter);
    return filtered.map((appt) => ({
      start: dayjs(appt.start).tz("America/Argentina/Buenos_Aires").toDate(),
      end: dayjs(appt.end).tz("America/Argentina/Buenos_Aires").toDate(),
      title: appt.title,
      clientID: appt.clientID,
      status: appt.status,
      businessID: appt.businessID,
      _id: appt._id,
      name: appt.name,
      email: appt.email,
      phone: appt.phone,
      service: appt.service,
      price: appt.price,
      depositStatus: appt.depositStatus,
      mpPaymentID: appt.mpPaymentID,
      employeeID: appt.employeeID,
      branchID: appt.branchID,
    }));
  }, [appointmentsData, selectedBranchFilter, selectedEmployeeFilter]);

  const appointmentDateSet = useMemo(() => {
    const set = new Set<string>();
    parsedEvents.forEach((e) => set.add(dayjs(e.start).format("YYYY-MM-DD")));
    return set;
  }, [parsedEvents]);

  const getCanDeleteEvent = (event: CalendarEvent): boolean => {
    if (!isEmployee) return true;
    if (canManageAll) return true;
    if (canManageOwn) return event.employeeID === currentEmployeeID;
    return false;
  };

  const daysToShow = useMemo<Date[]>(() => [date], [date]);

  // Effect 1: When the selected day changes, reset the time-range and duration
  // to match that weekday's configured schedule.
  useEffect(() => {
    if (!scheduleDays.length) return;
    const schedule = scheduleDays.find(
      (s) => s.day === DAY_MAP[dayjs(date).day()] && s.enabled
    );
    if (!schedule) return;

    setSelectedDaySchedule({
      dayStart: schedule.dayStart,
      dayEnd: schedule.dayEnd,
      appointmentDuration: schedule.appointmentDuration ?? 30,
    });
  }, [date, scheduleDays, services]);

  // Effect 2: After the schedule baseline is set, widen the visible range further if any
  // appointment on the visible day(s) falls outside it. Uses a functional updater so it
  // always reads the state committed by Effect 1 and never resets the duration.
  useEffect(() => {
    const visibleDayStrs = new Set(daysToShow.map((d) => dayjs(d).format("YYYY-MM-DD")));
    const visibleEvents = parsedEvents.filter((e) =>
      visibleDayStrs.has(dayjs(e.start).format("YYYY-MM-DD"))
    );
    if (!visibleEvents.length) return;

    setSelectedDaySchedule((prev) => {
      let newStart = prev.dayStart;
      let newEnd = prev.dayEnd;
      visibleEvents.forEach((e) => {
        const sh = dayjs(e.start).hour();
        const eh = dayjs(e.end).hour() + (dayjs(e.end).minute() > 0 ? 1 : 0);
        if (sh < newStart) newStart = sh;
        if (eh > newEnd) newEnd = Math.min(eh, 23);
      });
      if (newStart === prev.dayStart && newEnd === prev.dayEnd) return prev;
      return { ...prev, dayStart: newStart, dayEnd: newEnd };
    });
  }, [parsedEvents, daysToShow]);

  const slots = useMemo<TimeSlot[]>(() => {
    const { dayStart, dayEnd, appointmentDuration } = selectedDaySchedule;
    const dur = Math.max(appointmentDuration, 1);
    const count = Math.floor(((dayEnd - dayStart) * 60) / dur);
    return Array.from({ length: count }, (_, i) => {
      const absMin = dayStart * 60 + i * dur;
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
  }, [selectedDaySchedule]);

  const getEventsForDay = useCallback(
    (day: Date): CalendarEvent[] => {
      const dayStr = dayjs(day).format("YYYY-MM-DD");
      return parsedEvents.filter((e) => dayjs(e.start).format("YYYY-MM-DD") === dayStr);
    },
    [parsedEvents]
  );

  const getEventTop = (event: CalendarEvent): number => {
    const { dayStart, appointmentDuration } = selectedDaySchedule;
    const eventMins = dayjs(event.start).hour() * 60 + dayjs(event.start).minute();
    return ((eventMins - dayStart * 60) / appointmentDuration) * HOUR_HEIGHT;
  };

  const getEventHeight = (event: CalendarEvent): number => {
    const { appointmentDuration } = selectedDaySchedule;
    const mins = dayjs(event.end).diff(dayjs(event.start), "minute");
    return (Math.max(mins, appointmentDuration) / appointmentDuration) * HOUR_HEIGHT;
  };

  // ─── API handlers ─────────────────────────────────────────────────────────

  const handleSaveAppointment = async (appointmentData: IAppointment) => {
    setCreateAppointmentModal(false);
    const tempId = `temp_${Date.now()}`;
    const optimistic: IAppointment = {
      ...appointmentData,
      title:
        appointmentData.status === "booked"
          ? appointmentData.name ?? "Cargando..."
          : "Cargando...",
      _id: tempId,
      status: appointmentData.status ?? "unbooked",
    };
    setAppointmentsData((prev) => [...prev, optimistic]);
    const toastId = toast.loading("Creando turno...", { position: "top-center" });
    try {
      await axiosReq.post("/appointment/create", appointmentData, getAuthHeader());
      toast.success("Turno creado correctamente", { id: toastId, position: "top-center" });
      router.refresh();
    } catch (error: any) {
      setAppointmentsData((prev) => prev.filter((a) => a._id !== tempId));
      if (error?.response?.status === 409) {
        toast.error("El empleado ya tiene un turno en ese horario", { id: toastId, position: "top-center" });
      } else {
        toast.error("No se pudo crear el turno", { id: toastId, position: "top-center" });
      }
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    setEventModal(false);
    const removed = appointmentsData.find((a) => a._id === id);
    setAppointmentsData((prev) => prev.filter((a) => a._id !== id));
    const toastId = toast.loading("Eliminando turno...", { position: "top-center" });
    try {
      await axiosReq.delete(`/appointment/delete/${id}`, getAuthHeader());
      toast.success("Turno eliminado correctamente", { id: toastId, position: "top-center" });
      router.refresh();
    } catch {
      if (removed) setAppointmentsData((prev) => [...prev, removed]);
      toast.error("No se pudo eliminar el turno", { id: toastId, position: "top-center" });
    }
  };

  const handleCancelAppointment = async (id: string) => {
    setEventModal(false);
    const original = appointmentsData.find((a) => a._id === id);
    // Optimista: el slot se libera (vuelve a "unbooked" limpio)
    setAppointmentsData((prev) =>
      prev.map((a) =>
        a._id === id
          ? {
              ...a,
              status: "unbooked",
              title: "Disponible",
              name: "",
              email: "",
              phone: 0,
              depositStatus: "none",
            }
          : a
      )
    );
    const toastId = toast.loading("Cancelando turno...", { position: "top-center" });
    try {
      const { data } = await axiosReq.put(
        "/appointment/book/cancel",
        { _id: id },
        getAuthHeader()
      );
      toast.success(
        data?.refunded
          ? "Turno cancelado y seña reembolsada"
          : "Turno cancelado correctamente",
        { id: toastId, position: "top-center" }
      );
      router.refresh();
    } catch {
      if (original) {
        setAppointmentsData((prev) =>
          prev.map((a) => (a._id === id ? original : a))
        );
      }
      toast.error("No se pudo cancelar el turno", { id: toastId, position: "top-center" });
    }
  };

  const handleSaveDayAppointments = async (dayAppointments: IAppointment[]) => {
    setAllDayAppointmentsModal(false);
    const tempIds = dayAppointments.map((_, i) => `temp_day_${Date.now()}_${i}`);
    const optimistic = dayAppointments.map((a, i) => ({ ...a, _id: tempIds[i] }));
    setAppointmentsData((prev) => [...prev, ...optimistic]);
    const toastId = toast.loading("Creando turnos del día...", { position: "top-center" });
    try {
      await axiosReq.post("/appointment/create/day", dayAppointments, getAuthHeader());
      toast.success("Turnos del día creados correctamente", { id: toastId, position: "top-center" });
      router.refresh();
    } catch {
      setAppointmentsData((prev) =>
        prev.filter((a) => !tempIds.includes(a._id ?? ""))
      );
      toast.error("No se pudieron crear los turnos", { id: toastId, position: "top-center" });
    }
  };

  const persistBookingsEnabled = async (next: boolean) => {
    const prev = bookingsEnabled;
    setBookingsEnabled(next);
    setBookingsSaving(true);
    const toastId = toast.loading(
      next ? "Habilitando reservas..." : "Deshabilitando reservas...",
      { position: "top-center" }
    );
    try {
      await axiosReq.put(
        "/business/edit",
        { ...business, bookingsEnabled: next },
        getAuthHeader()
      );
      toast.success(
        next ? "Reservas habilitadas" : "Reservas deshabilitadas",
        { id: toastId, position: "top-center" }
      );
      setBusiness((b) => ({ ...b, bookingsEnabled: next }));
      router.refresh();
    } catch {
      setBookingsEnabled(prev);
      toast.error("No se pudo actualizar", { id: toastId, position: "top-center" });
    } finally {
      setBookingsSaving(false);
    }
  };

  const handleBookingsToggle = (next: boolean) => {
    if (!canToggleBookings || bookingsSaving) return;
    if (next === false) {
      setDisableBookingsModal(true);
      return;
    }
    persistBookingsEnabled(true);
  };

  // ─── Time gutter + click → open create modal at exact slot time ──────────

  const handleTimeGutterPlusClick = (slot: TimeSlot, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canCreateAppointments) return;
    if (subscriptionData?.subscriptionType === "SC_EXPIRED") {
      setExpiredModal(true);
      return;
    }
    const day = daysToShow[0];
    const { appointmentDuration } = selectedDaySchedule;
    const start = dayjs(day).hour(slot.hour).minute(slot.minute).second(0).millisecond(0);
    const end = start.add(appointmentDuration, "minute").toDate();

    if (start.isBefore(dayjs().subtract(2, "day"))) {
      toast.error("Solo podés cargar turnos de hasta 2 días atrás", { position: "top-center" });
      return;
    }

    const isPast = start.isBefore(dayjs());
    setCreateAppointmentTabMode(isPast ? "booked" : "pending");
    setCreateAppointmentData({ businessID: business?._id, start: start.toDate(), end, service: "" });
    setCreateAppointmentModal(true);
  };

  // ─── Slot click → open create modal at that slot's start time ────────────

  const handleSlotClick = (
    day: Date,
    slot: TimeSlot,
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    if (!canCreateAppointments) return;
    if (subscriptionData?.subscriptionType === "SC_EXPIRED") {
      setExpiredModal(true);
      return;
    }
    const { appointmentDuration } = selectedDaySchedule;
    const start = dayjs(day).hour(slot.hour).minute(slot.minute).second(0).millisecond(0);
    const end = start.add(appointmentDuration, "minute").toDate();

    if (start.isBefore(dayjs().subtract(2, "day"))) {
      toast.error("Solo podés cargar turnos de hasta 2 días atrás", { position: "top-center" });
      return;
    }

    const isPast = start.isBefore(dayjs());
    setCreateAppointmentTabMode(isPast ? "booked" : "pending");
    setCreateAppointmentData({ businessID: business?._id, start: start.toDate(), end, service: "" });
    setCreateAppointmentModal(true);
  };

  // ─── Event click ──────────────────────────────────────────────────────────

  const handleSelectEvent = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    const matchedService = services.find((s) => s.name === event.service);
    setEventData({ ...event, depositAmount: matchedService?.depositAmount });
    setEventCanDelete(getCanDeleteEvent(event));
    setEventModal(true);
  };

  // ─── Navigation ───────────────────────────────────────────────────────────

  const handleDayStartChange = (val: number) => {
    if (val >= selectedDaySchedule.dayEnd) {
      toast.error("El horario de inicio debe ser menor al horario de fin", { position: "top-center" });
      return;
    }
    const visibleEvents = getEventsForDay(date);
    if (visibleEvents.length) {
      const earliestHour = Math.min(...visibleEvents.map((e) => dayjs(e.start).hour()));
      if (val > earliestHour) {
        toast.error(`Hay turnos desde las ${String(earliestHour).padStart(2, "0")}:00 hs`, { position: "top-center" });
        return;
      }
    }
    setSelectedDaySchedule((prev) => ({ ...prev, dayStart: val }));
  };

  const handleDayEndChange = (val: number) => {
    if (val <= selectedDaySchedule.dayStart) {
      toast.error("El horario de fin debe ser mayor al horario de inicio", { position: "top-center" });
      return;
    }
    const visibleEvents = getEventsForDay(date);
    if (visibleEvents.length) {
      const latestHour = Math.max(
        ...visibleEvents.map((e) => dayjs(e.end).hour() + (dayjs(e.end).minute() > 0 ? 1 : 0))
      );
      if (val < latestHour) {
        toast.error(`Hay turnos hasta las ${String(latestHour).padStart(2, "0")}:00 hs`, { position: "top-center" });
        return;
      }
    }
    setSelectedDaySchedule((prev) => ({ ...prev, dayEnd: val }));
  };

  const handleDurationChange = (val: number) => {
    setSelectedDaySchedule((prev) => ({ ...prev, appointmentDuration: val }));
  };

  const onNextClick = () => {
    swipeDir.current = "left";
    setDate((prev) => dayjs(prev).add(1, "day").toDate());
  };

  const onPrevClick = () => {
    swipeDir.current = "right";
    setDate((prev) => dayjs(prev).subtract(1, "day").toDate());
  };

  const goToDate = (newDate: Date) => {
    const target = dayjs(newDate).startOf("day");
    const current = dayjs(date).startOf("day");
    if (target.isSame(current)) return;
    swipeDir.current = target.isAfter(current) ? "left" : "right";
    setDate(target.toDate());
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setShowSwipeHint(false);
    const grid = gridRef.current;
    touchInScrollableGrid.current = !!(
      grid &&
      grid.contains(e.target as Node) &&
      grid.scrollWidth > grid.clientWidth
    );
    initialGridScrollLeft.current = grid?.scrollLeft ?? 0;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    const gridActuallyScrolled =
      touchInScrollableGrid.current &&
      (gridRef.current?.scrollLeft ?? 0) !== initialGridScrollLeft.current;
    if (gridActuallyScrolled) return;
    if (Math.abs(deltaX) < 60 || Math.abs(deltaX) < Math.abs(deltaY)) return;
    if (deltaX < 0) onNextClick();
    else onPrevClick();
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

  const handleSetAllDayAppointmentsModal = () => {
    if (!canCreateAppointments) return;
    if (subscriptionData?.subscriptionType === "SC_EXPIRED") {
      setExpiredModal(true);
      return;
    }
    setAllDayAppointmentsModal(true);
  };

  // ─── Render ───────────────────────────────────────────────────────────────

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
      <Dialog
        open={allDayAppointmentsModal}
        onOpenChange={() => setAllDayAppointmentsModal(false)}
      >
        <DialogContent className="sm:w-[420px] w-[93vw] p-0 gap-0 flex flex-col max-h-[90dvh] overflow-hidden">
          <DialogTitle className="sr-only">Crear turnos del día</DialogTitle>
          <AllDayAppointmentsModal
            business={business}
            services={services}
            date={date}
            selectedDay={selectedDaySchedule}
            employees={employees}
            branches={activeBranches}
            currentEmployeeID={currentEmployeeID}
            canManageAll={canManageAll}
            onSave={handleSaveDayAppointments}
            closeModalF={() => setAllDayAppointmentsModal(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={eventModal} onOpenChange={() => setEventModal(false)}>
        <DialogContent className="md:w-[510px] w-[93vw] ">
          <DialogTitle className="sr-only">Detalle del turno</DialogTitle>
          <AppointmentModal
            appointment={eventData}
            onDelete={handleDeleteAppointment}
            onCancel={handleCancelAppointment}
            closeModalF={() => setEventModal(false)}
            canDelete={eventCanDelete}
            employees={employees}
            branches={branches}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={createAppointmentModal}
        onOpenChange={() => setCreateAppointmentModal(false)}
      >
        <DialogContent
          className={`w-[93vw] transition-all duration-200 max-w-none ${createAppointmentTabMode === "booked" ? "sm:w-[660px]" : "sm:w-[400px]"
            }`}
        >
          <DialogTitle className="sr-only">Crear turno</DialogTitle>
          <CreateAppointmentModal
            onSave={handleSaveAppointment}
            closeModalF={() => setCreateAppointmentModal(false)}
            appointmentData={createAppointmentData}
            servicesData={services}
            employees={employees}
            branches={activeBranches}
            currentEmployeeID={currentEmployeeID}
            canManageAll={canManageAll}
            tabMode={createAppointmentTabMode}
            onTabModeChange={setCreateAppointmentTabMode}
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
        <DialogContent className="max-w-3xl max-h-[90dvh] overflow-y-auto w-[calc(100%-2rem)] sm:w-full px-4 sm:px-6">
          <DialogTitle className="sr-only">Plan vencido</DialogTitle>
          <ExpiredPlanModal
            onCloseModal={() => setExpiredModal(false)}
            businessData={business}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={disableBookingsModal} onOpenChange={() => setDisableBookingsModal(false)}>
        <DialogContent className="sm:w-[440px] w-[93vw] p-6">
          <DialogTitle className="sr-only">Deshabilitar reservas de clientes</DialogTitle>
          <div className="flex flex-col items-center w-full gap-5">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-orange-100">
              <span className="absolute inset-0 rounded-full bg-orange-200/40 animate-pulse" />
              <LuCalendarX size={30} className="text-primary relative" />
            </div>
            <div className="flex flex-col items-center gap-2 px-2">
              <h3 className="text-[17px] font-bold text-gray-900 text-center leading-snug">
                Deshabilitar reservas de clientes
              </h3>
              <p className="text-sm text-gray-500 text-center leading-relaxed">
                Tus clientes no van a poder reservar turnos en tu página pública hasta que las vuelvas a habilitar. Vos podés seguir creando turnos manualmente desde el panel.
              </p>
            </div>
            <div className="flex items-center w-full gap-2 mt-1">
              <button
                onClick={() => setDisableBookingsModal(false)}
                className="flex-1 h-10 rounded-lg text-sm font-semibold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setDisableBookingsModal(false);
                  persistBookingsEnabled(false);
                }}
                className="flex-1 h-10 rounded-lg text-sm font-semibold bg-primary hover:bg-orange-500 text-white shadow-sm transition-colors"
              >
                Deshabilitar
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={helpModal} onOpenChange={() => setHelpModal(false)}>
        <DialogContent className="sm:w-[600px] max-w-none w-[93vw] px-0 pb-0">
          <DialogTitle className="sr-only">Ayuda</DialogTitle>
          <HelpModal onClose={() => setHelpModal(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={cancelledModal} onOpenChange={setCancelledModal}>
        <DialogContent className="sm:w-[720px] max-w-none w-[93vw] max-h-[90dvh] overflow-y-auto">
          <DialogTitle className="sr-only">Turnos cancelados</DialogTitle>
          {cancelledModal && <CancelledAppointments businessID={businessData._id ?? ""} />}
        </DialogContent>
      </Dialog>

      {/*  Page layout  */}
      <div className="flex flex-col w-full gap-3 pb-16 md:pb-8">

        {/* Page header */}
        <div className="flex items-center justify-between gap-3 mt-5 2xl:mt-3 mb-0 2xl:mb-1">
          <h1 className="text-lg 2xl:text-xl font-semibold text-gray-800">Agenda de turnos</h1>

          {/* Mobile / tablet controls */}
          <div className="flex lg:hidden items-center gap-2 shrink-0">
            <button
              onClick={() => setHelpModal(true)}
              className="h-9 flex items-center gap-1.5 px-3 rounded-xl bg-orange-50 text-primary text-xs font-semibold hover:bg-orange-100 transition-colors shadow-sm"
            >
              <IoInformationCircle size={16} />
              Cómo usar
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-9 w-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-colors">
                  <IoMdMore size={20} className="text-gray-600" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={6} className="w-[272px] rounded-xl shadow-xl border-gray-100 p-1">
                <DropdownMenuItem
                  onSelect={handleSetAllDayAppointmentsModal}
                  className="gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-700 focus:bg-orange-50 focus:text-orange-700"
                >
                  <LuCalendarPlus size={16} className="text-orange-500 shrink-0" />
                  <span className="text-sm font-medium">Generar turnos del día</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem asChild className="gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-700 focus:bg-orange-50 focus:text-orange-700">
                  <Link href="/admin/schedule/automate">
                    <MdEditCalendar size={16} className="text-orange-500 shrink-0" />
                    <span className="text-sm font-medium">Automatizar agenda</span>
                  </Link>
                </DropdownMenuItem>
                {canViewCancelled && (
                  <>
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem
                      onSelect={() => setCancelledModal(true)}
                      className="gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-700 focus:bg-orange-50 focus:text-orange-700"
                    >
                      <LuCalendarX size={16} className="text-orange-500 shrink-0" />
                      <span className="text-sm font-medium">Turnos cancelados</span>
                    </DropdownMenuItem>
                  </>
                )}
                {canToggleBookings && (
                  <>
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        handleBookingsToggle(!bookingsEnabled);
                      }}
                      disabled={bookingsSaving}
                      className="gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-700 focus:bg-orange-50 focus:text-orange-700"
                    >
                      {bookingsEnabled
                        ? <LuCalendarX size={16} className="text-orange-500 shrink-0" />
                        : <LuCalendarCheck size={16} className="text-orange-500 shrink-0" />}
                      <span className="text-sm font-medium flex-1">{bookingsToggleLabel}</span>
                      <Switch
                        checked={bookingsEnabled}
                        onCheckedChange={handleBookingsToggle}
                        disabled={bookingsSaving}
                        aria-label={bookingsToggleLabel}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop controls */}
          <div className="hidden lg:flex items-center gap-4 shrink-0">
            {canToggleBookings && (
              <label className="flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer select-none">
                <Switch
                  checked={bookingsEnabled}
                  onCheckedChange={handleBookingsToggle}
                  disabled={bookingsSaving}
                  aria-label={bookingsToggleLabel}
                />
                {bookingsToggleLabel}
              </label>
            )}
            <button
              onClick={() => setHelpModal(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-500 transition-colors"
            >
              <IoInformationCircle size={17} />
              ¿Cómo agrego turnos?
            </button>
          </div>
        </div>

        {/* branch / employee filters — only rendered when each has 2+ options */}
        {(showBranchFilter || showEmployeeFilter) && (
          <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-5 lg:gap-y-2">
            {showBranchFilter && (
              <div className="flex items-center gap-2">
                <LuMapPin size={13} className="text-gray-400 shrink-0" />
                <span className="w-[72px] lg:w-auto text-xs font-medium text-gray-500 shrink-0">Sucursal</span>
                <Select
                  value={selectedBranchFilter ? selectedBranchFilter : ALL_FILTER_VALUE}
                  onValueChange={(value) => handleBranchFilterChange(value === ALL_FILTER_VALUE ? "" : value)}
                >
                  <SelectTrigger className="h-8 flex-1 min-w-0 lg:flex-none lg:w-auto rounded-md border border-gray-200 bg-[rgb(245,245,245)] px-2.5 text-xs font-medium text-gray-800 shadow-none transition-all duration-200 ease-in-out focus:ring-0 focus:ring-offset-0 hover:border-orange-600 focus-visible:border-orange-600 data-[state=open]:border-orange-600">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    <SelectItem
                      value={ALL_FILTER_VALUE}
                      className="cursor-pointer text-xs text-gray-700 focus:bg-orange-50 focus:text-orange-700 data-[state=checked]:font-medium data-[state=checked]:text-orange-700"
                    >
                      Todas
                    </SelectItem>
                    {activeBranches.map((b) => (
                      <SelectItem
                        key={b._id}
                        value={b._id ?? ""}
                        className="cursor-pointer text-xs text-gray-700 focus:bg-orange-50 focus:text-orange-700 data-[state=checked]:font-medium data-[state=checked]:text-orange-700"
                      >
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {showEmployeeFilter && (
              <div className="flex items-center gap-2">
                <LuUser size={13} className="text-gray-400 shrink-0" />
                <span className="w-[72px] lg:w-auto text-xs font-medium text-gray-500 shrink-0">Empleado</span>
                <Select
                  value={selectedEmployeeFilter ? selectedEmployeeFilter : ALL_FILTER_VALUE}
                  onValueChange={(value) => setSelectedEmployeeFilter(value === ALL_FILTER_VALUE ? "" : value)}
                >
                  <SelectTrigger className="h-8 flex-1 min-w-0 lg:flex-none lg:w-auto rounded-md border border-gray-200 bg-[rgb(245,245,245)] px-2.5 text-xs font-medium text-gray-800 shadow-none transition-all duration-200 ease-in-out focus:ring-0 focus:ring-offset-0 hover:border-orange-600 focus-visible:border-orange-600 data-[state=open]:border-orange-600">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    <SelectItem
                      value={ALL_FILTER_VALUE}
                      className="cursor-pointer text-xs text-gray-700 focus:bg-orange-50 focus:text-orange-700 data-[state=checked]:font-medium data-[state=checked]:text-orange-700"
                    >
                      Todos
                    </SelectItem>
                    {employeeFilterOptions.map((e) => (
                      <SelectItem
                        key={e._id}
                        value={e._id!}
                        className="cursor-pointer text-xs text-gray-700 focus:bg-orange-50 focus:text-orange-700 data-[state=checked]:font-medium data-[state=checked]:text-orange-700"
                      >
                        {e.surname ? `${e.name} ${e.surname}` : e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {/* date controls navbar  */}
        <div className="flex flex-col gap-2">

          {/* Desktop — navbar card */}
          <div className="hidden lg:flex items-center justify-between gap-2 bg-white rounded-xl border border-gray-100 shadow-sm">

            {/* LEFT: create all day appointments + cancelled history */}
            <div className="flex items-center gap-2 px-4 py-2 shrink-0">
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleSetAllDayAppointmentsModal}
                      aria-label="Generar turnos del día"
                      className="flex items-center gap-2 h-9 bg-primary hover:bg-orange-500 text-white text-xs font-semibold px-3.5 rounded-lg shadow-sm transition-colors duration-200"
                    >
                      <LuCalendarPlus size={15} className="shrink-0" />
                      <span className="hidden xl:inline 2xl:hidden">Generar turnos</span>
                      <span className="hidden 2xl:inline">Generar turnos del día</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[220px] text-center">
                    Creá múltiples turnos desde el principio al fin del día
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {canViewCancelled && (
                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setCancelledModal(true)}
                        aria-label="Turnos cancelados"
                        className="h-9 w-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-orange-300 hover:bg-orange-50 hover:text-primary transition-all duration-200 shrink-0"
                      >
                        <LuCalendarX size={16} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[220px] text-center">
                      Historial de turnos cancelados y devolución de señas
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            {/* CENTER: date navigation */}
            <div className="flex flex-1 min-w-0 items-center justify-center gap-2 px-2 py-2">
              <button
                onClick={() => goToDate(now.toDate())}
                disabled={dayjs(date).isSame(now, "day")}
                className="h-9 px-3 rounded-lg text-xs font-semibold border transition-all duration-200 shrink-0 text-gray-600 border-gray-200 bg-white hover:border-orange-300 hover:text-primary hover:bg-orange-50 disabled:text-gray-300 disabled:border-gray-100 disabled:bg-white disabled:hover:bg-white disabled:hover:text-gray-300 disabled:cursor-default"
              >
                Hoy
              </button>
              <div className="flex items-center gap-1 min-w-0">
                <button
                  onClick={onPrevClick}
                  className="h-9 w-9 flex items-center justify-center rounded-lg border border-orange-300 bg-orange-50 text-primary hover:border-primary hover:bg-orange-100 transition-all duration-200 shrink-0"
                  aria-label="Anterior"
                >
                  <LuChevronLeft size={17} />
                </button>
                <MonthCalendarPicker
                  date={date}
                  onSelect={goToDate}
                  appointmentDateSet={appointmentDateSet}
                  className="min-w-0 xl:min-w-[190px] justify-center shadow-sm"
                />
                <button
                  onClick={onNextClick}
                  className="h-9 w-9 flex items-center justify-center rounded-lg border border-orange-300 bg-orange-50 text-primary hover:border-primary hover:bg-orange-100 transition-all duration-200 shrink-0"
                  aria-label="Siguiente"
                >
                  <LuChevronRight size={17} />
                </button>
              </div>
            </div>

            {/* RIGHT: time-range controls */}
            <TimeRangeControls
              dayStart={selectedDaySchedule.dayStart}
              dayEnd={selectedDaySchedule.dayEnd}
              appointmentDuration={selectedDaySchedule.appointmentDuration}
              onDayStartChange={handleDayStartChange}
              onDayEndChange={handleDayEndChange}
              onDurationChange={handleDurationChange}
              className="justify-end px-4 py-2 shrink-0 flex-nowrap"
            />
          </div>

          {/* Mobile/tablet — grouped control panel */}
          <div className="flex flex-col gap-2.5 lg:hidden bg-white rounded-xl border border-gray-100 shadow-sm p-2.5">

            {/* Row 1: actions — Hoy + time range */}
            <div className="flex items-center flex-wrap gap-2">
              <button
                onClick={() => goToDate(now.toDate())}
                disabled={dayjs(date).isSame(now, "day")}
                className="h-9 px-3 rounded-lg text-xs font-semibold border transition-all duration-200 shrink-0 text-gray-600 border-gray-200 bg-white hover:border-orange-300 hover:text-primary hover:bg-orange-50 disabled:text-gray-300 disabled:border-gray-100 disabled:bg-white disabled:hover:bg-white disabled:hover:text-gray-300 disabled:cursor-default"
              >
                Hoy
              </button>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 [@media(hover:hover)]:hover:border-orange-300 [@media(hover:hover)]:hover:bg-orange-50 [@media(hover:hover)]:hover:text-primary active:border-orange-300 active:bg-orange-50 active:text-primary transition-all duration-200"
                  >
                    <LuClock size={14} className="text-gray-400 shrink-0" />
                    {String(selectedDaySchedule.dayStart).padStart(2, "0")}:00 – {String(selectedDaySchedule.dayEnd).padStart(2, "0")}:00
                    <span className="text-gray-300">·</span>
                    {selectedDaySchedule.appointmentDuration} min
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-64">
                  <TimeRangeControls
                    dayStart={selectedDaySchedule.dayStart}
                    dayEnd={selectedDaySchedule.dayEnd}
                    appointmentDuration={selectedDaySchedule.appointmentDuration}
                    onDayStartChange={handleDayStartChange}
                    onDayEndChange={handleDayEndChange}
                    onDurationChange={handleDurationChange}
                    className="flex-col items-stretch"
                    title="Rango horario"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="-mx-2.5 h-px bg-gray-100" />

            {/* Row 2: date navigation — arrows flank a full-width date */}
            <div className="flex items-center gap-2">
              <button
                onClick={onPrevClick}
                className="h-9 w-12 flex items-center justify-center rounded-lg border border-orange-300 bg-orange-50 text-primary [@media(hover:hover)]:hover:border-primary [@media(hover:hover)]:hover:bg-orange-100 active:border-primary active:bg-orange-100 transition-all duration-200 shrink-0"
                aria-label="Anterior"
              >
                <LuChevronLeft size={18} />
              </button>
              <MonthCalendarPicker
                date={date}
                onSelect={goToDate}
                appointmentDateSet={appointmentDateSet}
                className="flex-1 justify-center"
              />
              <button
                onClick={onNextClick}
                className="h-9 w-12 flex items-center justify-center rounded-lg border border-orange-300 bg-orange-50 text-primary [@media(hover:hover)]:hover:border-primary [@media(hover:hover)]:hover:bg-orange-100 active:border-primary active:bg-orange-100 transition-all duration-200 shrink-0"
                aria-label="Siguiente"
              >
                <LuChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/*  Calendar grid  */}
        <div
          ref={calendarCardRef}
          className="relative bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className={cn(
              "absolute inset-0 z-20 flex items-center justify-center md:hidden pointer-events-none transition-opacity duration-300",
              showSwipeHint ? "opacity-100" : "opacity-0"
            )}
            style={{ background: "rgba(243,244,246,0.72)", backdropFilter: "blur(2px)" }}
          >
            <div className="flex items-center gap-3 bg-white/80 border border-gray-200 rounded-2xl px-5 py-3 shadow-sm">
              <LuChevronLeft size={15} className="text-gray-400" />
              <span className="text-xs font-medium text-gray-500 tracking-wide">Deslizá para cambiar de día</span>
              <LuChevronRight size={15} className="text-gray-400" />
            </div>
          </div>

          <div
            key={dayjs(date).format("YYYY-MM-DD")}
            className={cn(
              "animate-in fade-in duration-200",
              swipeDir.current === "left"
                ? "slide-in-from-right-[50px]"
                : "slide-in-from-left-[50px]"
            )}
          >

          {/* Day header */}
          <div className="flex lg:hidden items-center gap-3 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
            <span
              className={cn(
                "text-sm font-semibold first-letter:uppercase",
                dayjs(date).isSame(now, "day") ? "text-primary" : "text-gray-700"
              )}
            >
              {dayjs(date).format("dddd D [de] MMMM")}
            </span>
            {dayjs(date).isSame(now, "day") && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-primary">
                Hoy
              </span>
            )}
          </div>

          {/* Scrollable time grid */}
          <div ref={gridRef} className="flex overflow-x-auto lg:overflow-y-auto lg:max-h-[65vh]">

            {/* Time gutter */}
            <div
              style={{ width: TIME_GUTTER, flexShrink: 0 }}
              className="border-r border-gray-100"
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

            {/* Day hour columns */}
            <div className="flex flex-1 min-w-0">
              {daysToShow.map((day, dayIdx) => {
                const dayEvents = getEventsForDay(day);
                const totalHeight = slots.length * HOUR_HEIGHT;

                return (
                  <div
                    key={dayIdx}
                    className="relative flex-1"
                  >
                    {/* Slot rows — one per appointment duration unit */}
                    {slots.map((slot) => (
                      <div
                        key={slot.index}
                        style={{ height: HOUR_HEIGHT }}
                        className={cn(
                          "relative hover:bg-orange-50/40 transition-colors duration-150 cursor-pointer group",
                          slot.isHourBoundary
                            ? "border-b border-gray-150"
                            : "border-b border-dashed border-gray-100"
                        )}
                        onClick={(e) => handleSlotClick(day, slot, e)}
                      >
                        {/* Hover hint */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <span className="text-xs text-orange-400 font-medium">
                            + Nuevo turno
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Current-time red line */}
                    {dayjs(day).isSame(now, "day") &&
                      (() => {
                        const nowMins = now.hour() * 60 + now.minute();
                        const top =
                          ((nowMins - selectedDaySchedule.dayStart * 60) /
                            selectedDaySchedule.appointmentDuration) *
                          HOUR_HEIGHT;
                        if (top < 0 || top > totalHeight) return null;
                        return (
                          <div
                            className="absolute left-0 right-0 flex items-center pointer-events-none z-10"
                            style={{ top }}
                          >
                            <div
                              className="w-2.5 h-2.5 rounded-full bg-orange-500 flex-shrink-0 shadow-sm"
                              style={{ marginLeft: -5 }}
                            />
                            <div className="flex-1 h-px bg-orange-500 opacity-80" />
                          </div>
                        );
                      })()}

                    {/* Appointment blocks — grouped into overlap clusters, rendered as flex rows */}
                    {computeClusters(dayEvents).map((cluster, clusterIdx) => {
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
                            const isBooked = event.status === "booked";
                            const offsetTop = Math.max(top, 0) - Math.max(minTop, 0);
                            const empName = getEmployeeName(event.employeeID);
                            const branchName = getBranchName(event.branchID);
                            const hasExtra = !!(empName || branchName);

                            return (
                              <div
                                key={event._id ?? eventIdx}
                                className={cn(
                                  "rounded-md overflow-hidden cursor-pointer transition-opacity duration-150 hover:opacity-80 select-none",
                                  isBooked
                                    ? "bg-orange-50 border-l-[3px] border-orange-400"
                                    : "bg-primary border-l-[3px] border-orange-800"
                                )}
                                style={{
                                  marginTop: offsetTop,
                                  height: Math.max(height - 2, 20),
                                  width: "fit-content",
                                  minWidth: 90,
                                  flexShrink: 0,
                                }}
                                onClick={(e) => handleSelectEvent(event, e)}
                              >
                                <div className="px-1.5 pt-1 pb-1 h-full flex flex-col min-h-0">
                                  <span
                                    className={cn(
                                      "text-xs font-semibold leading-tight whitespace-nowrap shrink-0",
                                      isBooked ? "text-orange-900" : "text-white"
                                    )}
                                  >
                                    {isBooked ? event.name : event.title ?? "Disponible"}
                                  </span>
                                  {height >= 36 && (
                                    <span
                                      className={cn(
                                        "text-[10px] leading-tight whitespace-nowrap shrink-0",
                                        isBooked ? "text-primary" : "text-orange-100"
                                      )}
                                    >
                                      {event.service}
                                    </span>
                                  )}
                                  {height >= 54 && (
                                    <span
                                      className={cn(
                                        "text-[10px] whitespace-nowrap shrink-0 tabular-nums",
                                        isBooked ? "text-orange-400" : "text-orange-200"
                                      )}
                                    >
                                      {dayjs(event.start).format("HH:mm")} –{" "}
                                      {dayjs(event.end).format("HH:mm")}
                                    </span>
                                  )}
                                  {height >= 70 && hasExtra && (
                                    <div
                                      className={cn(
                                        "flex items-center gap-1 mt-auto shrink-0 min-w-0",
                                        isBooked ? "text-orange-500" : "text-orange-300"
                                      )}
                                    >
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
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
          </div>
        </div>

        {/* Desktop footer */}
        <div className="hidden md:flex items-center justify-between mt-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-primary inline-block" />
                Disponible
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-orange-50 border-l-2 border-orange-400 inline-block" />
                Reservado
              </span>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default CalendarTurnos;
