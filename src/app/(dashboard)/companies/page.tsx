import { Building2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CompanyCreateAction } from "@/components/features/companies/company-actions";
import { CompanyRowActions } from "@/components/features/companies/company-row-actions";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterBar } from "@/components/shared/filter-bar";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { SortLink } from "@/components/shared/sort-link";
import { StatusBadge } from "@/components/shared/status-badge";
import { parseSearchParams } from "@/lib/validators/common";
import { companyListQuerySchema } from "@/lib/validators/company";
import { toURLSearchParams } from "@/lib/search-params";
import { listCompanies } from "@/services/company.service";
import { getCurrentUser } from "@/services/auth.service";
import type { CompanyListItem } from "@/types/crm";

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const urlSearchParams = toURLSearchParams(await searchParams);
  const query = parseSearchParams(companyListQuerySchema, urlSearchParams);
  const { rows, meta } = await listCompanies(query);

  const columns: DataTableColumn<CompanyListItem>[] = [
    {
      key: "name",
      header: (
        <SortLink
          label="Company"
          field="name"
          currentSortBy={query.sortBy}
          currentSortOrder={query.sortOrder}
          searchParams={urlSearchParams}
        />
      ),
      cell: (company) => (
        <div>
          <Link href={`/companies/${company.id}`} className="font-medium hover:underline">
            {company.name}
          </Link>
          <div className="text-xs text-muted-foreground">{company.website ?? company.email}</div>
        </div>
      ),
    },
    {
      key: "industry",
      header: (
        <SortLink
          label="Industry"
          field="industry"
          currentSortBy={query.sortBy}
          currentSortOrder={query.sortOrder}
          searchParams={urlSearchParams}
        />
      ),
      cell: (company) => <StatusBadge value={company.industry} />,
    },
    {
      key: "contacts",
      header: (
        <SortLink
          label="Contacts"
          field="contact_count"
          currentSortBy={query.sortBy}
          currentSortOrder={query.sortOrder}
          searchParams={urlSearchParams}
        />
      ),
      className: "text-right",
      cell: (company) => company.contact_count,
    },
    {
      key: "deals",
      header: (
        <SortLink
          label="Deals"
          field="deal_count"
          currentSortBy={query.sortBy}
          currentSortOrder={query.sortOrder}
          searchParams={urlSearchParams}
        />
      ),
      className: "text-right",
      cell: (company) => company.deal_count,
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      cell: (company) => <CompanyRowActions company={company} user={user} />,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Companies"
        description="Accounts that group contacts, leads, and pipeline records."
        actions={<CompanyCreateAction user={user} />}
      />
      <FilterBar searchPlaceholder="Search companies..." />
      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(company) => company.id}
        empty={
          <EmptyState
            icon={Building2}
            title="No companies found"
            description="Create a company to anchor contacts, leads, and deals."
            action={<CompanyCreateAction user={user} />}
          />
        }
      />
      <PaginationControls meta={meta} searchParams={urlSearchParams} />
    </div>
  );
}
