"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEAL_STAGE_LABELS } from "@/lib/constants";
import { DEAL_STAGES, type AppUser } from "@/types/enums";

export function DealFilters({
  users,
  showStage = true,
}: {
  users: AppUser[];
  showStage?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete(key);
    else params.set(key, value);
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <>
      {showStage ? (
        <Select
          value={searchParams.get("stage") ?? "all"}
          onValueChange={(value) => updateFilter("stage", value)}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            {DEAL_STAGES.map((stage) => (
              <SelectItem key={stage} value={stage}>
                {DEAL_STAGE_LABELS[stage]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
      <Select
        value={searchParams.get("assigned_to_id") ?? "all"}
        onValueChange={(value) => updateFilter("assigned_to_id", value)}
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Owner" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All owners</SelectItem>
          {users.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              {account.first_name} {account.last_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
