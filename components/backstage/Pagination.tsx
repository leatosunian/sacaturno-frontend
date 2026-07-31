import Link from "next/link";

interface Props {
  page: number;
  totalPages: number;
  basePath: string;
  search?: string;
  category?: string;
}

const Pagination = ({ page, totalPages, basePath, search, category }: Props) => {
  if (totalPages <= 1) return null;

  const hrefFor = (p: number) => {
    const params = new URLSearchParams();
    params.set("page", String(p));
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    return `${basePath}?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-end gap-2 py-3">
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-disabled={page <= 1}
        className={`text-xs font-medium ${page <= 1 ? "pointer-events-none text-gray-300" : "text-orange-600 hover:underline"}`}
      >
        Anterior
      </Link>
      <span className="text-xs text-gray-500">
        Página {page} de {totalPages}
      </span>
      <Link
        href={hrefFor(Math.min(totalPages, page + 1))}
        aria-disabled={page >= totalPages}
        className={`text-xs font-medium ${page >= totalPages ? "pointer-events-none text-gray-300" : "text-orange-600 hover:underline"}`}
      >
        Siguiente
      </Link>
    </div>
  );
};

export default Pagination;
