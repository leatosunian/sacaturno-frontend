"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { BUSINESS_CATEGORIES } from "@/lib/businessCategories";

const BusinessCategoryFilter = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("category") ?? "";

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("category", value);
    else params.delete("category");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      value={current}
      onChange={(e) => handleChange(e.target.value)}
      className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-800 outline-none transition-colors focus:border-orange-600 sm:w-auto"
    >
      <option value="">Todos los rubros</option>
      {BUSINESS_CATEGORIES.map((c) => (
        <option key={c.code} value={c.code}>
          {c.label}
        </option>
      ))}
    </select>
  );
};

export default BusinessCategoryFilter;
