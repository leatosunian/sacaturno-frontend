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
import { LuSave } from "react-icons/lu";
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
import { timeOptions } from "@/helpers/timeOptions";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

dayjs.locale("es-mx");
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advanced);

const HOUR_HEIGHT = 57;
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
}

const AutomateSchedule: React.FC<Props> = ({
  businessData,
  servicesData,
  subscriptionData,
  daysAndAppointments,
}) => {
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
  const gridRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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

  const handleSelectAppointmentDuration: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    setSelectedAppointmentDuration(Number(e.target.value));
    editDaySchedule({
      day: selectedDay.dayName,
      dayStart: selectedDayStart,
      dayEnd: selectedDayEnd,
      appointmentDuration: Number(e.target.value),
    });
  };

  const handleSelectDayStart: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const val = Number(e.target.value);
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

  const handleSelectDayEnd: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const val = Number(e.target.value);
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

  const saveChanges = async () => {
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
      if (daysChanged.length > 0) saveModifiedScheduleDays();
      setAlert({ msg: "Cambios guardados con éxito", error: true, alertType: "OK_ALERT" });
      hideAlert();
      setLoadingButton(false);
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

  const totalHeight = slots.length * HOUR_HEIGHT;

  // ── Render ───────────────────────────────────────────────────────────────

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

      {/* ── Dialogs ── */}
      <Dialog open={subscriptionData?.subscriptionType === "SC_EXPIRED"}>
        <DialogContent className="sm:w-[460px] w-[93vw]">
          <ExpiredPlanModal onCloseModal={() => setExpiredModal(false)} businessData={business} />
        </DialogContent>
      </Dialog>

      <Dialog open={eventModal} onOpenChange={() => setEventModal(false)}>
        <DialogContent className="sm:w-[400px] w-[93vw]">
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
          />
        </DialogContent>
      </Dialog>

      <Dialog open={createAppointmentModal} onOpenChange={() => setCreateAppointmentModal(false)}>
        <DialogContent className="sm:w-[400px] w-[93vw]">
          <CreateScheduleAppointmentModal
            onNewAppointment={(newAppt) => {
              setSelectedDayAppointments([...selectedDayAppointments!, newAppt]);
              setAppointmentsSchedule([...appointmentsSchedule!, newAppt]);
            }}
            appointmentData={createAppointmentData}
            servicesData={services}
            closeModalF={() => setCreateAppointmentModal(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={servicesData.length === 0}>
        <DialogContent className="sm:w-[460px] w-[93vw]">
          <NoServicesModal />
        </DialogContent>
      </Dialog>

      <Dialog open={expiredModal} onOpenChange={() => setExpiredModal(false)}>
        <DialogTitle />
        <DialogContent className="sm:w-[400px] w-[93vw]">
          <ExpiredPlanModal onCloseModal={() => setExpiredModal(false)} businessData={business} />
        </DialogContent>
      </Dialog>


      <Dialog open={tutorialModal} onOpenChange={() => setTutorialModal(false)}>
        <DialogContent className="sm:w-[460px] md:w-[700px] w-[93vw]">
          <TutorialAutomateModal onClose={() => setTutorialModal(false)} />
        </DialogContent>
      </Dialog>

      {/* ── Page layout ── */}
      <div className="flex flex-col w-full gap-5 pb-24 md:pb-10">

        {/* Page header */}
        <div className="flex items-center justify-between mt-4 xl:mt-7">
          <div className="flex items-center gap-3">
            <h1 className="text-lg 2xl:text-xl font-semibold text-gray-800">Automatizar agenda</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Tutorial button — visible on both mobile and desktop */}
            <button
              onClick={() => setTutorialModal(true)}
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs font-semibold transition-colors duration-200"
              title="Ver tutorial paso a paso"
            >
              <LuBookOpen size={14} />
              <span>Tutorial</span>
            </button>

            {!loadingButton ? (
              <button
                onClick={saveChanges}
                className="hidden md:flex items-center gap-1.5 h-9 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-4 rounded-lg transition-colors duration-200"
              >
                <LuSave size={14} />
                Guardar cambios
              </button>
            ) : (
              <div className="hidden md:flex items-center justify-center w-32 h-9">
                <div className="loaderSmall" />
              </div>
            )}
          </div>
        </div>

        {/* ── Card 1: Automatic schedule config ── */}
        <Card className="p-5 md:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-semibold text-gray-800">
                Frecuencia y cantidad de días
              </h2>
              <p className="text-sm text-gray-500">
                Activá la agenda automática para que los turnos se generen sin intervención manual.
              </p>
            </div>

            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <FaCircleInfo size={13} className="text-blue-400 mt-0.5 shrink-0" />
              <p className="text-sm text-blue-500 leading-relaxed">
                Ingresá la cantidad de días que querés crear turnos y cuántos días antes del último
                turno querés que se vuelvan a generar los turnos programados.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {/* Toggle */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-600">
                  Crear turnos automáticamente
                </label>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedAutomaticSchedule(!selectedAutomaticSchedule)}
                    className={cn(
                      "relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-200 focus:outline-none shrink-0",
                      selectedAutomaticSchedule ? "bg-orange-600" : "bg-gray-200"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                        selectedAutomaticSchedule ? "translate-x-5" : "translate-x-0.5"
                      )}
                    />
                  </button>
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      selectedAutomaticSchedule ? "text-gray-800" : "text-gray-400"
                    )}
                  >
                    {selectedAutomaticSchedule ? "Activado" : "Desactivado"}
                  </span>
                </div>
              </div>

              {/* Days to create */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-600">
                  Días con turnos disponibles
                </label>
                <select
                  value={selectedDaysToCreate}
                  onChange={(e) => setSelectedDaysToCreate(Number(e.target.value))}
                  className="h-8 rounded-md border border-gray-200 bg-[rgb(235,235,235)] px-3 text-sm text-gray-700 hover:border-orange-600 focus:border-orange-600 focus:outline-none transition-all duration-200 cursor-pointer"
                >
                  <option value="7">Crear 7 días</option>
                  <option value="15">Crear 15 días</option>
                  <option value="30">Crear 30 días</option>
                </select>
              </div>

              {/* Anticipation */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-600">
                  ¿Con qué anticipación crear turnos?
                </label>
                <select
                  value={selectedAnticipation}
                  onChange={(e) => setSelectedAnticipation(Number(e.target.value))}
                  className="h-8 rounded-md border border-gray-200 bg-[rgb(235,235,235)] px-3 text-sm text-gray-700 hover:border-orange-600 focus:border-orange-600 focus:outline-none transition-all duration-200 cursor-pointer"
                >
                  {Array.from({ length: 16 }, (_, i) => (
                    <option key={i} value={i}>
                      {i === 0 ? "0 días antes" : `${i} ${i === 1 ? "día" : "días"} antes`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status messages */}
            {selectedAutomaticSchedule && businessData.automaticSchedule && (
              <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-100">
                <FaCircleInfo size={13} className="text-orange-500 shrink-0" />
                <span className="text-xs font-medium text-orange-700">
                  Tus próximos turnos se crearán el{" "}
                  {dayjs(businessData.scheduleEnd)
                    .subtract(businessData.scheduleAnticipation, "day")
                    .format("dddd DD/MM")}
                  .
                </span>
              </div>
            )}
            {selectedAutomaticSchedule && !businessData.automaticSchedule && (
              <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-100">
                <FaCircleInfo size={13} className="text-orange-500 shrink-0" />
                <span className="text-xs font-medium text-orange-700">
                  A partir de hoy se crearán turnos durante {selectedDaysToCreate} días.{" "}
                  {selectedAnticipation} {selectedAnticipation === 1 ? "día" : "días"} antes del
                  último turno, se volverá a generar tu agenda.
                </span>
              </div>
            )}
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
                  Por cada día de la semana, configurá el horario y agregá los turnos y servicios.
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
              {daysOfWeek.map((day) => (
                <button
                  key={day.dayName}
                  onClick={() => handleSelectDay(day)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200",
                    selectedDay.dayName === day.dayName
                      ? "bg-orange-600 border-orange-600 text-white shadow-sm"
                      : "border-gray-200 text-gray-600 hover:border-orange-600 hover:text-orange-600 bg-white"
                  )}
                >
                  {day.dayName}
                </button>
              ))}
            </div>

            {/* Time controls */}
            <div className="flex items-end gap-3 flex-wrap border-t border-gray-50 pt-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Desde
                </label>
                <select
                  value={selectedDayStart}
                  onChange={handleSelectDayStart}
                  className="h-8 rounded-md border border-gray-200 bg-gray-50 px-2 text-xs text-gray-700 hover:border-orange-600 focus:border-orange-600 focus:outline-none transition-colors duration-200 cursor-pointer"
                >
                  {timeOptions.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Hasta
                </label>
                <select
                  value={selectedDayEnd}
                  onChange={handleSelectDayEnd}
                  className="h-8 rounded-md border border-gray-200 bg-gray-50 px-2 text-xs text-gray-700 hover:border-orange-600 focus:border-orange-600 focus:outline-none transition-colors duration-200 cursor-pointer"
                >
                  {timeOptions.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Duración
                </label>
                <select
                  value={selectedAppointmentDuration}
                  onChange={handleSelectAppointmentDuration}
                  className="h-8 rounded-md border border-gray-200 bg-gray-50 px-2 text-xs text-gray-700 hover:border-orange-600 focus:border-orange-600 focus:outline-none transition-colors duration-200 cursor-pointer"
                >
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">1 h</option>
                  <option value="75">1:15 hs</option>
                  <option value="90">1:30 hs</option>
                  <option value="105">1:45 hs</option>
                  <option value="120">2 hs</option>
                </select>
              </div>

              <span className="text-xs text-gray-400 mb-1.5 hidden sm:block">
                Hacé clic en un horario para agregar un turno
              </span>
            </div>

            {/* Calendar grid */}
            <div className="rounded-xl border border-gray-100 overflow-hidden">

              {/* Day header */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
                <span className="text-xs font-semibold capitalize text-orange-600">
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
              <div ref={gridRef} className="flex overflow-y-auto" style={{ maxHeight: "60vh" }}>

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
                          return (
                            <div
                              key={event._id ?? eventIdx}
                              style={{
                                marginTop: offsetTop,
                                height: Math.max(height - 2, 20),
                                width: "fit-content",
                                minWidth: 80,
                                flexShrink: 0,
                              }}
                              className="rounded-md bg-orange-600 border-l-[3px] border-orange-800 cursor-pointer hover:opacity-80 transition-opacity duration-150 overflow-hidden select-none"
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
                                  <span className="text-xs text-orange-100 leading-tight whitespace-nowrap shrink-0 tabular-nums">
                                    {dayjs(event.start).format("HH:mm")} –{" "}
                                    {dayjs(event.end).format("HH:mm")}
                                  </span>
                                )}
                                {height >= 52 && event.price > 0 && (
                                  <span className="text-xs text-orange-200 mt-auto whitespace-nowrap shrink-0">
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
                  <span className="w-3 h-3 rounded-sm bg-orange-600 border-l-2 border-orange-800 inline-block" />
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

      {/* Mobile bottom save bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-200 p-4">
        {!loadingButton ? (
          <button
            onClick={saveChanges}
            className="flex items-center justify-center gap-1.5 w-full h-11 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition-colors duration-200"
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
