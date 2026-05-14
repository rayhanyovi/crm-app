"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DEAL_STAGE_LABELS } from "@/lib/constants";
import type { DealStage } from "@/types/enums";

export function StageChangeDialog({
  open,
  onOpenChange,
  fromStage,
  toStage,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fromStage: DealStage;
  toStage: DealStage;
  onConfirm: (input: { note?: string | null; lost_reason?: string }) => void;
  isPending?: boolean;
}) {
  const [note, setNote] = useState("");
  const [lostReason, setLostReason] = useState("");
  const requiresLostReason = toStage === "CLOSED_LOST";
  const canSubmit = !requiresLostReason || lostReason.trim().length > 0;

  function submit() {
    if (!canSubmit) return;
    onConfirm({
      note: note.trim() || null,
      lost_reason: requiresLostReason ? lostReason.trim() : undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move deal stage</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Move from {DEAL_STAGE_LABELS[fromStage]} to {DEAL_STAGE_LABELS[toStage]}.
          </p>
          {requiresLostReason ? (
            <div className="space-y-2">
              <Label>Lost reason *</Label>
              <Textarea
                value={lostReason}
                onChange={(event) => setLostReason(event.target.value)}
                placeholder="Why was this deal lost?"
              />
            </div>
          ) : null}
          <div className="space-y-2">
            <Label>Note</Label>
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional context for the stage history"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSubmit || isPending}>
            {isPending ? "Moving..." : "Move"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
