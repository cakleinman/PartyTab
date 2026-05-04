import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    tab: { findUnique: vi.fn() },
    participant: { findUnique: vi.fn() },
    expense: { findFirst: vi.fn() },
    receiptItem: {
      findFirst: vi.fn(),
      aggregate: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/lib/session/session", () => ({
  getSessionUserId: vi.fn(),
  setSessionUserId: vi.fn(),
}));

vi.mock("@/lib/auth/rate-limit", () => ({
  checkUserRateLimit: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/api/audit-log", () => ({
  logApiRequest: vi.fn(),
}));

import { POST } from "@/app/api/tabs/[tabId]/expenses/[expenseId]/receipt/items/route";
import {
  PATCH as ITEM_PATCH,
  DELETE as ITEM_DELETE,
} from "@/app/api/tabs/[tabId]/expenses/[expenseId]/receipt/items/[itemId]/route";
import { prisma } from "@/lib/db/prisma";
import { getSessionUserId } from "@/lib/session/session";

const TAB = "00000000-0000-0000-0000-000000000aaa";
const EXPENSE = "00000000-0000-0000-0000-000000000bbb";
const ITEM = "00000000-0000-0000-0000-000000000ccc";
const OWNER = "owner-user-id";
const CREATOR = "creator-user-id";
const RANDO = "rando-user-id";

const params = (extra?: Record<string, string>) => ({
  params: Promise.resolve({ tabId: TAB, expenseId: EXPENSE, ...(extra ?? {}) }),
});

const itemParams = () => ({
  params: Promise.resolve({ tabId: TAB, expenseId: EXPENSE, itemId: ITEM }),
});

const seedAuthAs = (userId: string) => {
  vi.mocked(getSessionUserId).mockResolvedValue(userId);
  vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: userId } as never);
  vi.mocked(prisma.tab.findUnique).mockResolvedValue({
    id: TAB,
    status: "ACTIVE",
    createdByUserId: OWNER,
  } as never);
  vi.mocked(prisma.participant.findUnique).mockResolvedValue({
    id: "p-" + userId,
    tabId: TAB,
    userId,
  } as never);
};

const buildPostReq = (body: unknown) =>
  new Request(`http://localhost/api/tabs/${TAB}/expenses/${EXPENSE}/receipt/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const buildPatchReq = (body: unknown) =>
  new Request(
    `http://localhost/api/tabs/${TAB}/expenses/${EXPENSE}/receipt/items/${ITEM}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );

const buildDeleteReq = () =>
  new Request(
    `http://localhost/api/tabs/${TAB}/expenses/${EXPENSE}/receipt/items/${ITEM}`,
    { method: "DELETE", headers: { "Content-Type": "application/json" } },
  );

describe("POST /receipt/items", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects unauthenticated requests with 401", async () => {
    vi.mocked(getSessionUserId).mockResolvedValue(null);
    const res = await POST(buildPostReq({ name: "Cubano", priceCents: 862 }), params());
    expect(res.status).toBe(401);
  });

  it("rejects non-creator non-owner participants with 403", async () => {
    seedAuthAs(RANDO);
    vi.mocked(prisma.expense.findFirst).mockResolvedValue({
      id: EXPENSE,
      createdByUserId: CREATOR,
    } as never);
    const res = await POST(buildPostReq({ name: "Cubano", priceCents: 862 }), params());
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error.code).toBe("forbidden");
  });

  it("allows the expense creator to add items", async () => {
    seedAuthAs(CREATOR);
    vi.mocked(prisma.expense.findFirst).mockResolvedValue({
      id: EXPENSE,
      createdByUserId: CREATOR,
    } as never);
    vi.mocked(prisma.receiptItem.aggregate).mockResolvedValue({
      _max: { sortOrder: 4 },
    } as never);
    vi.mocked(prisma.receiptItem.create).mockResolvedValue({
      id: ITEM, name: "Cubano", priceCents: 862, quantity: 1,
    } as never);

    const res = await POST(buildPostReq({ name: "Cubano", priceCents: 862 }), params());
    expect(res.status).toBe(201);
    expect(prisma.receiptItem.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ sortOrder: 5, name: "Cubano", priceCents: 862, quantity: 1 }),
    });
  });

  it("allows the tab owner to add items even if they didn't create the expense", async () => {
    seedAuthAs(OWNER);
    vi.mocked(prisma.expense.findFirst).mockResolvedValue({
      id: EXPENSE,
      createdByUserId: CREATOR,
    } as never);
    vi.mocked(prisma.receiptItem.aggregate).mockResolvedValue({
      _max: { sortOrder: null },
    } as never);
    vi.mocked(prisma.receiptItem.create).mockResolvedValue({
      id: ITEM, name: "Cubano", priceCents: 862, quantity: 1,
    } as never);

    const res = await POST(buildPostReq({ name: "Cubano", priceCents: 862 }), params());
    expect(res.status).toBe(201);
    expect(prisma.receiptItem.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ sortOrder: 0 }),
    });
  });

  it("rejects empty name with 400", async () => {
    seedAuthAs(CREATOR);
    vi.mocked(prisma.expense.findFirst).mockResolvedValue({
      id: EXPENSE, createdByUserId: CREATOR,
    } as never);
    const res = await POST(buildPostReq({ name: "   ", priceCents: 100 }), params());
    expect(res.status).toBe(400);
  });

  it("rejects zero or negative priceCents with 400", async () => {
    seedAuthAs(CREATOR);
    vi.mocked(prisma.expense.findFirst).mockResolvedValue({
      id: EXPENSE, createdByUserId: CREATOR,
    } as never);
    const res = await POST(buildPostReq({ name: "Cubano", priceCents: 0 }), params());
    expect(res.status).toBe(400);
  });

  it("404s when the expense doesn't belong to this tab", async () => {
    seedAuthAs(CREATOR);
    vi.mocked(prisma.expense.findFirst).mockResolvedValue(null);
    const res = await POST(buildPostReq({ name: "Cubano", priceCents: 862 }), params());
    expect(res.status).toBe(404);
  });
});

