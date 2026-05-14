"use client";

import { useQuery } from "@tanstack/react-query";
import { ListChecks, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { getLeadColumns } from "@/components/features/leads/lead-columns";
import { LeadForm } from "@/components/features/leads/lead-form";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterBar } from "@/components/shared/filter-bar";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS } from "@/lib/constants";
import { can } from "@/lib/permissions";
import { useCurrentUser } from "@/hooks/use-current-user";
import type { ApiSuccess } from "@/types/api";
import { LEAD_SOURCES, LEAD_STATUSES, type AppUser } from "@/types/enums";
import type { LeadListItem } from "@/services/lead.service";

type LeadsMeta = {
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

async function fetchLeads(queryString: string) {
  const response = await fetch(`/api/leads?${queryString}`);
  if (!response.ok) throw new Error("Unable to load leads.");
  return (await response.json()) as ApiSuccess<LeadListItem[], LeadsMeta>;
}

async function fetchUsers() {
  const response = await fetch("/api/auth/demo-accounts");
  if (!response.ok) throw new Error("Unable to load users.");
  const payload = (await response.json()) as ApiSuccess<AppUser[]>;
  return payload.data;
}

export default function LeadsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const [createOpen, setCreateOpen] = useState(false);
  const currentUser = useCurrentUser();
  const leadsQuery = useQuery({
    queryKey: ["leads", queryString],
    queryFn: () => fetchLeads(queryString),
  });
  const usersQuery = useQuery({
    queryKey: ["demo-accounts"],
    queryFn: fetchUsers,
  });
  const columns = useMemo(() => getLeadColumns(), []);
  const user = currentUser.data;

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete(key);
    else params.set(key, value);
    params.delete("page");
    router.replace(`/leads?${params.toString()}`);
  }

  if (currentUser.isLoading || leadsQuery.isLoading) {
    return (
      <div className="space-y-5">
        <PageHeader title="Leads" description="Track prospects from first touch to conversion." />
        <Skeleton className="h-16 w-full" />
        <div className="rounded-lg border">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="m-3 h-10" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) return null;

  const leads = leadsQuery.data?.data ?? [];
  const meta =
    leadsQuery.data?.meta ?? ({ total: 0, page: 1, pageSize: 25, hasMore: false } satisfies LeadsMeta);
  const searchParamsForPagination = new URLSearchParams(searchParams.toString());

  return (
    <div className="space-y-5">
      <PageHeader
        title="Leads"
        description="Track prospects from first touch to conversion."
        actions={
          can(user, "create", "lead") ? (
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Lead
            </Button>
          ) : null
        }
      />
      <FilterBar
        searchPlaceholder="Search leads..."
        filters={
          <>
            <Select
              value={searchParams.get("status") ?? "all"}
              onValueChange={(value) => updateFilter("status", value)}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {LEAD_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {LEAD_STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={searchParams.get("source") ?? "all"}
              onValueChange={(value) => updateFilter("source", value)}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                {LEAD_SOURCES.map((source) => (
                  <SelectItem key={source} value={source}>
                    {LEAD_SOURCE_LABELS[source]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={searchParams.get("assigned_to_id") ?? "all"}
              onValueChange={(value) => updateFilter("assigned_to_id", value)}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All owners</SelectItem>
                {(usersQuery.data ?? []).map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.first_name} {account.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
      />
      <DataTable
        columns={columns}
        rows={leads}
        getRowKey={(lead) => lead.id}
        empty={
          <EmptyState
            icon={ListChecks}
            title="No leads found"
            description="No leads match the current filters."
            action={
              can(user, "create", "lead") ? (
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Add Lead
                </Button>
              ) : null
            }
          />
        }
      />
      <PaginationControls meta={meta} searchParams={searchParamsForPagination} />
      <LeadForm open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
