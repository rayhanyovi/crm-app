"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { ContactForm } from "@/components/features/contacts/contact-form";
import { EntityDrawer } from "@/components/shared/entity-drawer";
import { Button } from "@/components/ui/button";
import { can } from "@/lib/permissions";
import type { CompanyListItem } from "@/types/crm";
import type { AppUser } from "@/types/enums";

export function ContactCreateAction({
  user,
  companies,
}: {
  user: AppUser;
  companies: CompanyListItem[];
}) {
  const [open, setOpen] = useState(false);

  if (!can(user, "create", "contact")) return null;

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Add Contact
      </Button>
      <EntityDrawer
        open={open}
        onOpenChange={setOpen}
        title="Add contact"
        description="Create a qualified person linked to a company."
      >
        <ContactForm companies={companies} onSaved={() => setOpen(false)} />
      </EntityDrawer>
    </>
  );
}
