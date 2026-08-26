import Link from "next/link";
import { LuChevronRight } from "react-icons/lu";
import { formatCurrency, formatDate } from "./format";

interface UserRow {
  _id: string;
  name: string;
  surname: string;
  email: string;
  verified: boolean;
  createdAt: string;
  role: "owner" | "employee" | "none";
  isActive: boolean;
  businesses: { name: string; businessID: string }[];
  memberBusinesses: string[];
  totalSubscriptionPayments: number;
}

const roleLabel: Record<UserRow["role"], string> = {
  owner: "Dueño",
  employee: "Empleado",
  none: "Sin negocio",
};

const VerifiedBadge = ({ verified }: { verified: boolean }) =>
  verified ? (
    <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">Sí</span>
  ) : (
    <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">No</span>
  );

const ActivityBadge = ({ active }: { active: boolean }) =>
  active ? (
    <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">Activo</span>
  ) : (
    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">Inactivo</span>
  );

const businessesLabel = (u: UserRow) =>
  [...u.businesses.map((b) => b.name), ...u.memberBusinesses].join(", ") || "—";

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</span>
    <span className="min-w-0 truncate text-xs font-medium text-gray-700">{value}</span>
  </div>
);

const UsersTable = ({ users }: { users: UserRow[] }) => {
  return (
    <>
      {/* MOBILE: tarjetas — tocar abre el detalle del usuario */}
      <div className="flex flex-col gap-3 md:hidden">
        {users.length === 0 && (
          <p className="rounded-xl border border-gray-100 bg-white px-4 py-8 text-center text-sm text-gray-400 shadow-sm">
            Sin resultados.
          </p>
        )}
        {users.map((u) => (
          <Link
            key={u._id}
            href={`/backstage/users/${u._id}`}
            className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 ease-in-out active:scale-[0.99] active:bg-gray-50"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-sm font-semibold text-gray-800">
                  {u.name} {u.surname}
                </span>
                <span className="truncate text-xs text-gray-500">{u.email}</span>
              </div>
              <LuChevronRight size={16} className="mt-1 flex-shrink-0 text-gray-300" />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                {roleLabel[u.role]}
              </span>
              <ActivityBadge active={u.isActive} />
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  u.verified ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {u.verified ? "Verificado" : "Sin verificar"}
              </span>
            </div>

            <div className="h-px w-full bg-gray-100" />

            <div className="flex flex-col gap-2">
              <Field label="Negocio(s)" value={businessesLabel(u)} />
              <Field label="Pagos plan" value={formatCurrency(u.totalSubscriptionPayments)} />
              <Field label="Alta" value={formatDate(u.createdAt)} />
            </div>
          </Link>
        ))}
      </div>

      {/* DESKTOP: tabla */}
      <div className="hidden w-full overflow-x-auto rounded-xl border border-gray-100 shadow-lg md:block">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Nombre</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Verificado</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Rol</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Negocio(s)</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Actividad</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Pagos plan</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Alta</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-gray-400">
                  Sin resultados.
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u._id} className="border-b border-gray-50 transition-colors duration-150 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">
                  {u.name} {u.surname}
                </td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3">
                  <VerifiedBadge verified={u.verified} />
                </td>
                <td className="px-4 py-3 text-gray-600">{roleLabel[u.role]}</td>
                <td className="px-4 py-3 text-gray-600">{businessesLabel(u)}</td>
                <td className="px-4 py-3">
                  <ActivityBadge active={u.isActive} />
                </td>
                <td className="px-4 py-3 text-gray-600">{formatCurrency(u.totalSubscriptionPayments)}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(u.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/backstage/users/${u._id}`} className="text-xs font-medium text-orange-600 hover:underline">
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default UsersTable;
