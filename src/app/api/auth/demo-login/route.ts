import { z } from "zod";

import {
  NotFoundError,
  successResponse,
  withErrorHandler,
} from "@/lib/api-helpers";
import { demoLogin } from "@/services/auth.service";

const DemoLoginSchema = z.object({
  userId: z.uuid(),
});

export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const input = DemoLoginSchema.parse(await request.json());
    const user = await demoLogin(input.userId);

    if (!user) {
      throw new NotFoundError("Demo account not found.");
    }

    return successResponse({ user });
  });
}
