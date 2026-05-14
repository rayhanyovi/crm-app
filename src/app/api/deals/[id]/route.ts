import {
  ForbiddenError,
  UnauthorizedError,
  successResponse,
  withErrorHandler,
} from "@/lib/api-helpers";
import { can } from "@/lib/permissions";
import { dealUpdateSchema } from "@/lib/validators/deal";
import { getCurrentUser } from "@/services/auth.service";
import { archiveDeal, getDealDetail, updateDeal } from "@/services/deal.service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return withErrorHandler(async () => {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();
    if (!can(user, "read", "deal")) throw new ForbiddenError();

    const { id } = await context.params;
    return successResponse(await getDealDetail(id));
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return withErrorHandler(async () => {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const { id } = await context.params;
    const existing = await getDealDetail(id);
    if (!can(user, "update", "deal", { ownerId: existing.assigned_to_id ?? existing.created_by_id })) {
      throw new ForbiddenError();
    }

    const input = dealUpdateSchema.parse(await request.json());
    return successResponse(await updateDeal(id, input, user));
  });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return withErrorHandler(async () => {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();
    if (!can(user, "archive", "deal")) throw new ForbiddenError();

    const { id } = await context.params;
    await archiveDeal(id, user);
    return successResponse({ message: "Deal archived." });
  });
}
