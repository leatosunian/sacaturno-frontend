import { cookies } from "next/headers";
import BusinessesTable from "@/components/backstage/BusinessesTable";
import TableSearchBar from "@/components/backstage/TableSearchBar";
import BusinessCategoryFilter from "@/components/backstage/BusinessCategoryFilter";
import Pagination from "@/components/backstage/Pagination";

const backendUrl = process.env.BACKEND_URL || "http://localhost:4000/api";

async function fetchBusinesses(page: number, search: string, category: string) {
  const token = cookies().get("sacaturno_hq_token")?.value;
  const params = new URLSearchParams({ page: String(page) });
  if (search) params.set("search", search);
  if (category) params.set("category", category);

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
  searchParams: { page?: string; search?: string; category?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || "";
  const category = searchParams.category || "";
  const data = await fetchBusinesses(page, search, category);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-semibold text-gray-800">Negocios</h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <BusinessCategoryFilter />
          <TableSearchBar placeholder="Buscar por nombre..." />
        </div>
      </div>
      <BusinessesTable businesses={data.businesses} />
      <Pagination page={data.page} totalPages={data.totalPages} basePath="/backstage/businesses" search={search} category={category} />
    </div>
  );
}
