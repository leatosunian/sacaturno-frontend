"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarDays,
  MapPin,
  Phone,
  Clock,
  Check,
  Zap,
  ExternalLink,
  Loader2,
  CircleCheck,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  User,
  Tag,
  Sun,
  Sunset,
  Moon,
} from "lucide-react";
import { cn, composeBranchAddress, resolveContactPhone } from "@/lib/utils";
import { resolveImageUrl } from "@/lib/images";
import { IAppointment } from "@/interfaces/appointment.interface";
import { IBusiness } from "@/interfaces/business.interface";
import { IDaySchedule } from "@/interfaces/daySchedule.interface";
import axiosReq from "@/config/axios";
import { bookAppointmentSchema } from "@/app/schemas/bookAppointmentSchema";
import type { IPublicBranch } from "./BranchSelector";
import type { IPublicEmployee } from "./EmployeeSelector";

// ── Timezone config ─────────────────────────────────────────
const ARG_TZ_OFFSET_HOURS = -3;
const TZ_MS = ARG_TZ_OFFSET_HOURS * 60 * 60 * 1000;

// ── Helpers ─────────────────────────────────────────────────
function toISOString(v: Date | string): string {
  const d = typeof v === "string" ? new Date(v) : v;
  return new Date(d.getTime() + TZ_MS).toISOString();
}
function extractDateStr(iso: string): string {
  return iso.slice(0, 10);
}
function extractTime(iso: string): string {
  const m = iso.match(/T(\d{2}:\d{2})/);
  return m ? m[1] : "00:00";
}
function dateForDateStr(dateStr: string): Date {
  return new Date(new Date(`${dateStr}T12:00:00Z`).getTime() + TZ_MS);
}
function getNowArgISO(): string {
  return new Date(Date.now() + TZ_MS).toISOString();
}
function addDaysStr(dateStr: string, days: number): string {
  const d = dateForDateStr(dateStr);
  d.setUTCDate(d.getUTCDate() + days);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}
function getDayIndex(dateStr: string): number {
  return dateForDateStr(dateStr).getUTCDay();
}

const DAY_NAMES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];
const MONTH_NAMES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const SCHEDULE_DAY_KEYS: Record<number, string> = {
  0: "DOM",
  1: "LUN",
  2: "MAR",
  3: "MIE",
  4: "JUE",
  5: "VIE",
  6: "SAB",
};

// ── Calendario de fechas ─────────────────────────────────────
// El mes se identifica por su prefijo "YYYY-MM", que es directamente
// comparable con las dateStr y evita arrastrar objetos Date por el estado.
function monthOf(dateStr: string): string {
  return dateStr.slice(0, 7);
}
function addMonths(ym: string, n: number): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1, 12));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

// Grilla del mes arrancando en lunes, con los huecos del arranque en null.
function monthCells(ym: string): (string | null)[] {
  const [y, m] = ym.split("-").map(Number);
  const lead = (new Date(Date.UTC(y, m - 1, 1, 12)).getUTCDay() + 6) % 7;
  const total = new Date(Date.UTC(y, m, 0, 12)).getUTCDate();
  return [
    ...Array<null>(lead).fill(null),
    ...Array.from(
      { length: total },
      (_, i) => `${y}-${String(m).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`,
    ),
  ];
}

const WEEKDAY_INITIALS = ["L", "M", "M", "J", "V", "S", "D"];

