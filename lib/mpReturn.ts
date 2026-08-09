// Utilidades para interpretar el regreso desde Checkout Pro de Mercado Pago.
//
// MP siempre redirige a las `back_urls` configuradas en la preferencia, tanto
// cuando se completa un pago como cuando el usuario toca "Volver a SacaTurno"
// sin pagar. En este último caso los parámetros llegan ausentes o con el string
// literal "null", por lo que hay que distinguir ambos escenarios antes de
// mostrarle un resultado de pago al usuario.

export type MPReturnStatus = "approved" | "pending" | "rejected" | "unknown";

export interface MPReturnResult {
  status: MPReturnStatus;
  paymentID: string | null;
  externalReference: string | null;
  paymentType: string | null;
  merchantOrderID: string | null;
}

interface ReadonlyParams {
  get(name: string): string | null;
  toString(): string;
}

// Todos los parámetros que MP agrega a la URL de retorno.
export const MP_RETURN_PARAMS = [
  "collection_id",
  "collection_status",
  "payment_id",
  "status",
  "external_reference",
  "payment_type",
  "merchant_order_id",
  "preference_id",
  "site_id",
  "processing_mode",
  "merchant_account_id",
];

// MP manda "null" como texto cuando el usuario vuelve sin pagar.
const clean = (value: string | null): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined") return null;
  return trimmed;
};

const normalizeStatus = (raw: string | null): MPReturnStatus => {
  switch (raw) {
    case "approved":
    case "success":
      return "approved";
    case "pending":
    case "in_process":
    case "in_mediation":
    case "authorized":
      return "pending";
    case "rejected":
    case "failure":
    case "cancelled":
    case "charged_back":
    case "refunded":
      return "rejected";
    default:
      // Volvió un paymentID pero MP no informó un estado que conozcamos.
      return "unknown";
  }
};

// Devuelve null cuando el regreso no corresponde a una transacción
// (ej. el usuario tocó "Volver a SacaTurno" sin pagar).
export const parseMPReturn = (params: ReadonlyParams): MPReturnResult | null => {
  const rawStatus = clean(params.get("status")) ?? clean(params.get("collection_status"));
  const paymentID = clean(params.get("payment_id")) ?? clean(params.get("collection_id"));

  if (!rawStatus && !paymentID) return null;

  return {
    status: normalizeStatus(rawStatus),
    paymentID,
    externalReference: clean(params.get("external_reference")),
    paymentType: clean(params.get("payment_type")),
    merchantOrderID: clean(params.get("merchant_order_id")),
  };
};

// Query string sin los parámetros de MP, para limpiar la URL sin perder
// cualquier otro parámetro propio de la página.
export const stripMPParams = (
  params: ReadonlyParams,
  alsoRemove: string[] = []
): string => {
  const next = new URLSearchParams(params.toString());
  [...MP_RETURN_PARAMS, ...alsoRemove].forEach((key) => next.delete(key));
  return next.toString();
};
