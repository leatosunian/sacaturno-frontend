"use client";
import dayjs from "dayjs";
import "dayjs/locale/es-mx";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { IBusiness } from "@/interfaces/business.interface";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import advanced from "dayjs/plugin/advancedFormat";
import { useRouter } from "next/navigation";
import { IService } from "@/interfaces/service.interface";
import NoServicesModal from "../services/NoServicesModal";
import ISubscription from "@/interfaces/subscription.interface";
import ExpiredPlanModal from "./ExpiredPlanModal";
import { LuSave, LuUser, LuMapPin, LuZap, LuCalendarDays, LuTimer, LuCalendarCog, LuActivity, LuArrowRight } from "react-icons/lu";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSidebar } from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  { dayName: "LUN", fullName: "lunes", dayNumber: 1 },
  { dayName: "MAR", fullName: "martes", dayNumber: 2 },
  { dayName: "MIE", fullName: "miércoles", dayNumber: 3 },
  { dayName: "JUE", fullName: "jueves", dayNumber: 4 },
  { dayName: "VIE", fullName: "viernes", dayNumber: 5 },
  { dayName: "SAB", fullName: "sábado", dayNumber: 6 },
  { dayName: "DOM", fullName: "domingo", dayNumber: 0 },
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

type DayBaseline = Record<
  string,
  { dayStart: number; dayEnd: number; appointmentDuration: number }
>;

// Reconcilia el dayStart/dayEnd de cada día con sus turnos guardados.
// Por qué: si el usuario amplió la ventana (9→8), creó un turno a las 8:00
// (que se persiste solo) y nunca guardó el cambio de ventana, la DB queda con
// dayStart=9 y un turno a las 8:00. Renderizar eso clavaría la tarjeta de las
// 8:00 en la fila de las 9:00 por el Math.max(minTop, 0) del layout de clusters.
const reconcileDays = (
  days: IDaySchedule[],
  appointments: IAppointmentSchedule[]
): IDaySchedule[] => {
  const apptsByDay = new Map<string, IAppointmentSchedule[]>();
  appointments.forEach((a) => {
    const list = apptsByDay.get(a.day);
    if (list) list.push(a);
    else apptsByDay.set(a.day, [a]);
  });

  return days.map((d) => {
    const appts = apptsByDay.get(d.day);
    if (!appts?.length) return d;
    const earliestHour = Math.min(...appts.map((a) => dayjs(a.start).hour()));
    const latestHour = Math.max(
      ...appts.map((a) => {
        const end = dayjs(a.end);
        return end.hour() + (end.minute() > 0 ? 1 : 0);
      })
    );
    const dayStart = Math.min(d.dayStart, earliestHour);
    const dayEnd = Math.max(d.dayEnd, latestHour);
    if (dayStart === d.dayStart && dayEnd === d.dayEnd) return d;
    return { ...d, dayStart, dayEnd };
  });
};

const toDayBaseline = (days: IDaySchedule[]): DayBaseline =>
  Object.fromEntries(
    days.map((d) => [
      d.day,
      {
        dayStart: d.dayStart,
        dayEnd: d.dayEnd,
        appointmentDuration: d.appointmentDuration,
      },
    ])
  );

