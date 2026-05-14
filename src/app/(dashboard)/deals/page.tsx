import { HandCoins, KanbanSquare } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { DealCreateAction } from "@/components/features/deals/deal-actions";
import { getDealColumns } from "@/components/features/deals/deal-columns";
import { DealFilters } from "@/components/features/deals/deal-filters";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterBar } from "@/components/shared/filter-bar";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { Button } from "@/components/ui/button";
import { toURLSearchParams } from "@/lib/search-params";
import { parseSearchParams } from "@/lib/validators/common";
import { dealListQuerySchema } from "@/lib/validators/deal";
import { DEMO_ACCOUNTS, getCurrentUser } from "@/services/auth.service";
import { listDeals } from "@/services/deal.service";

export default async function DealsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const urlSearchParams = toURLSearchParams(await searchParams);
  const query = parseSearchParams(dealListQuerySchema, urlSearchParams);
  const { rows, meta } = await listDeals(query);
  const columns = getDealColumns({ user, query, searchParams: urlSearchParams });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Deals"
        description="Track active opportunities from first qualification to close."
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/deals/pipeline">
                <KanbanSquare className="h-4 w-4" />
                Pipeline
              </Link>
            </Button>
            <DealCreateAction user={user} />
          </>
        }
      />
      <FilterBar
        searchPlaceholder="Search deals..."
        filters={<DealFilters users={DEMO_ACCOUNTS.filter((account) => account.role !== "VIEWER")} />}
      />
      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(deal) => deal.id}
        empty={
          <EmptyState
            icon={HandCoins}
            title="No deals found"
            description="Create a deal or adjust the current filters."
            action={<DealCreateAction user={user} />}
          />
        }
      />
      <PaginationControls meta={meta} searchParams={urlSearchParams} />
    </div>
  );
}
