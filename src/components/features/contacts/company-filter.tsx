"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CompanyListItem } from "@/types/crm";

export function CompanyFilter({ companies }: { companies: CompanyListItem[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateCompany(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete("company_id");
    else params.set("company_id", value);
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <Select
      value={searchParams.get("company_id") ?? "all"}
      onValueChange={updateCompany}
    >
      <SelectTrigger className="w-full sm:w-56">
        <SelectValue placeholder="Company" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All companies</SelectItem>
        {companies.map((company) => (
          <SelectItem key={company.id} value={company.id}>
            {company.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
