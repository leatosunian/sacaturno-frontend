"use client";
import dayjs from "dayjs";
import "dayjs/locale/es-mx";
import { IAppointment } from "@/interfaces/appointment.interface";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AppointmentModal from "./AppointmentModal";
import { IBusiness } from "@/interfaces/business.interface";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import advanced from "dayjs/plugin/advancedFormat";
import { useRouter } from "next/navigation";
import CreateAppointmentModal from "./CreateAppointmentModal";
import { IService } from "@/interfaces/service.interface";
import NoServicesModal from "../services/NoServicesModal";
import ISubscription from "@/interfaces/subscription.interface";
import ExpiredPlanModal from "./ExpiredPlanModal";
import AllDayAppointmentsModal from "./AllDayAppointmentsModal";
import { LuCalendarPlus, LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { IoInformationCircle } from "react-icons/io5";
import { IoMdMore } from "react-icons/io";
import HelpModal from "./HelpModal";
import { MdEditCalendar } from "react-icons/md";
import { IDaySchedule } from "@/interfaces/daySchedule.interface";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";
import { timeOptions, durationOptions } from "@/helpers/timeOptions";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import axiosReq from "@/config/axios";
import { cn } from "@/lib/utils";

dayjs.locale("es-mx");
dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.extend(advanced);

const HOUR_HEIGHT = 57; // px per hour in the time grid
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
}) => {
  const now = dayjs();
  const [appointmentsData, setAppointmentsData] = useState<IAppointment[]>(appointments);
  const [business, setBusiness] = useState<IBusiness>(businessData);
  const [services, setServices] = useState<IService[]>(servicesData);
  const [eventModal, setEventModal] = useState(false);
  const [eventData, setEventData] = useState<CalendarEvent | undefined>();
  const [createAppointmentModal, setCreateAppointmentModal] = useState(false);
  const [createAppointmentData, setCreateAppointmentData] = useState<IAppointment>();
  const [createAppointmentTabMode, setCreateAppointmentTabMode] = useState<"pending" | "booked">("pending");
  const [allDayAppointmentsModal, setAllDayAppointmentsModal] = useState(false);
  const [helpModal, setHelpModal] = useState(false);
  const [date, setDate] = useState<Date>(now.toDate());
  const [expiredModal, setExpiredModal] = useState(false);
  const [dropdownActive, setDropdownActive] = useState(false);
  const [loadingNewAppointments, setLoadingNewAppointments] = useState(true);
  const [selectedDaySchedule, setSelectedDaySchedule] = useState({
    dayStart: 8,
    dayEnd: 22,
    appointmentDuration: 30,
  });
  const gridRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setAppointmentsData(appointments);
    setBusiness(businessData);
    setServices(servicesData);
  }, [appointments, businessData, servicesData]);

  useEffect(() => {
    setLoadingNewAppointments(false);
  }, []);

  const parsedEvents = useMemo<CalendarEvent[]>(() => {
    return appointmentsData.map((appt) => ({
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
    }));
  }, [appointmentsData]);

  const daysToShow = useMemo<Date[]>(() => [date], [date]);

  // Effect 1: When the selected day changes, reset the time-range and duration
  // to match that weekday's configured schedule.
  useEffect(() => {
    if (!scheduleDays.length) return;
    const schedule = scheduleDays.find(
      (s) => s.day === DAY_MAP[dayjs(date).day()] && s.enabled
    );
    if (!schedule) return;

    // Use the longest service duration as the appointment duration so every service
    // can fit in a single slot by default.
    const longestDuration = services.reduce(
      (max, s) => Math.max(max, s.duration ?? 0),
      0
    );

    setSelectedDaySchedule({
      dayStart: schedule.dayStart,
      dayEnd: schedule.dayEnd,
      appointmentDuration: longestDuration > 0 ? longestDuration : schedule.appointmentDuration,
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

  const hours = useMemo(
    () =>
      Array.from(
        { length: selectedDaySchedule.dayEnd - selectedDaySchedule.dayStart },
        (_, i) => selectedDaySchedule.dayStart + i
      ),
    [selectedDaySchedule.dayStart, selectedDaySchedule.dayEnd]
  );

  const getEventsForDay = useCallback(
    (day: Date): CalendarEvent[] => {
      const dayStr = dayjs(day).format("YYYY-MM-DD");
      return parsedEvents.filter((e) => dayjs(e.start).format("YYYY-MM-DD") === dayStr);
    },
    [parsedEvents]
  );

  const getEventTop = (event: CalendarEvent): number => {
    const h = dayjs(event.start).hour() + dayjs(event.start).minute() / 60;
    return (h - selectedDaySchedule.dayStart) * HOUR_HEIGHT;
  };

  const getEventHeight = (event: CalendarEvent): number => {
    const mins = dayjs(event.end).diff(dayjs(event.start), "minute");
    return Math.max((mins / 60) * HOUR_HEIGHT, 22);
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
    } catch {
      setAppointmentsData((prev) => prev.filter((a) => a._id !== tempId));
      toast.error("No se pudo crear el turno", { id: toastId, position: "top-center" });
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

  // ─── Time gutter + click → open create modal at exact hour ─────────────

  const handleTimeGutterPlusClick = (hour: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (subscriptionData?.subscriptionType === "SC_EXPIRED") {
      setExpiredModal(true);
      return;
    }
    const day = daysToShow[0];
    const { appointmentDuration } = selectedDaySchedule;
    const start = dayjs(day).hour(hour).minute(0).second(0).millisecond(0).toDate();
    const end = dayjs(start).add(appointmentDuration, "minute").toDate();
    setCreateAppointmentTabMode("pending");
    setCreateAppointmentData({ businessID: business?._id, start, end, service: "" });
    setCreateAppointmentModal(true);
  };

  // ─── Slot click → open create modal with snapped time ────────────────────

  const handleSlotClick = (
    day: Date,
    hour: number,
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    if (subscriptionData?.subscriptionType === "SC_EXPIRED") {
      setExpiredModal(true);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const rawMinute = Math.floor((relativeY / HOUR_HEIGHT) * 60);
    const { appointmentDuration } = selectedDaySchedule;
    const snappedMinute =
      Math.floor(rawMinute / appointmentDuration) * appointmentDuration;

    const start = dayjs(day)
      .hour(hour)
      .minute(snappedMinute)
      .second(0)
      .millisecond(0)
      .toDate();
    const end = dayjs(start).add(appointmentDuration, "minute").toDate();

    setCreateAppointmentTabMode("pending");
    setCreateAppointmentData({ businessID: business?._id, start, end, service: "" });
    setCreateAppointmentModal(true);
  };

  // ─── Event click ──────────────────────────────────────────────────────────

  const handleSelectEvent = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    const matchedService = services.find((s) => s.name === event.service);
    setEventData({ ...event, depositAmount: matchedService?.depositAmount });
    setEventModal(true);
  };

  // ─── Navigation ───────────────────────────────────────────────────────────

  const onNextClick = () =>
    setDate((prev) => dayjs(prev).add(1, "day").toDate());

  const onPrevClick = () =>
    setDate((prev) => dayjs(prev).subtract(1, "day").toDate());

  const dateLabel = useMemo(
    () => dayjs(date).format("dddd D [de] MMMM"),
    [date]
  );

  const handleSetAllDayAppointmentsModal = () => {
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
        <DialogContent className="sm:w-[400px] w-[93vw]">
          <AllDayAppointmentsModal
            business={business}
            services={services}
            date={date}
            selectedDay={selectedDaySchedule}
            onSave={handleSaveDayAppointments}
            closeModalF={() => setAllDayAppointmentsModal(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={eventModal} onOpenChange={() => setEventModal(false)}>
        <DialogContent className="md:w-[700px] w-[93vw] ">
          <AppointmentModal
            appointment={eventData}
            onDelete={handleDeleteAppointment}
            closeModalF={() => setEventModal(false)}
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
          <CreateAppointmentModal
            onSave={handleSaveAppointment}
            closeModalF={() => setCreateAppointmentModal(false)}
            appointmentData={createAppointmentData}
            servicesData={services}
            tabMode={createAppointmentTabMode}
            onTabModeChange={setCreateAppointmentTabMode}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={servicesData.length === 0}>
        <DialogContent className="sm:w-[460px] w-[93vw]">
          <NoServicesModal />
        </DialogContent>
      </Dialog>

      <Dialog open={expiredModal} onOpenChange={() => setExpiredModal(false)}>
        <DialogContent className="sm:w-[460px] w-[93vw]">
          <ExpiredPlanModal
            onCloseModal={() => setExpiredModal(false)}
            businessData={business}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={helpModal} onOpenChange={() => setHelpModal(false)}>
        <DialogContent className="sm:w-[600px] max-w-none w-[93vw] px-0 pb-0">
          <HelpModal onClose={() => setHelpModal(false)} />
        </DialogContent>
      </Dialog>

      {/*  Mobile dropdown (top right)  */}
      <div className="absolute top-20 right-4 flex flex-col md:hidden z-40">
        <button
          onClick={() => setDropdownActive(!dropdownActive)}
          className="p-1 rounded-md hover:bg-gray-100 transition-colors"
        >
          <IoMdMore size={24} className="text-gray-600" />
        </button>
        {dropdownActive && (
          <div className="absolute right-0 top-9 bg-white border border-gray-100 rounded-xl shadow-xl py-1 min-w-[200px]">
            <Link
              href="/admin/schedule/automate"
              className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setDropdownActive(false)}
            >
              <MdEditCalendar size={16} className="text-gray-400" />
              Configurar agenda
            </Link>
            <button
              onClick={() => {
                handleSetAllDayAppointmentsModal();
                setDropdownActive(false);
              }}
              className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-50 transition-colors"
            >
              <LuCalendarPlus size={16} className="text-gray-400" />
              Crear turnos del día
            </button>
            <button
              onClick={() => {
                setHelpModal(true);
                setDropdownActive(false);
              }}
              className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-50 transition-colors"
            >
              <IoInformationCircle size={16} className="text-gray-400" />
              Tutorial de uso
            </button>
          </div>
        )}
      </div>

      {/*  Page layout  */}
      <div className="flex flex-col w-full gap-3 pb-16 md:pb-8">

        {/* Page header */}
        <div className="flex items-center justify-between mt-5 2xl:mt-6 mb-0 2xl:mb-1">
          <h1 className="text-lg 2xl:text-xl font-semibold text-gray-800">Agenda de turnos</h1>
          <button
            onClick={() => setHelpModal(true)}
            className="hidden md:flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-500 transition-colors"
          >
            <IoInformationCircle size={17} />
            ¿Cómo agrego turnos?
          </button>
        </div>

        {/* date controls navbar  */}
        <div className="flex flex-col gap-2">

          {/* Desktop — navbar card */}
          <div className="hidden lg:grid lg:grid-cols-3 py-1 items-center bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden">

            {/* LEFT: create all day appointments button */}
            <div className="flex items-center px-4 py-1 border-r border-gray-100">
              <button
                onClick={handleSetAllDayAppointmentsModal}
                className="flex items-center gap-1.5 h-9 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-3 rounded-lg transition-colors duration-200"
              >
                <LuCalendarPlus size={14} />
                Crear turnos del día
              </button>
            </div>

            {/* CENTER: date navigation */}
            <div className="flex items-center justify-center gap-4 px-4 py-1 border-r border-gray-100">
              <button
                onClick={onPrevClick}
                className="h-9 w-9 flex items-center justify-center rounded-lg bg-orange-600 hover:bg-orange-700 transition-colors text-white shrink-0"
                aria-label="Anterior"
              >
                <LuChevronLeft size={16} />
              </button>
              <span className="min-w-[180px] text-center capitalize text-[15px] 2xl:text-base font-semibold text-gray-700 px-1 truncate">
                {dateLabel}
              </span>
              <button
                onClick={onNextClick}
                className="h-9 w-9 flex items-center justify-center rounded-lg bg-orange-600 hover:bg-orange-700 transition-colors text-white shrink-0"
                aria-label="Siguiente"
              >
                <LuChevronRight size={16} />
              </button>
            </div>

            {/* RIGHT: time-range controls */}
            <div className="flex items-end justify-end gap-2 px-4 py-1">
              <div className="flex flex-col gap-0.5">
                <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                  Desde
                </label>
                <select
                  value={selectedDaySchedule.dayStart}
                  onChange={(e) =>
                    setSelectedDaySchedule((prev) => ({
                      ...prev,
                      dayStart: Number(e.target.value),
                    }))
                  }
                  className="h-6 rounded-lg border border-gray-200 bg-gray-50 px-2 text-xs text-gray-700 hover:border-orange-600 focus:border-orange-600 focus:outline-none transition-colors cursor-pointer"
                >
                  {timeOptions.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-0.5">
                <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                  Hasta
                </label>
                <select
                  value={selectedDaySchedule.dayEnd}
                  onChange={(e) =>
                    setSelectedDaySchedule((prev) => ({
                      ...prev,
                      dayEnd: Number(e.target.value),
                    }))
                  }
                  className="h-6 rounded-lg border border-gray-200 bg-gray-50 px-2 text-xs text-gray-700 hover:border-orange-600 focus:border-orange-600 focus:outline-none transition-colors cursor-pointer"
                >
                  {timeOptions.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-0.5">
                <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                  Duración
                </label>
                <select
                  value={selectedDaySchedule.appointmentDuration}
                  onChange={(e) =>
                    setSelectedDaySchedule((prev) => ({
                      ...prev,
                      appointmentDuration: Number(e.target.value),
                    }))
                  }
                  className="h-6 rounded-lg border border-gray-200 bg-gray-50 px-2 text-xs text-gray-700 hover:border-orange-600 focus:border-orange-600 focus:outline-none transition-colors cursor-pointer"
                >
                  {durationOptions.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Mobile — compact inline row */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <span className="text-xs font-medium text-gray-400 shrink-0">De</span>
            <select
              value={selectedDaySchedule.dayStart}
              onChange={(e) =>
                setSelectedDaySchedule((prev) => ({
                  ...prev,
                  dayStart: Number(e.target.value),
                }))
              }
              className="flex-1 h-7 rounded-lg border border-gray-200 bg-gray-50 px-2 text-xs text-gray-700 hover:border-orange-600 focus:border-orange-600 focus:outline-none transition-colors cursor-pointer min-w-0"
            >
              {timeOptions.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <span className="text-xs font-medium text-gray-400 shrink-0">a</span>
            <select
              value={selectedDaySchedule.dayEnd}
              onChange={(e) =>
                setSelectedDaySchedule((prev) => ({
                  ...prev,
                  dayEnd: Number(e.target.value),
                }))
              }
              className="flex-1 h-7 rounded-lg border border-gray-200 bg-gray-50 px-2 text-xs text-gray-700 hover:border-orange-600 focus:border-orange-600 focus:outline-none transition-colors cursor-pointer min-w-0"
            >
              {timeOptions.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <span className="text-xs text-gray-300 shrink-0">·</span>
            <select
              value={selectedDaySchedule.appointmentDuration}
              onChange={(e) =>
                setSelectedDaySchedule((prev) => ({
                  ...prev,
                  appointmentDuration: Number(e.target.value),
                }))
              }
              className="flex-1 h-7 rounded-lg border border-gray-200 bg-gray-50 px-2 text-xs text-gray-700 hover:border-orange-600 focus:border-orange-600 focus:outline-none transition-colors cursor-pointer min-w-0"
            >
              {durationOptions.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/*  Calendar grid  */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">

          {/* Day header */}
          <div className="flex lg:hidden items-center gap-3 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
            <span
              className={cn(
                "text-sm font-semibold capitalize",
                dayjs(date).isSame(now, "day") ? "text-orange-600" : "text-gray-700"
              )}
            >
              {dayjs(date).format("dddd D [de] MMMM")}
            </span>
            {dayjs(date).isSame(now, "day") && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
                Hoy
              </span>
            )}
          </div>

          {/* Scrollable time grid */}
          <div ref={gridRef} className="flex overflow-y-auto" style={{ maxHeight: "65vh" }}>

            {/* Time gutter */}
            <div
              style={{ width: TIME_GUTTER, flexShrink: 0 }}
              className="border-r border-gray-100"
            >
              {hours.map((h) => (
                <div
                  key={h}
                  style={{ height: HOUR_HEIGHT }}
                  className="flex flex-col items-center pt-1.5 gap-0 justify-center"
                >
                  <span className="text-xs text-gray-400 select-none tabular-nums">
                    {String(h).padStart(2, "0")}:00
                  </span>
                  <button
                    onClick={(e) => handleTimeGutterPlusClick(h, e)}
                    className="w-5 h-5 flex items-center justify-center rounded-full text-orange-500 hover:text-white hover:bg-orange-500 transition-colors duration-150 text-sm font-bold leading-none select-none"
                    aria-label={`Agregar turno a las ${h}:00`}
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
                const totalHeight = hours.length * HOUR_HEIGHT;

                return (
                  <div
                    key={dayIdx}
                    className="relative flex-1"
                  >
                    {/* Hour slot rows — clickable */}
                    {hours.map((h) => (
                      <div
                        key={h}
                        style={{ height: HOUR_HEIGHT }}
                        className="relative border-b border-gray-150 hover:bg-orange-50/40 transition-colors duration-150 cursor-pointer group"
                        onClick={(e) => handleSlotClick(day, h, e)}
                      >
                        {/* Half-hour divider */}
                        <div
                          className="absolute left-0 right-0 border-b border-dashed border-gray-50 pointer-events-none"
                          style={{ top: "50%" }}
                        />
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
                        const currentFraction =
                          now.hour() + now.minute() / 60;
                        const top =
                          (currentFraction - selectedDaySchedule.dayStart) *
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

                            return (
                              <div
                                key={event._id ?? eventIdx}
                                className={cn(
                                  "rounded-md overflow-hidden cursor-pointer transition-opacity duration-150 hover:opacity-80 select-none",
                                  isBooked
                                    ? "bg-orange-50 border-l-[3px] border-orange-400"
                                    : "bg-orange-600 border-l-[3px] border-orange-800"
                                )}
                                style={{
                                  marginTop: offsetTop,
                                  height: Math.max(height - 2, 20),
                                  width: "fit-content",
                                  minWidth: 80,
                                  flexShrink: 0,
                                }}
                                onClick={(e) => handleSelectEvent(event, e)}
                              >
                                <div className="px-1.5 pt-1 pb-1 h-full flex flex-col min-h-0">
                                  <span
                                    className={cn(
                                      "text-xs font-semibold leading-tight whitespace-nowrap mb-0.5 shrink-0",
                                      isBooked ? "text-orange-900" : "text-white"
                                    )}
                                  >
                                    {isBooked ? event.name : event.title ?? "Disponible"}
                                  </span>
                                  {height >= 36 && (
                                    <span
                                      className={cn(
                                        "text-[10px] sm:text-[10px] leading-tight whitespace-nowrap shrink-0",
                                        isBooked ? "text-orange-600" : "text-orange-100"
                                      )}
                                    >
                                      {event.service}
                                    </span>
                                  )}
                                  {height >= 52 && (
                                    <span
                                      className={cn(
                                        "text-[10px] mt-auto whitespace-nowrap shrink-0",
                                        isBooked ? "text-orange-500" : "text-orange-200"
                                      )}
                                    >
                                      {dayjs(event.start).format("HH:mm")} –{" "}
                                      {dayjs(event.end).format("HH:mm")}
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
                );
              })}
            </div>
          </div>
        </div>

        {/* Desktop footer */}
        <div className="hidden md:flex items-center justify-between mt-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-orange-600 inline-block" />
                Disponible
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-orange-50 border-l-2 border-orange-400 inline-block" />
                Reservado
              </span>
            </div>
          </div>
          <Link
            href="/admin/schedule/automate"
            className="flex items-center gap-2 text-xs font-semibold uppercase text-orange-600 hover:text-orange-700 transition-colors duration-200"
          >
            Configuración de agenda <FaArrowRight size={11} />
          </Link>
        </div>

        {/* Mobile bottom navigation */}
        <div className="fixed bottom-4 left-0 right-0 flex justify-center z-40 md:hidden">
          <div className="flex rounded-xl shadow-lg overflow-hidden">
            <button
              onClick={onPrevClick}
              className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 transition-colors"
            >
              <LuChevronLeft size={16} />
              Anterior
            </button>
            <div className="w-px bg-orange-500" />
            <button
              onClick={onNextClick}
              className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 transition-colors"
            >
              Siguiente
              <LuChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CalendarTurnos;
