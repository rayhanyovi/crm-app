import { z } from "zod";

import { paginationSchema } from "@/lib/validators/common";
import { LEAD_SOURCES } from "@/types/enums";

const nullableText = z
  .string()
  .trim()
  .transform((value) => (value.length ? value : null))
  .nullable()
  .optional();

export const contactListQuerySchema = paginationSchema.extend({
  search: z.string().trim().optional(),
  company_id: z.string().uuid().optional(),
  has_deals: z.coerce.boolean().optional(),
});

const contactBaseSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required.").max(120),
  last_name: z.string().trim().min(1, "Last name is required.").max(120),
  email: nullableText,
  phone: nullableText,
  title: nullableText,
  company_id: z.string().uuid().nullable().optional(),
  source: z.enum(LEAD_SOURCES).nullable().optional(),
});

export const contactCreateSchema = contactBaseSchema.refine(
  (value) => Boolean(value.email || value.phone),
  {
    message: "Email or phone is required.",
    path: ["email"],
  },
);

export const contactUpdateSchema = contactBaseSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "At least one field is required.",
);

export type ContactListQuery = z.infer<typeof contactListQuerySchema>;
export type ContactCreateInput = z.infer<typeof contactCreateSchema>;
export type ContactUpdateInput = z.infer<typeof contactUpdateSchema>;
