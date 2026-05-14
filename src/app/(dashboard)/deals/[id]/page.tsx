"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarClock,
  ContactRound,
  Pencil,
  Repeat2,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { DealForm } from "@/components/features/deals/deal-form";
import { StageChangeDialog } from "@/components/features/deals/stage-change-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { DetailCard } from "@/components/shared/detail-card";
import { DetailLayout } from "@/components/shared/detail-layout";
import { EmptyState } from "@/components/shared/empty-state";
import { EntityDrawer } from "@/components/shared/entity-drawer";
import { StageBadge } from "@/components/shared/stage-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { DEAL_STAGE_LABELS } from "@/lib/constants";
import { can } from "@/lib/permissions";
import { useCurrentUser } from "@/hooks/use-current-user";
import type { ApiSuccess } from "@/types/api";
import type { DealDetail } from "@/types/crm";
import { DEAL_STAGES, type AppUser, type DealStage } from "@/types/enums";

async function fetchDeal(id: string) {
  const response = await fetch(`/api/deals/${id}`);
  if (!response.ok) throw new Error("Unable to load deal.");
  const payload = (await response.json()) as ApiSuccess<DealDetail>;
  return payload.data;
}

async function fetchUsers() {
  const response = await fetch("/api/auth/demo-accounts");
  if (!response.ok) throw new Error("Unable to load users.");
  const payload = (await response.json()) as ApiSuccess<AppUser[]>;
  return payload.data;
}

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DealDetailPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const currentUser = useCurrentUser();
  const dealQuery = useQuery({
    queryKey: ["deals", params.id],
    queryFn: () => fetchDeal(params.id),
  });
  const usersQuery = useQuery({
    queryKey: ["demo-accounts"],
    queryFn: fetchUsers,
  });
  const [editOpen, setEditOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignedToId, setAssignedToId] = useState("");
  const [targetStage, setTargetStage] = useState<DealStage>("LEAD");
  const [stageOpen, setStageOpen] = useState(false);
  const [stageConfirmOpen, setStageConfirmOpen] = useState(false);

  const assignMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/deals/${params.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assigned_to_id: assignedToId }),
      });
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error?.message ?? "Unable to assign deal.");
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["deals"] }),
        queryClient.invalidateQueries({ queryKey: ["deals", params.id] }),
      ]);
      toast.success("Deal assigned.");
      setAssignOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const stageMutation = useMutation({
    mutationFn: async (input: { note?: string | null; lost_reason?: string }) => {
      const response = await fetch(`/api/deals/${params.id}/stage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: targetStage, ...input }),
      });
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error?.message ?? "Unable to move deal.");
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["deals"] }),
        queryClient.invalidateQueries({ queryKey: ["deals", params.id] }),
      ]);
      toast.success("Deal stage updated.");
      setStageOpen(false);
      setStageConfirmOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });

  if (currentUser.isLoading || dealQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (dealQuery.isError || !dealQuery.data || !currentUser.data) {
    return (
      <EmptyState
        icon={ContactRound}
        title="Deal not found"
        description="The deal may have been archived or removed."
      />
    );
  }

  const deal = dealQuery.data;
  const user = currentUser.data;
  const ownerId = deal.assigned_to_id ?? deal.created_by_id;
  const canUpdate = can(user, "update", "deal", { ownerId });
  const canAssign = can(user, "assign", "deal");
  const canMoveStage = can(user, "change_stage", "deal", { ownerId });

  return (
    <div className="space-y-6">
      <PageHeader
        title={deal.title}
        description="Deal profile, ownership, stage history, and activity context."
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/deals">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            {canUpdate ? (
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            ) : null}
            {canAssign ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAssignedToId(deal.assigned_to_id ?? "");
                  setAssignOpen(true);
                }}
              >
                <UserRound className="h-4 w-4" />
                Assign
              </Button>
            ) : null}
            {canMoveStage ? (
              <Button
                size="sm"
                onClick={() => {
                  setTargetStage(deal.stage);
                  setStageOpen(true);
                }}
              >
                <Repeat2 className="h-4 w-4" />
                Change Stage
              </Button>
            ) : null}
          </>
        }
      />

      <DetailLayout
        main={
          <>
            <DetailCard
              title="Deal details"
              fields={[
                { label: "Stage", value: <StageBadge stage={deal.stage} /> },
                { label: "Value", value: currency(deal.value) },
                {
                  label: "Contact",
                  value: deal.contact ? (
                    <Link href={`/contacts/${deal.contact.id}`} className="hover:underline">
                      {deal.contact.first_name} {deal.contact.last_name}
                    </Link>
                  ) : null,
                },
                {
                  label: "Company",
                  value: deal.company ? (
                    <Link href={`/companies/${deal.company.id}`} className="hover:underline">
                      {deal.company.name}
                    </Link>
                  ) : null,
                },
                { label: "Assigned To", value: deal.assignee_name },
                {
                  label: "Expected Close",
                  value: deal.expected_close_date
                    ? new Date(deal.expected_close_date).toLocaleDateString()
                    : null,
                },
                { label: "Lost Reason", value: deal.lost_reason },
                {
                  label: "Closed",
                  value: deal.closed_at ? new Date(deal.closed_at).toLocaleDateString() : null,
                },
              ]}
            />
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Stage history</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {deal.stage_history.length ? (
                  deal.stage_history.map((entry) => (
                    <div key={entry.id} className="border-l-2 pl-4">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        {entry.from_stage ? <StageBadge stage={entry.from_stage} /> : null}
                        <span className="text-muted-foreground">to</span>
                        <StageBadge stage={entry.to_stage} />
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {new Date(entry.created_at).toLocaleString()}
                        {entry.changed_by
                          ? ` by ${entry.changed_by.first_name} ${entry.changed_by.last_name}`
                          : ""}
                      </div>
                      {entry.note ? <p className="mt-2 text-sm">{entry.note}</p> : null}
                    </div>
                  ))
                ) : (
                  <EmptyState
                    icon={Repeat2}
                    title="No stage history"
                    description="Stage changes will appear here."
                  />
                )}
              </CardContent>
            </Card>
          </>
        }
        aside={
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <SummaryRow label="Stage" value={DEAL_STAGE_LABELS[deal.stage]} />
                <SummaryRow label="Value" value={currency(deal.value)} />
                <SummaryRow label="Owner" value={deal.assignee_name ?? "Unassigned"} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Activity timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {deal.recent_activities.length ? (
                  deal.recent_activities.map((activity) => (
                    <div key={activity.id} className="rounded-md border p-3">
                      <div className="font-medium">{activity.subject}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    icon={CalendarClock}
                    title="No activity"
                    description="Deal timeline entries will appear here in Phase 4."
                  />
                )}
              </CardContent>
            </Card>
          </>
        }
      />

      <EntityDrawer open={editOpen} onOpenChange={setEditOpen} title="Edit deal">
        <DealForm deal={deal} onSaved={() => setEditOpen(false)} />
      </EntityDrawer>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign deal</DialogTitle>
          </DialogHeader>
          <Select value={assignedToId} onValueChange={setAssignedToId}>
            <SelectTrigger>
              <SelectValue placeholder="Select owner" />
            </SelectTrigger>
            <SelectContent>
              {(usersQuery.data ?? [])
                .filter((account) => account.role !== "VIEWER")
                .map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.first_name} {account.last_name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => assignMutation.mutate()}
              disabled={!assignedToId || assignMutation.isPending}
            >
              {assignMutation.isPending ? "Assigning..." : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={stageOpen} onOpenChange={setStageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change stage</DialogTitle>
          </DialogHeader>
          <Select value={targetStage} onValueChange={(value) => setTargetStage(value as DealStage)}>
            <SelectTrigger>
              <SelectValue placeholder="Select stage" />
            </SelectTrigger>
            <SelectContent>
              {DEAL_STAGES.map((stage) => (
                <SelectItem key={stage} value={stage}>
                  {DEAL_STAGE_LABELS[stage]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStageOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={targetStage === deal.stage}
              onClick={() => {
                setStageOpen(false);
                setStageConfirmOpen(true);
              }}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <StageChangeDialog
        open={stageConfirmOpen}
        onOpenChange={setStageConfirmOpen}
        fromStage={deal.stage}
        toStage={targetStage}
        isPending={stageMutation.isPending}
        onConfirm={(input) => stageMutation.mutate(input)}
      />
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground">{label}</span>
        <span className="truncate font-medium text-foreground">{value}</span>
      </div>
      <Separator className="mt-3" />
    </div>
  );
}
