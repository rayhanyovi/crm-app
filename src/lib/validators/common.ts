import { z } from "zod";

const sortableColumns = z
  .string()
  .regex(/^[a-zA-Z0-9_]+$/)
  .optional();

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  sortBy: sortableColumns.default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

export function parseSearchParams<T extends z.ZodType>(
  schema: T,
  searchParams: URLSearchParams,
): z.infer<T> {
  return schema.parse(Object.fromEntries(searchParams.entries()));
}
