import {
  ForbiddenError,
  UnauthorizedError,
  successResponse,
  withErrorHandler,
} from "@/lib/api-helpers";
import { can } from "@/lib/permissions";
import { parseSearchParams } from "@/lib/validators/common";
import { dealCreateSchema, dealListQuerySchema } from "@/lib/validators/deal";
import { getCurrentUser } from "@/services/auth.service";
import { createDeal, listDeals, notifyDealCreated } from "@/services/deal.service";

export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();
    if (!can(user, "read", "deal")) throw new ForbiddenError();

    const query = parseSearchParams(dealListQuerySchema, new URL(request.url).searchParams);
    const { rows, meta } = await listDeals(query);
    return successResponse(rows, meta);
  });
}

export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();
    if (!can(user, "create", "deal")) throw new ForbiddenError();

    const input = dealCreateSchema.parse(await request.json());
    const deal = await createDeal(input, user.id);
    await notifyDealCreated(deal, user.id);
    return successResponse(deal, undefined, 201);
  });
}
