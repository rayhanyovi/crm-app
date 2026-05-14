import {
  ForbiddenError,
  UnauthorizedError,
  successResponse,
  withErrorHandler,
} from "@/lib/api-helpers";
import { can } from "@/lib/permissions";
import { dealStageSchema } from "@/lib/validators/deal";
import { getCurrentUser } from "@/services/auth.service";
import { changeDealStage, getDealDetail } from "@/services/deal.service";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return withErrorHandler(async () => {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const { id } = await context.params;
    const existing = await getDealDetail(id);
    if (!can(user, "change_stage", "deal", { ownerId: existing.assigned_to_id ?? existing.created_by_id })) {
      throw new ForbiddenError();
    }

    const input = dealStageSchema.parse(await request.json());
    return successResponse(await changeDealStage(id, input, user));
  });
}
