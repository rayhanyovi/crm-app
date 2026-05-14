"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { DealForm } from "@/components/features/deals/deal-form";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EntityDrawer } from "@/components/shared/entity-drawer";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { can } from "@/lib/permissions";
import type { DealListItem } from "@/types/crm";
import type { AppUser } from "@/types/enums";

export function DealRowActions({
  deal,
  user,
}: {
  deal: DealListItem;
  user: AppUser;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const canEdit = can(user, "update", "deal", { ownerId: deal.created_by_id });
  const canArchive = can(user, "archive", "deal");

  if (!canEdit && !canArchive) return null;

  async function handleArchive() {
    const response = await fetch(`/api/deals/${deal.id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Failed to archive deal.");
      return;
    }
    toast.success("Deal archived.");
    router.refresh();
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canEdit ? (
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Edit
            </DropdownMenuItem>
          ) : null}
          {canEdit && canArchive ? <DropdownMenuSeparator /> : null}
          {canArchive ? (
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Archive
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <EntityDrawer
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Edit deal"
      >
        <DealForm deal={deal} onSaved={() => setEditOpen(false)} />
      </EntityDrawer>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Archive deal"
        description={`Archive "${deal.title}"? It will be removed from the pipeline.`}
        actionLabel="Archive"
        onConfirm={handleArchive}
      />
    </>
  );
}
