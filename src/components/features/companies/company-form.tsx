"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { companyCreateSchema, type CompanyCreateInput } from "@/lib/validators/company";
import type { ApiSuccess } from "@/types/api";
import type { CompanyListItem, DuplicateCompanyResult } from "@/types/crm";

export function CompanyForm({
  company,
  onSaved,
}: {
  company?: CompanyListItem;
  onSaved: () => void;
}) {
  const router = useRouter();
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompanyCreateInput>({
    resolver: zodResolver(companyCreateSchema),
    defaultValues: {
      name: company?.name ?? "",
      industry: company?.industry ?? "",
      website: company?.website ?? "",
      phone: company?.phone ?? "",
      email: company?.email ?? "",
      address: company?.address ?? "",
      notes: company?.notes ?? "",
    },
  });

  async function checkDuplicate(name: string) {
    if (!name || name === company?.name) {
      setDuplicateWarning(null);
      return;
    }

    const response = await fetch(`/api/companies/check-duplicate?name=${encodeURIComponent(name)}`);
    if (!response.ok) return;
    const payload = (await response.json()) as ApiSuccess<DuplicateCompanyResult>;

    if (payload.data.exactMatch && payload.data.exactMatch.id !== company?.id) {
      setDuplicateWarning("Exact company match exists. Saving will be blocked.");
      return;
    }

    if (payload.data.similarMatches.length) {
      setDuplicateWarning(
        `Similar: ${payload.data.similarMatches.map((match) => match.name).join(", ")}`,
      );
      return;
    }

    setDuplicateWarning(null);
  }

  async function onSubmit(input: CompanyCreateInput) {
    const response = await fetch(company ? `/api/companies/${company.id}` : "/api/companies", {
      method: company ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const payload = await response.json();
      toast.error(payload.error?.message ?? "Unable to save company.");
      return;
    }

    toast.success(company ? "Company updated." : "Company created.");
    router.refresh();
    onSaved();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <Field label="Name" error={errors.name?.message}>
        <Input
          {...register("name")}
          onBlur={(event) => checkDuplicate(event.target.value)}
        />
      </Field>
      {duplicateWarning ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {duplicateWarning}
        </div>
      ) : null}
      <Field label="Industry">
        <Input {...register("industry")} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Website">
          <Input {...register("website")} />
        </Field>
        <Field label="Phone">
          <Input {...register("phone")} />
        </Field>
      </div>
      <Field label="Email">
        <Input type="email" {...register("email")} />
      </Field>
      <Field label="Address">
        <Input {...register("address")} />
      </Field>
      <Field label="Notes">
        <Textarea rows={4} {...register("notes")} />
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onSaved}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save company"}
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
