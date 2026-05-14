import { ContactRound } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ContactCreateAction } from "@/components/features/contacts/contact-actions";
import { CompanyFilter } from "@/components/features/contacts/company-filter";
import { ContactRowActions } from "@/components/features/contacts/contact-row-actions";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterBar } from "@/components/shared/filter-bar";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { SortLink } from "@/components/shared/sort-link";
import { StatusBadge } from "@/components/shared/status-badge";
import { parseSearchParams } from "@/lib/validators/common";
import { companyListQuerySchema } from "@/lib/validators/company";
import { contactListQuerySchema } from "@/lib/validators/contact";
import { toURLSearchParams } from "@/lib/search-params";
import { listCompanies } from "@/services/company.service";
import { listContacts } from "@/services/contact.service";
import { getCurrentUser } from "@/services/auth.service";
import type { ContactListItem } from "@/types/crm";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const urlSearchParams = toURLSearchParams(await searchParams);
  const query = parseSearchParams(contactListQuerySchema, urlSearchParams);
  const [{ rows, meta }, companiesResult] = await Promise.all([
    listContacts(query),
    listCompanies(parseSearchParams(companyListQuerySchema, new URLSearchParams("pageSize=100&sortBy=name&sortOrder=asc"))),
  ]);
  const companies = companiesResult.rows;

  const columns: DataTableColumn<ContactListItem>[] = [
    {
      key: "name",
      header: (
        <SortLink
          label="Contact"
          field="first_name"
          currentSortBy={query.sortBy}
          currentSortOrder={query.sortOrder}
          searchParams={urlSearchParams}
        />
      ),
      cell: (contact) => (
        <div>
          <Link href={`/contacts/${contact.id}`} className="font-medium hover:underline">
            {contact.first_name} {contact.last_name}
          </Link>
          <div className="text-xs text-muted-foreground">{contact.email ?? contact.phone}</div>
        </div>
      ),
    },
    {
      key: "company",
      header: (
        <SortLink
          label="Company"
          field="company_name"
          currentSortBy={query.sortBy}
          currentSortOrder={query.sortOrder}
          searchParams={urlSearchParams}
        />
      ),
      cell: (contact) =>
        contact.company_id && contact.company_name ? (
          <Link href={`/companies/${contact.company_id}`} className="hover:underline">
            {contact.company_name}
          </Link>
        ) : (
          <span className="text-muted-foreground">Unassigned</span>
        ),
    },
    {
      key: "source",
      header: (
        <SortLink
          label="Source"
          field="source"
          currentSortBy={query.sortBy}
          currentSortOrder={query.sortOrder}
          searchParams={urlSearchParams}
        />
      ),
      cell: (contact) => <StatusBadge value={contact.source} />,
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
      cell: (contact) => contact.deal_count,
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      cell: (contact) => (
        <ContactRowActions contact={contact} companies={companies} user={user} />
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Contacts"
        description="Qualified people attached to companies and deals."
        actions={<ContactCreateAction user={user} companies={companies} />}
      />
      <FilterBar
        searchPlaceholder="Search contacts..."
        filters={<CompanyFilter companies={companies} />}
      />
      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(contact) => contact.id}
        empty={
          <EmptyState
            icon={ContactRound}
            title="No contacts found"
            description="Create contacts with at least an email or phone number."
            action={<ContactCreateAction user={user} companies={companies} />}
          />
        }
      />
      <PaginationControls meta={meta} searchParams={urlSearchParams} />
    </div>
  );
}
