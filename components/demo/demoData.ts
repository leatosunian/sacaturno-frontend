import type { IAppointment } from "@/interfaces/appointment.interface";
import type { IBusiness } from "@/interfaces/business.interface";
import type { IDaySchedule } from "@/interfaces/daySchedule.interface";
import type { IService } from "@/interfaces/service.interface";
import type { IPublicBranch } from "@/components/home/bookAppointments/BranchSelector";
import type { IPublicEmployee } from "@/components/home/bookAppointments/EmployeeSelector";
import type { DemoConfig } from "./demoSync";

/*
  Negocio de ejemplo de /demo. Todo se arma en memoria a partir de la config que
  el visitante elige con los switches: el wizard no distingue estos datos de los
  que le llegan del backend, así que los pasos aparecen y desaparecen solos.

  Nada de esto puede depender del reloj más fino que el día ni de Math.random:
  los dos dispositivos son iframes separados que generan los mismos datos por su
  cuenta, y si difieren dejan de estar sincronizados.
*/

const ARG_TZ_OFFSET_MS = -3 * 60 * 60 * 1000;

const ID = {
  business: "demo-business",
  owner: "demo-owner",
};

// ── Fechas ──────────────────────────────────────────────────
function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** El "hoy" del negocio, en hora argentina. */
export function demoTodayStr(): string {
  const d = new Date(Date.now() + ARG_TZ_OFFSET_MS);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

function weekday(dateStr: string): number {
  return new Date(`${dateStr}T12:00:00Z`).getUTCDay();
}

/**
 * Instante real de un horario local. El wizard le resta 3 horas para mostrarlo,
 * así que acá hay que sumárselas: 10:00 en Belgrano son las 13:00 UTC.
 */
function instant(dateStr: string, hour: number, minute: number): Date {
  return new Date(
    new Date(`${dateStr}T${pad(hour)}:${pad(minute)}:00.000Z`).getTime() -
      ARG_TZ_OFFSET_MS,
  );
}

/** Hash estable: mismo string, mismo resultado en los dos iframes. */
function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

// ── Catálogo ────────────────────────────────────────────────
const FULL_SERVICES: (Omit<IService, "businessID"> & { deposit: number })[] = [
  {
    _id: "demo-svc-consulta",
    name: "Consulta y diagnóstico",
    description: "Primera visita, revisión general y plan de tratamiento.",
    price: 18000,
    duration: 30,
    deposit: 0,
  },
  {
    _id: "demo-svc-limpieza",
    name: "Limpieza dental",
    description: "Detartraje completo y pulido.",
    price: 32000,
    duration: 45,
    deposit: 10000,
  },
  {
    _id: "demo-svc-blanqueamiento",
    name: "Blanqueamiento",
    description: "Sesión en consultorio con lámpara LED.",
    price: 95000,
    duration: 60,
    deposit: 25000,
  },
  {
    _id: "demo-svc-ortodoncia",
    name: "Ortodoncia · control",
    description: "Ajuste mensual de brackets.",
    price: 22000,
    duration: 30,
    deposit: 0,
  },
];

const SINGLE_SERVICE = {
  _id: "demo-svc-unico",
  name: "Consulta odontológica",
  description: "Atención general con turno reservado.",
  price: 24000,
  duration: 30,
  deposit: 8000,
};

const FULL_BRANCHES: IPublicBranch[] = [
  {
    _id: "demo-branch-belgrano",
    name: "Belgrano",
    street: "Av. Cabildo",
    number: "1234",
    city: "CABA",
    province: "Buenos Aires",
    phone: 1147885566,
  },
  {
    _id: "demo-branch-nunez",
    name: "Núñez",
    street: "Av. del Libertador",
    number: "6789",
    city: "CABA",
    province: "Buenos Aires",
    phone: 1147885577,
  },
  {
    _id: "demo-branch-vlopez",
    name: "Vicente López",
    street: "Laprida",
    number: "234",
    city: "Vicente López",
    province: "Buenos Aires",
    phone: 1147885588,
  },
];

interface DemoStaff {
  _id: string;
  name: string;
  surname: string;
  isOwner?: boolean;
  branchNames: string[];
  serviceIDs: string[];
}

const FULL_STAFF: DemoStaff[] = [
  {
    _id: "demo-emp-carla",
    name: "Carla",
    surname: "Ruiz",
    isOwner: true,
    branchNames: ["Belgrano", "Núñez"],
    serviceIDs: FULL_SERVICES.map((s) => s._id!),
  },
  {
    _id: "demo-emp-martin",
    name: "Martín",
    surname: "Sosa",
    branchNames: ["Belgrano", "Vicente López"],
    serviceIDs: ["demo-svc-consulta", "demo-svc-limpieza", "demo-svc-blanqueamiento"],
  },
  {
    _id: "demo-emp-lucia",
    name: "Lucía",
    surname: "Ferrer",
    branchNames: ["Núñez", "Vicente López"],
    serviceIDs: ["demo-svc-consulta", "demo-svc-limpieza", "demo-svc-ortodoncia"],
  },
];

// Horarios que se publican por día. Menos densos que una agenda real, pero
// suficientes para que se vean turnos libres, ocupados y de mañana y tarde.
const WEEKDAY_HOURS = [9, 10, 11, 15, 16, 17, 18];
const SATURDAY_HOURS = [9, 10, 11];

const DAYS_AHEAD = 21;

export const DEMO_CLIENT = {
  name: "Martina Gómez",
  phone: "1155501234",
  email: "martina@ejemplo.com",
};

export interface DemoData {
  business: IBusiness;
  services: IService[];
  branches: IPublicBranch[];
  employees: IPublicEmployee[];
  appointments: IAppointment[];
  scheduleDays: IDaySchedule[];
}

export function buildDemoData(config: DemoConfig): DemoData {
  const branches: IPublicBranch[] = config.branches ? FULL_BRANCHES : [];

  const services: IService[] = (config.multiService
    ? FULL_SERVICES
    : [SINGLE_SERVICE]
  ).map((s) => ({
    _id: s._id,
    businessID: ID.business,
    name: s.name,
    description: s.description,
    price: s.price,
    duration: s.duration,
    depositAmount: config.deposit ? s.deposit : 0,
  }));

  const serviceIDs = new Set(services.map((s) => s._id!));

  // Sin equipo queda sólo la dueña, publicada como prestadora: el wizard la
  // nombra en el encabezado en vez de abrir un paso con una sola opción.
  const staff: DemoStaff[] = config.employees
    ? FULL_STAFF
    : [
        {
          ...FULL_STAFF[0],
          branchNames: FULL_BRANCHES.map((b) => b.name),
          serviceIDs: Array.from(serviceIDs),
        },
      ];

  const branchIDsOf = (member: DemoStaff): (string | null)[] => {
    if (branches.length === 0) return [null];
    const ids = branches
      .filter((b) => member.branchNames.includes(b.name))
      .map((b) => b._id);
    return ids.length > 0 ? ids : [branches[0]._id];
  };

  const employees: IPublicEmployee[] = staff.map((member) => ({
    _id: member._id,
    name: member.name,
    surname: member.surname,
    isOwner: member.isOwner,
    branches: branchIDsOf(member).filter((b): b is string => b !== null),
    services: member.serviceIDs.filter((id) => serviceIDs.has(id)),
  }));

  const business: IBusiness = {
    _id: ID.business,
    ownerID: ID.owner,
    name: "Odontología Belgrano",
    businessCategory: "salud",
    businessType: "Odontología",
    street: "Av. Cabildo",
    number: "1234",
    city: "CABA",
    province: "Buenos Aires",
    phone: 1147885566,
    image: "",
    email: "turnos@odontologiabelgrano.com",
    slug: "odontologia-belgrano",
    scheduleEnd: null,
    scheduleAnticipation: 1,
    scheduleDaysToCreate: 30,
    automaticSchedule: true,
    mpLinked: config.deposit,
    bookingsEnabled: true,
    cancellationWindowHours: 24,
  };

  const scheduleDays: IDaySchedule[] = [
    ["LUN", true, 9, 20],
    ["MAR", true, 9, 20],
    ["MIE", true, 9, 20],
    ["JUE", true, 9, 20],
    ["VIE", true, 9, 20],
    ["SAB", true, 9, 13],
    ["DOM", false, 0, 0],
  ].map(([day, enabled, dayStart, dayEnd]) => ({
    businessID: ID.business,
    ownerID: ID.owner,
    day: day as string,
    enabled: enabled as boolean,
    dayStart: dayStart as number,
    dayEnd: dayEnd as number,
    appointmentDuration: 30,
  }));

  // ── Turnos publicados ──
  const today = demoTodayStr();
  const appointments: IAppointment[] = [];

  for (let offset = 1; offset <= DAYS_AHEAD; offset++) {
    const dateStr = addDays(today, offset);
    const dow = weekday(dateStr);
    if (dow === 0) continue;
    const hours = dow === 6 ? SATURDAY_HOURS : WEEKDAY_HOURS;

    for (const member of staff) {
      for (const branchID of branchIDsOf(member)) {
        for (const service of services) {
          if (!member.serviceIDs.includes(service._id!)) continue;

          for (const hour of hours) {
            const seed = `${dateStr}|${member._id}|${branchID ?? "-"}|${service._id}|${hour}`;
            const start = instant(dateStr, hour, 0);
            const end = new Date(
              start.getTime() + (service.duration ?? 30) * 60 * 1000,
            );
            appointments.push({
              _id: `demo-apt-${hash(seed).toString(36)}`,
              businessID: ID.business,
              // Un tercio ocupado: una agenda llena de huecos no se parece a la
              // de un negocio que funciona.
              status: hash(seed) % 100 < 32 ? "booked" : "unbooked",
              start,
              end,
              service: service.name,
              price: service.price,
              description: service.description,
              employeeID: member._id,
              branchID,
              depositStatus: "none",
            });
          }
        }
      }
    }
  }

  return { business, services, branches, employees, appointments, scheduleDays };
}

// ── Etiquetas ───────────────────────────────────────────────
const DAY_NAMES = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
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

export function demoDateLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  return `${DAY_NAMES[d.getUTCDay()]} ${d.getUTCDate()} de ${MONTH_NAMES[d.getUTCMonth()]}`;
}

export function demoMoney(amount: number): string {
  return `$${amount.toLocaleString("es-AR")}`;
}

/** Nombres del equipo y las sucursales de ejemplo, para el tour del panel. */
export const DEMO_TEAM = FULL_STAFF.map((member) => ({
  id: member._id,
  name: `${member.name} ${member.surname}`,
}));

export const DEMO_BRANCH_NAMES = FULL_BRANCHES.map((branch) => branch.name);
