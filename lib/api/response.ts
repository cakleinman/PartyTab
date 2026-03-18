import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ErrorCode =
  | "validation_error"
  | "not_found"
  | "forbidden"
  | "unauthorized"
  | "tab_closed"
  | "not_participant"
  | "already_claimed"
  | "tab_limit_reached"
  | "pro_required"
  | "limit_exceeded"
  | "internal_error"
  | "email_exists"
  | "upgrade_required"
  | "rate_limited";

export function error(status: number, code: ErrorCode, message: string, details?: unknown) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        details: details ?? undefined,
      },
    },
    { status },
  );
}

export function ok<T>(payload: T) {
  return NextResponse.json(payload, { status: 200 });
}

export function created<T>(payload: T) {
  return NextResponse.json(payload, { status: 201 });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function validationError(err: unknown, status = 400) {
  if (err instanceof ZodError) {
    return error(status, "validation_error", err.issues[0]?.message ?? "Invalid request");
  }
  // In production, suppress internal error messages (e.g. Prisma schema details)
  if (process.env.NODE_ENV === "production") {
    if (err instanceof Error) console.error("Unexpected validation error:", err.message);
    return error(status, "validation_error", "Invalid request");
  }
  const message = err instanceof Error && err.message ? err.message : "Invalid request";
  return error(status, "validation_error", message);
}

export function rateLimited(retryAfter: number) {
  return NextResponse.json(
    { error: { code: "rate_limited", message: "Too many requests" } },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}

