import {
  ForbiddenError,
  UnauthorizedError,
  successResponse,
  withErrorHandler,
} from "@/lib/api-helpers";
import { can } from "@/lib/permissions";
import { updateLeadSchema } from "@/lib/validators/lead";
import { getCurrentUser } from "@/services/auth.service";
import { leadService } from "@/services/lead.service";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();
    if (!can(user, "read", "lead")) throw new ForbiddenError();

    const { id } = await context.params;
    return successResponse(await leadService.getById(id));
  });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const { id } = await context.params;
    const existing = await leadService.getById(id);
    if (
      !can(user, "update", "lead", {
        ownerId: existing.assigned_to_id ?? existing.created_by_id,
      })
    ) {
      throw new ForbiddenError();
    }
    const input = updateLeadSchema.parse(await request.json());
    return successResponse(await leadService.update(id, input, user));
  });
}
