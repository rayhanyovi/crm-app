"use client";

import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { StageChangeDialog } from "@/components/features/deals/stage-change-dialog";
import { StageBadge } from "@/components/shared/stage-badge";
import { Card, CardContent } from "@/components/ui/card";
import { DEAL_STAGE_LABELS } from "@/lib/constants";
import { can } from "@/lib/permissions";
import type { ApiSuccess } from "@/types/api";
import type { DealListItem, PipelineStageData } from "@/types/crm";
import type { AppUser, DealStage } from "@/types/enums";

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

async function fetchPipeline(assignedToId?: string) {
  const params = new URLSearchParams();
  if (assignedToId) params.set("assigned_to_id", assignedToId);
  const response = await fetch(`/api/deals/pipeline?${params.toString()}`);
  if (!response.ok) throw new Error("Unable to load pipeline.");
  const payload = (await response.json()) as ApiSuccess<{ stages: PipelineStageData[] }>;
  return payload.data.stages;
}

export function PipelineBoard({
  initialStages,
  user,
  assignedToId,
}: {
  initialStages: PipelineStageData[];
  user: AppUser;
  assignedToId?: string;
}) {
  const queryClient = useQueryClient();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const [pendingMove, setPendingMove] = useState<{
    deal: DealListItem;
    toStage: DealStage;
  } | null>(null);

  const pipelineQuery = useQuery({
    queryKey: ["deals", "pipeline", assignedToId ?? "all"],
    queryFn: () => fetchPipeline(assignedToId),
    initialData: initialStages,
  });

  const stageMutation = useMutation({
    mutationFn: async ({
      deal,
      toStage,
      note,
      lost_reason,
    }: {
      deal: DealListItem;
      toStage: DealStage;
      note?: string | null;
      lost_reason?: string;
    }) => {
      const response = await fetch(`/api/deals/${deal.id}/stage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: toStage, note, lost_reason }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error?.message ?? "Unable to move deal.");
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["deals"] });
      toast.success("Deal stage updated.");
      setPendingMove(null);
    },
    onError: (error) => toast.error(error.message),
  });

  function moveDeal(deal: DealListItem, toStage: DealStage, input?: { note?: string | null; lost_reason?: string }) {
    stageMutation.mutate({ deal, toStage, ...input });
  }

  function onDragEnd(event: DragEndEvent) {
    const dealId = String(event.active.id);
    const toStage = event.over?.id as DealStage | undefined;
    if (!toStage) return;

    const deal = pipelineQuery.data
      .flatMap((stage) => stage.deals)
      .find((item) => item.id === dealId);
    if (!deal || deal.stage === toStage) return;

    if (toStage === "CLOSED_LOST") {
      setPendingMove({ deal, toStage });
      return;
    }

    moveDeal(deal, toStage);
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragEnd={onDragEnd}>
        <div className="grid gap-3 overflow-x-auto pb-2 lg:grid-cols-6">
          {pipelineQuery.data.map((stage) => (
            <PipelineColumn key={stage.stage} stage={stage} user={user} />
          ))}
        </div>
      </DndContext>
      {pendingMove ? (
        <StageChangeDialog
          open={Boolean(pendingMove)}
          onOpenChange={(open) => {
            if (!open) setPendingMove(null);
          }}
          fromStage={pendingMove.deal.stage}
          toStage={pendingMove.toStage}
          isPending={stageMutation.isPending}
          onConfirm={(input) => moveDeal(pendingMove.deal, pendingMove.toStage, input)}
        />
      ) : null}
    </>
  );
}

function PipelineColumn({
  stage,
  user,
}: {
  stage: PipelineStageData;
  user: AppUser;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.stage });

  return (
    <section
      ref={setNodeRef}
      className="min-h-80 min-w-64 rounded-lg border bg-card"
      data-over={isOver ? "true" : "false"}
    >
      <div className="border-b p-3">
        <div className="flex items-center justify-between gap-2">
          <StageBadge stage={stage.stage} />
          <span className="text-xs text-muted-foreground">{stage.count}</span>
        </div>
        <div className="mt-2 text-sm font-medium">{currency(stage.totalValue)}</div>
      </div>
      <div className="space-y-2 p-2">
        {stage.deals.map((deal) => {
          const ownerId = deal.assigned_to_id ?? deal.created_by_id;
          const canMove =
            can(user, "change_stage", "deal", { ownerId }) &&
            (!["CLOSED_WON", "CLOSED_LOST"].includes(deal.stage) || can(user, "reopen", "deal"));
          return <DealCard key={deal.id} deal={deal} canMove={canMove} />;
        })}
        {!stage.deals.length ? (
          <div className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
            No {DEAL_STAGE_LABELS[stage.stage].toLowerCase()} deals
          </div>
        ) : null}
      </div>
    </section>
  );
}

function DealCard({ deal, canMove }: { deal: DealListItem; canMove: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: deal.id,
    disabled: !canMove,
  });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.7 : undefined,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="rounded-md shadow-none"
      {...attributes}
      {...listeners}
    >
      <CardContent className="space-y-2 p-3">
        <Link href={`/deals/${deal.id}`} className="block font-medium hover:underline">
          {deal.title}
        </Link>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span>{currency(deal.value)}</span>
          <span className="truncate text-muted-foreground">{deal.assignee_name ?? "Unassigned"}</span>
        </div>
        <div className="truncate text-xs text-muted-foreground">{deal.contact_name}</div>
      </CardContent>
    </Card>
  );
}
