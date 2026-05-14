import { z } from "zod";

import { paginationSchema } from "@/lib/validators/common";
import { DEAL_STAGES } from "@/types/enums";

const nullableText = z
  .string()
  .trim()
  .transform((val) => (val.length ? val : null))
  .nullable()
  .optional();

export const dealListQuerySchema = paginationSchema.extend({
  search: z.string().trim().optional(),
  stage: z.enum(DEAL_STAGES).optional(),
  assigned_to_id: z.string().uuid().optional(),
  company_id: z.string().uuid().optional(),
  value_min: z.coerce.number().optional(),
  value_max: z.coerce.number().optional(),
});

export const dealCreateSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(200),
  value: z.coerce.number().min(0, "Value must be 0 or more.").default(0),
  stage: z.enum(DEAL_STAGES).default("LEAD"),
  contact_id: z.string().uuid("A contact is required."),
  company_id: z.string().uuid().optional().nullable(),
  lead_id: z.string().uuid().optional().nullable(),
  expected_close_date: z.string().optional().nullable(),
  lost_reason: nullableText,
});

export const dealUpdateSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required.").max(200).optional(),
    value: z.coerce.number().min(0, "Value must be 0 or more.").optional(),
    contact_id: z.string().uuid("A contact is required.").optional(),
    company_id: z.string().uuid().optional().nullable(),
    expected_close_date: z.string().optional().nullable(),
  })
  .refine((val) => Object.keys(val).length > 0, "At least one field is required.");

export const dealStageSchema = z
  .object({
    stage: z.enum(DEAL_STAGES),
    note: nullableText,
    lost_reason: z.string().trim().min(1).optional(),
  })
  .refine(
    (data) =>
      data.stage !== "CLOSED_LOST" ||
      (data.lost_reason && data.lost_reason.length > 0),
    {
      message: "Lost reason is required when closing as lost.",
      path: ["lost_reason"],
    },
  );

export const dealAssignSchema = z.object({
  assigned_to_id: z.string().uuid("An assignee is required."),
});

export const dealPipelineQuerySchema = z.object({
  assigned_to_id: z.string().uuid().optional(),
});

export type DealListQuery = z.output<typeof dealListQuerySchema>;
export type DealCreateFormInput = z.input<typeof dealCreateSchema>;
export type DealCreateInput = z.output<typeof dealCreateSchema>;
export type DealUpdateInput = z.output<typeof dealUpdateSchema>;
export type DealStageInput = z.output<typeof dealStageSchema>;
export type DealStageFormInput = z.input<typeof dealStageSchema>;
export type DealAssignInput = z.output<typeof dealAssignSchema>;
export type DealPipelineQuery = z.output<typeof dealPipelineQuerySchema>;
