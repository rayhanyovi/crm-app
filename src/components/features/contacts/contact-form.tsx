"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
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
import { contactCreateSchema, type ContactCreateInput } from "@/lib/validators/contact";
import type { CompanyListItem, ContactListItem } from "@/types/crm";
import { LEAD_SOURCE_LABELS } from "@/lib/constants";
import { LEAD_SOURCES } from "@/types/enums";

export function ContactForm({
  contact,
  companies,
  onSaved,
}: {
  contact?: ContactListItem;
  companies: CompanyListItem[];
  onSaved: () => void;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ContactCreateInput>({
    resolver: zodResolver(contactCreateSchema),
    defaultValues: {
      first_name: contact?.first_name ?? "",
      last_name: contact?.last_name ?? "",
      email: contact?.email ?? "",
      phone: contact?.phone ?? "",
      title: contact?.title ?? "",
      company_id: contact?.company_id ?? null,
      source: contact?.source ?? null,
    },
  });
  const selectedCompanyId = useWatch({ control, name: "company_id" });
  const selectedSource = useWatch({ control, name: "source" });

  async function onSubmit(input: ContactCreateInput) {
    const response = await fetch(contact ? `/api/contacts/${contact.id}` : "/api/contacts", {
      method: contact ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const payload = await response.json();
      toast.error(payload.error?.message ?? "Unable to save contact.");
      return;
    }

    toast.success(contact ? "Contact updated." : "Contact created.");
    router.refresh();
    onSaved();
  }

  return (
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
      <Field label="Title">
        <Input {...register("title")} />
      </Field>
      <Field label="Company">
        <Select
          value={selectedCompanyId ?? "none"}
          onValueChange={(value) =>
            setValue("company_id", value === "none" ? null : value, {
              shouldDirty: true,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select company" />
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
      <Field label="Source">
        <Select
          value={selectedSource ?? "none"}
          onValueChange={(value) =>
            setValue("source", value === "none" ? null : (value as ContactCreateInput["source"]), {
              shouldDirty: true,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No source</SelectItem>
            {LEAD_SOURCES.map((source) => (
              <SelectItem key={source} value={source}>
                {LEAD_SOURCE_LABELS[source]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onSaved}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save contact"}
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
