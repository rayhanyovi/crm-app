import {
  UnauthorizedError,
  successResponse,
  withErrorHandler,
} from "@/lib/api-helpers";
import { getCurrentUser } from "@/services/auth.service";

export async function GET() {
  return withErrorHandler(async () => {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    return successResponse(user);
  });
}
