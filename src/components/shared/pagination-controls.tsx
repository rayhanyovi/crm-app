import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "@/types/crm";

function pageHref(searchParams: URLSearchParams, page: number) {
  const params = new URLSearchParams(searchParams.toString());
  params.set("page", String(page));
  return `?${params.toString()}`;
}

export function PaginationControls({
  meta,
  searchParams,
}: {
  meta: PaginationMeta;
  searchParams: URLSearchParams;
}) {
  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>
        {meta.total === 0
          ? "0 results"
          : `${(meta.page - 1) * meta.pageSize + 1}-${Math.min(
              meta.page * meta.pageSize,
              meta.total,
            )} of ${meta.total}`}
      </span>
      <div className="flex gap-2">
        {meta.page > 1 ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={pageHref(searchParams, meta.page - 1)}>Previous</Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
        )}
        {meta.hasMore ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={pageHref(searchParams, meta.page + 1)}>Next</Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
