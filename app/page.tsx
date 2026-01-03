"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";

const PARTICIPANTS = ["You", "Alex", "Jamie", "Sam"];

type Expense = {
  id: string;
  note: string;
  paidBy: string;
  amountCents: number;
  splitWith?: string[]; // If undefined, split with everyone; otherwise only these people owe
};

const INITIAL_EXPENSES: Expense[] = [
  { id: "1", note: "Cabin rental", paidBy: "Jamie", amountCents: 80000 }, // Everyone splits
  { id: "2", note: "Lift tickets", paidBy: "Alex", amountCents: 48000 }, // Everyone splits
  { id: "3", note: "Ski rentals", paidBy: "You", amountCents: 32000, splitWith: ["Alex", "Jamie"] }, // Only Alex & Jamie rented
  { id: "4", note: "Dinner at the lodge", paidBy: "Alex", amountCents: 18000 }, // Everyone splits
  { id: "5", note: "Uber to airport", paidBy: "Sam", amountCents: 4500, splitWith: ["You"] }, // Just You owes Sam
  { id: "6", note: "Groceries", paidBy: "Sam", amountCents: 15600 }, // Everyone splits
];

function formatCents(cents: number): string {
  return "$" + (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function SkiWeekendPreview() {
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [showForm, setShowForm] = useState(false);
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("You");
  const formRef = useRef<HTMLDivElement>(null);

  // Calculate totals
  const totalCents = expenses.reduce((sum, e) => sum + e.amountCents, 0);

  // Calculate "Your" net position properly accounting for splits
  // Net = (what you paid) - (what you owe from all expenses you're part of)
  const yourNetCents = expenses.reduce((net, expense) => {
    // Get who's involved in this expense (payer + people who owe)
    const peopleWhoOwe = expense.splitWith ?? PARTICIPANTS.filter(p => p !== expense.paidBy);
    const allInvolved = [expense.paidBy, ...peopleWhoOwe];
    const perPersonAmount = Math.round(expense.amountCents / allInvolved.length);

    if (expense.paidBy === "You") {
      // You paid, so others owe you their shares
      const othersOweYou = peopleWhoOwe.length * perPersonAmount;
      return net + othersOweYou;
    } else if (peopleWhoOwe.includes("You")) {
      // You owe this payer your share
      return net - perPersonAmount;
    }
    // You're not involved in this expense
    return net;
  }, 0);

  const handleAddExpense = () => {
    const amountCents = Math.round(parseFloat(amount) * 100);
    if (!note.trim() || isNaN(amountCents) || amountCents <= 0) return;

    const newExpense: Expense = {
      id: Date.now().toString(),
      note: note.trim(),
      paidBy,
      amountCents,
    };

    setExpenses([newExpense, ...expenses]);
    setNote("");
    setAmount("");
    setPaidBy("You");
    setShowForm(false);
  };

  const getOwedByText = (expense: Expense) => {
    // If splitWith is defined, only those people owe; otherwise everyone except payer
    const peopleWhoOwe = expense.splitWith ?? PARTICIPANTS.filter((p) => p !== expense.paidBy);
    if (peopleWhoOwe.length === 1) return peopleWhoOwe[0];
    if (peopleWhoOwe.length === 2) return peopleWhoOwe.join(" & ");
    return `${peopleWhoOwe.length} people`;
  };

  return (
    <div className="relative rounded-3xl border border-sand-200 bg-white/80 p-5 shadow-sm">
      <span className="absolute -top-3 left-4 rounded-full bg-ink-900 px-3 py-1 text-xs font-medium uppercase tracking-wide text-sand-50">
        Try it
      </span>
      <div className="space-y-4">
        {/* Tab header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-ink-500">ACTIVE</p>
            <h2 className="text-xl font-semibold text-ink-900">Ski Weekend</h2>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-full bg-ink-900 px-3 py-1.5 text-xs font-semibold text-sand-50 transition-transform hover:scale-105 active:scale-95"
          >
            {showForm ? "Cancel" : "+ Add expense"}
          </button>
        </div>

        {/* Add expense form */}
        {showForm && (
          <div ref={formRef} className="rounded-2xl border border-teal-200 bg-teal-50/50 p-3 space-y-3">
            <input
              type="text"
              placeholder="What was it for?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm focus:border-teal-400 focus:outline-none"
              autoFocus
            />
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-500">$</span>
                <input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-lg border border-sand-200 bg-white py-2 pl-7 pr-3 text-sm focus:border-teal-400 focus:outline-none"
                  min="0"
                  step="0.01"
                />
              </div>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm focus:border-teal-400 focus:outline-none"
              >
                {PARTICIPANTS.map((p) => (
                  <option key={p} value={p}>
                    {p === "You" ? "You paid" : `${p} paid`}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAddExpense}
              disabled={!note.trim() || !amount}
              className="w-full rounded-lg bg-teal-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to tab
            </button>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-sand-200 bg-sand-50/50 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-[0.15em] text-ink-500">Group total</p>
            <p className="mt-1 text-lg font-semibold">{formatCents(totalCents)}</p>
            <p className="text-[10px] text-ink-500">{expenses.length} expense{expenses.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="rounded-2xl border border-sand-200 bg-sand-50/50 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-[0.15em] text-ink-500">Your net</p>
            {yourNetCents === 0 ? (
              <>
                <p className="mt-1 text-lg font-semibold">Even</p>
                <p className="text-[10px] text-ink-500">You&apos;re squared up</p>
              </>
            ) : yourNetCents > 0 ? (
              <>
                <p className="mt-1 text-lg font-semibold text-green-600">+{formatCents(yourNetCents)}</p>
                <p className="text-[10px] text-ink-500">Others owe you</p>
              </>
            ) : (
              <>
                <p className="mt-1 text-lg font-semibold text-red-600">-{formatCents(Math.abs(yourNetCents))}</p>
                <p className="text-[10px] text-ink-500">You owe others</p>
              </>
            )}
          </div>
        </div>

        {/* Recent expenses */}
        <div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-ink-700">Recent expenses</p>
            <span className="text-[10px] text-ink-500">{expenses.length} total</span>
          </div>
          <div className="mt-2 space-y-2 max-h-[200px] overflow-y-auto">
            {expenses.slice(0, 5).map((expense) => (
              <div
                key={expense.id}
                className="rounded-xl border border-sand-200 bg-white px-3 py-2 transition-all animate-in fade-in slide-in-from-top-1 duration-200"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-ink-700">{expense.note}</p>
                    <p className="truncate text-[10px] text-ink-500">
                      {getOwedByText(expense)} → {expense.paidBy}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-ink-700">{formatCents(expense.amountCents)}</span>
                </div>
              </div>
            ))}
          </div>
          {expenses.length > 5 && (
            <p className="mt-2 text-center text-[10px] text-ink-500">
              + {expenses.length - 5} more expense{expenses.length - 5 !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const ACTIVITIES = [
  "Trips to Cabo",
  "Roommate bills",
  "Group dinners",
  "Bachelor parties",
  "Ski weekends",
  "Concert tickets",
  "Birthday dinners",
  "Beach houses",
  "Euro trips",
  "Wedding weekends",
  "Camping trips",
  "Fantasy football leagues",
  "Bachelorettes in Nashville",
  "Lake house summers",
  "Golf trips",
  "Friendsgivings",
  "Road trips to Joshua Tree",
  "Coachella houses",
  "Two weeks in Thailand",
  "Monthly book clubs",
  "Graduation parties",
  "Family reunions",
  "Airbnbs in Tulum",
  "Summer share houses",
  "Fishing trips",
  "Vegas weekends",
];

function CyclingActivity() {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % ACTIVITIES.length);
        setIsVisible(true);
      }, 300);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className={`inline-block text-teal-600 transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      }`}
    >
      {ACTIVITIES[index]}
    </span>
  );
}

export default function LandingPage() {
  return (
    <div className="space-y-16">
      {/* Hero section with ski weekend preview */}
      <section className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.35em] text-ink-500">
            Perfect for: <CyclingActivity />
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-ink-900 md:text-5xl">
            Turn a mess of IOUs into a few simple payments.
          </h1>
          <p className="text-lg text-ink-700">
            PartyTab automatically untangles group expenses—so instead of
            everyone paying everyone, only the right people pay the right
            amounts.
          </p>
          <p className="text-sm text-ink-500">
            Holiday trip with 8 people? That IOU chaos collapses into clean,
            minimal payments.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/tabs/new"
              className="btn-primary rounded-full px-6 py-3 text-sm font-semibold"
            >
              Start a PartyTab
            </Link>
            <a
              href="#how"
              className="btn-secondary rounded-full px-6 py-3 text-sm font-semibold"
            >
              See how it works
            </a>
          </div>
          <div className="grid gap-3 pt-4 text-sm text-ink-500">
            <p>Automatically resolves circular debts</p>
            <p>Minimizes total payments · Everyone ends at zero</p>
            <p>Designed for trips, roommates, and groups</p>
          </div>
        </div>

        {/* Interactive Ski Weekend Preview */}
        <SkiWeekendPreview />
      </section>

      {/* Example diagram section */}
      <section className="grid gap-10 lg:grid-cols-2">
        <div className="relative rounded-3xl border border-sand-200 bg-white/80 p-6 shadow-sm">
          <span className="absolute -top-3 left-4 rounded-full bg-sand-200 px-3 py-1 text-xs font-medium uppercase tracking-wide text-ink-500">
            How it works
          </span>
          <div className="space-y-6">
            <div className="grid gap-4 rounded-2xl bg-sand-100 p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3 rounded-2xl bg-white px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-ink-500">
                    The problem
                  </p>
                  <svg
                    viewBox="0 0 220 160"
                    className="h-32 w-full"
                    aria-label="A owes B, B owes C, C owes A"
                  >
                    <defs>
                      <marker
                        id="arrow"
                        markerWidth="8"
                        markerHeight="8"
                        refX="6"
                        refY="3"
                        orient="auto"
                      >
                        <path d="M0,0 L6,3 L0,6 z" fill="#6f6a61" />
                      </marker>
                    </defs>
                    <circle cx="40" cy="30" r="18" fill="#eadfcd" />
                    <circle cx="180" cy="30" r="18" fill="#eadfcd" />
                    <circle cx="110" cy="130" r="18" fill="#eadfcd" />
                    <text x="40" y="35" textAnchor="middle" fontSize="14">
                      A
                    </text>
                    <text x="180" y="35" textAnchor="middle" fontSize="14">
                      B
                    </text>
                    <text x="110" y="135" textAnchor="middle" fontSize="14">
                      C
                    </text>
                    <line
                      x1="60"
                      y1="30"
                      x2="160"
                      y2="30"
                      className="flow-line flow-line-muted"
                      strokeWidth="2"
                      markerEnd="url(#arrow)"
                    />
                    <line
                      x1="170"
                      y1="48"
                      x2="120"
                      y2="112"
                      className="flow-line flow-line-muted"
                      strokeWidth="2"
                      markerEnd="url(#arrow)"
                    />
                    <line
                      x1="100"
                      y1="112"
                      x2="50"
                      y2="48"
                      className="flow-line flow-line-muted"
                      strokeWidth="2"
                      markerEnd="url(#arrow)"
                    />
                  </svg>
                  <p className="text-sm text-ink-500">
                    A owes B. B owes C. C owes A.
                  </p>
                </div>
                <div className="space-y-3 rounded-2xl bg-white px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-ink-500">
                    PartyTab solution
                  </p>
                  <svg
                    viewBox="0 0 220 160"
                    className="h-32 w-full"
                    aria-label="PartyTab settles with fewer payments"
                  >
                    <defs>
                      <marker
                        id="arrow-solution"
                        markerWidth="8"
                        markerHeight="8"
                        refX="6"
                        refY="3"
                        orient="auto"
                      >
                        <path d="M0,0 L6,3 L0,6 z" fill="#54b9a7" />
                      </marker>
                    </defs>
                    <circle cx="40" cy="30" r="18" fill="#eadfcd" />
                    <circle cx="180" cy="30" r="18" fill="#eadfcd" />
                    <circle cx="110" cy="130" r="18" fill="#eadfcd" />
                    <text x="40" y="35" textAnchor="middle" fontSize="14">
                      A
                    </text>
                    <text x="180" y="35" textAnchor="middle" fontSize="14">
                      B
                    </text>
                    <text x="110" y="135" textAnchor="middle" fontSize="14">
                      C
                    </text>
                    <line
                      x1="58"
                      y1="34"
                      x2="160"
                      y2="34"
                      className="flow-line flow-line-accent"
                      strokeWidth="3"
                      markerEnd="url(#arrow-solution)"
                    />
                    <line
                      x1="52"
                      y1="46"
                      x2="100"
                      y2="118"
                      className="flow-line flow-line-accent delay-line"
                      strokeWidth="3"
                      markerEnd="url(#arrow-solution)"
                    />
                  </svg>
                  <p className="text-sm text-ink-500">
                    PartyTab settles this with one smaller payment instead of
                    three.
                  </p>
                </div>
              </div>
              <p className="text-xs text-ink-500">
                No spreadsheets, calculators, or awkward math. Just clean settlement.
              </p>
            </div>
            <div className="grid gap-4 rounded-2xl bg-sand-100 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">
                Group dinner
              </p>
              <div className="rounded-2xl bg-white px-4 py-4">
                <svg
                  viewBox="0 0 280 140"
                  className="h-28 w-full"
                  aria-label="One person pays, everyone settles up"
                >
                  <defs>
                    <marker
                      id="arrow-dinner"
                      markerWidth="8"
                      markerHeight="8"
                      refX="6"
                      refY="3"
                      orient="auto"
                    >
                      <path d="M0,0 L6,3 L0,6 z" fill="#54b9a7" />
                    </marker>
                  </defs>
                  {/* Payer in center */}
                  <circle cx="140" cy="70" r="22" fill="#54b9a7" />
                  <text x="140" y="75" textAnchor="middle" fontSize="12" fill="white" fontWeight="600">
                    Paid
                  </text>
                  {/* People around the table - labels read A-F left to right */}
                  <circle cx="40" cy="100" r="16" fill="#eadfcd" />
                  <text x="40" y="105" textAnchor="middle" fontSize="12">A</text>
                  <circle cx="40" cy="40" r="16" fill="#eadfcd" />
                  <text x="40" y="45" textAnchor="middle" fontSize="12">B</text>
                  <circle cx="100" cy="20" r="16" fill="#eadfcd" />
                  <text x="100" y="25" textAnchor="middle" fontSize="12">C</text>
                  <circle cx="180" cy="20" r="16" fill="#eadfcd" />
                  <text x="180" y="25" textAnchor="middle" fontSize="12">D</text>
                  <circle cx="240" cy="40" r="16" fill="#eadfcd" />
                  <text x="240" y="45" textAnchor="middle" fontSize="12">E</text>
                  <circle cx="240" cy="100" r="16" fill="#eadfcd" />
                  <text x="240" y="105" textAnchor="middle" fontSize="12">F</text>
                  {/* Arrows pointing to payer */}
                  <line x1="56" y1="48" x2="118" y2="62" className="flow-line flow-line-accent" strokeWidth="2" markerEnd="url(#arrow-dinner)" />
                  <line x1="108" y1="34" x2="126" y2="52" className="flow-line flow-line-accent delay-line" strokeWidth="2" markerEnd="url(#arrow-dinner)" />
                  <line x1="172" y1="34" x2="154" y2="52" className="flow-line flow-line-accent" strokeWidth="2" markerEnd="url(#arrow-dinner)" />
                  <line x1="224" y1="48" x2="162" y2="62" className="flow-line flow-line-accent delay-line" strokeWidth="2" markerEnd="url(#arrow-dinner)" />
                  <line x1="224" y1="92" x2="162" y2="78" className="flow-line flow-line-accent" strokeWidth="2" markerEnd="url(#arrow-dinner)" />
                  <line x1="56" y1="92" x2="118" y2="78" className="flow-line flow-line-accent delay-line" strokeWidth="2" markerEnd="url(#arrow-dinner)" />
                </svg>
              </div>
              <p className="text-xs text-ink-500">
                One person covers the bill. PartyTab calculates each share and tracks who&apos;s settled.
              </p>
            </div>
          </div>
        </div>

        {/* Explanation card */}
        <div className="space-y-6 rounded-3xl border border-sand-200 bg-white/80 p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-ink-500">
              The mechanic
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink-900">
              Group expenses create circles. PartyTab breaks them.
            </h2>
          </div>
          <p className="text-sm text-ink-700">
            When money moves through a group, debts overlap and loop back on
            themselves. PartyTab finds those loops and collapses them—so fewer
            payments move, and everyone ends up square.
          </p>
          <div className="space-y-3 border-t border-sand-200 pt-4 text-sm text-ink-600">
            <p>Automatically resolves circular debts</p>
            <p>Minimizes total payments</p>
            <p>Everyone ends at zero</p>
          </div>
        </div>
      </section>

      <section id="how" className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-sand-200 bg-white/80 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-500">
            Before PartyTab
          </p>
          <ul className="mt-4 space-y-2 text-sm text-ink-700">
            <li>Alex pays Jamie $40</li>
            <li>Jamie pays Chris $30</li>
            <li>Chris pays Alex $20</li>
          </ul>
          <p className="mt-4 text-sm text-ink-500">
            Three payments. Money going in circles.
          </p>
        </div>
        <div className="rounded-3xl border border-sand-200 bg-sand-100 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-500">
            After PartyTab
          </p>
          <ul className="mt-4 space-y-2 text-sm text-ink-700">
            <li>Alex pays Jamie $20</li>
            <li>Alex pays Chris $10</li>
          </ul>
          <p className="mt-4 text-sm text-ink-500">
            Same result. Fewer payments. Less hassle.
          </p>
        </div>
        <p className="text-xs text-ink-500 lg:col-span-2">
          PartyTab minimizes both the number of payments and the total money
          that needs to move.
        </p>
      </section>

      <section className="rounded-3xl border border-sand-200 bg-white/80 p-8 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-ink-500">
          Stop chasing payments
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-ink-900">
          Create a PartyTab, add expenses, and let the math disappear.
        </h2>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link
            href="/tabs/new"
            className="btn-primary rounded-full px-6 py-3 text-sm font-semibold"
          >
            Start a PartyTab
          </Link>
        </div>
      </section>
      <style jsx>{`
        .flow-line {
          stroke-dasharray: 6 6;
          animation: flow 3s linear infinite;
        }

        .flow-line-muted {
          stroke: #6f6a61;
        }

        .flow-line-accent {
          stroke: #54b9a7;
        }

        .delay-line {
          animation-delay: 0.6s;
        }

        @keyframes flow {
          to {
            stroke-dashoffset: -24;
          }
        }
      `}</style>
    </div>
  );
}
