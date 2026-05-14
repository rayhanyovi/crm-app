"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { CompanyForm } from "@/components/features/companies/company-form";
import { EntityDrawer } from "@/components/shared/entity-drawer";
import { Button } from "@/components/ui/button";
import { can } from "@/lib/permissions";
import type { AppUser } from "@/types/enums";

export function CompanyCreateAction({ user }: { user: AppUser }) {
  const [open, setOpen] = useState(false);

  if (!can(user, "create", "company")) return null;

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Add Company
      </Button>
      <EntityDrawer
        open={open}
        onOpenChange={setOpen}
        title="Add company"
        description="Create an account record for contacts, leads, and deals."
      >
        <CompanyForm onSaved={() => setOpen(false)} />
      </EntityDrawer>
    </>
  );
}
