"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CalendarClock, ContactRound, Pencil, Repeat2, UserRound } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { LeadConvertDialog } from "@/components/features/leads/lead-convert-dialog";
import { LeadForm } from "@/components/features/leads/lead-form";
import { PageHeader } from "@/components/layout/page-header";
import { DetailCard } from "@/components/shared/detail-card";
import { DetailLayout } from "@/components/shared/detail-layout";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
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
import { LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS } from "@/lib/constants";
import { can } from "@/lib/permissions";
import { useCurrentUser } from "@/hooks/use-current-user";
import type { ApiSuccess } from "@/types/api";
import type { AppUser } from "@/types/enums";
import type { LeadDetail } from "@/services/lead.service";

async function fetchLead(id: string) {
  const response = await fetch(`/api/leads/${id}`);
  if (!response.ok) throw new Error("Unable to load lead.");
  const payload = (await response.json()) as ApiSuccess<LeadDetail>;
  return payload.data;
}

async function fetchUsers() {
  const response = await fetch("/api/auth/demo-accounts");
  if (!response.ok) throw new Error("Unable to load users.");
  const payload = (await response.json()) as ApiSuccess<AppUser[]>;
  return payload.data;
}

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const currentUser = useCurrentUser();
  const leadQuery = useQuery({
    queryKey: ["leads", params.id],
    queryFn: () => fetchLead(params.id),
  });
  const usersQuery = useQuery({
    queryKey: ["demo-accounts"],
    queryFn: fetchUsers,
  });
  const [editOpen, setEditOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [assignedToId, setAssignedToId] = useState<string>("");

  const assignMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/leads/${params.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assigned_to_id: assignedToId }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error?.message ?? "Unable to assign lead.");
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["leads"] }),
        queryClient.invalidateQueries({ queryKey: ["leads", params.id] }),
      ]);
      toast.success("Lead assigned.");
      setAssignOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });

  if (currentUser.isLoading || leadQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (leadQuery.isError || !leadQuery.data || !currentUser.data) {
    return (
      <EmptyState
        icon={ContactRound}
        title="Lead not found"
        description="The lead may have been archived or removed."
      />
    );
  }

  const lead = leadQuery.data;
  const user = currentUser.data;
  const displayName = `${lead.first_name} ${lead.last_name}`;
  const isConverted = lead.status === "CONVERTED" || Boolean(lead.converted_contact_id);
  const ownerId = lead.assigned_to_id ?? lead.created_by_id;
  const canUpdate = !isConverted && can(user, "update", "lead", { ownerId });
  const canAssign = !isConverted && can(user, "assign", "lead");
  const canConvert = !isConverted && can(user, "convert", "lead", { ownerId });

  return (
    <div className="space-y-6">
      <PageHeader
        title={displayName}
        description="Lead profile, status, ownership, and conversion context."
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/leads">
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
                  setAssignedToId(lead.assigned_to_id ?? "");
                  setAssignOpen(true);
                }}
              >
                <UserRound className="h-4 w-4" />
                Assign
              </Button>
            ) : null}
            {canConvert ? (
              <Button size="sm" onClick={() => setConvertOpen(true)}>
                <Repeat2 className="h-4 w-4" />
                Convert
              </Button>
            ) : null}
          </>
        }
      />
      <DetailLayout
        main={
          <>
            <DetailCard
              title="Lead details"
              fields={[
                { label: "Status", value: <StatusBadge value={LEAD_STATUS_LABELS[lead.status]} /> },
                { label: "Source", value: LEAD_SOURCE_LABELS[lead.source] },
                { label: "Email", value: lead.email },
                { label: "Phone", value: lead.phone },
                {
                  label: "Company",
                  value:
                    lead.company_id && lead.company_name ? (
                      <Link href={`/companies/${lead.company_id}`} className="hover:underline">
                        {lead.company_name}
                      </Link>
                    ) : null,
                },
                { label: "Assigned To", value: lead.assignee_name },
                { label: "Notes", value: lead.notes },
                { label: "Created", value: new Date(lead.created_at).toLocaleDateString() },
              ]}
            />
            {isConverted && lead.converted_contact ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Conversion</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  Converted to{" "}
                  <Link
                    href={`/contacts/${lead.converted_contact.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {lead.converted_contact.first_name} {lead.converted_contact.last_name}
                  </Link>
                  {lead.converted_at ? (
                    <span className="text-muted-foreground">
                      {" "}
                      on {new Date(lead.converted_at).toLocaleDateString()}
                    </span>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}
          </>
        }
        aside={
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <SummaryRow label="Status" value={LEAD_STATUS_LABELS[lead.status]} />
                <SummaryRow label="Owner" value={lead.assignee_name ?? "Unassigned"} />
                <SummaryRow label="Source" value={LEAD_SOURCE_LABELS[lead.source]} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Activity timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lead.recent_activities.length ? (
                  lead.recent_activities.map((activity) => (
                    <div key={activity.id} className="rounded-md border p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{activity.subject}</div>
                        <StatusBadge value={activity.type} />
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    icon={CalendarClock}
                    title="No activity"
                    description="Lead timeline entries will appear here in Phase 4."
                  />
                )}
              </CardContent>
            </Card>
          </>
        }
      />
      <LeadForm open={editOpen} onOpenChange={setEditOpen} lead={lead} />
      <LeadConvertDialog lead={lead} open={convertOpen} onOpenChange={setConvertOpen} />
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign lead</DialogTitle>
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
