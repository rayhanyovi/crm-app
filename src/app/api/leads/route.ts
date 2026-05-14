import {
  ForbiddenError,
  UnauthorizedError,
  successResponse,
  withErrorHandler,
} from "@/lib/api-helpers";
import { can } from "@/lib/permissions";
import { parseSearchParams } from "@/lib/validators/common";
import { createLeadSchema, leadListQuerySchema } from "@/lib/validators/lead";
import { getCurrentUser } from "@/services/auth.service";
import { leadService } from "@/services/lead.service";

export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();
    if (!can(user, "read", "lead")) throw new ForbiddenError();

    const query = parseSearchParams(leadListQuerySchema, new URL(request.url).searchParams);
    const { rows, meta } = await leadService.list(query);
    return successResponse(rows, meta);
  });
}

export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();
    if (!can(user, "create", "lead")) throw new ForbiddenError();

    const input = createLeadSchema.parse(await request.json());
    const lead = await leadService.create(input, user.id);
    return successResponse(lead, undefined, 201);
  });
}
