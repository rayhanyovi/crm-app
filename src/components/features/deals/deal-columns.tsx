import Link from "next/link";

import { DealRowActions } from "@/components/features/deals/deal-row-actions";
import { StageBadge } from "@/components/shared/stage-badge";
import { SortLink } from "@/components/shared/sort-link";
import type { DataTableColumn } from "@/components/shared/data-table";
import type { DealListQuery } from "@/lib/validators/deal";
import type { DealListItem } from "@/types/crm";
import type { AppUser } from "@/types/enums";

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getDealColumns({
  user,
  query,
  searchParams,
}: {
  user: AppUser;
  query: DealListQuery;
  searchParams: URLSearchParams;
}): DataTableColumn<DealListItem>[] {
  return [
    {
      key: "title",
      header: (
        <SortLink
          label="Deal"
          field="title"
          currentSortBy={query.sortBy}
          currentSortOrder={query.sortOrder}
          searchParams={searchParams}
        />
      ),
      cell: (deal) => (
        <div>
          <Link href={`/deals/${deal.id}`} className="font-medium hover:underline">
            {deal.title}
          </Link>
          <div className="text-xs text-muted-foreground">{deal.contact_name}</div>
        </div>
      ),
    },
    {
      key: "company",
      header: "Company",
      cell: (deal) =>
        deal.company_id && deal.company_name ? (
          <Link href={`/companies/${deal.company_id}`} className="hover:underline">
            {deal.company_name}
          </Link>
        ) : (
          <span className="text-muted-foreground">Unassigned</span>
        ),
    },
    {
      key: "stage",
      header: (
        <SortLink
          label="Stage"
          field="stage"
          currentSortBy={query.sortBy}
          currentSortOrder={query.sortOrder}
          searchParams={searchParams}
        />
      ),
      cell: (deal) => <StageBadge stage={deal.stage} />,
    },
    {
      key: "value",
      header: (
        <SortLink
          label="Value"
          field="value"
          currentSortBy={query.sortBy}
          currentSortOrder={query.sortOrder}
          searchParams={searchParams}
        />
      ),
      className: "text-right",
      cell: (deal) => currency(deal.value),
    },
    {
      key: "owner",
      header: "Assigned To",
      cell: (deal) => deal.assignee_name ?? <span className="text-muted-foreground">Unassigned</span>,
    },
    {
      key: "close",
      header: (
        <SortLink
          label="Close Date"
          field="expected_close_date"
          currentSortBy={query.sortBy}
          currentSortOrder={query.sortOrder}
          searchParams={searchParams}
        />
      ),
      cell: (deal) =>
        deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : "-",
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      cell: (deal) => <DealRowActions deal={deal} user={user} />,
    },
  ];
}
