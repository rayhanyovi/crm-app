import {
  ForbiddenError,
  UnauthorizedError,
  successResponse,
  withErrorHandler,
} from "@/lib/api-helpers";
import { can } from "@/lib/permissions";
import { parseSearchParams } from "@/lib/validators/common";
import { dealPipelineQuerySchema } from "@/lib/validators/deal";
import { getCurrentUser } from "@/services/auth.service";
import { getPipeline } from "@/services/deal.service";

export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();
    if (!can(user, "read", "deal")) throw new ForbiddenError();

    const query = parseSearchParams(
      dealPipelineQuerySchema,
      new URL(request.url).searchParams,
    );
    const stages = await getPipeline(query);
    return successResponse({ stages });
  });
}
