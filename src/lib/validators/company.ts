import { z } from "zod";

import { paginationSchema } from "@/lib/validators/common";

const nullableText = z
  .string()
  .trim()
  .transform((value) => (value.length ? value : null))
  .nullable()
  .optional();

export const companyListQuerySchema = paginationSchema.extend({
  search: z.string().trim().optional(),
  industry: z.string().trim().optional(),
  includeArchived: z.coerce.boolean().default(false),
});

export const companyCreateSchema = z.object({
  name: z.string().trim().min(1, "Company name is required.").max(200),
  industry: nullableText,
  website: nullableText,
  phone: nullableText,
  email: nullableText,
  address: nullableText,
  notes: nullableText,
});

export const companyUpdateSchema = companyCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "At least one field is required.",
);

export const duplicateCompanyQuerySchema = z.object({
  name: z.string().trim().min(1, "Company name is required."),
});

export type CompanyListQuery = z.infer<typeof companyListQuerySchema>;
export type CompanyCreateInput = z.infer<typeof companyCreateSchema>;
export type CompanyUpdateInput = z.infer<typeof companyUpdateSchema>;
