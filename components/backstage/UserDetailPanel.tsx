import Link from "next/link";
import { formatCurrency, formatDate } from "./format";

interface OwnedBusiness {
  _id: string;
  name: string;
  slug: string;
  businessType: string;
  createdAt: string;
  mpLinked?: boolean;
  subscription: { subscriptionType: string; expiracyDate: string } | null;
  appointmentsCount: number;
  lastActivity: string | null;
  isActive: boolean;
}

interface Membership {
  businessID: string;
  status: "pending" | "active" | "inactive";
  permissions: string[];
  business: { name: string; slug: string; businessType: string } | null;
  appointmentsCount: number;
  isActive: boolean;
}

interface Payment {
  _id: string;
  businessID: string;
  price: number;
  subscriptionType: string;
  paymentDate: string;
  createdAt: string;
}

interface UserDetail {
  user: {
    name: string;
    surname: string;
    email: string;
    phone?: number;
    verified: boolean;
    isFirstLogin: boolean;
    createdAt: string;
  };
  ownedBusinesses: OwnedBusiness[];
  memberships: Membership[];
  subscriptionPayments: Payment[];
}

const UserDetailPanel = ({ data }: { data: UserDetail }) => {
  const { user, ownedBusinesses, memberships, subscriptionPayments } = data;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">
            {user.name} {user.surname}
          </h1>
          {user.verified ? (
            <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">Verificado</span>
          ) : (
            <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">No verificado</span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 sm:grid-cols-4">
          <div>
            <span className="block text-gray-400">Email</span>
            {user.email}
          </div>
          <div>
            <span className="block text-gray-400">Teléfono</span>
            {user.phone || "—"}
          </div>
          <div>
            <span className="block text-gray-400">Alta</span>
            {formatDate(user.createdAt)}
          </div>
          <div>
            <span className="block text-gray-400">Primer login pendiente</span>
            {user.isFirstLogin ? "Sí" : "No"}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-0 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-800">Negocios como dueño</h2>
        </div>
        <div className="flex flex-col divide-y divide-gray-50">
          {ownedBusinesses.length === 0 && <p className="px-6 py-4 text-xs text-gray-400">No creó ningún negocio.</p>}
          {ownedBusinesses.map((b) => (
            <div
              key={b._id}
              className="flex flex-col gap-2 px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-6"
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate font-medium text-gray-800">{b.name}</span>
                <span className="truncate text-gray-400">{b.businessType} · alta {formatDate(b.createdAt)}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="text-gray-600">{b.appointmentsCount} turnos</span>
                <span className="text-gray-600">{b.subscription?.subscriptionType ?? "SC_FREE"}</span>
                {b.isActive ? (
                  <span className="rounded-full bg-green-100 px-2.5 py-1 font-medium text-green-700">Activo</span>
                ) : (
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 font-medium text-gray-700">Inactivo</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-0 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-800">Membresías como empleado</h2>
        </div>
        <div className="flex flex-col divide-y divide-gray-50">
          {memberships.length === 0 && <p className="px-6 py-4 text-xs text-gray-400">No es empleado de ningún negocio.</p>}
          {memberships.map((m) => (
            <div
              key={m.businessID}
              className="flex flex-col gap-2 px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-6"
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate font-medium text-gray-800">{m.business?.name ?? "Negocio eliminado"}</span>
                <span className="truncate text-gray-400">{m.permissions.join(", ") || "Sin permisos"}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="text-gray-600">{m.appointmentsCount} turnos</span>
                <span className="rounded-full bg-gray-100 px-2.5 py-1 font-medium text-gray-700">{m.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-0 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-800">Historial de pagos de suscripción</h2>
        </div>
        <div className="flex flex-col divide-y divide-gray-50">
          {subscriptionPayments.length === 0 && <p className="px-6 py-4 text-xs text-gray-400">Sin pagos registrados.</p>}
          {subscriptionPayments.map((p) => (
            <div
              key={p._id}
              className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 px-4 py-3 text-xs sm:flex sm:items-center sm:justify-between sm:px-6"
            >
              <span className="text-gray-600">{formatDate(p.paymentDate)}</span>
              <span className="col-start-2 row-start-1 justify-self-end font-medium text-gray-800 sm:col-auto sm:row-auto sm:justify-self-auto">
                {formatCurrency(p.price)}
              </span>
              <span className="col-span-2 text-gray-400 sm:col-span-1 sm:order-none sm:text-gray-600">
                {p.subscriptionType}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Link href="/backstage/users" className="text-xs font-medium text-orange-600 hover:underline">
        ← Volver al listado
      </Link>
    </div>
  );
};

export default UserDetailPanel;
