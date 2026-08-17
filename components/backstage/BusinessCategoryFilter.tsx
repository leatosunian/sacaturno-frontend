"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { BUSINESS_CATEGORIES } from "@/lib/businessCategories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL_VALUE = "__all__";

const BusinessCategoryFilter = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("category") ?? "";

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const normalized = value === ALL_VALUE ? "" : value;
    if (normalized) params.set("category", normalized);
    else params.delete("category");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Select value={current || ALL_VALUE} onValueChange={handleChange}>
      <SelectTrigger className="h-9 w-full sm:w-auto rounded-md border border-gray-200 bg-gray-50 px-3 text-xs text-gray-800 shadow-none transition-all duration-200 ease-in-out focus:ring-0 focus:ring-offset-0 hover:border-orange-600 focus:border-orange-600 data-[state=open]:border-orange-600">
        <SelectValue placeholder="Todos los rubros" />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        <SelectItem
          value={ALL_VALUE}
          className="cursor-pointer text-xs text-gray-700 focus:bg-orange-50 focus:text-orange-700 data-[state=checked]:font-medium data-[state=checked]:text-orange-700"
        >
          Todos los rubros
        </SelectItem>
        {BUSINESS_CATEGORIES.map((c) => (
          <SelectItem
            key={c.code}
            value={c.code}
            className="cursor-pointer text-xs text-gray-700 focus:bg-orange-50 focus:text-orange-700 data-[state=checked]:font-medium data-[state=checked]:text-orange-700"
          >
            {c.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default BusinessCategoryFilter;
