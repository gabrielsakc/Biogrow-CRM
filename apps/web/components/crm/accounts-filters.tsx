"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter } from "lucide-react";
import { Input } from "@biogrow/ui/components/input";
import { Select } from "@biogrow/ui/components/select";

interface AccountsFiltersProps {
  companySlug: string;
}

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "PROSPECT", label: "Prospect" },
  { value: "CUSTOMER", label: "Customer" },
  { value: "PARTNER", label: "Partner" },
  { value: "VENDOR", label: "Vendor" },
  { value: "CHURNED", label: "Churned" },
];

export function AccountsFilters({ companySlug }: AccountsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1"); // Reset to first page on filter change
    router.push(`/${companySlug}/crm/accounts?${params.toString()}`);
  }

  const currentType = searchParams.get("type") || "";
  const currentSearch = searchParams.get("search") || "";

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="search"
          placeholder="Search accounts..."
          defaultValue={currentSearch}
          onChange={(e) => {
            // Debounce search - simple implementation
            const value = e.target.value;
            clearTimeout((e.target as any)._debounce);
            (e.target as any)._debounce = setTimeout(() => {
              updateFilter("search", value);
            }, 300);
          }}
          className="pl-9"
        />
      </div>

      {/* Type Filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-400" />
        <Select
          value={currentType}
          onChange={(e) => updateFilter("type", e.target.value)}
          options={TYPE_OPTIONS}
          className="min-w-[140px]"
        />
      </div>
    </div>
  );
}