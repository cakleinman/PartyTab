import { describe, expect, it } from "vitest";

const baseUrl = process.env.SMOKE_BASE_URL;

function uniqueLabel(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createClient() {
  const jar = new Map<string, string>();

  function updateCookies(response: Response) {
    const setCookie = response.headers.getSetCookie?.() ?? [];
    if (!setCookie || setCookie.length === 0) return;
    const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
    cookies.forEach((cookie) => {
      const [pair] = cookie.split(";");
      const [name, value] = pair.split("=");
      if (!name) return;
      const trimmedName = name.trim();
      const trimmedValue = value === undefined ? "" : value.trim();
      if (!trimmedValue) {
        jar.delete(trimmedName);
      } else {
        jar.set(trimmedName, trimmedValue);
      }
    });
  }

  function cookieHeader() {
    return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  }

  async function request(path: string, options: RequestInit = {}) {
    if (!baseUrl) {
      throw new Error("SMOKE_BASE_URL not set");
    }
    const headers = new Headers(options.headers ?? {});
    const cookie = cookieHeader();
    if (cookie) headers.set("cookie", cookie);
    const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
    updateCookies(response);
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    return { response, data };
  }

  return { request };
}

describe("api contract", () => {
  if (!baseUrl) {
    it.skip("SMOKE_BASE_URL not set", () => {});
    return;
  }

  it("returns tabs list for unauthenticated user", async () => {
    const client = createClient();
    const { response, data } = await client.request("/api/tabs");
    expect(response.status).toBe(200);
    expect(Array.isArray(data.tabs)).toBe(true);
  });

  it("returns standard error format", async () => {
    const client = createClient();
    const { response, data } = await client.request("/api/tabs", {
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
    const client = createClient();
    const { response, data } = await client.request("/api/invites/doesnotexist");
    expect(response.status).toBe(404);
    expect(data.error.code).toBe("not_found");
  });

  it("rejects create tab without display name or pin", async () => {
    const client = createClient();
    const { response, data } = await client.request("/api/tabs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "No Auth Tab" }),
    });
    expect(response.status).toBe(401);
    expect(data.error.code).toBe("unauthorized");
  });

  it("rejects custom split totals that do not match amount", async () => {
    const host = createClient();
    const guest = createClient();
    const hostName = uniqueLabel("host");

    const createRes = await host.request("/api/tabs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: uniqueLabel("split-total"),
        displayName: hostName,
        pin: "1111",
      }),
    });
    expect(createRes.response.ok).toBe(true);
    const tabId = createRes.data.tab.id;

    const inviteRes = await host.request(`/api/tabs/${tabId}/invites`, { method: "POST" });
    expect(inviteRes.response.ok).toBe(true);
    const token = inviteRes.data.invite.token;

    const joinRes = await guest.request(`/api/invites/${token}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: uniqueLabel("guest"), pin: "2222" }),
    });
    expect(joinRes.response.ok).toBe(true);

    const participantsRes = await host.request(`/api/tabs/${tabId}/participants`);
    expect(participantsRes.response.ok).toBe(true);
    const participants = participantsRes.data.participants;
    expect(participants.length).toBeGreaterThanOrEqual(2);

    const splits = participants.slice(0, 2).map((participant: { id: string }, index: number) => ({
      participantId: participant.id,
      amountCents: index === 0 ? 900 : 50,
    }));

    const expenseRes = await host.request(`/api/tabs/${tabId}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: "10.00",
        note: "Bad split totals",
        paidByParticipantId: participants[0].id,
        splits,
      }),
    });
    expect(expenseRes.response.status).toBe(400);
    expect(expenseRes.data.error.code).toBe("validation_error");
  }, 15000);

  it("prevents non-creator from closing tab", async () => {
    const host = createClient();
    const guest = createClient();

    const createRes = await host.request("/api/tabs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: uniqueLabel("close-permission"),
        displayName: uniqueLabel("creator"),
        pin: "3333",
      }),
    });
    expect(createRes.response.ok).toBe(true);
    const tabId = createRes.data.tab.id;

    const inviteRes = await host.request(`/api/tabs/${tabId}/invites`, { method: "POST" });
    expect(inviteRes.response.ok).toBe(true);
    const token = inviteRes.data.invite.token;

    const joinRes = await guest.request(`/api/invites/${token}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: uniqueLabel("guest"), pin: "4444" }),
    });
    expect(joinRes.response.ok).toBe(true);

    const closeRes = await guest.request(`/api/tabs/${tabId}/close`, { method: "POST" });
    expect(closeRes.response.status).toBe(403);
    expect(closeRes.data.error.code).toBe("forbidden");
  });

  it("rejects creating expenses on closed tab", async () => {
    const host = createClient();

    const createRes = await host.request("/api/tabs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: uniqueLabel("closed-expense"),
        displayName: uniqueLabel("closer"),
        pin: "5555",
      }),
    });
    expect(createRes.response.ok).toBe(true);
    const tabId = createRes.data.tab.id;

    const participantsRes = await host.request(`/api/tabs/${tabId}/participants`);
    expect(participantsRes.response.ok).toBe(true);
    const participants = participantsRes.data.participants;

    const closeRes = await host.request(`/api/tabs/${tabId}/close`, { method: "POST" });
    expect(closeRes.response.ok).toBe(true);

    const expenseRes = await host.request(`/api/tabs/${tabId}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: "12.00",
        note: "Should fail",
        paidByParticipantId: participants[0].id,
        evenSplit: true,
      }),
    });
    expect(expenseRes.response.status).toBe(409);
    expect(expenseRes.data.error.code).toBe("tab_closed");
  });
});
