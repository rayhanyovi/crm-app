import { List } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { DealCreateAction } from "@/components/features/deals/deal-actions";
import { DealFilters } from "@/components/features/deals/deal-filters";
import { PipelineBoard } from "@/components/features/deals/pipeline-board";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { DEMO_ACCOUNTS, getCurrentUser } from "@/services/auth.service";
import { getPipeline } from "@/services/deal.service";

export default async function DealPipelinePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const assignedToId =
    typeof params.assigned_to_id === "string" ? params.assigned_to_id : undefined;
  const stages = await getPipeline({ assigned_to_id: assignedToId });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Pipeline"
        description="Move deals through stages and review pipeline value by stage."
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/deals">
                <List className="h-4 w-4" />
                Table
              </Link>
            </Button>
            <DealCreateAction user={user} />
          </>
        }
      />
      <div className="flex justify-end">
        <DealFilters
          showStage={false}
          users={DEMO_ACCOUNTS.filter((account) => account.role !== "VIEWER")}
        />
      </div>
      <PipelineBoard initialStages={stages} user={user} assignedToId={assignedToId} />
    </div>
  );
}
