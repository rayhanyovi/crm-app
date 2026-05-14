"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { convertLeadSchema } from "@/lib/validators/lead";
import type { ApiSuccess } from "@/types/api";
import type { LeadConversionResult, LeadDetail } from "@/services/lead.service";
import type { z } from "zod";

type LeadConvertFormInput = z.input<typeof convertLeadSchema>;
type LeadConvertFormOutput = z.output<typeof convertLeadSchema>;

export function LeadConvertDialog({
  lead,
  open,
  onOpenChange,
}: {
  lead: LeadDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<LeadConvertFormInput, unknown, LeadConvertFormOutput>({
    resolver: zodResolver(convertLeadSchema),
    defaultValues: {
      createDeal: false,
      dealTitle: `${lead.first_name} ${lead.last_name} opportunity`,
      dealValue: 0,
      dealCloseDate: "",
    },
  });
  const createDeal = useWatch({ control, name: "createDeal" });

  const mutation = useMutation({
    mutationFn: async (input: LeadConvertFormOutput) => {
      const response = await fetch(`/api/leads/${lead.id}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error?.message ?? "Unable to convert lead.");
      }

      return (await response.json()) as ApiSuccess<LeadConversionResult>;
    },
    onSuccess: async (payload) => {
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead converted.");
      onOpenChange(false);
      router.push(`/contacts/${payload.data.contact.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convert lead</DialogTitle>
          <DialogDescription>
            Will create contact: {lead.first_name} {lead.last_name}
            {lead.email ? ` (${lead.email})` : ""}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit((input) => mutation.mutate(input))}>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={createDeal}
              onCheckedChange={(checked) => setValue("createDeal", checked === true)}
            />
            Also create a deal
          </label>
          {createDeal ? (
            <div className="space-y-4 rounded-md border bg-muted/30 p-3">
              <Field label="Deal title" error={errors.dealTitle?.message}>
                <Input {...register("dealTitle")} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Deal value" error={errors.dealValue?.message}>
                  <Input type="number" min="0" step="100" {...register("dealValue")} />
                </Field>
                <Field label="Close date" error={errors.dealCloseDate?.message}>
                  <Input type="date" {...register("dealCloseDate")} />
                </Field>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Converting..." : "Convert lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
