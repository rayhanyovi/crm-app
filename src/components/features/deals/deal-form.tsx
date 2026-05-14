"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEAL_STAGE_LABELS } from "@/lib/constants";
import {
  dealCreateSchema,
  type DealCreateFormInput,
  type DealCreateInput,
} from "@/lib/validators/deal";
import type { ApiSuccess } from "@/types/api";
import type { CompanyListItem, ContactListItem, DealListItem } from "@/types/crm";
import { DEAL_STAGES } from "@/types/enums";

type Props = {
  deal?: DealListItem;
  defaultContactId?: string;
  onSaved: () => void;
};

export function DealForm({ deal, defaultContactId, onSaved }: Props) {
  const router = useRouter();
  const [contacts, setContacts] = useState<ContactListItem[]>([]);
  const [companies, setCompanies] = useState<CompanyListItem[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    deal?.company_id ?? null,
  );
  const [selectedStage, setSelectedStage] = useState<DealCreateInput["stage"]>(
    deal?.stage ?? "LEAD",
  );
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DealCreateFormInput, unknown, DealCreateInput>({
    resolver: zodResolver(dealCreateSchema),
    defaultValues: {
      title: deal?.title ?? "",
      value: deal?.value ?? 0,
      stage: deal?.stage ?? "LEAD",
      contact_id: deal?.contact_id ?? defaultContactId ?? "",
      company_id: deal?.company_id ?? null,
      expected_close_date: deal?.expected_close_date ?? "",
    },
  });

  useEffect(() => {
    fetch("/api/contacts?pageSize=100")
      .then((r) => r.json())
      .then((payload: ApiSuccess<ContactListItem[]>) => {
        setContacts(payload.data ?? []);
      })
      .catch(() => {});

    fetch("/api/companies?pageSize=100&sortBy=name&sortOrder=asc")
      .then((r) => r.json())
      .then((payload: ApiSuccess<CompanyListItem[]>) => {
        setCompanies(payload.data ?? []);
      })
      .catch(() => {});
  }, []);

  function selectContact(contactId: string) {
    setValue("contact_id", contactId, { shouldDirty: true, shouldValidate: true });
    const contact = contacts.find((item) => item.id === contactId);
    if (contact?.company_id) {
      setSelectedCompanyId(contact.company_id);
      setValue("company_id", contact.company_id, { shouldDirty: true });
    }
  }

  async function onSubmit(input: DealCreateInput) {
    const url = deal ? `/api/deals/${deal.id}` : "/api/deals";
    const method = deal ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const payload = await response.json();
      toast.error(payload.error?.message ?? "Unable to save deal.");
      return;
    }

    toast.success(deal ? "Deal updated." : "Deal created.");
    router.refresh();
    onSaved();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <Field label="Title *" error={errors.title?.message}>
        <Input {...register("title")} placeholder="e.g. Acme CRM rollout" />
      </Field>

      <Field label="Contact *" error={errors.contact_id?.message}>
        <Select
          defaultValue={deal?.contact_id ?? defaultContactId ?? ""}
          onValueChange={selectContact}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a contact" />
          </SelectTrigger>
          <SelectContent>
            {contacts.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.first_name} {c.last_name}
                {c.company_name ? ` - ${c.company_name}` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Value ($)" error={errors.value?.message}>
          <Input type="number" min={0} step={100} {...register("value")} />
        </Field>

        <Field label="Company" error={errors.company_id?.message}>
          <Select
            value={selectedCompanyId ?? "none"}
            onValueChange={(v) => {
              const nextValue = v === "none" ? null : v;
              setSelectedCompanyId(nextValue);
              setValue("company_id", nextValue, { shouldDirty: true });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No company</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      {!deal ? (
        <Field label="Stage" error={errors.stage?.message}>
          <Select
            value={selectedStage}
            onValueChange={(v) => {
              const nextStage = v as DealCreateInput["stage"];
              setSelectedStage(nextStage);
              setValue("stage", nextStage, { shouldDirty: true });
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEAL_STAGES.map((s) => (
                <SelectItem key={s} value={s}>
                  {DEAL_STAGE_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      ) : null}

      <Field label="Expected close date" error={errors.expected_close_date?.message}>
        <Input type="date" {...register("expected_close_date")} />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onSaved}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : deal ? "Update deal" : "Create deal"}
        </Button>
      </div>
    </form>
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
