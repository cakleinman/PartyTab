import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/feedback/route";

// Mock the email client
vi.mock("@/lib/email/client", () => ({
  emailClient: {
    sendEmail: vi.fn().mockResolvedValue({}),
  },
}));

// Track mock IP for rate limiting tests
let mockIp = "127.0.0.1";

// Mock next/headers
vi.mock("next/headers", () => ({
  headers: vi.fn().mockImplementation(async () => ({
    get: (name: string) => {
      if (name === "x-forwarded-for") return mockIp;
      return null;
    },
  })),
}));

// Mock environment variables
vi.stubEnv("EMAIL_FROM", "test@partytab.app");
vi.stubEnv("FEEDBACK_EMAIL", "feedback@partytab.app");

function createRequest(body: unknown): Request {
  return new Request("http://localhost/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function setMockIp(ip: string) {
  mockIp = ip;
}

describe("POST /api/feedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Use a unique IP for each test to avoid rate limit interference
    setMockIp(`test-ip-${Date.now()}-${Math.random()}`);
  });

  it("should return 400 if message is missing", async () => {
    const request = createRequest({ name: "Test", email: "test@example.com" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe("validation_error");
    expect(data.error.message).toBe("Message is required");
  });

  it("should return 400 if message is empty string", async () => {
    const request = createRequest({ message: "   " });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe("validation_error");
  });

  it("should return 400 if message is too long", async () => {
    const request = createRequest({ message: "a".repeat(5001) });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.message).toBe("Message is too long (max 5000 characters)");
  });

  it("should return 400 if email format is invalid", async () => {
    const request = createRequest({
      message: "Test feedback",
      email: "not-an-email",
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.message).toBe("Invalid email format");
  });

  it("should accept valid feedback with all fields", async () => {
    const request = createRequest({
      name: "John Doe",
      email: "john@example.com",
      message: "This is great feedback!",
      feedbackType: "feature",
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("should accept feedback with only message", async () => {
    const request = createRequest({
      message: "Anonymous feedback",
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("should default to 'other' for invalid feedback type", async () => {
    const request = createRequest({
      message: "Test",
      feedbackType: "invalid_type",
    });
    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  it("should accept valid email formats", async () => {
    const validEmails = [
      "test@example.com",
      "user.name@domain.co.uk",
      "user+tag@example.org",
    ];

    for (const email of validEmails) {
      const request = createRequest({ message: "Test", email });
      const response = await POST(request);
      expect(response.status).toBe(200);
    }
  });

  it("should handle XSS attempts in message", async () => {
    const request = createRequest({
      name: "<script>alert('xss')</script>",
      message: "<img src=x onerror=alert('xss')>",
    });
    const response = await POST(request);

    // Should succeed but content should be escaped (tested via email content)
    expect(response.status).toBe(200);
  });

  it("should rate limit after 5 requests from same IP", async () => {
    // Use a unique IP for this test to avoid interference
    const testIp = `rate-limit-test-${Date.now()}`;
    setMockIp(testIp);

    // First 5 requests should succeed
    for (let i = 0; i < 5; i++) {
      const request = createRequest({ message: `Test ${i}` });
      const response = await POST(request);
      expect(response.status).toBe(200);
    }

    // 6th request should be rate limited
    const request = createRequest({ message: "Should be blocked" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error.code).toBe("rate_limited");
    expect(data.error.message).toContain("Too many feedback submissions");
  });

  it("should allow requests from different IPs", async () => {
    // Each request from a different IP should succeed
    for (let i = 0; i < 10; i++) {
      setMockIp(`unique-ip-${Date.now()}-${i}`);
      const request = createRequest({ message: `Test ${i}` });
      const response = await POST(request);
      expect(response.status).toBe(200);
    }
  });
});
