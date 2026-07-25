export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);

export const formatPercent = (value: number) =>
  new Intl.NumberFormat("es-AR", { style: "percent", maximumFractionDigits: 1 }).format(value);

export const formatDate = (value: string | Date) =>
  new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
