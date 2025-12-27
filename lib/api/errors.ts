import type { ErrorCode } from "@/lib/api/response";

export class ApiError extends Error {
  status: number;
  code: ErrorCode;

  constructor(status: number, code: ErrorCode, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function throwApiError(status: number, code: ErrorCode, message: string): never {
  throw new ApiError(status, code, message);
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
