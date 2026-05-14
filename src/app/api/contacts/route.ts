import { ForbiddenError, UnauthorizedError, successResponse, withErrorHandler } from "@/lib/api-helpers";
import { can } from "@/lib/permissions";
import { parseSearchParams } from "@/lib/validators/common";
import { contactCreateSchema, contactListQuerySchema } from "@/lib/validators/contact";
import { createContact, listContacts } from "@/services/contact.service";
import { getCurrentUser } from "@/services/auth.service";

export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();
    if (!can(user, "read", "contact")) throw new ForbiddenError();

    const query = parseSearchParams(contactListQuerySchema, new URL(request.url).searchParams);
    const { rows, meta } = await listContacts(query);
    return successResponse(rows, meta);
  });
}

export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();
    if (!can(user, "create", "contact")) throw new ForbiddenError();

    const input = contactCreateSchema.parse(await request.json());
    const contact = await createContact(input, user.id);
    return successResponse(contact, undefined, 201);
  });
}