function MonthCalendar({
  month,
  onMonthChange,
  canGoPrev,
  canGoNext,
  availableDates,
  selected,
  todayStr,
  onSelect,
}: {
  month: string;
  onMonthChange: (ym: string) => void;
  canGoPrev: boolean;
  canGoNext: boolean;
  availableDates: Set<string>;
  selected: string;
  todayStr: string;
  onSelect: (dateStr: string) => void;
}) {
  const [y, m] = month.split("-").map(Number);
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          disabled={!canGoPrev}
          onClick={() => onMonthChange(addMonths(month, -1))}
          aria-label="Mes anterior"
          className={cn(
            "size-9 rounded-xl flex items-center justify-center border transition-all",
            canGoPrev
              ? "border-orange-200 text-orange-600 hover:bg-orange-50"
              : "border-transparent text-neutral-200 cursor-not-allowed",
          )}
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-sm 2xl:text-base font-extrabold tracking-tight first-letter:uppercase">
          {MONTH_NAMES[m - 1]}{" "}
          <span className="text-muted-foreground font-bold">{y}</span>
        </span>
        <button
          type="button"
          disabled={!canGoNext}
          onClick={() => onMonthChange(addMonths(month, 1))}
          aria-label="Mes siguiente"
          className={cn(
            "size-9 rounded-xl flex items-center justify-center border transition-all",
            canGoNext
              ? "border-orange-200 text-orange-600 hover:bg-orange-50"
              : "border-transparent text-neutral-200 cursor-not-allowed",
          )}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_INITIALS.map((w, i) => (
          <span
            key={i}
            className="text-[10px] font-bold text-muted-foreground text-center py-1"
          >
            {w}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {monthCells(month).map((dateStr, i) => {
          if (!dateStr) return <span key={`gap-${i}`} />;
          const free = availableDates.has(dateStr);
          const sel = selected === dateStr;
          const isToday = dateStr === todayStr;
          return (
            <button
              type="button"
              key={dateStr}
              disabled={!free}
              onClick={() => onSelect(dateStr)}
              className={cn(
                "aspect-square flex items-center justify-center rounded-xl text-sm 2xl:text-base font-bold transition-all",
                sel
                  ? "bg-primary text-primary-foreground shadow-md"
                  : free
                    ? "bg-orange-50 text-neutral-900 hover:bg-orange-100"
                    : "text-neutral-300 cursor-not-allowed",
                isToday && !sel && "ring-2 ring-orange-400 ring-offset-1",
              )}
            >
              {Number(dateStr.slice(8))}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Los horarios se agrupan por franja: una grilla plana de 15+ turnos es
// ilegible, y "a la tarde" es como el cliente ya piensa el día.
const TIME_BUCKETS = [
  { id: "manana", label: "Mañana", Icon: Sun, until: 12 },
  { id: "tarde", label: "Tarde", Icon: Sunset, until: 18 },
  { id: "noche", label: "Noche", Icon: Moon, until: 24 },
] as const;

// ── Service type ─────────────────────────────────────────────
interface IService {
  _id: string;
  name: string;
  description?: string;
  depositAmount?: number;
  duration?: number;
  price?: number;
  businessID: string;
  [key: string]: unknown;
}

async function getBusinessServices(businessID: string): Promise<IService[]> {
  const res = await axiosReq.get(`/user/business/service/get/${businessID}`);
  return res.data;
}

// ── FormattedAppointment (exported — used by BookAppointmentModal) ──
export interface FormattedAppointment {
  _id: string;
  startISO: string;
  endISO: string;
  title: string;
  clientID: string;
  service: string;
  email: string;
  phone: number;
  name: string;
  price: number;
  description: string;
  status: "booked" | "unbooked";
  timeLabel: string;
  endTimeLabel: string;
  dateStr: string;
  employeeID: string | null;
  branchID: string | null;
  cancelToken?: string | null;
}

// ── Wizard steps ─────────────────────────────────────────────
type ActiveStep = "service" | "branch" | "employee" | "date" | "confirm";
type WizardStep = ActiveStep | "done";

const STEP_LABELS: Record<ActiveStep, string> = {
  service: "Servicio",
  branch: "Sucursal",
  employee: "Especialista",
  date: "Fecha",
  confirm: "Confirmar",
};

interface FormInputs {
  name: string;
  phone: string;
  email: string;
}

// ── Props ────────────────────────────────────────────────────
interface Props {
  appointments: IAppointment[];
  businessData: IBusiness;
  scheduleDays: IDaySchedule[];
  employees: IPublicEmployee[];
  branches: IPublicBranch[];
}

// ── Component ────────────────────────────────────────────────
export default function ListBookAppointment({
  appointments: rawAppointments,
  businessData,
  scheduleDays,
  employees,
  branches,
}: Props) {
  const router = useRouter();

  // Un turno con reserva temporal vigente (alguien lo está pagando en MP) se
  // muestra igual que uno ocupado. Normalizarlo acá evita repetir la condición
  // en cada filtro de disponibilidad de abajo.
  const appointments = useMemo(() => {
    const now = Date.now();
    return rawAppointments.map((a) =>
      a.status === "unbooked" &&
      a.depositHoldUntil &&
      new Date(a.depositHoldUntil).getTime() > now
        ? { ...a, status: "booked" as const }
        : a,
    );
  }, [rawAppointments]);

  const initialDateStr = useMemo(() => {
    const a = new Date(Date.now() + TZ_MS);
    return `${a.getUTCFullYear()}-${String(a.getUTCMonth() + 1).padStart(2, "0")}-${String(a.getUTCDate()).padStart(2, "0")}`;
  }, []);

  // ── Data state ──
  const [services, setServices] = useState<IService[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [currentDateStr, setCurrentDateStr] = useState(initialDateStr);
  const [calendarMonth, setCalendarMonth] = useState(() => monthOf(initialDateStr));
  const [selectedSlot, setSelectedSlot] = useState<FormattedAppointment | null>(
    null,
  );

  // ── Wizard state ──
  const [wizardStep, setWizardStep] = useState<WizardStep>("service");
  const [bookingSpinner, setBookingSpinner] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [logoFailed, setLogoFailed] = useState(false);

  // Sin imagen propia se prefiere la inicial de marca al avatar genérico, que
  // para un negocio queda peor que la letra.
  const businessLogoUrl = logoFailed ? null : resolveImageUrl(businessData.image);

  // ── Form ──
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: zodResolver(bookAppointmentSchema),
  });

  // ── Fetch services ──
  useEffect(() => {
    if (!businessData._id) return;
    setLoadingServices(true);
    getBusinessServices(businessData._id)
      .then((data) => {
        setServices(data);
      })
      .catch(() => setServices([]))
      .finally(() => setLoadingServices(false));
  }, [businessData._id]);

  // ── Active steps (dynamic) ──
  const activeSteps = useMemo<ActiveStep[]>(() => {
    const steps: ActiveStep[] = [];
    if (services.length >= 1) steps.push("service");
    if (branches.length >= 2) steps.push("branch");
    if (employees.length >= 2) steps.push("employee");
    steps.push("date");
    steps.push("confirm");
    return steps;
  }, [services, branches, employees]);

  const stepIndex = useMemo(
    () => activeSteps.indexOf(wizardStep as ActiveStep),
    [activeSteps, wizardStep],
  );

  const goNextStep = useCallback(() => {
    const idx = activeSteps.indexOf(wizardStep as ActiveStep);
    if (idx >= 0 && idx < activeSteps.length - 1)
      setWizardStep(activeSteps[idx + 1]);
    else setWizardStep("done");
  }, [activeSteps, wizardStep]);

  const goPrevStep = useCallback(() => {
    const idx = activeSteps.indexOf(wizardStep as ActiveStep);
    if (idx > 0) setWizardStep(activeSteps[idx - 1]);
  }, [activeSteps, wizardStep]);

  const selectedServiceID = useMemo(
    () => services.find((s) => s.name === selectedService)?._id,
    [services, selectedService],
  );

  // ── Employee selector filtered by branch + selected service ──
  // Sin el filtro por servicio se ofrecía un profesional que no lo presta, y el
  // paso siguiente quedaba sin fechas disponibles y sin explicación.
  const selectorEmployees = useMemo(() => {
    let list = employees;
    if (selectedBranch)
      list = list.filter((e) => (e.branches ?? []).includes(selectedBranch));
    if (selectedServiceID)
      list = list.filter((e) => (e.services ?? []).includes(selectedServiceID));
    return list;
  }, [employees, selectedBranch, selectedServiceID]);

  // ── Schedule for current day ──
  const daySchedule = useMemo(() => {
    const key = SCHEDULE_DAY_KEYS[getDayIndex(currentDateStr)];
    const def: IDaySchedule = {
      day: key,
      dayStart: 9,
      dayEnd: 20,
      appointmentDuration: 30,
      enabled: true,
      businessID: "",
      ownerID: "",
    };
    return scheduleDays.find((d) => d.day === key) ?? def;
  }, [currentDateStr, scheduleDays]);

  // ── Available dates ──
  const availableDateStrSet = useMemo(() => {
    const nowISO = getNowArgISO();
    const set = new Set<string>();
    appointments
      .filter((a) => a.status === "unbooked")
      .filter((a) => !selectedBranch || a.branchID === selectedBranch)
      .filter((a) => !selectedService || a.service === selectedService)
      .filter((a) => !selectedEmployee || a.employeeID === selectedEmployee)
      .filter((a) => toISOString(a.start) > nowISO)
      .forEach((a) => set.add(extractDateStr(toISOString(a.start))));
    return set;
  }, [appointments, selectedBranch, selectedService, selectedEmployee]);

  const availableDatesArray = useMemo(
    () => Array.from(availableDateStrSet).sort().slice(0, 30),
    [availableDateStrSet],
  );

  // El calendario no deja salir del rango con turnos: desde el mes de hoy
  // hasta el de la última fecha publicada.
  const monthRange = useMemo(() => {
    const last = availableDatesArray[availableDatesArray.length - 1];
    return {
      min: monthOf(initialDateStr),
      max: monthOf(last ?? initialDateStr),
    };
  }, [availableDatesArray, initialDateStr]);

  // Si el día apuntado se quedó sin turnos —al entrar al paso, o porque
  // cambió un filtro— saltar al siguiente con disponibilidad en vez de
  // mostrar la columna de horarios vacía.
  useEffect(() => {
    if (availableDatesArray.length === 0) return;
    if (availableDateStrSet.has(currentDateStr)) return;
    const next =
      availableDatesArray.find((d) => d >= currentDateStr) ??
      availableDatesArray[0];
    setCurrentDateStr(next);
    setSelectedSlot(null);
  }, [availableDatesArray, availableDateStrSet, currentDateStr]);

  // Seguir al día elegido cuando el salto vino de afuera del calendario
  // (por ejemplo el snap de arriba, que puede caer en otro mes).
  useEffect(() => {
    setCalendarMonth(monthOf(currentDateStr));
  }, [currentDateStr]);

  // ── Derived selection objects ──
  const selectedServiceObj = useMemo(
    () => services.find((s) => s.name === selectedService),
    [services, selectedService],
  );
  const displayDuration = useMemo(() => {
    const d = selectedServiceObj?.duration;
    return typeof d === "number" ? d : daySchedule.appointmentDuration;
  }, [selectedServiceObj, daySchedule]);
  const requiresDeposit = (selectedServiceObj?.depositAmount ?? 0) > 0;

  // ── Appointments for current day ──
  const dayAppointments = useMemo(() => {
    const nowISO = getNowArgISO();
    const sorted = appointments
      .filter((a) => extractDateStr(toISOString(a.start)) === currentDateStr)
      .filter((a) => !selectedBranch || a.branchID === selectedBranch)
      .filter((a) => !selectedService || a.service === selectedService)
      .filter((a) => !selectedEmployee || a.employeeID === selectedEmployee)
      .filter((a) => toISOString(a.start) > nowISO)
      .map((a): FormattedAppointment => {
        const startISO = toISOString(a.start);
        const endISO = toISOString(a.end);
        return {
          _id: a._id ?? "",
          startISO,
          endISO,
          title: a.title ?? "",
          clientID: a.clientID ?? "",
          service: a.service ?? "",
          email: a.email ?? "",
          phone: a.phone ?? 0,
          name: a.name ?? "",
          price: a.price ?? 0,
          description: a.description ?? "",
          status: a.status ?? "unbooked",
          timeLabel: extractTime(startISO),
          endTimeLabel: extractTime(endISO),
          dateStr: extractDateStr(startISO),
          employeeID: a.employeeID ?? null,
          branchID: a.branchID ?? null,
        };
      })
      .sort((a, b) => a.timeLabel.localeCompare(b.timeLabel));

    if (selectedEmployee === null && employees.length >= 2) {
      const key = (a: FormattedAppointment) =>
        selectedBranch ? a.timeLabel : `${a.timeLabel}|${a.branchID ?? ""}`;
      const best = new Map<string, FormattedAppointment>();
      for (const a of sorted) {
        const k = key(a);
        const prev = best.get(k);
        if (!prev || (prev.status === "booked" && a.status === "unbooked")) {
          best.set(k, a);
        }
      }
      return Array.from(best.values());
    }
    return sorted;
  }, [
    appointments,
    currentDateStr,
    selectedBranch,
    selectedService,
    selectedEmployee,
    employees,
  ]);

  // ── Confirm step display strings ──
  const modalDateStr = useMemo(() => {
    if (!selectedSlot) return "";
    const d = dateForDateStr(selectedSlot.dateStr);
    return `${DAY_NAMES[d.getUTCDay()].toLowerCase()} ${d.getUTCDate()} de ${MONTH_NAMES[d.getUTCMonth()]}`;
  }, [selectedSlot]);

  const selectedEmployeeObj = useMemo(
    () => employees.find((e) => e._id === selectedEmployee),
    [employees, selectedEmployee],
  );
  const selectedBranchObj = useMemo(
    () => branches.find((b) => b._id === selectedBranch),
    [branches, selectedBranch],
  );
  const slotBranchObj = useMemo(
    () => selectedSlot?.branchID ? branches.find((b) => b._id === selectedSlot.branchID) : undefined,
    [branches, selectedSlot],
  );
  const displayBranchObj = selectedBranchObj ?? slotBranchObj;
  const showBranchInSlots = !selectedBranch && branches.length >= 2;

  // Elegir "Cualquier especialista" no significa que no se sepa quién atiende:
  // el turno ya trae su empleado, y decirlo es más útil que dejar el dato en blanco.
  const slotEmployeeObj = useMemo(
    () => selectedSlot?.employeeID ? employees.find((e) => e._id === selectedSlot.employeeID) : undefined,
    [employees, selectedSlot],
  );

  // Con un solo prestador no hay nada que elegir —el paso sería un click vacío—
  // pero sí a quién nombrar: se muestra como dato en el encabezado y en el
  // resumen, y cubre también los turnos viejos que quedaron sin asignar.
  const soleProvider = employees.length === 1 ? employees[0] : undefined;
  const displayEmployeeObj = selectedEmployeeObj ?? slotEmployeeObj ?? soleProvider;

  // Con sucursales cargadas, ellas son la fuente de verdad para la dirección:
  // con una sola sucursal se muestra su dirección puntual; con 2+ es ambiguo y se oculta.
  const singleLocationAddress = useMemo(() => {
    if (branches.length === 0) return composeBranchAddress(businessData) || null;
    if (branches.length === 1) return composeBranchAddress(branches[0]) || null;
    return null;
  }, [branches, businessData]);

  // El teléfono de contacto sale de la sucursal en juego (la elegida o la única
  // que hay) y cae al del negocio mientras esa sucursal no tenga uno propio.
  const contactPhone = useMemo(
    () =>
      resolveContactPhone(
        businessData.phone,
        displayBranchObj ?? (branches.length === 1 ? branches[0] : null),
      ),
    [businessData.phone, displayBranchObj, branches],
  );

  // ── Resumen: dónde y con quién ──
  const summaryPlaceName = displayBranchObj?.name ?? businessData.name ?? "";
  const summaryAddress = displayBranchObj
    ? composeBranchAddress(displayBranchObj)
    : singleLocationAddress ?? "";
  const summaryMapsUrl = summaryAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(summaryAddress)}`
    : null;

  // ── Step subtitles (selected value per completed step) ──
  const stepSubtitles = useMemo<Partial<Record<ActiveStep, string>>>(() => ({
    service: selectedService ?? undefined,
    branch: selectedBranchObj?.name,
    employee: selectedEmployeeObj
      ? `${selectedEmployeeObj.name}${selectedEmployeeObj.surname ? " " + selectedEmployeeObj.surname : ""}`.trim()
      : undefined,
    date: selectedSlot ? `${modalDateStr} · ${selectedSlot.timeLabel} hs` : undefined,
  }), [selectedService, selectedBranchObj, selectedEmployeeObj, selectedSlot, modalDateStr]);

  // ── Booking API ──
  const bookWithoutDeposit = async (formData: FormInputs) => {
    if (!selectedSlot) return;
    setBookingSpinner(true);
    try {
      await axiosReq.put("/appointment/book", {
        _id: selectedSlot._id,
        status: "booked",
        clientID: "",
        email: formData.email,
        phone: formData.phone,
        name: formData.name,
        title: formData.name,
        // Único momento en que se sabe si el cliente pidió a esa persona o si
        // entró por "Cualquier especialista" y le tocó de casualidad.
        employeeChosenByClient: selectedEmployee !== null,
      });
      setWizardStep("done");
      router.refresh();
    } catch (error: any) {
      if (error?.response?.status === 409) {
        setBookingError(
          "Ese horario se acaba de ocupar. Elegí otro y volvé a intentar.",
        );
        router.refresh();
      } else {
        setBookingError("Error al reservar. Intentá de nuevo.");
      }
    } finally {
      setBookingSpinner(false);
    }
  };

  const bookWithDeposit = async (formData: FormInputs) => {
    if (!selectedSlot) return;
    setBookingSpinner(true);
    try {
      const res = await axiosReq.post("/mp/deposit/create-preference", {
        appointmentID: selectedSlot._id,
        clientName: formData.name,
        clientEmail: formData.email,
        clientPhone: formData.phone,
        employeeChosenByClient: selectedEmployee !== null,
      });
      window.location.href = res.data.initPoint;
    } catch (error: any) {
      const msg = error?.response?.data?.msg;
      if (msg === "SLOT_TAKEN" || msg === "SLOT_HELD") {
        setBookingError(
          msg === "SLOT_TAKEN"
            ? "Ese horario se acaba de reservar. Elegí otro y volvé a intentar."
            : "Alguien está reservando ese horario en este momento. Probá con otro o volvé a intentar en unos minutos.",
        );
        router.refresh();
      } else {
        setBookingError(
          msg === "BUSINESS_NOT_LINKED"
            ? "Este negocio aún no configuró el cobro de señas. Contactalo directamente."
            : "No se pudo generar el pago. Intentá de nuevo.",
        );
      }
      setBookingSpinner(false);
    }
  };

  const onSubmit = (formData: FormInputs) => {
    setBookingError("");
    if (requiresDeposit) bookWithDeposit(formData);
    else bookWithoutDeposit(formData);
  };


  // ── Step content ─────────────────────────────────────────────
  const renderStepContent = () => {
    switch (wizardStep) {
      case "service":
        return <ServiceStep />;
      case "branch":
        return <BranchStep />;
      case "employee":
        return <EmployeeStep />;
      case "date":
        return <DateStep />;
      case "confirm":
        return <ConfirmStep />;
      default:
        return null;
    }
  };

  const stepLabel = `Paso ${stepIndex + 1} de ${activeSteps.length}`;
  const canGoBack = stepIndex > 0;

  // ── Step chrome (scrollable body + pinned footer) ─────────────
  const StepShell = ({
    children,
    footer,
  }: {
    children: React.ReactNode;
    footer?: React.ReactNode;
  }) => (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 md:min-h-0 md:overflow-y-auto flex flex-col gap-4 2xl:gap-5">
        {children}
      </div>
      {(canGoBack || footer) && (
        <div className="shrink-0 flex items-center gap-3 mt-4 2xl:mt-5 pt-4 border-t border-orange-100">
          {canGoBack && (
            <button
              onClick={goPrevStep}
              className="flex shrink-0 items-center gap-1.5 h-11 2xl:h-12 px-4 rounded-xl text-xs 2xl:text-sm font-bold text-orange-600 bg-orange-50 border border-orange-200 hover:bg-orange-100 hover:border-orange-300 transition-all"
            >
              <ArrowLeft className="size-3.5" /> Volver
            </button>
          )}
          {footer}
        </div>
      )}
    </div>
  );

  const StepHeading = ({
    title,
    subtitle,
  }: {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
  }) => (
    <div className="shrink-0">
      {/* block + leading-none: como inline, el line box del contenedor sumaba
          ~7px de half-leading arriba y el paso no arrancaba a la altura del padding. */}
      <span className="hidden md:block leading-none text-[10px] 2xl:text-xs uppercase tracking-widest text-orange-600 font-bold">
        {stepLabel}
      </span>
      <h2 className="text-lg md:text-xl 2xl:text-3xl font-extrabold tracking-tight mt-1.5 2xl:mt-2">
        {title}
      </h2>
      {subtitle && (
        <p className="text-xs 2xl:text-sm text-muted-foreground mt-0.5 2xl:mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );

  // SERVICE STEP
  const ServiceStep = () => (
    <StepShell>
      <StepHeading
        title="Seleccioná un servicio"
        subtitle="¿Qué querés reservar hoy?"
      />
      {loadingServices ? (
        <div className="flex flex-col gap-3">
          <div className="h-16 rounded-2xl bg-muted animate-pulse" />
          <div className="h-16 rounded-2xl bg-muted animate-pulse" />
          <div className="h-16 rounded-2xl bg-muted animate-pulse" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {services.map((svc) => {
            const sel = selectedService === svc.name;
            const hasDeposit = (svc.depositAmount ?? 0) > 0;
            return (
              <button
                key={svc._id}
                onClick={() => {
                  setSelectedService(svc.name);
                  setSelectedSlot(null);
                  // Volver atrás y cambiar de servicio puede invalidar al
                  // profesional ya elegido: se limpia para no dejarlo sin fechas.
                  if (selectedEmployee) {
                    const emp = employees.find((e) => e._id === selectedEmployee);
                    if (emp && !(emp.services ?? []).includes(svc._id!))
                      setSelectedEmployee(null);
                  }
                  goNextStep();
                }}
                className={cn(
                  "group relative text-left rounded-xl border transition-all overflow-hidden p-3 2xl:p-4",
                  sel
                    ? "border-orange-500 bg-orange-50 shadow-md ring-2 ring-orange-100"
                    : "border-orange-100 bg-white hover:border-orange-300 hover:bg-orange-50/30 hover:shadow-md",
                )}
              >
                <div className="flex flex-col gap-1.5 2xl:gap-2">
                  <h3 className="font-extrabold text-sm 2xl:text-base leading-tight text-neutral-900 tracking-tight">
                    {svc.name}
                  </h3>

                  <div className="h-0.5 w-6 bg-orange-500 group-hover:w-full transition-all duration-500" />

                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    {svc.price ? (
                      <span className="text-[15px] 2xl:text-lg font-extrabold text-neutral-900 tracking-tight leading-none">
                        ${svc.price.toLocaleString("es-AR")}
                      </span>
                    ) : (
                      <span />
                    )}
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {typeof svc.duration === "number" && (
                        <div className="inline-flex items-center gap-1 bg-neutral-100 border border-neutral-200 px-2 py-1 rounded-md">
                          <Clock className="size-3 text-neutral-500" />
                          <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider whitespace-nowrap">
                            {svc.duration} min
                          </span>
                        </div>
                      )}
                      {hasDeposit && (
                        <div className="inline-flex items-center gap-1.5 bg-orange-100 border border-orange-200 px-2 py-1 rounded-md">
                          <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">
                            Seña
                          </span>
                          <span className="text-sm font-black text-orange-700 leading-none">
                            ${svc.depositAmount!.toLocaleString("es-AR")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </StepShell>
  );

  // BRANCH STEP
  const BranchStep = () => (
    <StepShell>
      <StepHeading title="¿Dónde querés atenderte?" />

      {/* Divider */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="h-px flex-1 bg-orange-100" />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
          nuestras sucursales
        </span>
        <div className="h-px flex-1 bg-orange-100" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Any branch card — same grid cell as a real branch */}
        <button
          onClick={() => {
            setSelectedBranch(null);
            setSelectedSlot(null);
            goNextStep();
          }}
          className={cn(
            "text-left p-3.5 2xl:p-5 rounded-2xl border-2 border-dashed transition-all",
            selectedBranch === null
              ? "border-orange-500 bg-gradient-to-r from-orange-100/70 to-orange-50 shadow-md"
              : "border-orange-300 bg-gradient-to-r from-orange-50/60 to-white hover:from-orange-100/60 hover:border-orange-400 hover:shadow-md",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-9 2xl:size-10 rounded-lg bg-white border-2 border-orange-400 flex items-center justify-center shrink-0 shadow-sm">
                <Zap className="size-4 text-orange-600" fill="currentColor" />
              </div>
              <div className="min-w-0">
                <div className="font-extrabold text-sm 2xl:text-base leading-tight">
                  Cualquier sucursal
                </div>
                <div className="text-[11px] 2xl:text-xs text-muted-foreground leading-snug">
                  Mostrá todos los turnos disponibles
                </div>
              </div>
            </div>
            <ChevronRight className="size-4 text-orange-500 shrink-0" />
          </div>
        </button>

        {branches.map((b) => {
          const sel = selectedBranch === b._id;
          return (
            <button
              key={b._id}
              onClick={() => {
                setSelectedBranch(b._id);
                setSelectedSlot(null);
                goNextStep();
              }}
              className={cn(
                "text-left p-3.5 2xl:p-5 rounded-2xl border-2 transition-all",
                sel
                  ? "border-orange-500 bg-orange-50 shadow-md ring-2 ring-orange-100"
                  : "border-orange-100 hover:border-orange-300 hover:shadow-md hover:bg-orange-50/30",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-9 2xl:size-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                    <MapPin className="size-4 text-orange-700" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm 2xl:text-base leading-tight">
                      {b.name}
                    </div>
                    {b.street && b.number && (
                      <div className="text-[11px] 2xl:text-xs text-muted-foreground leading-snug">
                        {b.street} {b.number}
                      </div>
                    )}
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground shrink-0" />
              </div>
            </button>
          );
        })}
      </div>
    </StepShell>
  );

  // EMPLOYEE STEP
  const EmployeeStep = () => (
    <StepShell>
      <StepHeading title="¿Con quién querés atenderte?" />

      {/* Divider */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="h-px flex-1 bg-orange-100" />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
          nuestro equipo
        </span>
        <div className="h-px flex-1 bg-orange-100" />
      </div>

      {/* Grilla de avatares. Las columnas se acotan por ancho en vez de fijar la
          cantidad: con pocos prestadores, 3 columnas estiraban cada card al
          doble de su alto. */}
      <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(120px,1fr))] 2xl:grid-cols-[repeat(auto-fill,minmax(190px,1fr))]">
        {/* Any specialist — una celda más de la grilla, como en el paso de sucursal */}
        <button
          onClick={() => {
            setSelectedEmployee(null);
            setSelectedSlot(null);
            goNextStep();
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-1.5 2xl:gap-2 p-2.5 2xl:p-4 min-h-[120px] 2xl:min-h-[152px] rounded-2xl border-2 border-dashed transition-all",
            selectedEmployee === null
              ? "border-orange-500 bg-gradient-to-b from-orange-100/70 to-orange-50 shadow-md"
              : "border-orange-300 bg-gradient-to-b from-orange-50/60 to-white hover:from-orange-100/60 hover:border-orange-400 hover:shadow-md",
          )}
        >
          <div className="size-14 2xl:size-16 rounded-xl bg-white border-2 border-orange-400 flex items-center justify-center shrink-0 shadow-sm">
            <Zap
              className="size-5 2xl:size-6 text-orange-600"
              fill="currentColor"
            />
          </div>
          <span className="font-extrabold text-[11px] 2xl:text-sm text-center leading-tight">
            Cualquier especialista
          </span>
        </button>

        {selectorEmployees.map((e) => {
          const sel = selectedEmployee === e._id;
          return (
            <button
              key={e._id}
              onClick={() => {
                setSelectedEmployee(e._id);
                setSelectedSlot(null);
                goNextStep();
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 2xl:gap-2 p-2.5 2xl:p-4 min-h-[120px] 2xl:min-h-[152px] rounded-2xl border-2 transition-all",
                sel
                  ? "border-orange-500 bg-orange-50 shadow-md ring-2 ring-orange-100"
                  : "border-orange-100 bg-white hover:border-orange-300 hover:bg-orange-50/30 hover:shadow-md",
              )}
            >
              {resolveImageUrl(e.profileImage) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveImageUrl(e.profileImage)!}
                  alt={e.name}
                  className={cn(
                    "size-14 2xl:size-16 rounded-xl object-cover shrink-0 transition-all",
                    sel ? "ring-2 ring-orange-500 shadow-md" : "",
                  )}
                />
              ) : (
                <div
                  className={cn(
                    "size-14 2xl:size-16 rounded-xl flex items-center justify-center text-base 2xl:text-xl font-black shrink-0 transition-all",
                    sel
                      ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md"
                      : "bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700",
                  )}
                >
                  {e.name?.[0]?.toUpperCase()}
                </div>
              )}
              <span className="font-bold text-[11px] 2xl:text-sm text-center leading-tight">
                {e.name} {e.surname}
              </span>
            </button>
          );
        })}
      </div>
    </StepShell>
  );

  // DATE STEP
  const tomorrowStr = useMemo(() => addDaysStr(initialDateStr, 1), [initialDateStr]);

  const currentDateLabel = useMemo(() => {
    const d = dateForDateStr(currentDateStr);
    return `${DAY_NAMES[d.getUTCDay()]} ${d.getUTCDate()} de ${MONTH_NAMES[d.getUTCMonth()]}`;
  }, [currentDateStr]);

  const currentDateRelLabel =
    currentDateStr === initialDateStr
      ? "Hoy"
      : currentDateStr === tomorrowStr
        ? "Mañana"
        : null;

  const groupedDaySlots = useMemo(
    () =>
      TIME_BUCKETS.map((bucket, i) => {
        const from = i === 0 ? 0 : TIME_BUCKETS[i - 1].until;
        return {
          ...bucket,
          items: dayAppointments.filter((a) => {
            const h = Number(a.timeLabel.slice(0, 2));
            return h >= from && h < bucket.until;
          }),
        };
      }).filter((g) => g.items.length > 0),
    [dayAppointments],
  );

  const pickDate = (dateStr: string) => {
    setCurrentDateStr(dateStr);
    setSelectedSlot(null);
  };

  const DateStep = () => (
    <StepShell
      footer={
        <button
          disabled={!selectedSlot}
          onClick={goNextStep}
          className={cn(
            "flex-1 h-11 2xl:h-12 rounded-xl text-xs 2xl:text-sm font-bold uppercase tracking-wider transition-all shadow-md",
            selectedSlot
              ? "bg-primary text-primary-foreground hover:opacity-90 hover:shadow-lg"
              : "bg-muted text-muted-foreground cursor-not-allowed shadow-none",
          )}
        >
          Continuar
        </button>
      }
    >
      <StepHeading
        title="Fecha y hora"
        subtitle={
          selectedServiceObj ? (
            <>
              Para <b>{selectedServiceObj.name}</b>
              {displayDuration > 0 && <> · {displayDuration} min</>}
            </>
          ) : undefined
        }
      />

      {availableDatesArray.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          No hay fechas disponibles
          {selectedService ? ` para "${selectedService}"` : ""}.
        </p>
      ) : (
        <div className="md:grid md:grid-cols-[260px_1fr] 2xl:md:grid-cols-[320px_1fr] md:gap-6 2xl:md:gap-8 flex flex-col gap-5">
          {/* Calendario */}
          <div className="shrink-0">
            <span className="text-[11px] 2xl:text-xs uppercase tracking-wider font-bold text-primary mb-2 block">
              Elegí un día
            </span>
            <MonthCalendar
              month={calendarMonth}
              onMonthChange={setCalendarMonth}
              canGoPrev={calendarMonth > monthRange.min}
              canGoNext={calendarMonth < monthRange.max}
              availableDates={availableDateStrSet}
              selected={currentDateStr}
              todayStr={initialDateStr}
              onSelect={pickDate}
            />
          </div>

          {/* Horarios del día elegido */}
          <div className="md:border-l md:border-orange-100 md:pl-6 2xl:md:pl-8 min-w-0">
            <span className="text-[11px] 2xl:text-xs uppercase tracking-wider font-bold text-primary mb-2 block">
              Elegí un horario
            </span>
            <div className="flex items-center gap-2 -mt-1 mb-3">
              {currentDateRelLabel && (
                <span className="shrink-0 text-[10px] font-black uppercase tracking-wider text-primary-foreground bg-primary rounded-full px-2 py-0.5">
                  {currentDateRelLabel}
                </span>
              )}
              <p className="text-base 2xl:text-lg font-extrabold first-letter:uppercase text-neutral-900 leading-tight">
                {currentDateLabel}
              </p>
            </div>
            {dayAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay horarios disponibles para este día.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {groupedDaySlots.map(({ id, label, Icon, items }) => (
                  <div key={id}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Icon className="size-3.5 text-orange-500" />
                      <span className="text-[11px] uppercase tracking-wider font-bold text-neutral-700">
                        {label}
                      </span>
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        · {items.length}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "grid gap-2",
                        showBranchInSlots
                          ? "grid-cols-3 2xl:grid-cols-4"
                          : "grid-cols-3 md:grid-cols-4 2xl:grid-cols-6",
                      )}
                    >
                      {items.map((apt) => {
                        const sel = selectedSlot?._id === apt._id;
                        const booked = apt.status === "booked";
                        const aptBranch =
                          showBranchInSlots && apt.branchID
                            ? branches.find((b) => b._id === apt.branchID)
                            : null;
                        return (
                          <button
                            key={apt._id}
                            onClick={() => !booked && setSelectedSlot(apt)}
                            disabled={booked}
                            className={cn(
                              "rounded-xl border text-xs 2xl:text-sm font-bold transition-all flex flex-col items-center justify-center gap-0.5 py-2.5 2xl:py-3 px-1 min-w-0",
                              booked
                                ? "border-border bg-muted/50 text-muted-foreground/40 cursor-not-allowed"
                                : sel
                                  ? "border-primary bg-primary text-primary-foreground shadow-md"
                                  : "border-primary/15 bg-white hover:border-primary/40 hover:bg-primary/5",
                            )}
                          >
                            <span className="truncate w-full text-center">
                              {apt.timeLabel}
                            </span>
                            {aptBranch && (
                              <span
                                className={cn(
                                  "text-[9px] font-semibold leading-tight truncate w-full text-center",
                                  sel
                                    ? "text-primary-foreground/75"
                                    : "text-muted-foreground",
                                )}
                              >
                                {aptBranch.name}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </StepShell>
  );

  // Resumen de la reserva: el mismo bloque se usa en el paso de confirmación y
  // en la pantalla final, para que el cliente vea siempre los mismos datos.
  const BookingSummary = ({
    className,
    style,
  }: {
    className?: string;
    style?: React.CSSProperties;
  }) => {
    if (!selectedSlot) return null;
    return (
      <div
        className={cn(
          "rounded-2xl bg-primary/5 border border-primary/20 overflow-hidden",
          className,
        )}
        style={style}
      >
        {/* Fecha/hora header */}
        <div className="flex items-center gap-3 bg-primary px-4 py-2.5 2xl:py-3">
          <CalendarDays className="size-4 text-primary-foreground shrink-0" />
          <div>
            <p className="text-base 2xl:text-lg font-bold text-primary-foreground capitalize">{modalDateStr}</p>
            <p className="text-[13px] 2xl:text-sm text-primary-foreground/80">{selectedSlot.timeLabel} — {selectedSlot.endTimeLabel} hs</p>
          </div>
        </div>

        <div className="px-4 py-3 2xl:py-3.5 flex flex-col bg-white divide-y divide-primary/15">
          {/* Servicio + precio inline */}
          {selectedServiceObj && (
            <div className="flex items-start justify-between gap-3 pb-2.5 2xl:pb-3">
              <div className="flex items-start gap-2 min-w-0">
                <Tag className="size-3.5 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-primary leading-none">Servicio</span>
                  <p className="font-extrabold text-sm 2xl:text-base text-neutral-900 leading-tight">{selectedServiceObj.name}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Precio</span>
                <p className="text-xl 2xl:text-2xl font-black text-primary leading-none mt-0.5">${selectedSlot.price.toLocaleString("es-AR")}</p>
              </div>
            </div>
          )}

          {/* Dónde: nombre de sucursal + dirección completa + acceso al mapa */}
          {(summaryPlaceName || summaryAddress) && (
            <div className="flex items-center gap-2.5 py-2.5 2xl:py-3">
              <div className="size-8 2xl:size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="size-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] 2xl:text-sm font-bold text-neutral-900 leading-tight truncate">
                  {summaryPlaceName}
                </p>
                {summaryAddress && (
                  <p className="text-[11px] 2xl:text-xs text-muted-foreground leading-snug">
                    {summaryAddress}
                  </p>
                )}
              </div>
              {summaryMapsUrl && (
                <a
                  href={summaryMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 whitespace-nowrap text-[11px] 2xl:text-xs font-bold text-primary border border-primary/25 hover:bg-primary/5 hover:border-primary/40 px-2.5 py-1.5 rounded-full transition-all"
                >
                  Cómo llegar
                </a>
              )}
            </div>
          )}

          {/* Con quién: sólo si hay a quién nombrar o si el cliente pudo elegir */}
          {(displayEmployeeObj || employees.length >= 2) && (
            <div className="flex items-center gap-2.5 py-2.5 2xl:py-3">
              {resolveImageUrl(displayEmployeeObj?.profileImage) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveImageUrl(displayEmployeeObj!.profileImage)!}
                  alt={displayEmployeeObj!.name}
                  className="size-8 2xl:size-9 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div className="size-8 2xl:size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  {displayEmployeeObj ? (
                    <span className="text-xs 2xl:text-sm font-black text-primary">
                      {displayEmployeeObj.name?.[0]?.toUpperCase()}
                    </span>
                  ) : (
                    <User className="size-4 text-primary" />
                  )}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[13px] 2xl:text-sm font-bold text-neutral-900 leading-tight truncate">
                  {displayEmployeeObj
                    ? `${displayEmployeeObj.name} ${displayEmployeeObj.surname ?? ""}`.trim()
                    : "Sin preferencia"}
                </p>
                <p className="text-[11px] 2xl:text-xs text-muted-foreground leading-snug truncate">
                  {displayEmployeeObj
                    ? "Te atiende"
                    : "Te asignamos al primero disponible"}
                </p>
              </div>
            </div>
          )}

          {/* Seña: solo cuando el turno la requiere */}
          {requiresDeposit && (
            <div className="pt-2.5 2xl:pt-3">
              <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Seña · Mercado Pago</span>
              <p className="text-sm font-bold text-primary">${selectedServiceObj!.depositAmount!.toLocaleString("es-AR")}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // CONFIRM STEP
  const ConfirmStep = () => (
    <StepShell
      footer={
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={bookingSpinner}
          className="flex-1 h-11 2xl:h-12 rounded-xl text-xs 2xl:text-sm font-bold uppercase tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
        >
          {bookingSpinner ? (
            <Loader2 className="size-4 animate-spin" />
          ) : requiresDeposit ? (
            <>
              <ExternalLink className="size-4" /> Abonar y confirmar
            </>
          ) : (
            "Confirmar reserva"
          )}
        </button>
      }
    >
      <StepHeading
        title="Casi listo"
        subtitle="Completá tus datos para confirmar la reserva."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 2xl:gap-4 shrink-0">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] 2xl:text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Nombre y apellido
          </label>
          <input
            {...register("name")}
            placeholder="Juan Pérez"
            maxLength={35}
            className="h-10 2xl:h-11 px-3 rounded-lg border border-border bg-white text-[13px] 2xl:text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all"
          />
          {errors.name?.message && (
            <span className="text-xs text-red-500">{errors.name.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] 2xl:text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Teléfono
          </label>
          <input
            {...register("phone")}
            type="number"
            placeholder="11 1234 5678"
            onKeyDown={(e) => ["+", "-", "e", "E", "."].includes(e.key) && e.preventDefault()}
            className="h-10 2xl:h-11 px-3 rounded-lg border border-border bg-white text-[13px] 2xl:text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all"
          />
          {errors.phone?.message && (
            <span className="text-xs text-red-500">{errors.phone.message}</span>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1 shrink-0">
        <label className="text-[11px] 2xl:text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Email
        </label>
        <input
          {...register("email")}
          type="email"
          placeholder="juan@email.com"
          maxLength={100}
          className="h-10 2xl:h-11 px-3 rounded-lg border border-border bg-white text-[13px] 2xl:text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all"
        />
        {errors.email?.message && (
          <span className="text-xs text-red-500">{errors.email.message}</span>
        )}
      </div>

      {/* Summary */}
      <BookingSummary className="shrink-0" />

      {bookingError && (
        <p className="text-sm text-red-500 font-semibold shrink-0">{bookingError}</p>
      )}
    </StepShell>
  );

  // ── Business header strip (integrated inside unified container) ─
  const BusinessHeaderStrip = () => (
    <div className="relative bg-primary/5 border-b border-primary/10 overflow-hidden shrink-0">
      <div className="relative flex items-center gap-4 2xl:gap-5 px-5 py-4 md:px-6 md:py-4 2xl:px-10 2xl:py-6">
        {/* Avatar: foto del negocio, con la inicial de marca como fallback */}
        {businessLogoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={businessLogoUrl}
            alt={businessData.name ? `Logo de ${businessData.name}` : "Logo del negocio"}
            onError={() => setLogoFailed(true)}
            className="size-11 md:size-12 2xl:size-16 rounded-2xl object-cover shrink-0 select-none shadow-md bg-primary/10"
          />
        ) : (
          <div className="size-11 md:size-12 2xl:size-16 rounded-2xl bg-primary flex items-center justify-center shrink-0 select-none shadow-md">
            <span className="text-lg md:text-xl 2xl:text-3xl font-black text-primary-foreground">
              {businessData.name?.[0]?.toUpperCase() ?? ""}
            </span>
          </div>
        )}

        {/* Info block */}
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-lg md:text-xl 2xl:text-3xl font-bold text-neutral-900 tracking-tight leading-none truncate">
              {businessData.name}
            </h1>
            {businessData.businessType && (
              <span className="shrink-0 text-[11px] 2xl:text-xs bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full font-semibold">
                {businessData.businessType}
              </span>
            )}
          </div>
          {(singleLocationAddress || contactPhone || soleProvider) && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 mt-1 2xl:mt-1.5 text-xs 2xl:text-[13px] text-neutral-500">
              {soleProvider && (
                <span className="flex items-center gap-1.5 min-w-0">
                  {resolveImageUrl(soleProvider.profileImage) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolveImageUrl(soleProvider.profileImage)!}
                      alt={soleProvider.name}
                      className="size-4 2xl:size-5 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <User className="size-3.5 text-primary/60 shrink-0" />
                  )}
                  <span className="truncate">
                    Te atiende{" "}
                    <b className="font-semibold text-neutral-700">
                      {`${soleProvider.name} ${soleProvider.surname ?? ""}`.trim()}
                    </b>
                  </span>
                </span>
              )}
              {singleLocationAddress && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-primary/60 shrink-0" />
                  <span className="truncate">{singleLocationAddress}</span>
                </span>
              )}
              {contactPhone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="size-3.5 text-primary/60 shrink-0" />
                  {contactPhone}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 2xl:px-5 2xl:py-2.5 rounded-2xl shadow-md shrink-0">
          <CalendarDays className="size-4 2xl:size-4.5" strokeWidth={2.5} />
          <span className="font-bold text-[13px] 2xl:text-sm tracking-wide">Reservar turno</span>
        </div>
      </div>
    </div>
  );

  // ── Done screen ──────────────────────────────────────────────
  if (wizardStep === "done") {
    return (
      <div className="flex flex-col w-full min-h-screen" style={{ background: "radial-gradient(ellipse 65% 55% at 12% 88%, rgba(255, 180, 110, 0.42) 0%, transparent 100%), radial-gradient(ellipse 55% 50% at 88% 12%, rgba(255, 140, 90, 0.32) 0%, transparent 100%), radial-gradient(ellipse 45% 40% at 65% 78%, rgba(255, 210, 160, 0.24) 0%, transparent 100%), #fff8f3" }}>
        <main className="flex flex-col flex-1 w-full max-w-7xl pt-[68px] md:pt-[84px] pb-4 mx-auto px-4 md:px-8 md:pb-6">
          <div className="rounded-3xl bg-white overflow-hidden shadow-2xl border border-orange-100/70">
            <BusinessHeaderStrip />
            <div className="flex flex-col w-fit mx-auto items-center gap-6 py-16 md:py-20 px-6">
              <div className="relative">
                <div className="booking-glow absolute inset-0 rounded-full bg-emerald-500/15 blur-2xl" />
                <div className="booking-ripple absolute inset-0 rounded-full border-2 border-emerald-500/60" />
                <div
                  className="booking-ripple absolute inset-0 rounded-full border-2 border-emerald-500/40"
                  style={{ animationDelay: "0.3s" }}
                />
                <div className="booking-badge relative size-16 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center">
                  <Check className="booking-check text-emerald-600 size-8" strokeWidth={3} />
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 max-w-md">
                <h2
                  className="booking-rise text-2xl md:text-3xl font-black tracking-tight text-neutral-900"
                  style={{ "--rise-delay": "0.45s" } as React.CSSProperties}
                >
                  Turno reservado
                </h2>
                <p
                  className="booking-rise text-base text-muted-foreground text-center leading-relaxed"
                  style={{ "--rise-delay": "0.55s" } as React.CSSProperties}
                >
                  Te enviamos los datos de la reserva a tu email. Si no lo ves, chequeá tu carpeta de correo no deseado.
                </p>
              </div>

              <BookingSummary
                className="booking-rise w-full max-w-md mt-2 text-left"
                style={{ "--rise-delay": "0.68s" } as React.CSSProperties}
              />

              <div
                className="booking-rise w-full max-w-md flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-left"
                style={{ "--rise-delay": "0.8s" } as React.CSSProperties}
              >
                <div className="mt-0.5 shrink-0 size-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center">
                  <Clock className="size-4 text-amber-700" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    Recordatorio
                  </span>
                  <p className="text-sm text-amber-900/90 leading-relaxed">
                    Por favor, llegá con anticipación al horario de inicio. La puntualidad es clave para que todo salga bien. ¡Nos vemos pronto!
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setWizardStep("service");
                  setSelectedSlot(null);
                }}
                className="booking-rise mt-2 w-full xs:w-fit h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold shadow-md hover:shadow-lg transition-all"
                style={{ "--rise-delay": "0.92s" } as React.CSSProperties}
              >
                Reservar otro turno
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── Main wizard layout ───────────────────────────────────────
  return (
    <div className="flex flex-col w-full min-h-screen md:h-screen md:min-h-0 md:overflow-hidden" style={{ background: "radial-gradient(ellipse 65% 55% at 12% 88%, rgba(255, 180, 110, 0.42) 0%, transparent 100%), radial-gradient(ellipse 55% 50% at 88% 12%, rgba(255, 140, 90, 0.32) 0%, transparent 100%), radial-gradient(ellipse 45% 40% at 65% 78%, rgba(255, 210, 160, 0.24) 0%, transparent 100%), #fff8f3" }}>
      <main className="flex flex-col flex-1 md:min-h-0 w-full max-w-[1200px] 2xl:max-w-7xl pt-[68px] md:pt-[84px] pb-4 mx-auto px-4 md:px-8 md:pb-6">
        {/* En desktop la tarjeta se mide por su contenido y sólo usa el alto
            disponible como techo, así no estira medio viewport vacío en pantallas
            grandes, pero sigue clampeando (y scrolleando por dentro) cuando el paso
            es largo. En mobile, en cambio, crece hasta el borde inferior del
            viewport dejando el mismo aire que a los lados (pb-4 = px-4). */}
        <div className="rounded-3xl bg-white overflow-hidden shadow-2xl border border-orange-100/70 flex flex-col flex-1 md:flex-initial md:min-h-0 md:max-h-full">
          <BusinessHeaderStrip />

          <div className="flex flex-col flex-1 md:flex-row md:min-h-0">
            {/* ── Desktop sidebar (warm orange gradient) ── */}
            <aside className="hidden md:flex md:flex-col md:w-60 2xl:w-80 md:shrink-0 relative overflow-hidden bg-primary text-white p-5 2xl:px-10 2xl:py-6">
              {/* Decorative overlays for depth */}
              <div className="absolute -top-20 -right-20 size-52 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute -bottom-24 -left-16 size-60 rounded-full bg-white/5 pointer-events-none" />
              <div className="absolute top-1/3 -right-8 size-16 rounded-full bg-white/5 pointer-events-none" />

              <div className="relative flex flex-col flex-1 min-h-0 overflow-y-auto scrollbar-hide">
                <div className="flex items-center gap-3 mb-4 2xl:mb-6 shrink-0">
                  <div className="size-10 2xl:size-12 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center shrink-0 shadow-lg">
                    <CalendarDays className="size-4 2xl:size-5 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm 2xl:text-base font-bold truncate">
                      Nueva reserva
                    </h2>
                    {/* <p className="text-xs text-white/75">Tarda menos de un minuto</p> */}
                  </div>
                </div>

                <div className="border-t border-white/20 pt-4 2xl:pt-6 flex-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-white/60 mb-2 2xl:mb-3 block">
                    Tu reserva
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {activeSteps.map((step, i) => {
                      const isCurr = step === wizardStep;
                      const isDone = i < stepIndex;
                      return (
                        <button
                          key={step}
                          onClick={() => isDone && setWizardStep(step)}
                          disabled={!isDone && !isCurr}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 2xl:py-2.5 rounded-xl text-left transition-all",
                            isCurr
                              ? "bg-white shadow-xl shadow-black/10"
                              : isDone
                                ? "hover:bg-white/10 cursor-pointer"
                                : "opacity-75 cursor-default",
                          )}
                        >
                          <div className="size-5 2xl:size-6 shrink-0 flex items-center justify-center">
                            {isDone ? (
                              <div className="size-5 2xl:size-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/50">
                                <Check
                                  className="size-3 2xl:size-3.5 text-white"
                                  strokeWidth={3}
                                />
                              </div>
                            ) : (
                              <div
                                className={cn(
                                  "size-5 2xl:size-6 rounded-full flex items-center justify-center text-[11px] 2xl:text-xs font-bold",
                                  isCurr
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "bg-white/15 text-white/70 border border-white/25",
                                )}
                              >
                                {i + 1}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span
                              className={cn(
                                "text-[13px] 2xl:text-sm font-bold",
                                isCurr
                                  ? "text-primary"
                                  : isDone
                                    ? "text-white"
                                    : "text-white/80",
                              )}
                            >
                              {STEP_LABELS[step]}
                            </span>
                            {isDone && stepSubtitles[step] && (
                              <span className="text-[11px] 2xl:text-xs font-medium capitalize-first-letter truncate text-white/60">
                                {stepSubtitles[step]}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {(contactPhone || singleLocationAddress) && (
                  <div className="mt-4 2xl:mt-6 p-3.5 2xl:p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/20 shrink-0">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-white/70 block mb-1.5 2xl:mb-2">
                      ¿Necesitás ayuda?
                    </span>
                    {contactPhone && (
                      <div className="flex items-center gap-2 text-xs text-white">
                        <Phone className="size-3" /> {contactPhone}
                      </div>
                    )}
                    {singleLocationAddress && (
                      <div className="flex items-center gap-2 text-xs text-white mt-1">
                        <MapPin className="size-3" /> {singleLocationAddress}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </aside>

            {/* ── Mobile top strip (warm orange gradient) ── */}
            <div className="md:hidden relative overflow-hidden bg-gradient-to-r from-orange-500 via-orange-600 to-orange-600 text-white px-5 pt-3 pb-3 shrink-0">
              <div className="absolute -top-8 -right-4 size-24 rounded-full bg-white/10 pointer-events-none" />
              <div className="relative flex items-center mb-2">
                <p className="text-sm text-white/85">
                  Paso {stepIndex + 1} de {activeSteps.length} ·{" "}
                  <span className="font-bold text-white">
                    {STEP_LABELS[wizardStep as ActiveStep]}
                  </span>
                </p>
              </div>
              <div className="relative flex gap-1">
                {activeSteps.map((step, i) => {
                  const isCurr = step === wizardStep;
                  const isDone = i < stepIndex;
                  return (
                    <div
                      key={step}
                      className={cn(
                        "flex-1 h-1 rounded-full transition-colors",
                        isDone
                          ? "bg-emerald-400"
                          : isCurr
                            ? "bg-white"
                            : "bg-white/25",
                      )}
                    />
                  );
                })}
              </div>
            </div>

            {/* ── Step content ── */}
            <section className="flex flex-col flex-1 min-w-0 md:min-h-0 px-5 py-3.5 md:p-6 2xl:px-10 2xl:py-6 bg-gradient-to-b from-white to-orange-50/20">
              {renderStepContent()}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
