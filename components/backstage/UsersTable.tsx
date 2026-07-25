import Link from "next/link";
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

const UsersTable = ({ users }: { users: UserRow[] }) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-gray-100 shadow-lg">
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
                {u.verified ? (
                  <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">Sí</span>
                ) : (
                  <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">No</span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-600">{roleLabel[u.role]}</td>
              <td className="px-4 py-3 text-gray-600">
                {[...u.businesses.map((b) => b.name), ...u.memberBusinesses].join(", ") || "—"}
              </td>
              <td className="px-4 py-3">
                {u.isActive ? (
                  <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">Activo</span>
                ) : (
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">Inactivo</span>
                )}
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
  );
};

export default UsersTable;
