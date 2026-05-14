import { ForbiddenError, UnauthorizedError, successResponse, withErrorHandler } from "@/lib/api-helpers";
import { can } from "@/lib/permissions";
import { parseSearchParams } from "@/lib/validators/common";
import { companyCreateSchema, companyListQuerySchema } from "@/lib/validators/company";
import { createCompany, listCompanies } from "@/services/company.service";
import { getCurrentUser } from "@/services/auth.service";

export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();
    if (!can(user, "read", "company")) throw new ForbiddenError();

    const query = parseSearchParams(companyListQuerySchema, new URL(request.url).searchParams);
    const { rows, meta } = await listCompanies(query);
    return successResponse(rows, meta);
  });
}

export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();
    if (!can(user, "create", "company")) throw new ForbiddenError();

    const input = companyCreateSchema.parse(await request.json());
    const result = await createCompany(input, user.id);
    return successResponse(result, undefined, 201);
  });
}
