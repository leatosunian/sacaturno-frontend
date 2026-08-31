"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ListBookAppointment from "@/components/home/bookAppointments/ListBookAppointment";
import HeaderPublic from "@/components/home/HeaderPublic";
import DemoCheckout from "./DemoCheckout";
import { buildDemoData, DEMO_CLIENT, demoDateLabel } from "./demoData";
import { DemoSyncContext } from "./demoSyncContext";
import {
  DEMO_MSG,
  type DemoAdapter,
  type DemoBooking,
  type DemoClient,
  type DemoConfig,
  type DemoMessage,
  type DemoSharedState,
  type DemoSlot,
  type DemoSyncApi,
} from "./demoSync";

/*
  El escenario: la página /[slug] de un negocio inventado.

  Siempre corre dentro de un iframe: en escritorio son dos —uno con ancho de
  teléfono y otro de laptop— y en mobile uno solo a pantalla completa. El motivo
  es que los breakpoints de Tailwind miden la ventana, así que sin un viewport
  propio el "teléfono" mostraría el layout de escritorio apretado en 380 px. Los
  frames comparten el estado del wizard por postMessage, así que da igual en
  cuál se toque.
*/

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface CheckoutState {
  amount: number;
  service: string;
  dateLabel: string;
  timeLabel: string;
}

interface Props {
  initialConfig: DemoConfig;
}

export default function DemoStage({ initialConfig }: Props) {
  const [config, setConfig] = useState<DemoConfig>(initialConfig);
  const [shared, setShared] = useState<DemoSharedState>({});
  const sharedRef = useRef<DemoSharedState>(shared);
  const pendingPayment = useRef<((paid: boolean) => void) | null>(null);

  // ── Puente entre frames ──
  const post = useCallback((message: DemoMessage) => {
    if (typeof window === "undefined" || window.parent === window) return;
    window.parent.postMessage(message, window.location.origin);
  }, []);

  const write = useCallback(
    (patchObj: DemoSharedState) => {
      const next = { ...sharedRef.current, ...patchObj };
      sharedRef.current = next;
      setShared(next);
      post({ type: DEMO_MSG.state, state: next });
    },
    [post],
  );

  const patch = useCallback(
    (key: string, value: unknown) => write({ [key]: value }),
    [write],
  );

  const reset = useCallback(() => {
    sharedRef.current = {};
    setShared({});
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const message = event.data as DemoMessage;
      if (!message || typeof message !== "object") return;
      if (message.type === DEMO_MSG.state) {
        // Llega del otro dispositivo: se aplica sin reenviar, o rebotaría.
        sharedRef.current = message.state;
        setShared(message.state);
      }
      if (message.type === DEMO_MSG.config) {
        setConfig(message.config);
        reset();
      }
    };
    window.addEventListener("message", onMessage);
    post({ type: DEMO_MSG.ready });
    return () => window.removeEventListener("message", onMessage);
  }, [post, reset]);

  // ── Datos del negocio ficticio ──
  const data = useMemo(() => buildDemoData(config), [config]);

  const bookedSlots = useMemo(
    () => new Set((shared.bookedSlots as string[]) ?? []),
    [shared.bookedSlots],
  );

  const appointments = useMemo(
    () =>
      bookedSlots.size === 0
        ? data.appointments
        : data.appointments.map((appointment) =>
            appointment._id && bookedSlots.has(appointment._id)
              ? { ...appointment, status: "booked" as const }
              : appointment,
          ),
    [data.appointments, bookedSlots],
  );

  // ── Checkout simulado ──
  const checkout = (shared.checkout as CheckoutState | null) ?? null;

  useEffect(() => {
    const result = shared.checkoutResult as string | undefined;
    if (!result || !pendingPayment.current) return;
    const resolve = pendingPayment.current;
    pendingPayment.current = null;
    write({ checkout: null, checkoutResult: null });
    resolve(result === "paid");
  }, [shared.checkoutResult, write]);

  // ── Adaptador que reemplaza a la red ──
  const describe = useCallback(
    (slot: DemoSlot, client: DemoClient, deposit: number): DemoBooking => ({
      slotID: slot._id,
      clientName: client.name,
      clientPhone: client.phone,
      clientEmail: client.email,
      service: slot.service,
      price: slot.price,
      deposit,
      dateStr: slot.dateStr,
      dateLabel: demoDateLabel(slot.dateStr),
      timeLabel: slot.timeLabel,
      endTimeLabel: slot.endTimeLabel,
      employeeName:
        data.employees
          .filter((employee) => employee._id === slot.employeeID)
          .map((employee) => `${employee.name} ${employee.surname}`.trim())[0] ?? null,
      branchName:
        data.branches.find((branch) => branch._id === slot.branchID)?.name ?? null,
    }),
    [data.employees, data.branches],
  );

  const adapter = useMemo<DemoAdapter>(
    () => ({
      services: data.services,
      client: DEMO_CLIENT,
      onBook: async (slot, client, deposit) => {
        // El piso de espera no es decorativo: sin él la confirmación aparece
        // tan rápido que se lee como si no hubiera pasado nada.
        await sleep(600);
        const booking = describe(slot, client, deposit);
        write({
          bookedSlots: [...((sharedRef.current.bookedSlots as string[]) ?? []), slot._id],
          lastBooking: booking,
        });
        post({ type: DEMO_MSG.booked, booking });
      },
      onDeposit: (slot, amount) =>
        new Promise<boolean>((resolve) => {
          pendingPayment.current = resolve;
          patch("checkout", {
            amount,
            service: slot.service,
            dateLabel: demoDateLabel(slot.dateStr),
            timeLabel: slot.timeLabel,
          } satisfies CheckoutState);
        }),
    }),
    [data.services, describe, write, patch, post],
  );

  const syncApi = useMemo<DemoSyncApi>(() => ({ state: shared, patch }), [shared, patch]);

  return (
    <DemoSyncContext.Provider value={syncApi}>
      {/* Decorativo: da el marco de una página real sin llevarse el iframe a otro lado. */}
      <div className="pointer-events-none select-none" aria-hidden="true">
        <HeaderPublic />
      </div>

      <ListBookAppointment
        key={`${config.multiService}-${config.employees}-${config.branches}-${config.deposit}`}
        appointments={appointments}
        businessData={data.business}
        scheduleDays={data.scheduleDays}
        employees={data.employees}
        branches={data.branches}
        demo={adapter}
      />

      {checkout && (
        <DemoCheckout
          amount={checkout.amount}
          service={checkout.service}
          dateLabel={checkout.dateLabel}
          timeLabel={checkout.timeLabel}
          businessName={data.business.name}
          onPay={() => patch("checkoutResult", "paid")}
          onCancel={() => patch("checkoutResult", "cancelled")}
        />
      )}
    </DemoSyncContext.Provider>
  );
}
