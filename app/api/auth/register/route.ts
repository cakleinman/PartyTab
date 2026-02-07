import { prisma } from "@/lib/db/prisma";
import { ok, error as apiError, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { hashPassword, validatePassword } from "@/lib/auth/password";
import { parseEmail } from "@/lib/validators/schemas";

/**
 * POST /api/auth/register
 * Register a new user with email and password.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, displayName } = body;

    // Validate email
    if (!email || typeof email !== "string") {
      throwApiError(400, "validation_error", "Email is required");
    }
    const emailLower = parseEmail(email);

    // Validate password
    if (!password || typeof password !== "string") {
      throwApiError(400, "validation_error", "Password is required");
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      throwApiError(400, "validation_error", passwordError);
    }

    // Validate display name
    if (!displayName || typeof displayName !== "string") {
      throwApiError(400, "validation_error", "Display name is required");
    }
    const trimmedName = displayName.trim();
    if (trimmedName.length < 1 || trimmedName.length > 40) {
      throwApiError(400, "validation_error", "Display name must be 1-40 characters");
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: emailLower },
    });
    if (existingUser) {
      // Generic message to prevent email enumeration
      throwApiError(400, "validation_error", "Unable to create account. Please try again or contact support.");
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: emailLower,
        displayName: trimmedName,
        passwordHash,
        authProvider: "EMAIL",
        subscriptionTier: "BASIC",
      },
    });

    return ok({
      success: true,
      userId: user.id,
      message: "Account created successfully. Please sign in.",
    });
  } catch (error) {
    if (isApiError(error)) {
      return apiError(error.status, error.code, error.message);
    }
    console.error("Registration error:", error);
    return validationError(error);
  }
}
