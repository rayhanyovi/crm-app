import { successResponse, withErrorHandler } from "@/lib/api-helpers";
import { getDemoAccounts } from "@/services/auth.service";

export async function GET() {
  return withErrorHandler(async () => {
    const users = await getDemoAccounts();
    return successResponse(users);
  });
}
