import { successResponse, withErrorHandler } from "@/lib/api-helpers";
import { logout } from "@/services/auth.service";

export async function POST() {
  return withErrorHandler(async () => {
    await logout();
    return successResponse({ message: "Logged out" });
  });
}
