import { ForbiddenError, UnauthorizedError, successResponse, withErrorHandler } from "@/lib/api-helpers";
import { can } from "@/lib/permissions";
import { contactUpdateSchema } from "@/lib/validators/contact";
import { archiveContact, getContactDetail, updateContact } from "@/services/contact.service";
import { getCurrentUser } from "@/services/auth.service";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();
    if (!can(user, "read", "contact")) throw new ForbiddenError();

    const { id } = await context.params;
    return successResponse(await getContactDetail(id));
  });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const { id } = await context.params;
    const input = contactUpdateSchema.parse(await request.json());
    return successResponse(await updateContact(id, input, user));
  });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();
    if (!can(user, "archive", "contact")) throw new ForbiddenError();

    const { id } = await context.params;
    await archiveContact(id, user.id);
    return successResponse({ message: "Contact archived." });
  });
}
