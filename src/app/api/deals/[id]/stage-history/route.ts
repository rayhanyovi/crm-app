import {
  ForbiddenError,
  UnauthorizedError,
  successResponse,
  withErrorHandler,
} from "@/lib/api-helpers";
import { can } from "@/lib/permissions";
import { getCurrentUser } from "@/services/auth.service";
import { getDealStageHistory } from "@/services/deal.service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return withErrorHandler(async () => {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();
    if (!can(user, "read", "deal")) throw new ForbiddenError();

    const { id } = await context.params;
    return successResponse(await getDealStageHistory(id));
  });
}
