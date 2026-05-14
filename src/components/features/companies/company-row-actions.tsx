"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { CompanyForm } from "@/components/features/companies/company-form";
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
import type { CompanyListItem } from "@/types/crm";
import type { AppUser } from "@/types/enums";

export function CompanyRowActions({
  company,
  user,
}: {
  company: CompanyListItem;
  user: AppUser;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  async function archiveCompany() {
    const response = await fetch(`/api/companies/${company.id}`, { method: "DELETE" });
    if (!response.ok) {
      const payload = await response.json();
      toast.error(payload.error?.message ?? "Unable to archive company.");
      return;
    }

    toast.success("Company archived.");
    setArchiveOpen(false);
    router.refresh();
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Actions for ${company.name}`}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {can(user, "update", "company") ? (
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" />
              Edit
            </DropdownMenuItem>
          ) : null}
          {can(user, "archive", "company") ? (
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
        title="Edit company"
        description="Update account details and notes."
      >
        <CompanyForm company={company} onSaved={() => setEditOpen(false)} />
      </EntityDrawer>
      <ConfirmDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        title="Archive company?"
        description="Companies with active contacts or deals cannot be archived."
        actionLabel="Archive"
        onConfirm={archiveCompany}
      />
    </>
  );
}
