import {
  ForbiddenError,
  UnauthorizedError,
  successResponse,
  withErrorHandler,
} from "@/lib/api-helpers";
import { can } from "@/lib/permissions";
import { assignLeadSchema } from "@/lib/validators/lead";
import { getCurrentUser } from "@/services/auth.service";
import { leadService } from "@/services/lead.service";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();
    if (!can(user, "assign", "lead")) throw new ForbiddenError();

    const { id } = await context.params;
    const input = assignLeadSchema.parse(await request.json());
    return successResponse(await leadService.assign(id, input, user));
  });
}
