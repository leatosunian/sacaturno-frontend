"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LuArrowLeft, LuCalendar, LuTrendingUp, LuUsers, LuX } from "react-icons/lu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MdOutlinePayment } from "react-icons/md";
import type { DateRange } from "react-day-picker";
import { es } from "react-day-picker/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface MonthData {
  month: string;
  year: number;
  shortLabel: string;
  appointments: number;
  revenue: number;
  paidDeposits: number;
  issuedAppointments: number;
}

interface AnalyticsSummary {
  totalRevenue: number;
  totalAppointments: number;
  totalDeposits: number;
  avgMonthlyRevenue: number;
  avgMonthlyAppointments: number;
}

interface AnalyticsData {
  monthlyData: MonthData[];
  summary: AnalyticsSummary;
}

interface AppointmentRecord {
  _id: string;
  start: string;
  end: string;
  name: string;
  phone: number;
  email: string;
  service: string;
  price: number;
  depositStatus: "none" | "pending" | "paid" | "failed";
}

interface Props {
  businessId: string | null;
}

const cardShadow = { boxShadow: "5px 5px 8px hsla(0, 0%, 12%, 0.17)" };

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);

const formatCurrencyShort = (amount: number) => {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${Math.round(amount / 1000)}k`;
  return formatCurrency(amount);
};

const formatDateOnly = (iso: string) =>
  new Date(iso).toLocaleDateString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const formatTimeOnly = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatDateShort = (date: Date) =>
  date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit" });

function DepositBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    paid: { label: "Abonada", cls: "bg-green-100 text-green-700" },
    pending: { label: "Pendiente", cls: "bg-yellow-100 text-yellow-700" },
    failed: { label: "Fallida", cls: "bg-red-100 text-red-600" },
    none: { label: "Sin seña", cls: "bg-gray-100 text-gray-500" },
  };
  const s = map[status] ?? map.none;
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${s.cls}`}>
      {s.label}
    </span>
  );
}

