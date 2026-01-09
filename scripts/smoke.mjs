const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";

function createClient() {
  const jar = new Map();

  function updateCookies(response) {
    const setCookie = response.headers.getSetCookie?.() ?? [];
    if (!setCookie || setCookie.length === 0) return;
    const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
    cookies.forEach((cookie) => {
      const [pair] = cookie.split(";");
      const [name, value] = pair.split("=");
      if (name && value) {
        jar.set(name.trim(), value.trim());
      }
    });
  }

  function cookieHeader() {
    return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  }

  async function request(path, options = {}) {
    const headers = new Headers(options.headers ?? {});
    const cookie = cookieHeader();
    if (cookie) headers.set("cookie", cookie);
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers,
    });
    updateCookies(response);
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    return { response, data };
  }

  return { request };
}

async function run() {
  const host = createClient();
  const guest = createClient();

  console.log("Creating tab...");
  const { response: createRes, data: createData } = await host.request("/api/tabs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Smoke Test",
      description: "CLI smoke",
      displayName: "Host",
      pin: "1234",
    }),
  });
  if (!createRes.ok) throw new Error(`Create tab failed: ${JSON.stringify(createData)}`);
  const tabId = createData.tab.id;

  console.log("Creating invite...");
  const { response: inviteRes, data: inviteData } = await host.request(`/api/tabs/${tabId}/invites`, { method: "POST" });
  if (!inviteRes.ok) throw new Error(`Invite failed: ${JSON.stringify(inviteData)}`);
  const token = inviteData.invite.token;

  console.log("Guest joining...");
  const joinRes = await guest.request(`/api/invites/${token}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ displayName: "Guest", pin: "4321" }),
  });
  if (!joinRes.response.ok) throw new Error(`Join failed: ${JSON.stringify(joinRes.data)}`);

  console.log("Fetching participants...");
  const participantsRes = await host.request(`/api/tabs/${tabId}/participants`);
  if (!participantsRes.response.ok) throw new Error(`Participants failed: ${JSON.stringify(participantsRes.data)}`);
  const participants = participantsRes.data.participants;
  const paidBy = participants[0].id;

  console.log("Creating expense...");
  const expenseRes = await host.request(`/api/tabs/${tabId}/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: "24.00", note: "Snacks", paidByParticipantId: paidBy, evenSplit: true }),
  });
  if (!expenseRes.response.ok) throw new Error(`Expense failed: ${JSON.stringify(expenseRes.data)}`);

  console.log("Closing tab...");
  const closeRes = await host.request(`/api/tabs/${tabId}/close`, { method: "POST" });
  if (!closeRes.response.ok) throw new Error(`Close failed: ${JSON.stringify(closeRes.data)}`);

  console.log("Fetching settlement...");
  const settlementRes = await host.request(`/api/tabs/${tabId}/settlement`);
  if (!settlementRes.response.ok) throw new Error(`Settlement failed: ${JSON.stringify(settlementRes.data)}`);

  console.log("Smoke test complete.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
