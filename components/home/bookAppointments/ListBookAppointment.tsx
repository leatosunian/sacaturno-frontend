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
  ArrowLeft,
  User,
  Tag,
} from "lucide-react";
import { cn, composeBranchAddress } from "@/lib/utils";
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
const DAY_ABBR = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SAB"];
const MONTH_ABBR = [
  "ENE",
  "FEB",
  "MAR",
  "ABR",
  "MAY",
  "JUN",
  "JUL",
  "AGO",
  "SEP",
  "OCT",
  "NOV",
  "DIC",
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
  appointments,
  businessData,
  scheduleDays,
  employees,
  branches,
}: Props) {
  const router = useRouter();

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
  const [selectedSlot, setSelectedSlot] = useState<FormattedAppointment | null>(
    null,
  );

  // ── Wizard state ──
  const [wizardStep, setWizardStep] = useState<WizardStep>("service");
  const [bookingSpinner, setBookingSpinner] = useState(false);
  const [bookingError, setBookingError] = useState("");

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

  // ── Employee selector filtered by branch ──
  const selectorEmployees = useMemo(() => {
    if (!selectedBranch) return employees;
    return employees.filter((e) => (e.branches ?? []).includes(selectedBranch));
  }, [employees, selectedBranch]);

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

  // Con sucursales cargadas, ellas son la fuente de verdad para la dirección:
  // con una sola sucursal se muestra su dirección puntual; con 2+ es ambiguo y se oculta.
  const singleLocationAddress = useMemo(() => {
    if (branches.length === 0) return businessData.address || null;
    if (branches.length === 1) return composeBranchAddress(branches[0]) || null;
    return null;
  }, [branches, businessData.address]);

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
      });
      setWizardStep("done");
      router.refresh();
    } catch {
      setBookingError("Error al reservar. Intentá de nuevo.");
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
      });
      window.location.href = res.data.initPoint;
    } catch (error: any) {
      const msg = error?.response?.data?.msg;
      setBookingError(
        msg === "BUSINESS_NOT_LINKED"
          ? "Este negocio aún no configuró el cobro de señas. Contactalo directamente."
          : "No se pudo generar el pago. Intentá de nuevo.",
      );
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

  // SERVICE STEP
  const ServiceStep = () => (
    <div className="flex flex-col gap-5">
      <div>
        <span className="hidden md:inline text-xs uppercase tracking-widest text-orange-600 font-bold">
          {stepLabel}
        </span>
        <h2 className="text-xl md:text-2xl 2xl:text-3xl font-extrabold tracking-tight mt-1">
          Seleccioná un servicio
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          ¿Qué querés reservar hoy?
        </p>
      </div>
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
                  goNextStep();
                }}
                className={cn(
                  "group relative text-left rounded-xl border transition-all overflow-hidden p-3.5 2xl:p-4",
                  sel
                    ? "border-orange-500 bg-orange-50 shadow-md ring-2 ring-orange-100"
                    : "border-orange-100 bg-white hover:border-orange-300 hover:bg-orange-50/30 hover:shadow-md",
                )}
              >
                <div className="flex flex-col gap-2">
                  <h3 className="font-extrabold text-[15px] 2xl:text-base leading-tight text-neutral-900 tracking-tight">
                    {svc.name}
                  </h3>

                  <div className="h-0.5 w-6 bg-orange-500 group-hover:w-full transition-all duration-500" />

                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    {svc.price ? (
                      <span className="text-base 2xl:text-lg font-extrabold text-neutral-900 tracking-tight leading-none">
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
    </div>
  );

  // BRANCH STEP
  const BranchStep = () => (
    <div className="flex flex-col gap-5">
      <div>
        <button
          onClick={goPrevStep}
          className="flex w-fit items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 hover:bg-orange-100 hover:border-orange-300 px-3 py-1.5 rounded-lg transition-all mb-4"
        >
          <ArrowLeft className="size-3.5" /> Volver
        </button>
        <span className="hidden md:inline text-xs uppercase tracking-widest text-orange-600 font-bold">
          {stepLabel}
        </span>
        <h2 className="text-xl md:text-2xl 2xl:text-3xl font-extrabold tracking-tight mt-1">
          ¿Dónde querés atenderte?
        </h2>
      </div>

      {/* Any branch hero card */}
      <button
        onClick={() => {
          setSelectedBranch(null);
          setSelectedSlot(null);
          goNextStep();
        }}
        className={cn(
          "text-left p-4 2xl:p-5 rounded-2xl border-2 border-dashed transition-all flex items-center gap-4 relative overflow-hidden",
          selectedBranch === null
            ? "border-orange-500 bg-gradient-to-r from-orange-100/70 to-orange-50 shadow-md"
            : "border-orange-300 bg-gradient-to-r from-orange-50/60 to-white hover:from-orange-100/60 hover:border-orange-400 hover:shadow-md",
        )}
      >
        <div className="size-12 2xl:size-14 rounded-xl bg-white border-2 border-orange-400 flex items-center justify-center shrink-0 shadow-sm">
          <Zap className="size-5 2xl:size-6 text-orange-600" fill="currentColor" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-extrabold text-sm 2xl:text-base leading-tight">
            Cualquier sucursal
          </div>
          <div className="text-[11px] 2xl:text-xs text-muted-foreground mt-1 leading-snug">
            Mostrá todos los turnos disponibles
          </div>
        </div>
        <ChevronRight className="size-4 text-orange-500 shrink-0" />
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-orange-100" />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
          nuestras sucursales
        </span>
        <div className="h-px flex-1 bg-orange-100" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                "text-left p-4 2xl:p-5 rounded-2xl border transition-all",
                sel
                  ? "border-orange-500 bg-orange-50 shadow-md ring-2 ring-orange-100"
                  : "border-orange-100 hover:border-orange-300 hover:shadow-md hover:bg-orange-50/30",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                    <MapPin className="size-4 text-orange-700" />
                  </div>
                  <div>
                    <div className="font-bold">{b.name}</div>
                    {b.street && b.number && (
                      <div className="text-xs text-muted-foreground">
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
    </div>
  );

  // EMPLOYEE STEP
  const EmployeeStep = () => (
    <div className="flex flex-col gap-5">
      <div>
        <button
          onClick={goPrevStep}
          className="flex w-fit items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 hover:bg-orange-100 hover:border-orange-300 px-3 py-1.5 rounded-lg transition-all mb-4"
        >
          <ArrowLeft className="size-3.5" /> Volver
        </button>
        <span className="hidden md:inline text-xs uppercase tracking-widest text-orange-600 font-bold">
          {stepLabel}
        </span>
        <h2 className="text-xl md:text-2xl 2xl:text-3xl font-extrabold tracking-tight mt-1">
          ¿Con quién querés atenderte?
        </h2>
      </div>

      {/* distinctive dashed hero card */}
      <button
        onClick={() => {
          setSelectedEmployee(null);
          setSelectedSlot(null);
          goNextStep();
        }}
        className={cn(
          "text-left p-4 2xl:p-5 rounded-2xl border-2 border-dashed transition-all flex items-center gap-4 relative overflow-hidden",
          selectedEmployee === null
            ? "border-orange-500 bg-gradient-to-r from-orange-100/70 to-orange-50 shadow-md"
            : "border-orange-300 bg-gradient-to-r from-orange-50/60 to-white hover:from-orange-100/60 hover:border-orange-400 hover:shadow-md",
        )}
      >
        <div className="size-12 2xl:size-14 rounded-xl bg-white border-2 border-orange-400 flex items-center justify-center shrink-0 shadow-sm">
          <Zap
            className="size-5 2xl:size-6 text-orange-600"
            fill="currentColor"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-extrabold text-sm 2xl:text-base leading-tight">
            Cualquier especialista 
          </div>
          <div className="text-[11px] 2xl:text-xs text-muted-foreground mt-1 leading-snug">
            O reservá con el primero disponible
          </div>
        </div>
        <ChevronRight className="size-4 text-orange-500 shrink-0" />
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-orange-100" />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
          nuestro equipo
        </span>
        <div className="h-px flex-1 bg-orange-100" />
      </div>

      {/* Vertical avatar grid (rounded-square badges, distinct from the ref) */}
      <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-3">
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
                "flex flex-col items-center gap-2 p-3 2xl:p-4 rounded-2xl border-2 transition-all",
                sel
                  ? "border-orange-500 bg-orange-50 shadow-md ring-2 ring-orange-100"
                  : "border-orange-100 bg-white hover:border-orange-300 hover:bg-orange-50/30 hover:shadow-md",
              )}
            >
              {e.profileImage && e.profileImage !== "user.png" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/getprofilepic/${e.profileImage}`}
                  alt={e.name}
                  className={cn(
                    "size-14 2xl:size-16 rounded-xl object-cover shrink-0 transition-all",
                    sel ? "ring-2 ring-orange-500 shadow-md" : "",
                  )}
                />
              ) : (
                <div
                  className={cn(
                    "size-14 2xl:size-16 rounded-xl flex items-center justify-center text-lg 2xl:text-xl font-black shrink-0 transition-all",
                    sel
                      ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md"
                      : "bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700",
                  )}
                >
                  {e.name?.[0]?.toUpperCase()}
                </div>
              )}
              <span className="font-bold text-xs 2xl:text-sm text-center leading-tight">
                {e.name} {e.surname}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  // DATE STEP
  const DateStep = () => (
    <div className="flex flex-col gap-5">
      <div>
        {activeSteps.indexOf("date") > 0 && (
          <button
            onClick={goPrevStep}
            className="flex w-fit items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 hover:bg-orange-100 hover:border-orange-300 px-3 py-1.5 rounded-lg transition-all mb-4"
          >
            <ArrowLeft className="size-3.5" /> Volver
          </button>
        )}
        <span className="hidden md:inline text-xs uppercase tracking-widest text-primary font-bold">
          {stepLabel}
        </span>
        <h2 className="text-xl md:text-2xl 2xl:text-3xl font-extrabold tracking-tight mt-1">
          Fecha y hora
        </h2>
        {selectedServiceObj && (
          <p className="text-sm text-muted-foreground mt-1">
            Para <b>{selectedServiceObj.name}</b>
            {displayDuration > 0 && <> · {displayDuration} min</>}
          </p>
        )}
      </div>

      {/* Date pills */}
      <div>
        <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2 block">
          Elegí un día
        </span>
        {availableDatesArray.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No hay fechas disponibles
            {selectedService ? ` para "${selectedService}"` : ""}.
          </p>
        ) : (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {availableDatesArray.map((dateStr) => {
              const sel = currentDateStr === dateStr;
              const d = dateForDateStr(dateStr);
              return (
                <button
                  key={dateStr}
                  onClick={() => {
                    setCurrentDateStr(dateStr);
                    setSelectedSlot(null);
                  }}
                  className={cn(
                    "shrink-0 w-16 py-3 rounded-2xl border flex flex-col items-center justify-center transition-all",
                    sel
                      ? "border-primary bg-primary text-primary-foreground shadow-lg"
                      : "border-primary/15 bg-white hover:border-primary/40 hover:bg-primary/5",
                  )}
                >
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase leading-none",
                      sel ? "text-primary-foreground/80" : "text-muted-foreground",
                    )}
                  >
                    {DAY_ABBR[d.getUTCDay()]}
                  </span>
                  <span className="text-lg font-black leading-tight mt-1">
                    {d.getUTCDate()}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-semibold mt-0.5",
                      sel ? "text-primary-foreground/80" : "text-muted-foreground",
                    )}
                  >
                    {MONTH_ABBR[d.getUTCMonth()]}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Time slots */}
      {availableDateStrSet.has(currentDateStr) && (
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2 block">
            Elegí un horario
          </span>
          {dayAppointments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay horarios disponibles para este día.
            </p>
          ) : (
            <div className={cn(
              "grid gap-2",
              showBranchInSlots
                ? "grid-cols-3 md:grid-cols-4 2xl:grid-cols-5"
                : "grid-cols-4 md:grid-cols-6 2xl:grid-cols-8",
            )}>
              {dayAppointments.map((apt) => {
                const sel = selectedSlot?._id === apt._id;
                const booked = apt.status === "booked";
                const aptBranch = showBranchInSlots && apt.branchID
                  ? branches.find((b) => b._id === apt.branchID)
                  : null;
                return (
                  <button
                    key={apt._id}
                    onClick={() => !booked && setSelectedSlot(apt)}
                    disabled={booked}
                    className={cn(
                      "rounded-lg border text-sm font-bold transition-all flex flex-col items-center justify-center gap-0.5 py-2 px-1 min-w-0",
                      booked
                        ? "border-border bg-muted/50 text-muted-foreground/40 cursor-not-allowed"
                        : sel
                          ? "border-primary bg-primary text-primary-foreground shadow-md"
                          : "border-primary/15 bg-white hover:border-primary/40 hover:bg-primary/5",
                    )}
                  >
                    <span className="truncate w-full text-center">{apt.timeLabel}</span>
                    {aptBranch && (
                      <span className={cn(
                        "text-[9px] font-semibold leading-tight truncate w-full text-center",
                        sel ? "text-primary-foreground/75" : "text-muted-foreground",
                      )}>
                        {aptBranch.name}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <button
        disabled={!selectedSlot}
        onClick={goNextStep}
        className={cn(
          "h-12 rounded-xl text-sm font-bold uppercase tracking-wider transition-all shadow-md",
          selectedSlot
            ? "bg-primary text-primary-foreground hover:opacity-90 hover:shadow-lg"
            : "bg-muted text-muted-foreground cursor-not-allowed shadow-none",
        )}
      >
        Continuar
      </button>
    </div>
  );

  // CONFIRM STEP
  const ConfirmStep = () => (
    <div className="flex flex-col gap-5">
      <div>
        <button
          onClick={goPrevStep}
          className="flex w-fit items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 hover:bg-orange-100 hover:border-orange-300 px-3 py-1.5 rounded-lg transition-all mb-4"
        >
          <ArrowLeft className="size-3.5" /> Volver
        </button>
        <span className="hidden md:inline text-xs uppercase tracking-widest text-orange-600 font-bold">
          {stepLabel}
        </span>
        <h2 className="text-xl md:text-2xl 2xl:text-3xl font-black tracking-tight mt-1">
          Casi listo
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Completá tus datos para confirmar la reserva.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Nombre y apellido
          </label>
          <input
            {...register("name")}
            placeholder="Juan Pérez"
            maxLength={35}
            className="h-11 px-3 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all"
          />
          {errors.name?.message && (
            <span className="text-xs text-red-500">{errors.name.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Teléfono
          </label>
          <input
            {...register("phone")}
            type="number"
            placeholder="11 1234 5678"
            onKeyDown={(e) => ["+", "-", "e", "E", "."].includes(e.key) && e.preventDefault()}
            className="h-11 px-3 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all"
          />
          {errors.phone?.message && (
            <span className="text-xs text-red-500">{errors.phone.message}</span>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Email
        </label>
        <input
          {...register("email")}
          type="email"
          placeholder="juan@email.com"
          maxLength={100}
          className="h-11 px-3 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all"
        />
        {errors.email?.message && (
          <span className="text-xs text-red-500">{errors.email.message}</span>
        )}
      </div>

      {/* Summary */}
      {selectedSlot && (
        <div className="rounded-2xl bg-orange-50 border border-orange-200 overflow-hidden">
          {/* Fecha/hora header */}
          <div className="flex items-center gap-3 bg-orange-500 px-4 py-3">
            <CalendarDays className="size-4 text-white shrink-0" />
            <div>
              <p className="text-lg font-bold text-white capitalize">{modalDateStr}</p>
              <p className="text-sm text-orange-100">{selectedSlot.timeLabel} — {selectedSlot.endTimeLabel} hs</p>
            </div>
          </div>

          <div className="px-4 py-3.5 flex flex-col gap-3">
            {/* Servicio + precio inline */}
            {selectedServiceObj && (
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 min-w-0">
                  <Tag className="size-3.5 text-orange-500 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-orange-500 leading-none">Servicio</span>
                    <p className="font-extrabold text-base text-neutral-900 leading-tight">{selectedServiceObj.name}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Precio</span>
                  <p className="text-2xl font-black text-orange-600 leading-none mt-0.5">${selectedSlot.price.toLocaleString("es-AR")}</p>
                </div>
              </div>
            )}

            {/* Sucursal + Empleado como chips */}
            {(displayBranchObj || selectedEmployeeObj) && (
              <div className="flex flex-wrap gap-2">
                {displayBranchObj && (
                  <span className="inline-flex items-center gap-1.5 bg-white border border-orange-200 px-2.5 py-1 rounded-full text-xs font-semibold text-neutral-700">
                    <MapPin className="size-3 text-orange-500 shrink-0" />
                    {displayBranchObj.street && displayBranchObj.number
                      ? `${displayBranchObj.street} ${displayBranchObj.number}`
                      : displayBranchObj.name}
                  </span>
                )}
                {selectedEmployeeObj && (
                  <span className="inline-flex items-center gap-1.5 bg-white border border-orange-200 px-2.5 py-1 rounded-full text-xs font-semibold text-neutral-700">
                    <User className="size-3 text-orange-500 shrink-0" />
                    {selectedEmployeeObj.name} {selectedEmployeeObj.surname}
                  </span>
                )}
              </div>
            )}

            {/* Seña: solo cuando el turno la requiere */}
            {requiresDeposit && (
              <div className="border-t border-orange-200 pt-3">
                <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Seña · Mercado Pago</span>
                <p className="text-sm font-bold text-orange-600">${selectedServiceObj!.depositAmount!.toLocaleString("es-AR")}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {bookingError && (
        <p className="text-sm text-red-500 font-semibold">{bookingError}</p>
      )}

      <button
        onClick={handleSubmit(onSubmit)}
        disabled={bookingSpinner}
        className="h-12 rounded-xl text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
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
    </div>
  );

  // ── Business header strip (integrated inside unified container) ─
  const BusinessHeaderStrip = () => (
    <div className="relative bg-primary/5 border-b border-primary/10 overflow-hidden">
      <div className="relative flex items-center gap-4 md:gap-5 px-5 py-4 md:px-8 md:py-5 2xl:px-10 2xl:py-6">
        {/* Avatar */}
        <div className="size-12 md:size-14 2xl:size-16 rounded-2xl bg-primary flex items-center justify-center shrink-0 select-none shadow-md">
          <span className="text-xl md:text-2xl 2xl:text-3xl font-black text-primary-foreground">
            {businessData.name?.[0]?.toUpperCase() ?? ""}
          </span>
        </div>

        {/* Info block */}
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-lg md:text-2xl 2xl:text-3xl font-bold text-neutral-900 tracking-tight leading-none truncate">
              {businessData.name}
            </h1>
            {businessData.businessType && (
              <span className="shrink-0 text-xs bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full font-semibold">
                {businessData.businessType}
              </span>
            )}
          </div>
          {(singleLocationAddress || businessData.phone) && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 mt-1.5 text-[13px] text-neutral-500">
              {singleLocationAddress && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-primary/60 shrink-0" />
                  <span className="truncate">{singleLocationAddress}</span>
                </span>
              )}
              {businessData.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="size-3.5 text-primary/60 shrink-0" />
                  {businessData.phone}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-2xl shadow-md shrink-0">
          <CalendarDays className="size-4.5" strokeWidth={2.5} />
          <span className="font-bold text-sm tracking-wide">Reservar turno</span>
        </div>
      </div>
    </div>
  );

  // ── Done screen ──────────────────────────────────────────────
  if (wizardStep === "done") {
    return (
      <div className="flex flex-col w-full min-h-screen" style={{ background: "radial-gradient(ellipse 65% 55% at 12% 88%, rgba(255, 180, 110, 0.42) 0%, transparent 100%), radial-gradient(ellipse 55% 50% at 88% 12%, rgba(255, 140, 90, 0.32) 0%, transparent 100%), radial-gradient(ellipse 45% 40% at 65% 78%, rgba(255, 210, 160, 0.24) 0%, transparent 100%), #fff8f3" }}>
        <main className="flex flex-col flex-1 w-full max-w-7xl pt-[84px] pb-4 mx-auto px-4 md:px-8 md:pb-6">
          <div className="rounded-3xl bg-white overflow-hidden shadow-2xl border border-orange-100/70">
            <BusinessHeaderStrip />
            <div className="flex flex-col items-center gap-5 py-16 px-6">
              <div className="size-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CircleCheck className="text-white size-12" strokeWidth={2.5} />
              </div>
              <h2 className="text-xl md:text-2xl 2xl:text-3xl font-black">
                Turno reservado
              </h2>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                Te enviamos la confirmación a tu email. ¡Nos vemos pronto!
              </p>
              <button
                onClick={() => {
                  setWizardStep("service");
                  setSelectedSlot(null);
                }}
                className="mt-2 h-11 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all"
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
    <div className="flex flex-col w-full min-h-screen" style={{ background: "radial-gradient(ellipse 65% 55% at 12% 88%, rgba(255, 180, 110, 0.42) 0%, transparent 100%), radial-gradient(ellipse 55% 50% at 88% 12%, rgba(255, 140, 90, 0.32) 0%, transparent 100%), radial-gradient(ellipse 45% 40% at 65% 78%, rgba(255, 210, 160, 0.24) 0%, transparent 100%), #fff8f3" }}>
      <main className="flex flex-col flex-1 w-full max-w-7xl pt-[84px] pb-4 mx-auto px-4 md:px-8 md:pb-6">
        <div className="rounded-3xl bg-white overflow-hidden shadow-2xl border border-orange-100/70">
          <BusinessHeaderStrip />

          <div className="md:flex md:flex-row  xs:min-h-[500px]">
            {/* ── Desktop sidebar (warm orange gradient) ── */}
            <aside className="hidden md:flex md:flex-col md:w-64 2xl:w-80 md:shrink-0 relative overflow-hidden bg-primary text-white p-6 2xl:p-10">
              {/* Decorative overlays for depth */}
              <div className="absolute -top-20 -right-20 size-52 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute -bottom-24 -left-16 size-60 rounded-full bg-white/5 pointer-events-none" />
              <div className="absolute top-1/3 -right-8 size-16 rounded-full bg-white/5 pointer-events-none" />

              <div className="relative flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className="size-12 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center shrink-0 shadow-lg">
                    <CalendarDays className="size-5 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-bold truncate">
                      Nueva reserva
                    </h2>
                    {/* <p className="text-xs text-white/75">Tarda menos de un minuto</p> */}
                  </div>
                </div>

                <div className="border-t border-white/20 pt-6 flex-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-white/60 mb-3 block">
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
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all",
                            isCurr
                              ? "bg-white shadow-xl shadow-black/10"
                              : isDone
                                ? "hover:bg-white/10 cursor-pointer"
                                : "opacity-75 cursor-default",
                          )}
                        >
                          <div className="size-6 shrink-0 flex items-center justify-center">
                            {isDone ? (
                              <div className="size-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/50">
                                <Check
                                  className="size-3.5 text-white"
                                  strokeWidth={3}
                                />
                              </div>
                            ) : (
                              <div
                                className={cn(
                                  "size-6 rounded-full flex items-center justify-center text-xs font-bold",
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
                                "text-sm font-bold",
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
                              <span className="text-xs font-medium capitalize-first-letter truncate text-white/60">
                                {stepSubtitles[step]}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {(businessData.phone || singleLocationAddress) && (
                  <div className="mt-6 p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/20">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-white/70 block mb-2">
                      ¿Necesitás ayuda?
                    </span>
                    {businessData.phone && (
                      <div className="flex items-center gap-2 text-xs text-white">
                        <Phone className="size-3" /> {businessData.phone}
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
            <div className="md:hidden relative overflow-hidden bg-gradient-to-r from-orange-500 via-orange-600 to-orange-600 text-white px-4 pt-4 pb-3.5">
              <div className="absolute -top-8 -right-4 size-24 rounded-full bg-white/10 pointer-events-none" />
              <div className="relative flex items-center mb-2.5">
                <p className="text-base text-white/85">
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
            <section className="flex-1 min-w-0 p-5 md:p-6 2xl:p-10 bg-gradient-to-b from-white to-orange-50/20">
              {renderStepContent()}
            </section>
          </div>
        </div>

        {/* Mobile bottom spacer */}
        <div className="h-6 md:hidden" />
      </main>
    </div>
  );
}
