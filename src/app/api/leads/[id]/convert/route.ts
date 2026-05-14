import {
  ForbiddenError,
  UnauthorizedError,
  successResponse,
  withErrorHandler,
} from "@/lib/api-helpers";
import { can } from "@/lib/permissions";
import { convertLeadSchema } from "@/lib/validators/lead";
import { getCurrentUser } from "@/services/auth.service";
import { leadService } from "@/services/lead.service";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const { id } = await context.params;
    const existing = await leadService.getById(id);
    if (
      !can(user, "convert", "lead", {
        ownerId: existing.assigned_to_id ?? existing.created_by_id,
      })
    ) {
      throw new ForbiddenError();
    }
    const input = convertLeadSchema.parse(await request.json());
    const result = await leadService.convert(id, input, user);
    if (!result.contact) throw new ForbiddenError("Unable to convert this lead.");
    return successResponse(result, undefined, 201);
  });
}
