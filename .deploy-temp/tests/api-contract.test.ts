import { describe, expect, it } from "vitest";

const baseUrl = process.env.SMOKE_BASE_URL;

async function request(path: string, options: RequestInit = {}) {
  if (!baseUrl) {
    throw new Error("SMOKE_BASE_URL not set");
  }
  const response = await fetch(`${baseUrl}${path}`, options);
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  return { response, data };
}

describe("api contract", () => {
  if (!baseUrl) {
    it.skip("SMOKE_BASE_URL not set", () => {});
    return;
  }

  it("returns tabs list for unauthenticated user", async () => {
    const { response, data } = await request("/api/tabs");
    expect(response.status).toBe(200);
    expect(Array.isArray(data.tabs)).toBe(true);
  });

  it("returns standard error format", async () => {
    const { response, data } = await request("/api/tabs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(response.ok).toBe(false);
    expect(data.error).toBeTruthy();
    expect(data.error.code).toBeTruthy();
    expect(data.error.message).toBeTruthy();
  });

  it("invalid invite returns not_found", async () => {
    const { response, data } = await request("/api/invites/doesnotexist");
    expect(response.status).toBe(404);
    expect(data.error.code).toBe("not_found");
  });
});
