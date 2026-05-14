import { z } from "zod";

import { paginationSchema } from "@/lib/validators/common";
import { LEAD_SOURCES, LEAD_STATUSES, type LeadStatus, type UserRole } from "@/types/enums";

const nullableText = z
  .string()
  .trim()
  .transform((value) => (value.length ? value : null))
  .nullable()
  .optional();

export const leadStatusFlow: LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "LOST",
  "CONVERTED",
];

export const leadListQuerySchema = paginationSchema.extend({
  search: z.string().trim().optional(),
  status: z.enum(LEAD_STATUSES).optional(),
  source: z.enum(LEAD_SOURCES).optional(),
  assigned_to_id: z.string().uuid().optional(),
  company_id: z.string().uuid().optional(),
});

const leadBaseSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required.").max(100),
  last_name: z.string().trim().min(1, "Last name is required.").max(100),
  email: nullableText,
  phone: nullableText,
  source: z.enum(LEAD_SOURCES),
  status: z.enum(LEAD_STATUSES).optional(),
  company_id: z.string().uuid().nullable().optional(),
  assigned_to_id: z.string().uuid().nullable().optional(),
  notes: nullableText,
});

export const createLeadSchema = leadBaseSchema
  .omit({ status: true, assigned_to_id: true })
  .refine((value) => Boolean(value.email || value.phone), {
    message: "Email or phone is required.",
    path: ["email"],
  });

export const leadFormSchema = leadBaseSchema.omit({ assigned_to_id: true }).refine(
  (value) => Boolean(value.email || value.phone),
  {
    message: "Email or phone is required.",
    path: ["email"],
  },
);

export const updateLeadSchema = leadBaseSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "At least one field is required.",
);

export const assignLeadSchema = z.object({
  assigned_to_id: z.string().uuid("Assigned user is required."),
});

export const convertLeadSchema = z
  .object({
    createDeal: z.boolean().optional().default(false),
    dealTitle: z.string().trim().max(200).optional(),
    dealValue: z.coerce.number().min(0).optional().default(0),
    dealCloseDate: z.string().trim().nullable().optional(),
  })
  .refine((value) => !value.createDeal || Boolean(value.dealTitle?.trim()), {
    message: "Deal title is required when creating a deal.",
    path: ["dealTitle"],
  });

export function canMoveLeadStatus({
  from,
  to,
  role,
}: {
  from: LeadStatus;
  to: LeadStatus;
  role: UserRole;
}) {
  if (from === to) return true;
  if (role === "ADMIN" || role === "MANAGER") return true;
  if (from === "CONVERTED") return false;

  return leadStatusFlow.indexOf(to) > leadStatusFlow.indexOf(from);
}

export type LeadListQuery = z.infer<typeof leadListQuerySchema>;
export type LeadCreateInput = z.infer<typeof createLeadSchema>;
export type LeadFormInput = z.input<typeof leadFormSchema>;
export type LeadFormOutput = z.output<typeof leadFormSchema>;
export type LeadUpdateInput = z.infer<typeof updateLeadSchema>;
export type LeadAssignInput = z.infer<typeof assignLeadSchema>;
export type LeadConvertInput = z.infer<typeof convertLeadSchema>;
