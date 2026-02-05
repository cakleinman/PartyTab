import { ok, error as apiError, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { emailClient } from "@/lib/email/client";
import { headers } from "next/headers";

const fromEmail = process.env.EMAIL_FROM;
const feedbackEmail = process.env.FEEDBACK_EMAIL || fromEmail;

// Rate limiting: 5 submissions per IP per hour
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getClientIp(headersList: Headers): string {
  // Check common headers for client IP (Vercel, Cloudflare, etc.)
  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return headersList.get("x-real-ip") || "unknown";
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // Clean up expired entries periodically (every 100 checks)
  if (Math.random() < 0.01) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!record || now > record.resetAt) {
    // First request or window expired - reset
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  // Increment count
  record.count++;
  return { allowed: true };
}

/**
 * Escapes HTML special characters to prevent XSS vulnerabilities
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * POST /api/feedback
 * Submit user feedback via email.
 * No authentication required.
 */
export async function POST(request: Request) {
  try {
    // Rate limiting
    const headersList = await headers();
    const clientIp = getClientIp(headersList);
    const rateLimit = checkRateLimit(clientIp);

    if (!rateLimit.allowed) {
      return apiError(
        429,
        "rate_limited",
        `Too many feedback submissions. Please try again in ${rateLimit.retryAfterSeconds} seconds.`
      );
    }

    const body = await request.json();
    const { name, email, message, feedbackType } = body;

    // Validate required fields
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      throwApiError(400, "validation_error", "Message is required");
    }

    if (message.length > 5000) {
      throwApiError(400, "validation_error", "Message is too long (max 5000 characters)");
    }

    // Validate optional email format if provided
    if (email && typeof email === "string" && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throwApiError(400, "validation_error", "Invalid email format");
      }
    }

    // Validate feedback type
    const validTypes = ["bug", "feature", "other"];
    const type = validTypes.includes(feedbackType) ? feedbackType : "other";

    // Check if email is configured
    if (!emailClient || !fromEmail || !feedbackEmail) {
      console.warn("Email client not configured, logging feedback instead.");
      console.log("=== FEEDBACK RECEIVED ===");
      console.log("Type:", type);
      console.log("Name:", name || "(anonymous)");
      console.log("Email:", email || "(not provided)");
      console.log("Message:", message);
      console.log("========================");

      return ok({
        success: true,
        message: "Feedback received (email not configured)",
      });
    }

    // Prepare email content
    const escapedName = name ? escapeHtml(name.trim()) : "Anonymous";
    const escapedEmail = email ? escapeHtml(email.trim()) : "Not provided";
    const escapedMessage = escapeHtml(message.trim());
    const typeLabel = type === "bug" ? "Bug Report" : type === "feature" ? "Feature Request" : "Feedback";

    // Send email
    await emailClient.sendEmail({
      From: fromEmail,
      To: feedbackEmail,
      ReplyTo: email && email.trim() ? email.trim() : undefined,
      Subject: `[PartyTab ${typeLabel}] ${escapedName}`,
      HtmlBody: `
        <h2>${typeLabel}</h2>
        <p><strong>From:</strong> ${escapedName}</p>
        <p><strong>Email:</strong> ${escapedEmail}</p>
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;" />
        <p style="white-space: pre-wrap;">${escapedMessage}</p>
      `,
      TextBody: `${typeLabel}\n\nFrom: ${escapedName}\nEmail: ${escapedEmail}\n\n${message.trim()}`,
    });

    return ok({
      success: true,
      message: "Feedback sent successfully",
    });
  } catch (error) {
    if (isApiError(error)) {
      return apiError(error.status, error.code, error.message);
    }
    console.error("Feedback submission error:", error);
    return validationError(error);
  }
}