// Fuera del componente a propósito: sobrevive al desmontaje cuando se navega a
// otra ruta y sólo se resetea con una recarga real del navegador, donde los
// datos del servidor ya llegan frescos.
let visitedThisSession = false;

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
  const [eventModal, setEventModal] = useState(false);
  const [eventData, setEventData] = useState<IAppointmentSchedule | undefined>();
  const [createAppointmentModal, setCreateAppointmentModal] = useState(false);
  const [createAppointmentData, setCreateAppointmentData] = useState<IAppointmentSchedule>();
  const [tutorialModal, setTutorialModal] = useState(false);
  const [expiredModal, setExpiredModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<{ dayName: string; dayNumber: number }>({
    dayName: "LUN",
    dayNumber: 1,
  });
  const [selectedAnticipation, setSelectedAnticipation] = useState<number>(
    businessData.scheduleAnticipation
  );
  const [selectedDaysToCreate, setSelectedDaysToCreate] = useState<number>(
    businessData.scheduleDaysToCreate
  );
  const [selectedAutomaticSchedule, setSelectedAutomaticSchedule] = useState<boolean>(
    businessData.automaticSchedule
  );
  const [daysSchedule, setDaysSchedule] = useState<IDaySchedule[]>(() =>
    reconcileDays(daysAndAppointments.days, daysAndAppointments.appointments)
  );
  const [appointmentsSchedule, setAppointmentsSchedule] = useState<IAppointmentSchedule[]>(
    daysAndAppointments.appointments
  );
  // Última verdad conocida del servidor. Es la referencia contra la que se mide
  // "hay cambios sin guardar", y se rebasea tanto al guardar como cuando llegan
  // props nuevas — por eso la vista ya no depende de un F5.
  const [savedConfig, setSavedConfig] = useState({
    automaticSchedule: businessData.automaticSchedule,
    scheduleDaysToCreate: businessData.scheduleDaysToCreate,
    scheduleAnticipation: businessData.scheduleAnticipation,
  });
  const [savedDays, setSavedDays] = useState<DayBaseline>(() =>
    toDayBaseline(reconcileDays(daysAndAppointments.days, daysAndAppointments.appointments))
  );
  const [loadingButton, setLoadingButton] = useState(false);
  const [leaveModal, setLeaveModal] = useState(false);
  const [isRefreshing, startRefresh] = useTransition();
  const gridRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pendingNavRef = useRef<(() => void) | null>(null);
  const bypassGuardRef = useRef(false);
  const sentinelPushedRef = useRef(false);
  const didMountRef = useRef(false);
  const skipFirstSyncRef = useRef(true);
  const hasUnsavedRef = useRef(false);

  // El día seleccionado se deriva de daysSchedule en lugar de duplicarse en
  // estado: cuando llegan datos nuevos del servidor la vista se actualiza sola
  // y deja de mostrar los horarios del lunes parada sobre otro día.
  const selectedDaySchedule = useMemo(
    () => daysSchedule.find((d) => d.day === selectedDay.dayName),
    [daysSchedule, selectedDay.dayName]
  );
  const selectedDayStart = selectedDaySchedule?.dayStart ?? 0;
  const selectedDayEnd = selectedDaySchedule?.dayEnd ?? 0;
  const selectedAppointmentDuration = selectedDaySchedule?.appointmentDuration ?? 30;
  const selectedDayID = selectedDaySchedule?._id ?? "";

  const selectedDayAppointments = useMemo(
    () => appointmentsSchedule.filter((a) => a.day === selectedDay.dayName),
    [appointmentsSchedule, selectedDay.dayName]
  );

  const dirtyDays = useMemo(
    () =>
      daysSchedule.filter((d) => {
        const saved = savedDays[d.day];
        return (
          !saved ||
          saved.dayStart !== d.dayStart ||
          saved.dayEnd !== d.dayEnd ||
          saved.appointmentDuration !== d.appointmentDuration
        );
      }),
    [daysSchedule, savedDays]
  );

  const hasUnsavedChanges =
    selectedAutomaticSchedule !== savedConfig.automaticSchedule ||
    selectedDaysToCreate !== savedConfig.scheduleDaysToCreate ||
    selectedAnticipation !== savedConfig.scheduleAnticipation ||
    dirtyDays.length > 0;
  hasUnsavedRef.current = hasUnsavedChanges;

  const refreshData = useCallback(() => {
    startRefresh(() => router.refresh());
  }, [router]);

  const hideAlert = () => {
    setTimeout(() => {
      setAlert({ error: false, alertType: "ERROR_ALERT", msg: "" });
    }, 3300);
  };

  const handleSelectDay = (day: { dayName: string; dayNumber: number }) => {
    setSelectedDay(day);
  };

  // Props nuevas del servidor (router.refresh, o volver a entrar a la ruta):
  // se rebasean los valores guardados y se re-sincroniza la vista, salvo que el
  // usuario tenga ediciones en curso — esas nunca se pisan.
  useEffect(() => {
    if (skipFirstSyncRef.current) {
      skipFirstSyncRef.current = false;
      return;
    }
    const nextDays = reconcileDays(
      daysAndAppointments.days,
      daysAndAppointments.appointments
    );
    setSavedDays(toDayBaseline(nextDays));
    setSavedConfig({
      automaticSchedule: businessData.automaticSchedule,
      scheduleDaysToCreate: businessData.scheduleDaysToCreate,
      scheduleAnticipation: businessData.scheduleAnticipation,
    });
    setAppointmentsSchedule(daysAndAppointments.appointments);
    if (hasUnsavedRef.current) return;
    setDaysSchedule(nextDays);
    setSelectedAutomaticSchedule(businessData.automaticSchedule);
    setSelectedDaysToCreate(businessData.scheduleDaysToCreate);
    setSelectedAnticipation(businessData.scheduleAnticipation);
  }, [businessData, daysAndAppointments]);

  // Volver a esta ruta con navegación de cliente sirve el Router Cache de Next,
  // que puede estar viejo. En la primera visita de la sesión los datos ya vienen
  // frescos del servidor, así que sólo revalidamos al reingresar.
  useEffect(() => {
    if (didMountRef.current) return;
    didMountRef.current = true;
    if (visitedThisSession) refreshData();
    else visitedThisSession = true;
  }, [refreshData]);

  useEffect(() => {
    if (servicesData.length === 0) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [servicesData.length]);

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
      businessID: businessData._id!,
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
    editDaySchedule({
      day: selectedDay.dayName,
      dayStart: selectedDayStart,
      dayEnd: selectedDayEnd,
      appointmentDuration: val,
    });
  };

  const handleSelectDayStart = (val: number) => {
    if (parsedSelectedAppointments.length) {
      const earliestHour = Math.min(...parsedSelectedAppointments.map((a) => dayjs(a.start).hour()));
      if (val > earliestHour) {
        setAlert({ msg: `Hay turnos desde las ${String(earliestHour).padStart(2, "0")}:00 hs`, error: true, alertType: "ERROR_ALERT" });
        hideAlert();
        return;
      }
    }
    // Si el nuevo inicio invade el fin actual, corremos el fin manteniendo el span
    // para que el usuario pueda desplazar el rango en un solo paso.
    let nextEnd = selectedDayEnd;
    if (val >= selectedDayEnd) {
      const span = Math.max(selectedDayEnd - selectedDayStart, 1);
      nextEnd = Math.min(val + span, 23);
      if (nextEnd <= val) {
        setAlert({ msg: "El horario de inicio no puede ser 23:00 hs", error: true, alertType: "ERROR_ALERT" });
        hideAlert();
        return;
      }
    }
    editDaySchedule({
      day: selectedDay.dayName,
      dayStart: val,
      dayEnd: nextEnd,
      appointmentDuration: selectedAppointmentDuration,
    });
  };

  const handleSelectDayEnd = (val: number) => {
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
    // Espejo del start: si el nuevo fin cae por debajo del inicio actual,
    // arrastramos el inicio para preservar el span.
    let nextStart = selectedDayStart;
    if (val <= selectedDayStart) {
      const span = Math.max(selectedDayEnd - selectedDayStart, 1);
      nextStart = Math.max(val - span, 0);
      if (nextStart >= val) {
        setAlert({ msg: "El horario de fin no puede ser 00:00 hs", error: true, alertType: "ERROR_ALERT" });
        hideAlert();
        return;
      }
    }
    editDaySchedule({
      day: selectedDay.dayName,
      dayStart: nextStart,
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
    setDaysSchedule((days) =>
      days.map((d) =>
        d.day === day ? { ...d, dayStart, dayEnd, appointmentDuration } : d
      )
    );
  };

  const saveChanges = async (onSaved?: () => void) => {
    if (selectedAnticipation >= selectedDaysToCreate) {
      setAlert({
        msg: "Elige una anticipación menor a los dias a crear",
        error: true,
        alertType: "ERROR_ALERT",
      });
      hideAlert();
      return;
    }
    setLoadingButton(true);
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
        "/business/schedule/parameters/" + businessData._id,
        {
          scheduleAnticipation: selectedAnticipation,
          scheduleDaysToCreate: selectedDaysToCreate,
          automaticSchedule: selectedAutomaticSchedule,
        },
        authHeader
      );
      if (dirtyDays.length > 0) {
        await axiosReq.put("/schedule/appointment/editmany", dirtyDays, authHeader);
      }
      // Rebase local inmediato: el indicador de "sin guardar" se apaga al toque,
      // sin esperar el round-trip del server component.
      setSavedConfig({
        automaticSchedule: selectedAutomaticSchedule,
        scheduleDaysToCreate: selectedDaysToCreate,
        scheduleAnticipation: selectedAnticipation,
      });
      setSavedDays(toDayBaseline(daysSchedule));
      setAlert({ msg: "Cambios guardados con éxito", error: true, alertType: "OK_ALERT" });
      hideAlert();
      setLoadingButton(false);
      // Trae lo que el backend recalculó (scheduleEnd, turnos regenerados) e
      // invalida el Router Cache para el resto del panel.
      refreshData();
      onSaved?.();
    } catch {
      setAlert({ msg: "Error al guardar cambios", error: true, alertType: "ERROR_ALERT" });
      hideAlert();
      setLoadingButton(false);
    }
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

  // Summary panel — live preview of the pending configuration so the user can
  // review it before saving. When nothing is dirty, selected* equals the saved
  // values, so the preview matches the last-saved state exactly.
  const savedAuto = savedConfig.automaticSchedule;
  const previewAuto = selectedAutomaticSchedule;
  const autoChanged = previewAuto !== savedAuto;

  const savedWindowLabel = `${savedConfig.scheduleDaysToCreate} días · ${savedConfig.scheduleAnticipation} antes`;
  const previewWindowLabel = `${selectedDaysToCreate} días · ${selectedAnticipation} antes`;
  const windowChanged =
    selectedDaysToCreate !== savedConfig.scheduleDaysToCreate ||
    selectedAnticipation !== savedConfig.scheduleAnticipation;

  const discardChanges = () => {
    setSelectedAutomaticSchedule(savedConfig.automaticSchedule);
    setSelectedDaysToCreate(savedConfig.scheduleDaysToCreate);
    setSelectedAnticipation(savedConfig.scheduleAnticipation);
    setDaysSchedule((days) => days.map((d) => ({ ...d, ...(savedDays[d.day] ?? {}) })));
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

    // Sentinel entry so browser back/forward can be intercepted. Se agrega una
    // sola vez por montaje: guardar ya no recarga la página, así que el flag de
    // cambios puede prenderse y apagarse varias veces sin ensuciar el historial.
    if (!sentinelPushedRef.current) {
      sentinelPushedRef.current = true;
      window.history.pushState(null, "", window.location.href);
    }

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
  const savedNextGenLabel = businessData.scheduleEnd
    ? dayjs(businessData.scheduleEnd)
        .subtract(savedConfig.scheduleAnticipation, "day")
        .format("ddd DD/MM")
    : "—";
  // Next generation uses the already-loaded scheduleEnd (past) minus the newly
  // selected anticipation (new), so the preview reflects both.
  const previewNextGenLabel = businessData.scheduleEnd
    ? dayjs(businessData.scheduleEnd)
        .subtract(selectedAnticipation, "day")
        .format("ddd DD/MM")
    : "—";
  const nextGenChanged =
    !!businessData.scheduleEnd &&
    previewAuto &&
    selectedAnticipation !== savedConfig.scheduleAnticipation;

  // Render

  return (
    <>
      {/* Dialogs */}
      {/* <Dialog open={subscriptionData?.subscriptionType === "SC_EXPIRED"}>
        <DialogContent className="sm:w-[460px] w-[93vw]">
          <ExpiredPlanModal onCloseModal={() => setExpiredModal(false)} businessData={businessData} />
        </DialogContent>
      </Dialog> */}

      <Dialog open={eventModal} onOpenChange={() => setEventModal(false)}>
        <DialogContent className="md:w-[510px] w-[93vw]">
          <DialogTitle className="sr-only">Detalle del turno</DialogTitle>
          <ScheduleAppointmentModal
            onDeleteAppointment={(deleted) => {
              setAppointmentsSchedule((prev) =>
                prev.filter((a) => a._id !== deleted._id)
              );
              refreshData();
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
              setAppointmentsSchedule((prev) => [...prev, newAppt]);
              refreshData();
            }}
            appointmentData={createAppointmentData}
            servicesData={servicesData}
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
          <ExpiredPlanModal onCloseModal={() => setExpiredModal(false)} businessData={businessData} />
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
                className="flex items-center justify-center gap-1.5 bg-primary hover:bg-orange-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
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
        <div className="flex items-center justify-between gap-3 mt-4 xl:mt-2 min-w-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <h1 className="text-lg 2xl:text-xl font-semibold text-gray-800 whitespace-nowrap truncate">Automatizar agenda</h1>
            <span
              aria-live="polite"
              className={cn(
                "hidden sm:flex items-center gap-1.5 text-xs text-gray-400 transition-opacity duration-200",
                isRefreshing ? "opacity-100" : "opacity-0"
              )}
            >
              <span className="loaderSmall" />
              Actualizando
            </span>
          </div>

          <button
            onClick={() => setTutorialModal(true)}
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 text-primary text-xs font-semibold transition-colors duration-200 shrink-0"
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
                      <Select
                        value={String(selectedDaysToCreate)}
                        onValueChange={(value) => setSelectedDaysToCreate(Number(value))}
                      >
                        <SelectTrigger className="h-9 rounded-md border border-gray-200 bg-[rgb(245,245,245)] px-3 text-sm text-gray-800 shadow-none transition-all duration-200 ease-in-out focus:ring-0 focus:ring-offset-0 hover:border-orange-600 focus-visible:border-orange-600 data-[state=open]:border-orange-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-72">
                          {[
                            { value: "7", label: "Crear 7 días" },
                            { value: "15", label: "Crear 15 días" },
                            { value: "30", label: "Crear 30 días" },
                          ].map((opt) => (
                            <SelectItem
                              key={opt.value}
                              value={opt.value}
                              className="cursor-pointer text-sm text-gray-700 focus:bg-orange-50 focus:text-orange-700 data-[state=checked]:font-medium data-[state=checked]:text-orange-700"
                            >
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-1.5 p-3.5 rounded-xl border border-gray-200 bg-gray-50">
                      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                        <LuTimer size={14} className="text-gray-400 shrink-0" />
                        ¿Con qué anticipación crear turnos?
                      </label>
                      <Select
                        value={String(selectedAnticipation)}
                        onValueChange={(value) => setSelectedAnticipation(Number(value))}
                      >
                        <SelectTrigger className="h-9 rounded-md border border-gray-200 bg-[rgb(245,245,245)] px-3 text-sm text-gray-800 shadow-none transition-all duration-200 ease-in-out focus:ring-0 focus:ring-offset-0 hover:border-orange-600 focus-visible:border-orange-600 data-[state=open]:border-orange-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-72">
                          {Array.from({ length: 16 }, (_, i) => (
                            <SelectItem
                              key={i}
                              value={String(i)}
                              className="cursor-pointer text-sm text-gray-700 focus:bg-orange-50 focus:text-orange-700 data-[state=checked]:font-medium data-[state=checked]:text-orange-700"
                            >
                              {i === 0 ? "0 días antes" : `${i} ${i === 1 ? "día" : "días"} antes`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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

                {/* Right — automation summary (live preview of pending config) */}
                <div
                  className={cn(
                    "flex flex-col rounded-xl border p-4 transition-colors duration-200",
                    previewAuto ? "bg-orange-50/50 border-orange-100" : "bg-gray-50 border-gray-200"
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <LuActivity size={15} className={previewAuto ? "text-primary" : "text-gray-400"} />
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
                    {hasUnsavedChanges ? "Vista previa · sin guardar" : "Según lo último guardado"}
                  </span>

                  <div
                    className={cn(
                      "flex flex-col mt-3 divide-y",
                      previewAuto ? "divide-orange-100" : "divide-gray-200"
                    )}
                  >
                    {/* Estado */}
                    <div className="flex items-center justify-between gap-2 py-2.5 first:pt-0">
                      <span className="text-xs text-gray-500 shrink-0">Estado</span>
                      <div className="flex items-center gap-1.5">
                        {autoChanged && (
                          <>
                            <span className="text-[11px] text-gray-400 line-through">
                              {savedAuto ? "Activada" : "Desactivada"}
                            </span>
                            <LuArrowRight size={11} className="text-orange-400 shrink-0" />
                          </>
                        )}
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
                            previewAuto
                              ? "bg-orange-50 border-orange-200 text-orange-700"
                              : "bg-gray-100 border-gray-200 text-gray-500",
                            autoChanged && "ring-1 ring-orange-200"
                          )}
                        >
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              previewAuto ? "bg-primary" : "bg-gray-400"
                            )}
                          />
                          {previewAuto ? "Activada" : "Desactivada"}
                        </span>
                      </div>
                    </div>

                    {/* Agenda cargada hasta */}
                    {previewAuto && businessData.scheduleEnd && (
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-xs text-gray-500">Agenda cargada hasta</span>
                        <span className="text-xs font-semibold text-gray-800 tabular-nums">
                          {scheduleEndLabel}
                        </span>
                      </div>
                    )}

                    {/* Próxima generación */}
                    <div className="flex items-center justify-between gap-2 py-2.5">
                      <span className="text-xs text-gray-500 shrink-0">Próxima generación</span>
                      {!previewAuto ? (
                        <span className="text-xs font-semibold text-gray-400">
                          {autoChanged ? "Se pausará al guardar" : "Se genera al activar"}
                        </span>
                      ) : !businessData.scheduleEnd ? (
                        <span className="text-xs font-semibold text-gray-400">
                          {autoChanged ? "Se genera al guardar" : "—"}
                        </span>
                      ) : nextGenChanged ? (
                        <span className="flex flex-wrap items-center justify-end gap-x-1.5 gap-y-0.5 pl-2">
                          <span className="text-[11px] text-gray-400 line-through capitalize">
                            {savedNextGenLabel}
                          </span>
                          <LuArrowRight size={11} className="text-orange-400 shrink-0" />
                          <span className="text-xs font-semibold text-orange-600 capitalize">
                            {previewNextGenLabel}
                          </span>
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-gray-800 capitalize">
                          {previewNextGenLabel}
                        </span>
                      )}
                    </div>

                    {/* Turnos por semana */}
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-xs text-gray-500">Turnos por semana</span>
                      <span className="text-xs font-semibold text-gray-800 tabular-nums">
                        {weeklyAppointmentsTotal}
                      </span>
                    </div>

                    {/* Ventana */}
                    <div className="flex items-center justify-between gap-2 py-2.5 last:pb-0">
                      <span className="text-xs text-gray-500 shrink-0">Ventana</span>
                      {windowChanged ? (
                        <span className="flex flex-wrap items-center justify-end gap-x-1.5 gap-y-0.5 pl-2">
                          <span className="text-[11px] text-gray-400 line-through">
                            {savedWindowLabel}
                          </span>
                          <LuArrowRight size={11} className="text-orange-400 shrink-0" />
                          <span className="text-xs font-semibold text-orange-600">
                            {previewWindowLabel}
                          </span>
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-gray-800">
                          {previewWindowLabel}
                        </span>
                      )}
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
            <div className="grid grid-cols-7 gap-1 p-1 rounded-xl bg-gray-50 border border-gray-100">
              {daysOfWeek.map((day) => {
                const count = appointmentCountByDay.get(day.dayName) ?? 0;
                const isActive = selectedDay.dayName === day.dayName;
                const isWeekend = day.dayNumber === 0 || day.dayNumber === 6;
                return (
                  <button
                    key={day.dayName}
                    onClick={() => handleSelectDay(day)}
                    className={cn(
                      "relative flex flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-semibold rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-primary text-white shadow-sm"
                        : cn(
                            "bg-transparent hover:bg-white hover:text-orange-600",
                            isWeekend ? "text-gray-400" : "text-gray-500"
                          )
                    )}
                  >
                    <span className="tracking-wide">{day.dayName}</span>
                    <span
                      className={cn(
                        "h-1 w-1 rounded-full transition-colors",
                        count > 0
                          ? isActive
                            ? "bg-white"
                            : "bg-primary/70"
                          : "bg-transparent"
                      )}
                      aria-label={count > 0 ? `${count} turnos` : undefined}
                    />
                  </button>
                );
              })}
            </div>

            {/* Time controls */}
            <div className="flex flex-col gap-2 border-t border-gray-50 pt-2 -mt-2">
              {/* Desktop — inline controls */}
              <div className="hidden lg:block">
                <TimeRangeControls
                  dayStart={selectedDayStart}
                  dayEnd={selectedDayEnd}
                  appointmentDuration={selectedAppointmentDuration}
                  onDayStartChange={handleSelectDayStart}
                  onDayEndChange={handleSelectDayEnd}
                  onDurationChange={handleSelectAppointmentDuration}
                />
              </div>

              {/* Mobile/tablet — compact popover trigger */}
              <div className="lg:hidden">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="group w-full grid grid-cols-3 rounded-xl border border-gray-200 bg-white divide-x divide-gray-100 overflow-hidden [@media(hover:hover)]:hover:border-orange-300 active:border-orange-300 transition-colors duration-200 shadow-sm"
                    >
                      <div className="flex flex-col items-center justify-center py-2 gap-0.5 [@media(hover:hover)]:group-hover:bg-orange-50/40">
                        <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Desde</span>
                        <span className="text-sm font-semibold text-gray-800 tabular-nums">
                          {String(selectedDayStart).padStart(2, "0")}:00
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center py-2 gap-0.5 [@media(hover:hover)]:group-hover:bg-orange-50/40">
                        <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Hasta</span>
                        <span className="text-sm font-semibold text-gray-800 tabular-nums">
                          {String(selectedDayEnd).padStart(2, "0")}:00
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center py-2 gap-0.5 [@media(hover:hover)]:group-hover:bg-orange-50/40">
                        <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Intervalo</span>
                        <span className="text-sm font-semibold text-gray-800 tabular-nums">
                          {selectedAppointmentDuration} min
                        </span>
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-64">
                    <TimeRangeControls
                      dayStart={selectedDayStart}
                      dayEnd={selectedDayEnd}
                      appointmentDuration={selectedAppointmentDuration}
                      onDayStartChange={handleSelectDayStart}
                      onDayEndChange={handleSelectDayEnd}
                      onDurationChange={handleSelectAppointmentDuration}
                      className="flex-col items-stretch"
                      title="Rango horario"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <span className="text-xs text-gray-400 hidden sm:block">
                Hacé clic en un horario para agregar un turno
              </span>
            </div>

            {/* Calendar grid */}
            <div className="rounded-xl border border-gray-100 overflow-hidden">

              {/* Day header */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
                <span className="text-xs font-semibold capitalize text-primary">
                  {daysOfWeek.find((d) => d.dayName === selectedDay.dayName)?.fullName ?? selectedDay.dayName}
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
