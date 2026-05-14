import { ForbiddenError, UnauthorizedError, successResponse, withErrorHandler } from "@/lib/api-helpers";
import { can } from "@/lib/permissions";
import { parseSearchParams } from "@/lib/validators/common";
import { duplicateCompanyQuerySchema } from "@/lib/validators/company";
import { checkDuplicateCompany } from "@/services/company.service";
import { getCurrentUser } from "@/services/auth.service";

export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();
    if (!can(user, "create", "company")) throw new ForbiddenError();

    const query = parseSearchParams(duplicateCompanyQuerySchema, new URL(request.url).searchParams);
    return successResponse(await checkDuplicateCompany(query.name));
  });
}
