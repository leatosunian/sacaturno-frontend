"use client";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/es";
import axiosReq from "@/config/axios";
import {
  ICancelledAppointment,
  CancelledBy,
  RefundStatus,
} from "@/interfaces/cancelledAppointment.interface";
import {
  LuCalendarX,
  LuChevronDown,
  LuCircleAlert,
  LuMail,
  LuMapPin,
  LuPhone,
  LuSearch,
  LuSearchX,
  LuUser,
} from "react-icons/lu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

dayjs.locale("es");

interface Props {
  businessID: string;
}

const ALL_VALUE = "__all__";

const REFUND_LABEL: Record<RefundStatus, string> = {
  none: "Sin reembolso",
  pending: "Reembolso pendiente",
  refunded: "Seña reembolsada",
  failed: "Reembolso fallido",
};

const REFUND_STYLE: Record<RefundStatus, string> = {
  none: "bg-gray-100 text-gray-700",
  pending: "bg-orange-100 text-orange-700",
  refunded: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

const CANCELLED_BY_LABEL: Record<CancelledBy, string> = {
  client: "Canceló el cliente",
  owner: "Canceló el negocio",
  employee: "Canceló un empleado",
};

const money = (n: number) => `$ ${(n ?? 0).toLocaleString("es-AR")}`;

const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const CancelledAppointments: React.FC<Props> = ({ businessID }) => {
  const [data, setData] = useState<ICancelledAppointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const [refundFilter, setRefundFilter] = useState<string>(ALL_VALUE);
  const [byFilter, setByFilter] = useState<string>(ALL_VALUE);
  const [expandedID, setExpandedID] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("sacaturno_token");
        const res = await axiosReq.get(`/appointment/cancelled/${businessID}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!active) return;
        setData(Array.isArray(res.data) ? res.data : []);
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    return () => {
      active = false;
    };
  }, [businessID]);

  const summary = useMemo(() => {
    const withDeposit = data.filter((c) => c.hadDeposit);
    const refunded = data.filter((c) => c.refundStatus === "refunded");
    const needsAttention = data.filter(
      (c) => c.refundStatus === "pending" || c.refundStatus === "failed"
    );
    return {
      total: data.length,
      depositCount: withDeposit.length,
      refundedAmount: refunded.reduce((s, c) => s + (c.refundAmount || 0), 0),
      needsAttention: needsAttention.length,
    };
  }, [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.filter((c) => {
      if (refundFilter !== ALL_VALUE && c.refundStatus !== refundFilter) return false;
      if (byFilter !== ALL_VALUE && c.cancelledBy !== byFilter) return false;
      if (!q) return true;
      return [c.name, c.email, c.service, String(c.phone), c.branchName, c.employeeName]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q));
    });
  }, [data, query, refundFilter, byFilter]);

  const inputClass =
    "h-9 w-full rounded-md border border-gray-200 bg-gray-50 pl-8 pr-3 text-xs text-gray-800 transition-all duration-200 ease-in-out hover:border-orange-600 focus:border-orange-600 focus:outline-none";
  const selectClass =
    "h-9 w-full rounded-md border border-gray-200 bg-gray-50 px-2.5 text-xs font-medium text-gray-800 shadow-none transition-all duration-200 ease-in-out focus:ring-0 focus:ring-offset-0 hover:border-orange-600 data-[state=open]:border-orange-600";
  const selectItemClass =
    "cursor-pointer text-xs text-gray-700 focus:bg-orange-50 focus:text-orange-700 data-[state=checked]:font-medium data-[state=checked]:text-orange-700";

  return (
    <div className="flex flex-col w-full gap-4">
      {/* Title block */}
      <div className="pb-4 border-b border-gray-100 flex flex-col gap-1">
        <h4 className="text-lg leading-none font-semibold text-gray-800">Turnos cancelados</h4>
        <p className="text-xs text-gray-400 mt-0.5">
          Historial de cancelaciones con los datos de la reserva y el estado de devolución de cada seña.
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-14">
          <div className="loaderSmall" />
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <LuCircleAlert size={26} className="text-red-400" />
          <p className="text-sm font-medium text-gray-700">No se pudo cargar el historial</p>
          <p className="text-xs text-gray-400">Cerrá la ventana y volvé a intentarlo en unos segundos.</p>
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <LuCalendarX size={26} className="text-gray-300" />
          <p className="text-sm font-medium text-gray-700">Todavía no hay turnos cancelados</p>
          <p className="text-xs text-gray-400 max-w-xs">
            Cuando vos o un cliente cancelen una reserva, acá vas a ver el detalle y el estado de la seña.
          </p>
        </div>
      )}

      {!loading && !error && data.length > 0 && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="flex flex-col gap-0.5 rounded-xl border border-gray-100 bg-white shadow-sm px-3 py-2.5">
              <span className="text-[10px] uppercase tracking-wide font-semibold text-gray-400">
                Cancelaciones
              </span>
              <span className="text-base font-semibold text-gray-800 tabular-nums">
                {summary.total}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 rounded-xl border border-gray-100 bg-white shadow-sm px-3 py-2.5">
              <span className="text-[10px] uppercase tracking-wide font-semibold text-gray-400">
                Con seña
              </span>
              <span className="text-base font-semibold text-gray-800 tabular-nums">
                {summary.depositCount}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 rounded-xl border border-gray-100 bg-white shadow-sm px-3 py-2.5">
              <span className="text-[10px] uppercase tracking-wide font-semibold text-gray-400">
                Reembolsado
              </span>
              <span className="text-base font-semibold text-green-600 tabular-nums">
                {money(summary.refundedAmount)}
              </span>
            </div>
            <div
              className={cn(
                "flex flex-col gap-0.5 rounded-xl border bg-white shadow-sm px-3 py-2.5",
                summary.needsAttention > 0 ? "border-red-200" : "border-gray-100"
              )}
            >
              <span className="text-[10px] uppercase tracking-wide font-semibold text-gray-400">
                A revisar
              </span>
              <span
                className={cn(
                  "text-base font-semibold tabular-nums",
                  summary.needsAttention > 0 ? "text-red-600" : "text-gray-800"
                )}
              >
                {summary.needsAttention}
              </span>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1 min-w-0">
              <LuSearch
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por cliente, servicio, teléfono…"
                className={inputClass}
              />
            </div>
            <div className="flex gap-2">
              <Select value={refundFilter} onValueChange={setRefundFilter}>
                <SelectTrigger className={cn(selectClass, "sm:w-[168px]")}>
                  <SelectValue placeholder="Reembolso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE} className={selectItemClass}>
                    Todos los estados
                  </SelectItem>
                  <SelectItem value="refunded" className={selectItemClass}>
                    Seña reembolsada
                  </SelectItem>
                  <SelectItem value="pending" className={selectItemClass}>
                    Reembolso pendiente
                  </SelectItem>
                  <SelectItem value="failed" className={selectItemClass}>
                    Reembolso fallido
                  </SelectItem>
                  <SelectItem value="none" className={selectItemClass}>
                    Sin reembolso
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select value={byFilter} onValueChange={setByFilter}>
                <SelectTrigger className={cn(selectClass, "sm:w-[150px]")}>
                  <SelectValue placeholder="Quién canceló" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE} className={selectItemClass}>
                    Todos
                  </SelectItem>
                  <SelectItem value="client" className={selectItemClass}>
                    Cliente
                  </SelectItem>
                  <SelectItem value="owner" className={selectItemClass}>
                    Negocio
                  </SelectItem>
                  <SelectItem value="employee" className={selectItemClass}>
                    Empleado
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* List */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <LuSearchX size={24} className="text-gray-300" />
              <p className="text-sm font-medium text-gray-700">Sin resultados</p>
              <p className="text-xs text-gray-400">Probá con otro término o cambiá los filtros.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-[52vh] overflow-y-auto pr-0.5 -mr-0.5">
              {filtered.map((c) => {
                const start = dayjs(c.start);
                const isOpen = expandedID === c._id;
                const refundTone = REFUND_STYLE[c.refundStatus];

                return (
                  <div
                    key={c._id}
                    className={cn(
                      "rounded-xl border bg-white shadow-sm overflow-hidden transition-colors duration-200",
                      isOpen ? "border-orange-200" : "border-gray-100"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedID(isOpen ? null : c._id)}
                      className="w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors duration-200"
                    >
                      {/* Date block */}
                      <div className="flex flex-col items-center justify-center shrink-0 w-12 rounded-lg bg-orange-50 border border-orange-100 py-1.5">
                        <span className="text-sm font-semibold text-primary leading-none tabular-nums">
                          {start.format("DD")}
                        </span>
                        <span className="text-[10px] font-medium text-orange-400 uppercase leading-none mt-0.5">
                          {start.format("MMM")}
                        </span>
                      </div>

                      {/* Main */}
                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <div className="flex items-baseline gap-2 min-w-0">
                          <span className="text-xs font-semibold text-gray-800 truncate">
                            {c.name || "Sin nombre"}
                          </span>
                          <span className="text-[11px] text-gray-400 tabular-nums shrink-0">
                            {start.format("HH:mm")} hs
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-500 truncate">
                          {c.service || "Sin servicio"}
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span
                            className={cn(
                              "text-[10px] font-medium px-2 py-0.5 rounded-full",
                              refundTone
                            )}
                          >
                            {c.hadDeposit
                              ? REFUND_LABEL[c.refundStatus]
                              : "Sin seña"}
                          </span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {CANCELLED_BY_LABEL[c.cancelledBy]}
                          </span>
                        </div>
                      </div>

                      <LuChevronDown
                        size={16}
                        className={cn(
                          "shrink-0 mt-1 text-gray-400 transition-transform duration-200",
                          isOpen && "rotate-180 text-primary"
                        )}
                      />
                    </button>

                    {isOpen && (
                      <div className="border-t border-gray-100 bg-gray-50/60 px-3 py-3 flex flex-col gap-3">
                        <Section title="Reserva">
                          <Field label="Turno" value={capitalize(start.format("dddd D [de] MMMM [·] HH:mm"))} />
                          <Field label="Duración" value={`${start.format("HH:mm")} — ${dayjs(c.end).format("HH:mm")} hs`} />
                          <Field label="Servicio" value={c.service || "—"} />
                          <Field label="Precio" value={money(c.price)} />
                          {c.branchName && <Field label="Sucursal" value={c.branchName} icon={<LuMapPin size={11} />} />}
                          {c.employeeName && <Field label="Profesional" value={c.employeeName} icon={<LuUser size={11} />} />}
                        </Section>

                        <Section title="Cliente">
                          <Field label="Nombre" value={c.name || "—"} />
                          <Field label="Teléfono" value={c.phone ? String(c.phone) : "—"} icon={<LuPhone size={11} />} />
                          <Field label="Correo" value={c.email || "—"} icon={<LuMail size={11} />} />
                        </Section>

                        <Section title="Cancelación">
                          <Field label="Canceló" value={CANCELLED_BY_LABEL[c.cancelledBy].replace("Canceló ", "")} />
                          <Field
                            label="Fecha"
                            value={capitalize(dayjs(c.cancelledAt).format("dddd D [de] MMMM [·] HH:mm [hs]"))}
                          />
                          {c.reason && <Field label="Motivo" value={c.reason} />}
                        </Section>

                        <Section title="Seña y devolución">
                          {c.hadDeposit ? (
                            <>
                              <Field label="Seña abonada" value={money(c.depositAmount)} />
                              <Field label="Estado" value={REFUND_LABEL[c.refundStatus]} />
                              {(c.refundAmount ?? 0) > 0 && (
                                <Field label="Monto devuelto" value={money(c.refundAmount ?? 0)} />
                              )}
                              {c.mpPaymentID && <Field label="ID de pago MP" value={c.mpPaymentID} mono />}
                              {c.refundID && <Field label="ID de reembolso" value={c.refundID} mono />}
                            </>
                          ) : (
                            <p className="text-xs text-gray-500 col-span-full">
                              Este turno se reservó sin seña.
                            </p>
                          )}
                        </Section>

                        {c.refundStatus === "failed" && (
                          <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2">
                            <LuCircleAlert size={13} className="text-red-400 mt-0.5 shrink-0" />
                            <p className="text-[11px] text-red-600 leading-relaxed">
                              El reembolso automático falló. Revisá el pago en tu cuenta de Mercado Pago
                              y devolvé la seña manualmente.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-[10px] uppercase tracking-wide font-semibold text-gray-400">{title}</span>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">{children}</div>
  </div>
);

const Field: React.FC<{
  label: string;
  value: string;
  icon?: React.ReactNode;
  mono?: boolean;
}> = ({ label, value, icon, mono }) => (
  <div className="flex items-baseline justify-between gap-3 min-w-0">
    <span className="flex items-center gap-1 text-[11px] text-gray-400 shrink-0">
      {icon}
      {label}
    </span>
    <span
      className={cn(
        "text-[11px] font-medium text-gray-800 text-right truncate",
        mono && "font-mono text-[10px] text-gray-500"
      )}
      title={value}
    >
      {value}
    </span>
  </div>
);

export default CancelledAppointments;
