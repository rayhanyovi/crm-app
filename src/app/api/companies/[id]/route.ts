import { ForbiddenError, UnauthorizedError, successResponse, withErrorHandler } from "@/lib/api-helpers";
import { can } from "@/lib/permissions";
import { companyUpdateSchema } from "@/lib/validators/company";
import { archiveCompany, getCompanyDetail, updateCompany } from "@/services/company.service";
import { getCurrentUser } from "@/services/auth.service";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();
    if (!can(user, "read", "company")) throw new ForbiddenError();

    const { id } = await context.params;
    return successResponse(await getCompanyDetail(id));
  });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();
    if (!can(user, "update", "company")) throw new ForbiddenError();

    const { id } = await context.params;
    const input = companyUpdateSchema.parse(await request.json());
    return successResponse(await updateCompany(id, input, user.id));
  });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();
    if (!can(user, "archive", "company")) throw new ForbiddenError();

    const { id } = await context.params;
    await archiveCompany(id, user.id);
    return successResponse({ message: "Company archived." });
  });
}
