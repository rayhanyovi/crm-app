"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { EntityDrawer } from "@/components/shared/entity-drawer";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  leadFormSchema,
  type LeadFormInput,
  type LeadFormOutput,
} from "@/lib/validators/lead";
import type { ApiSuccess } from "@/types/api";
import type { CompanyListItem } from "@/types/crm";
import { LEAD_SOURCES, LEAD_STATUSES, type LeadStatus } from "@/types/enums";
import type { LeadListItem } from "@/services/lead.service";

async function fetchCompanies() {
  const response = await fetch("/api/companies?pageSize=100&sortBy=name&sortOrder=asc");
  if (!response.ok) throw new Error("Unable to load companies.");
  const payload = (await response.json()) as ApiSuccess<CompanyListItem[]>;
  return payload.data;
}

export function LeadForm({
  open,
  onOpenChange,
  lead,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: LeadListItem;
}) {
  const queryClient = useQueryClient();
  const companiesQuery = useQuery({
    queryKey: ["companies", "lead-form"],
    queryFn: fetchCompanies,
    enabled: open,
  });
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormInput, unknown, LeadFormOutput>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      first_name: lead?.first_name ?? "",
      last_name: lead?.last_name ?? "",
      email: lead?.email ?? "",
      phone: lead?.phone ?? "",
      source: lead?.source ?? "WEBSITE",
      status: lead?.status,
      company_id: lead?.company_id ?? null,
      notes: lead?.notes ?? "",
    },
  });
  const selectedCompanyId = useWatch({ control, name: "company_id" });
  const selectedSource = useWatch({ control, name: "source" });
  const selectedStatus = useWatch({ control, name: "status" });
  const selectedCompany = companiesQuery.data?.find((company) => company.id === selectedCompanyId);

  const mutation = useMutation({
    mutationFn: async (input: LeadFormOutput) => {
      const response = await fetch(lead ? `/api/leads/${lead.id}` : "/api/leads", {
        method: lead ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error?.message ?? "Unable to save lead.");
      }

      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success(lead ? "Lead updated." : "Lead created.");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function onSubmit(input: LeadFormOutput) {
    mutation.mutate(input);
  }

  return (
    <EntityDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={lead ? "Edit lead" : "Add lead"}
      description="Capture prospect details and keep ownership clear."
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" error={errors.first_name?.message}>
            <Input {...register("first_name")} />
          </Field>
          <Field label="Last name" error={errors.last_name?.message}>
            <Input {...register("last_name")} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" error={errors.email?.message}>
            <Input type="email" {...register("email")} />
          </Field>
          <Field label="Phone" error={errors.phone?.message}>
            <Input {...register("phone")} />
          </Field>
        </div>
        <Field label="Company">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {selectedCompany?.name ?? "Select company"}
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search companies..." />
                <CommandList>
                  <CommandEmpty>No companies found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem value="none" onSelect={() => setValue("company_id", null)}>
                      <Check className={cn("h-4 w-4", !selectedCompanyId ? "opacity-100" : "opacity-0")} />
                      No company
                    </CommandItem>
                    {(companiesQuery.data ?? []).map((company) => (
                      <CommandItem
                        key={company.id}
                        value={company.name}
                        onSelect={() => setValue("company_id", company.id, { shouldDirty: true })}
                      >
                        <Check
                          className={cn(
                            "h-4 w-4",
                            selectedCompanyId === company.id ? "opacity-100" : "opacity-0",
                          )}
                        />
                        {company.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Source">
            <Select
              value={selectedSource}
              onValueChange={(value) =>
                setValue("source", value as LeadFormOutput["source"], { shouldDirty: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                {LEAD_SOURCES.map((source) => (
                  <SelectItem key={source} value={source}>
                    {LEAD_SOURCE_LABELS[source]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {lead ? (
            <Field label="Status">
              <Select
                value={selectedStatus}
                onValueChange={(value) =>
                  setValue("status", value as LeadStatus, { shouldDirty: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {LEAD_STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          ) : null}
        </div>
        <Field label="Notes">
          <Textarea rows={4} {...register("notes")} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save lead"}
          </Button>
        </div>
      </form>
    </EntityDrawer>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
