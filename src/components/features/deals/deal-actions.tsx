"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { DealForm } from "@/components/features/deals/deal-form";
import { EntityDrawer } from "@/components/shared/entity-drawer";
import { Button } from "@/components/ui/button";
import { can } from "@/lib/permissions";
import type { AppUser } from "@/types/enums";

export function DealCreateAction({
  user,
  defaultContactId,
}: {
  user: AppUser;
  defaultContactId?: string;
}) {
  const [open, setOpen] = useState(false);

  if (!can(user, "create", "deal")) return null;

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Add Deal
      </Button>
      <EntityDrawer
        open={open}
        onOpenChange={setOpen}
        title="Create deal"
        description="Add a new deal to the pipeline."
      >
        <DealForm
          defaultContactId={defaultContactId}
          onSaved={() => setOpen(false)}
        />
      </EntityDrawer>
    </>
  );
}
