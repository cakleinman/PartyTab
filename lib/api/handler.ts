import { NextResponse } from "next/server";
import { isApiError } from "@/lib/api/errors";
import { error as apiError, validationError } from "@/lib/api/response";

type RouteContext<P = Record<string, string>> = {
    params: Promise<P>;
};

type ApiHandler<P = Record<string, string>> = (
    request: Request,
    context: RouteContext<P>,
) => Promise<NextResponse>;

type RawApiHandler<P = Record<string, string>> = (
    request: Request,
    context: RouteContext<P>,
) => Promise<NextResponse>;

/**
 * Wraps an API route handler with standardized error handling.
 *
 * Catches ApiError instances and converts them to proper JSON responses,
 * and catches all other errors as validation errors.
 *
 * Usage:
 * ```ts
 * export const POST = withApiHandler(async (request, { params }) => {
 *   // Your handler logic here - just throw ApiError or use throwApiError()
 *   return ok({ success: true });
 * });
 * ```
 */
export function withApiHandler<P = Record<string, string>>(
    handler: RawApiHandler<P>,
): ApiHandler<P> {
    return async (request: Request, context: RouteContext<P>) => {
        try {
            return await handler(request, context);
        } catch (error) {
            if (isApiError(error)) {
                return apiError(error.status, error.code, error.message);
            }
            return validationError(error);
        }
    };
}

/**
 * Simplified wrapper for handlers that don't need the context parameter.
 * Useful for simple GET endpoints.
 */
export function withSimpleApiHandler(
    handler: (request: Request) => Promise<NextResponse>,
): (request: Request) => Promise<NextResponse> {
    return async (request: Request) => {
        try {
            return await handler(request);
        } catch (error) {
            if (isApiError(error)) {
                return apiError(error.status, error.code, error.message);
            }
            return validationError(error);
        }
    };
}
