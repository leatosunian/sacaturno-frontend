import type { IService } from "@/interfaces/service.interface";

/*
  Contrato del modo demo del wizard de reserva.

  ListBookAppointment es el mismo componente que ven los clientes en /[slug]:
  cuando recibe el prop `demo` no toca la red (ni trae servicios, ni guarda el
  turno, ni redirige a Mercado Pago) y delega esas tres cosas acá. Sin el prop
  se comporta exactamente como siempre.
*/

export interface DemoConfig {
  /** Varios servicios con precio y duración propios, en vez de uno solo. */
  multiService: boolean;
  /** Equipo de profesionales: habilita el paso "Especialista". */
  employees: boolean;
  /** Varias sucursales: habilita el paso "Sucursal". */
  branches: boolean;
  /** Seña por Mercado Pago antes de confirmar. */
  deposit: boolean;
}

export const DEFAULT_DEMO_CONFIG: DemoConfig = {
  multiService: true,
  employees: true,
  branches: true,
  deposit: true,
};

const CONFIG_KEYS: (keyof DemoConfig)[] = [
  "multiService",
  "employees",
  "branches",
  "deposit",
];

/** La config viaja al iframe como un string de 4 dígitos: "1101". */
export function encodeConfig(config: DemoConfig): string {
  return CONFIG_KEYS.map((k) => (config[k] ? "1" : "0")).join("");
}

export function decodeConfig(raw: string | undefined | null): DemoConfig {
  if (!raw || raw.length !== CONFIG_KEYS.length) return DEFAULT_DEMO_CONFIG;
  const config = { ...DEFAULT_DEMO_CONFIG };
  CONFIG_KEYS.forEach((k, i) => {
    config[k] = raw[i] === "1";
  });
  return config;
}

/** Datos del cliente que el visitante ve precargados en el último paso. */
export interface DemoClient {
  name: string;
  phone: string;
  email: string;
}

/**
 * El turno elegido, tal como lo tiene el wizard. Es un subconjunto de su
 * FormattedAppointment, así que se puede pasar tal cual.
 */
export interface DemoSlot {
  _id: string;
  startISO: string;
  endISO: string;
  service: string;
  price: number;
  timeLabel: string;
  endTimeLabel: string;
  dateStr: string;
  employeeID: string | null;
  branchID: string | null;
}

/** Lo que el wizard le entrega al panel cuando el turno queda reservado. */
export interface DemoBooking {
  slotID: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  service: string;
  price: number;
  deposit: number;
  dateStr: string;
  dateLabel: string;
  timeLabel: string;
  endTimeLabel: string;
  employeeName: string | null;
  branchName: string | null;
}

export interface DemoAdapter {
  /** Los servicios llegan por prop: en demo no hay fetch ni estado de carga. */
  services: IService[];
  /** Datos precargados del cliente de ejemplo. */
  client: DemoClient;
  /** Reemplaza al PUT /appointment/book. */
  onBook: (slot: DemoSlot, client: DemoClient, deposit: number) => Promise<void>;
  /** Reemplaza al POST /mp/deposit/create-preference. Resuelve true si pagó. */
  onDeposit: (slot: DemoSlot, amount: number) => Promise<boolean>;
}

/*
  Sincronización entre los dos dispositivos.

  Cada dispositivo del escenario es un iframe con su propio viewport —sin eso el
  teléfono mostraría el layout de escritorio, porque los breakpoints de Tailwind
  miden la ventana y no el contenedor—. Para que los dos muestren lo mismo, el
  estado del wizard sale de acá en vez de sus useState locales, y viaja entre
  frames por postMessage. Sin contexto (o sea, en /[slug]) el wizard usa sus
  useState de siempre y nada de esto existe.
*/
export type DemoSharedState = Record<string, unknown>;

export interface DemoSyncApi {
  state: DemoSharedState;
  patch: (key: string, value: unknown) => void;
}

// ── Mensajes entre el contenedor y los iframes ──────────────
export const DEMO_MSG = {
  ready: "demo:ready",
  config: "demo:config",
  state: "demo:state",
  booked: "demo:booked",
} as const;

export type DemoMessage =
  | { type: typeof DEMO_MSG.ready }
  | { type: typeof DEMO_MSG.config; config: DemoConfig }
  | { type: typeof DEMO_MSG.state; state: DemoSharedState }
  | { type: typeof DEMO_MSG.booked; booking: DemoBooking };
