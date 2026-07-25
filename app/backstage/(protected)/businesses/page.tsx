import { cookies } from "next/headers";
import BusinessesTable from "@/components/backstage/BusinessesTable";
import TableSearchBar from "@/components/backstage/TableSearchBar";
import Pagination from "@/components/backstage/Pagination";

const backendUrl = process.env.BACKEND_URL || "http://localhost:4000/api";

async function fetchBusinesses(page: number, search: string) {
  const token = cookies().get("sacaturno_hq_token")?.value;
  const params = new URLSearchParams({ page: String(page) });
  if (search) params.set("search", search);

  const res = await fetch(`${backendUrl}/superadmin/businesses?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return { businesses: [], page: 1, totalPages: 1 };
  return res.json();
}

export default async function BackstageBusinessesPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || "";
  const data = await fetchBusinesses(page, search);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800">Negocios</h1>
        <TableSearchBar placeholder="Buscar por nombre..." />
      </div>
      <BusinessesTable businesses={data.businesses} />
      <Pagination page={data.page} totalPages={data.totalPages} basePath="/backstage/businesses" search={search} />
    </div>
  );
}
