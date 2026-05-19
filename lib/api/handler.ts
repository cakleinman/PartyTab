import { NextResponse } from "next/server";
import { isApiError } from "@/lib/api/errors";
import { error as apiError, rateLimited, validationError } from "@/lib/api/response";
import { getUserFromSession } from "@/lib/api/guards";
import { checkUserRateLimit } from "@/lib/auth/rate-limit";
import { logApiRequest } from "@/lib/api/audit-log";

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

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function validateContentType(request: Request): NextResponse | null {
    if (!MUTATION_METHODS.has(request.method)) return null;
    const ct = request.headers.get("content-type");
    if (ct && !ct.includes("application/json") && !ct.includes("multipart/form-data")) {
        return apiError(415, "validation_error", "Content-Type must be application/json");
    }
    return null;
}

/**
 * Wraps an API route handler with standardized error handling,
 * content-type validation, per-user rate limiting, and audit logging.
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
        const start = Date.now();
        let userId: string | null = null;
        try {
            // Content-Type validation
            const ctError = validateContentType(request);
            if (ctError) return ctError;

            // Per-user rate limiting
            const user = await getUserFromSession();
            userId = user?.id ?? null;
            if (user) {
                const rateCheck = await checkUserRateLimit(user.id);
                if (rateCheck) return rateLimited(rateCheck.retryAfter);
            }

            const response = await handler(request, context);
            logApiRequest({
                timestamp: new Date().toISOString(),
                method: request.method,
                path: new URL(request.url).pathname,
                userId,
                statusCode: response.status,
                durationMs: Date.now() - start,
            });
            return response;
        } catch (error) {
            const status = isApiError(error) ? error.status : 400;
            logApiRequest({
                timestamp: new Date().toISOString(),
                method: request.method,
                path: new URL(request.url).pathname,
                userId,
                statusCode: status,
                durationMs: Date.now() - start,
            });
            if (isApiError(error)) {
                return apiError(error.status, error.code, error.message, error.details);
            }
            return validationError(error);
        }
    };
}

/**
 * Simplified wrapper for handlers that don't need the context parameter.
 * Includes content-type validation, per-user rate limiting, and audit logging.
 */
export function withSimpleApiHandler(
    handler: (request: Request) => Promise<NextResponse>,
): (request: Request) => Promise<NextResponse> {
    return async (request: Request) => {
        const start = Date.now();
        let userId: string | null = null;
        try {
            // Content-Type validation
            const ctError = validateContentType(request);
            if (ctError) return ctError;

            // Per-user rate limiting
            const user = await getUserFromSession();
            userId = user?.id ?? null;
            if (user) {
                const rateCheck = await checkUserRateLimit(user.id);
                if (rateCheck) return rateLimited(rateCheck.retryAfter);
            }

            const response = await handler(request);
            logApiRequest({
                timestamp: new Date().toISOString(),
                method: request.method,
                path: new URL(request.url).pathname,
                userId,
                statusCode: response.status,
                durationMs: Date.now() - start,
            });
            return response;
        } catch (error) {
            const status = isApiError(error) ? error.status : 400;
            logApiRequest({
                timestamp: new Date().toISOString(),
                method: request.method,
                path: new URL(request.url).pathname,
                userId,
                statusCode: status,
                durationMs: Date.now() - start,
            });
            if (isApiError(error)) {
                return apiError(error.status, error.code, error.message, error.details);
            }
            return validationError(error);
        }
    };
}
