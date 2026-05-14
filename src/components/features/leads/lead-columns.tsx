"use client";

import Link from "next/link";

import { StatusBadge } from "@/components/shared/status-badge";
import type { DataTableColumn } from "@/components/shared/data-table";
import type { LeadListItem } from "@/services/lead.service";

export function getLeadColumns(): DataTableColumn<LeadListItem>[] {
  return [
    {
      key: "name",
      header: "Name",
      cell: (lead) => (
        <div>
          <Link href={`/leads/${lead.id}`} className="font-medium hover:underline">
            {lead.first_name} {lead.last_name}
          </Link>
          <div className="text-xs text-muted-foreground">{lead.email ?? lead.phone}</div>
        </div>
      ),
    },
    {
      key: "company",
      header: "Company",
      cell: (lead) =>
        lead.company_id && lead.company_name ? (
          <Link href={`/companies/${lead.company_id}`} className="hover:underline">
            {lead.company_name}
          </Link>
        ) : (
          <span className="text-muted-foreground">Unassigned</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      cell: (lead) => <StatusBadge value={lead.status} />,
    },
    {
      key: "source",
      header: "Source",
      cell: (lead) => <StatusBadge value={lead.source} />,
    },
    {
      key: "assigned_to",
      header: "Assigned To",
      cell: (lead) => lead.assignee_name ?? <span className="text-muted-foreground">Unassigned</span>,
    },
    {
      key: "created_at",
      header: "Created At",
      cell: (lead) => new Date(lead.created_at).toLocaleDateString(),
    },
  ];
}