function BarChart({
  data,
  formatValue,
}: {
  data: { label: string; value: number; year: number }[];
  formatValue: (v: number) => string;
}) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const minBarWidth = 36;
  const chartWidth = Math.max(data.length * (minBarWidth + 8), 100);

  return (
    <div className="overflow-x-auto">
      <div className="flex flex-col gap-2 pt-7" style={{ minWidth: `${chartWidth}px` }}>
        <div className="flex items-end gap-2 h-36">
          {data.map((d, i) => {
            const pct = d.value > 0 ? Math.max((d.value / maxVal) * 100, 3) : 0;
            const showYear = i === 0 || d.year !== data[i - 1].year;
            return (
              <div
                key={`${d.label}-${d.year}-${i}`}
                className="flex flex-col items-center flex-1 h-full group cursor-default"
                style={{ minWidth: `${minBarWidth}px` }}
              >
                {showYear && (
                  <span className="text-[9px] font-semibold text-gray-300 mb-0.5 self-start">
                    {d.year}
                  </span>
                )}
                <div className="flex-1 w-full flex items-end">
                  <div
                    className="relative w-full rounded-t-md bg-orange-500 hover:bg-orange-600 transition-colors duration-200"
                    style={{ height: `${pct}%`, minHeight: d.value > 0 ? "3px" : "0px" }}
                  >
                    {d.value > 0 && (
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-white px-1 rounded shadow-sm z-10 pointer-events-none">
                        {formatValue(d.value)}
                      </span>
                    )}
                  </div>
                </div>
                <span className="capitalize mt-1" style={{ fontSize: "10px", color: "#9ca3af" }}>
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const PAGE_SIZE = 25;

const AnalyticsComponent: React.FC<Props> = ({ businessId }) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [tab, setTab] = useState<"stats" | "history">("stats");
  const [selectedMonth, setSelectedMonth] = useState<MonthData | null>(null);
  const [history, setHistory] = useState<AppointmentRecord[] | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(false);
  const [historyFetched, setHistoryFetched] = useState(false);

  const [filterName, setFilterName] = useState("");
  const [filterPhone, setFilterPhone] = useState("");
  const [filterService, setFilterService] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!businessId) {
      setError(true);
      setLoading(false);
      return;
    }
    fetch(`/api/analytics/${businessId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Analytics error:", err);
        setError(true);
        setLoading(false);
      });
  }, [businessId]);

  useEffect(() => {
    setPage(1);
  }, [filterName, filterPhone, filterService, dateRange]);

  const handleTabChange = (newTab: "stats" | "history") => {
    setTab(newTab);
    if (newTab === "history" && !historyFetched && businessId) {
      setHistoryLoading(true);
      fetch(`/api/analytics/${businessId}/history`)
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((json) => {
          setHistory(json);
          setHistoryLoading(false);
          setHistoryFetched(true);
        })
        .catch(() => {
          setHistoryError(true);
          setHistoryLoading(false);
        });
    }
  };

  const uniqueServices = useMemo(
    () =>
      Array.from(
        new Set((history ?? []).map((a) => a.service).filter(Boolean))
      ).sort(),
    [history]
  );

  const filtered = useMemo(() => {
    if (!history) return [];
    return history.filter((a) => {
      if (filterName && !a.name.toLowerCase().includes(filterName.toLowerCase()))
        return false;
      if (filterPhone && !String(a.phone).includes(filterPhone)) return false;
      if (filterService && a.service !== filterService) return false;
      if (dateRange?.from || dateRange?.to) {
        const appDate = new Date(a.start).toLocaleDateString("sv-SE", {
          timeZone: "America/Argentina/Buenos_Aires",
        });
        if (dateRange.from) {
          const fromStr = dateRange.from.toLocaleDateString("sv-SE");
          if (appDate < fromStr) return false;
        }
        if (dateRange.to) {
          const toStr = dateRange.to.toLocaleDateString("sv-SE");
          if (appDate > toStr) return false;
        }
      }
      return true;
    });
  }, [history, filterName, filterPhone, filterService, dateRange]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const hasActiveFilters =
    filterName || filterPhone || filterService || dateRange?.from || dateRange?.to;

  const clearFilters = () => {
    setFilterName("");
    setFilterPhone("");
    setFilterService("");
    setDateRange(undefined);
  };

  const dateRangeLabel = dateRange?.from
    ? dateRange.to
      ? `${formatDateShort(dateRange.from)} – ${formatDateShort(dateRange.to)}`
      : formatDateShort(dateRange.from)
    : "Período";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="loader" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <span className="text-sm text-gray-500">No se pudieron cargar las estadísticas.</span>
        <Link href="/admin/dashboard" className="text-xs text-orange-600 hover:underline">
          ← Volver al inicio
        </Link>
      </div>
    );
  }

  const { monthlyData, summary } = data;
  const currentMonth = monthlyData[monthlyData.length - 1];
  const ticketPromedio =
    (currentMonth?.appointments ?? 0) > 0
      ? (currentMonth.revenue / currentMonth.appointments)
      : 0;

  const revenueChartData = monthlyData.map((m) => ({
    label: m.shortLabel,
    value: m.revenue,
    year: m.year,
  }));

  const appointmentsChartData = monthlyData.map((m) => ({
    label: m.shortLabel,
    value: m.appointments,
    year: m.year,
  }));

  const occupancyRate =
    selectedMonth && selectedMonth.issuedAppointments > 0
      ? Math.round((selectedMonth.appointments / selectedMonth.issuedAppointments) * 100)
      : 0;

  const monthTicket =
    selectedMonth && selectedMonth.appointments > 0
      ? selectedMonth.revenue / selectedMonth.appointments
      : 0;

  return (
    <div className="flex h-fit mx-auto w-full px-[25px] pt-7 sm:pt-[35px] md:w-4/5 md:pt-10 2xl:pt-10 md:px-0 pb-16">
      <div className="flex flex-col w-full gap-8 h-fit">

        {/* HEADER */}
        <div className="flex flex-col gap-1">
          {/* <Link
            href="/admin/business"
            className="flex items-center gap-1 text-xs hover:text-gray-400 text-orange-600 transition-colors duration-200 w-fit mb-1"
          >
            <LuArrowLeft size={13} />
            <span>Mi empresa</span>
          </Link> */}
          <h4 className="text-2xl font-bold md:text-3xl">Estadísticas</h4>
          <span className="text-sm text-gray-500">
            Historial completo · {monthlyData.length} mes{monthlyData.length !== 1 ? "es" : ""}
          </span>
        </div>

        {/* TABS */}
        <div className="flex gap-6 border-b border-gray-100 -mb-2">
          <button
            onClick={() => handleTabChange("stats")}
            className={`pb-3 text-sm font-semibold border-b-2 -mb-px transition-colors duration-150 ${
              tab === "stats"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Estadísticas
          </button>
          <button
            onClick={() => handleTabChange("history")}
            className={`pb-3 text-sm font-semibold border-b-2 -mb-px transition-colors duration-150 ${
              tab === "history"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Historial de turnos
          </button>
        </div>

        {/* STATS TAB */}
        {tab === "stats" && (
          <>
            {/* HISTÓRICO GROUP */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Histórico</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">

                <div style={cardShadow} className="flex flex-col gap-3 p-4 bg-white rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide pr-3 sm:pr-0">
                      Ingresos totales
                    </span>
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ backgroundColor: "#fff3ef" }}>
                      <LuTrendingUp size={15} color="#dd4924" />
                    </div>
                  </div>
                  <span className="text-xl font-bold leading-tight">
                    {formatCurrency(summary.totalRevenue)}
                  </span>
                  <span className="text-xs text-gray-500">acumulado histórico</span>
                </div>

                <div style={cardShadow} className="flex flex-col gap-3 p-4 bg-white rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide pr-3 sm:pr-0">
                      Prom. mensual
                    </span>
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ backgroundColor: "#fff3ef" }}>
                      <LuTrendingUp size={15} color="#dd4924" />
                    </div>
                  </div>
                  <span className="text-xl font-bold leading-tight">
                    {formatCurrency(summary.avgMonthlyRevenue)}
                  </span>
                  <span className="text-xs text-gray-500">promedio por mes</span>
                </div>

                <div style={cardShadow} className="flex flex-col gap-3 p-4 bg-white rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide pr-3 sm:pr-0">
                      Turnos totales
                    </span>
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ backgroundColor: "#fff3ef" }}>
                      <LuUsers size={15} color="#dd4924" />
                    </div>
                  </div>
                  <span className="text-2xl font-bold">
                    {summary.totalAppointments}{" "}
                    <span className="text-gray-400 text-sm font-normal">turnos</span>
                  </span>
                  <span className="text-xs text-gray-500">historial completo</span>
                </div>

                <div style={cardShadow} className="flex flex-col gap-3 p-4 bg-white rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide pr-3 sm:pr-0">
                      Señas cobradas
                    </span>
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ backgroundColor: "#fff3ef" }}>
                      <MdOutlinePayment size={15} color="#dd4924" />
                    </div>
                  </div>
                  <span className="text-2xl font-bold">
                    {summary.totalDeposits}{" "}
                    <span className="text-gray-400 text-sm font-normal">señas</span>
                  </span>
                  <span className="text-xs text-gray-500">con seña abonada</span>
                </div>

              </div>
            </div>

            {/* ESTE MES GROUP */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-orange-500 uppercase tracking-widest">Este mes</span>
                <div className="flex-1 h-px bg-orange-100" />
                <span className="text-[11px] text-gray-400 capitalize">{currentMonth?.month} {currentMonth?.year}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">

                <div style={cardShadow} className="flex flex-col gap-3 p-4 bg-white rounded-xl border-t-2 border-orange-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide pr-3 sm:pr-0">
                      Ingresos
                    </span>
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100">
                      <LuTrendingUp size={15} color="#dd4924" />
                    </div>
                  </div>
                  <span className="text-xl font-bold leading-tight">
                    {formatCurrency(currentMonth?.revenue ?? 0)}
                  </span>
                  <span className="text-xs text-gray-500">ingresos del mes</span>
                </div>

                <div style={cardShadow} className="flex flex-col gap-3 p-4 bg-white rounded-xl border-t-2 border-orange-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide pr-3 sm:pr-0">
                      Turnos
                    </span>
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100">
                      <LuUsers size={15} color="#dd4924" />
                    </div>
                  </div>
                  <span className="text-2xl font-bold">
                    {currentMonth?.appointments ?? 0}{" "}
                    <span className="text-gray-400 text-sm font-normal">turnos</span>
                  </span>
                  <span className="text-xs text-gray-500">reservados este mes</span>
                </div>

                <div style={cardShadow} className="flex flex-col gap-3 p-4 bg-white rounded-xl border-t-2 border-orange-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide pr-3 sm:pr-0">
                      Señas
                    </span>
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100">
                      <MdOutlinePayment size={15} color="#dd4924" />
                    </div>
                  </div>
                  <span className="text-2xl font-bold">
                    {currentMonth?.paidDeposits ?? 0}{" "}
                    <span className="text-gray-400 text-sm font-normal">señas</span>
                  </span>
                  <span className="text-xs text-gray-500">cobradas este mes</span>
                </div>

                <div style={cardShadow} className="flex flex-col gap-3 p-4 bg-white rounded-xl border-t-2 border-orange-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide pr-3 sm:pr-0">
                      Ticket prom.
                    </span>
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100">
                      <LuTrendingUp size={15} color="#dd4924" />
                    </div>
                  </div>
                  <span className="text-xl font-bold leading-tight">
                    {formatCurrency(ticketPromedio)}
                  </span>
                  <span className="text-xs text-gray-500">por turno este mes</span>
                </div>

              </div>
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div style={cardShadow} className="flex flex-col gap-4 p-5 bg-white rounded-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-sm font-semibold text-gray-800">Ingresos por mes</span>
                    <p className="text-xs text-gray-400 mt-0.5">Pasá el mouse sobre las barras para ver el detalle</p>
                  </div>
                  <span className="text-xs font-semibold text-orange-600 whitespace-nowrap ml-2">
                    {formatCurrencyShort(summary.totalRevenue)} total
                  </span>
                </div>
                <BarChart data={revenueChartData} formatValue={formatCurrency} />
              </div>

              <div style={cardShadow} className="flex flex-col gap-4 p-5 bg-white rounded-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-sm font-semibold text-gray-800">Turnos por mes</span>
                    <p className="text-xs text-gray-400 mt-0.5">Pasá el mouse sobre las barras para ver el detalle</p>
                  </div>
                  <span className="text-xs font-semibold text-orange-600 whitespace-nowrap ml-2">
                    {summary.totalAppointments} total
                  </span>
                </div>
                <BarChart
                  data={appointmentsChartData}
                  formatValue={(v) => `${v} turno${v !== 1 ? "s" : ""}`}
                />
              </div>

            </div>

            {/* MONTHLY TABLE */}
            <div style={cardShadow} className="bg-white rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-800">Detalle mensual</span>
                <span className="text-[11px] text-gray-400">Hacé clic en un mes para ver el detalle</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-5 py-3 font-semibold text-gray-500">Mes</th>
                      <th className="text-right px-5 py-3 font-semibold text-gray-500">Turnos reservados</th>
                      <th className="text-right px-5 py-3 font-semibold text-gray-500">Ingresos</th>
                      <th className="text-right px-5 py-3 font-semibold text-gray-500">Señas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...monthlyData].reverse().map((m, idx) => (
                      <tr
                        key={`${m.month}-${m.year}`}
                        onClick={() => setSelectedMonth(m)}
                        className={`border-b border-gray-50 hover:bg-orange-50/40 cursor-pointer transition-colors duration-150 group ${
                          idx === 0 ? "font-semibold" : ""
                        }`}
                      >
                        <td className="px-5 py-3 text-gray-800 capitalize">
                          <span className="group-hover:text-orange-600 transition-colors duration-150">
                            {m.month} {m.year}
                          </span>
                          {idx === 0 && (
                            <span className="ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600">
                              actual
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right text-gray-700">
                          {m.appointments > 0 ? m.appointments : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right text-gray-700">
                          {m.revenue > 0 ? formatCurrency(m.revenue) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right">
                          {m.paidDeposits > 0 ? (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                              {m.paidDeposits} seña{m.paidDeposits !== 1 ? "s" : ""}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* MONTH DETAIL MODAL */}
        <Dialog open={!!selectedMonth} onOpenChange={(open) => { if (!open) setSelectedMonth(null); }}>
          <DialogContent className="max-w-sm p-0 overflow-hidden rounded-2xl gap-0">
            <DialogHeader className="px-6 pt-5 pb-4 border-b border-gray-100">
              <DialogTitle className="text-base md:text-xl font-bold text-gray-800 capitalize">
                {selectedMonth?.month} {selectedMonth?.year}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400">
                Resumen del mes
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-px bg-gray-100">
              <div className="bg-white px-5 py-4 flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Turnos emitidos</span>
                <span className="text-xl font-bold text-gray-800">{selectedMonth?.issuedAppointments}</span>
                <span className="text-[11px] text-gray-400">slots creados</span>
              </div>
              <div className="bg-white px-5 py-4 flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Turnos reservados</span>
                <span className="text-xl font-bold text-gray-800">{selectedMonth?.appointments}</span>
                <span className="text-[11px] text-gray-400">por clientes</span>
              </div>
              <div className="bg-white px-5 py-4 flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Ocupación</span>
                <span className="text-xl font-bold text-gray-800">{occupancyRate}%</span>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-0.5">
                  <div
                    className="bg-orange-400 h-1.5 rounded-full transition-all"
                    style={{ width: `${occupancyRate}%` }}
                  />
                </div>
              </div>
              <div className="bg-white px-5 py-4 flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Ingresos</span>
                <span className="text-xl font-bold text-gray-800">{formatCurrency(selectedMonth?.revenue ?? 0)}</span>
                <span className="text-[11px] text-gray-400">del mes</span>
              </div>
              <div className="bg-white px-5 py-4 flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Señas cobradas</span>
                <span className="text-xl font-bold text-gray-800">{selectedMonth?.paidDeposits}</span>
                <span className="text-[11px] text-gray-400">con seña abonada</span>
              </div>
              <div className="bg-white px-5 py-4 flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Ticket promedio</span>
                <span className="text-xl font-bold text-gray-800">{formatCurrency(monthTicket)}</span>
                <span className="text-[11px] text-gray-400">por turno reservado</span>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* HISTORY TAB */}
        {tab === "history" && (
          <>
            {/* FILTERS */}
            <div style={cardShadow} className="bg-white rounded-xl p-4 md:p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">Filtros</span>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-orange-600 hover:underline">
                    Limpiar filtros
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3 sm:items-center">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-orange-400 w-full sm:w-40"
                />
                <input
                  type="text"
                  placeholder="Teléfono"
                  value={filterPhone}
                  onChange={(e) => setFilterPhone(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-orange-400 w-full sm:w-36"
                />
                <select
                  value={filterService}
                  onChange={(e) => setFilterService(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-orange-400 bg-white w-full sm:w-auto"
                >
                  <option value="">Todos los servicios</option>
                  {uniqueServices.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                {/* DATE RANGE PICKER */}
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <button
                      className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-xs transition-colors focus:outline-none w-full sm:w-auto justify-center sm:justify-start ${
                        dateRange?.from
                          ? "border-orange-400 text-orange-600 bg-orange-50"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      <LuCalendar size={12} />
                      <span>{dateRangeLabel}</span>
                      {dateRange?.from && (
                        <span
                          role="button"
                          onClick={(e) => { e.stopPropagation(); setDateRange(undefined); }}
                          className="ml-1 text-orange-400 hover:text-orange-600"
                        >
                          <LuX size={11} />
                        </span>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      locale={es}
                      selected={dateRange}
                      onSelect={(range) => {
                        setDateRange(range);
                        if (
                          range?.from &&
                          range?.to &&
                          range.from.toDateString() !== range.to.toDateString()
                        ) {
                          setCalendarOpen(false);
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* HISTORY LIST */}
            <div style={cardShadow} className="bg-white rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 md:px-5 py-4 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-800">Turnos reservados</span>
                {!historyLoading && history && (
                  <span className="text-xs text-gray-400">
                    {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
                    {hasActiveFilters && ` de ${history.length}`}
                  </span>
                )}
              </div>

              {historyLoading && (
                <div className="flex items-center justify-center py-16">
                  <div className="loader" />
                </div>
              )}

              {historyError && (
                <div className="flex items-center justify-center py-16">
                  <span className="text-sm text-gray-400">No se pudo cargar el historial.</span>
                </div>
              )}

              {!historyLoading && !historyError && history && (
                <>
                  {/* MOBILE CARD LIST */}
                  <div className="md:hidden divide-y divide-gray-50">
                    {paginated.length === 0 ? (
                      <p className="px-4 py-10 text-center text-sm text-gray-400">
                        No hay turnos que coincidan con los filtros.
                      </p>
                    ) : (
                      paginated.map((a) => (
                        <div key={a._id} className="px-4 py-4 flex flex-col gap-2.5 hover:bg-gray-50/60 transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs font-semibold text-gray-800">{formatDateOnly(a.start)}</span>
                              <span className="text-[11px] text-gray-400">{formatTimeOnly(a.start)}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {a.price > 0 && (
                                <span className="text-sm font-bold text-gray-800">{formatCurrency(a.price)}</span>
                              )}
                              <DepositBadge status={a.depositStatus} />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-semibold text-gray-800">
                              {a.name || <span className="text-gray-400 font-normal">Sin nombre</span>}
                            </span>
                            <div className="flex items-center gap-2 flex-wrap">
                              {a.phone && (
                                <span className="text-xs text-gray-500">{a.phone}</span>
                              )}
                              {a.service && (
                                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-100">
                                  {a.service}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* DESKTOP TABLE */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Fecha</th>
                          <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Nombre</th>
                          <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Teléfono</th>
                          <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Servicio</th>
                          <th className="text-right px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Precio</th>
                          <th className="text-right px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Seña</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginated.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">
                              No hay turnos que coincidan con los filtros.
                            </td>
                          </tr>
                        ) : (
                          paginated.map((a) => (
                            <tr
                              key={a._id}
                              className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors duration-150"
                            >
                              <td className="px-5 py-4">
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-xs font-semibold text-gray-800 whitespace-nowrap">
                                    {formatDateOnly(a.start)}
                                  </span>
                                  <span className="text-[11px] text-gray-400 whitespace-nowrap">
                                    {formatTimeOnly(a.start)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <span className="text-sm font-semibold text-gray-800">
                                  {a.name || <span className="text-gray-400 font-normal text-xs">-</span>}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <span className="text-xs text-gray-500">
                                  {a.phone ? a.phone : <span className="text-gray-300">-</span>}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                {a.service ? (
                                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-100 whitespace-nowrap">
                                    {a.service}
                                  </span>
                                ) : (
                                  <span className="text-gray-300 text-xs">-</span>
                                )}
                              </td>
                              <td className="px-5 py-4 text-right">
                                {a.price > 0 ? (
                                  <span className="text-sm font-bold text-gray-800">{formatCurrency(a.price)}</span>
                                ) : (
                                  <span className="text-gray-300 text-xs">-</span>
                                )}
                              </td>
                              <td className="px-5 py-4 text-right">
                                <DepositBadge status={a.depositStatus} />
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* PAGINATION */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 md:px-5 py-3 border-t border-gray-100">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="text-xs text-gray-500 hover:text-orange-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        ← Anterior
                      </button>
                      <span className="text-xs text-gray-400">
                        {page} / {totalPages}
                      </span>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="text-xs text-gray-500 hover:text-orange-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        Siguiente →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default AnalyticsComponent;
