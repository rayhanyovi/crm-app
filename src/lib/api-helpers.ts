import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 500,
    public details?: unknown,
  ) {
    super(message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "You must be logged in.") {
    super("UNAUTHORIZED", message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action.") {
    super("FORBIDDEN", message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "The requested resource was not found.") {
    super("NOT_FOUND", message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "The requested resource conflicts with existing data.") {
    super("CONFLICT", message, 409);
  }
}

export function successResponse<T>(
  data: T,
  meta?: Record<string, unknown>,
  status = 200,
) {
  return NextResponse.json({ data, meta }, { status });
}

export function errorResponse(
  code: string,
  message: string,
  status: number,
  details?: unknown,
) {
  return NextResponse.json({ error: { code, message, details } }, { status });
}

export async function withErrorHandler(
  handler: () => Promise<NextResponse> | NextResponse,
) {
  try {
    return await handler();
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Invalid input.",
        400,
        error.flatten(),
      );
    }

    if (error instanceof AppError) {
      return errorResponse(error.code, error.message, error.status, error.details);
    }

    console.error(error);
    return errorResponse("INTERNAL_ERROR", "Something went wrong.", 500);
  }
}