describe("PATCH /receipt/items/[itemId]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("forbids non-creator non-owner from editing", async () => {
    seedAuthAs(RANDO);
    vi.mocked(prisma.receiptItem.findFirst).mockResolvedValue({
      id: ITEM,
      expense: { tabId: TAB, createdByUserId: CREATOR },
    } as never);
    const res = await ITEM_PATCH(buildPatchReq({ name: "Renamed" }), itemParams());
    expect(res.status).toBe(403);
  });

  it("lets the expense creator edit", async () => {
    seedAuthAs(CREATOR);
    vi.mocked(prisma.receiptItem.findFirst).mockResolvedValue({
      id: ITEM,
      expense: { tabId: TAB, createdByUserId: CREATOR },
    } as never);
    vi.mocked(prisma.receiptItem.update).mockResolvedValue({
      id: ITEM, name: "Renamed", priceCents: 999, quantity: 1, claims: [],
    } as never);
    const res = await ITEM_PATCH(buildPatchReq({ name: "Renamed", priceCents: 999 }), itemParams());
    expect(res.status).toBe(200);
  });

  it("rejects priceCents <= 0", async () => {
    seedAuthAs(CREATOR);
    vi.mocked(prisma.receiptItem.findFirst).mockResolvedValue({
      id: ITEM,
      expense: { tabId: TAB, createdByUserId: CREATOR },
    } as never);
    const res = await ITEM_PATCH(buildPatchReq({ priceCents: -5 }), itemParams());
    expect(res.status).toBe(400);
  });
});

describe("DELETE /receipt/items/[itemId]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("forbids non-creator non-owner from deleting", async () => {
    seedAuthAs(RANDO);
    vi.mocked(prisma.receiptItem.findFirst).mockResolvedValue({
      id: ITEM,
      expense: { tabId: TAB, createdByUserId: CREATOR },
    } as never);
    const res = await ITEM_DELETE(buildDeleteReq(), itemParams());
    expect(res.status).toBe(403);
  });

  it("lets the tab owner delete even if not the creator", async () => {
    seedAuthAs(OWNER);
    vi.mocked(prisma.receiptItem.findFirst).mockResolvedValue({
      id: ITEM,
      expense: { tabId: TAB, createdByUserId: CREATOR },
    } as never);
    vi.mocked(prisma.receiptItem.delete).mockResolvedValue({ id: ITEM } as never);
    const res = await ITEM_DELETE(buildDeleteReq(), itemParams());
    expect(res.status).toBe(200);
  });
});
