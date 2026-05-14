"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ContactForm } from "@/components/features/contacts/contact-form";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EntityDrawer } from "@/components/shared/entity-drawer";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { can } from "@/lib/permissions";
import type { CompanyListItem, ContactListItem } from "@/types/crm";
import type { AppUser } from "@/types/enums";

export function ContactRowActions({
  contact,
  companies,
  user,
}: {
  contact: ContactListItem;
  companies: CompanyListItem[];
  user: AppUser;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const canUpdate = can(user, "update", "contact", { ownerId: contact.created_by_id });

  async function archiveContact() {
    const response = await fetch(`/api/contacts/${contact.id}`, { method: "DELETE" });
    if (!response.ok) {
      const payload = await response.json();
      toast.error(payload.error?.message ?? "Unable to archive contact.");
      return;
    }

    toast.success("Contact archived.");
    setArchiveOpen(false);
    router.refresh();
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Actions for ${contact.first_name} ${contact.last_name}`}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canUpdate ? (
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" />
              Edit
            </DropdownMenuItem>
          ) : null}
          {can(user, "archive", "contact") ? (
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setArchiveOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Archive
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      <EntityDrawer
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Edit contact"
        description="Update contact details and company relationship."
      >
        <ContactForm
          contact={contact}
          companies={companies}
          onSaved={() => setEditOpen(false)}
        />
      </EntityDrawer>
      <ConfirmDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        title="Archive contact?"
        description="This hides the contact from active lists while keeping historical CRM records."
        actionLabel="Archive"
        onConfirm={archiveContact}
      />
    </>
  );
}
