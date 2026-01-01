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
  | "internal_error";

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
  const message =
    err instanceof ZodError
      ? err.issues[0]?.message ?? "Invalid request"
      : err instanceof Error && err.message
        ? err.message
        : "Invalid request";
  return error(status, "validation_error", message);
}

export const errorResponse = error;
export const okResponse = ok;
