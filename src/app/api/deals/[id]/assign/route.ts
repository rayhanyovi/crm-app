import {
  ForbiddenError,
  UnauthorizedError,
  successResponse,
  withErrorHandler,
} from "@/lib/api-helpers";
import { can } from "@/lib/permissions";
import { dealAssignSchema } from "@/lib/validators/deal";
import { getCurrentUser } from "@/services/auth.service";
import { assignDeal } from "@/services/deal.service";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return withErrorHandler(async () => {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();
    if (!can(user, "assign", "deal")) throw new ForbiddenError();

    const { id } = await context.params;
    const input = dealAssignSchema.parse(await request.json());
    return successResponse(await assignDeal(id, input, user));
  });
}
