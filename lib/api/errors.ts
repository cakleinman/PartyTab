import type { ErrorCode } from "@/lib/api/response";

export class ApiError extends Error {
  status: number;
  code: ErrorCode;
  details?: unknown;

  constructor(status: number, code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function throwApiError(
  status: number,
  code: ErrorCode,
  message: string,
  details?: unknown,
): never {
  throw new ApiError(status, code, message, details);
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
