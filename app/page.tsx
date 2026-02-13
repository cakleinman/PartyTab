"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { FaqJsonLd } from "@/app/components/JsonLdSchema";

const PARTICIPANTS = ["You", "Alex", "Jamie", "Sam"];

type Expense = {
  id: string;
  note: string;
  paidBy: string;
  amountCents: number;
  splitWith?: string[];
};

const INITIAL_EXPENSES: Expense[] = [
  { id: "1", note: "Cabin rental", paidBy: "Jamie", amountCents: 80000 },
  { id: "2", note: "Lift tickets", paidBy: "Alex", amountCents: 48000 },
  { id: "3", note: "Groceries", paidBy: "You", amountCents: 15600 },
];

function formatCents(cents: number): string {
  return "$" + (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function InteractiveDemo() {
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [showForm, setShowForm] = useState(false);
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("You");
  const [splitWith, setSplitWith] = useState<string[]>([]);
  const [hasClickedAdd, setHasClickedAdd] = useState(false);
  const noteInputRef = useRef<HTMLInputElement>(null);

  const potentialOwers = PARTICIPANTS.filter((p) => p !== paidBy);

  const totalCents = expenses.reduce((sum, e) => sum + e.amountCents, 0);

  const yourNetCents = expenses.reduce((net, expense) => {
    const peopleWhoOwe = expense.splitWith ?? PARTICIPANTS.filter(p => p !== expense.paidBy);
    const allInvolved = [expense.paidBy, ...peopleWhoOwe];
    const perPersonAmount = Math.round(expense.amountCents / allInvolved.length);

    if (expense.paidBy === "You") {
      const othersOweYou = peopleWhoOwe.length * perPersonAmount;
      return net + othersOweYou;
    } else if (peopleWhoOwe.includes("You")) {
      return net - perPersonAmount;
    }
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
      splitWith: splitWith.length > 0 && splitWith.length < potentialOwers.length ? splitWith : undefined,
    };

    setExpenses([newExpense, ...expenses]);
    setNote("");
    setAmount("");
    setPaidBy("You");
    setSplitWith([]);
    setShowForm(false);
  };

  const toggleOwer = (person: string) => {
    setSplitWith((prev) =>
      prev.includes(person) ? prev.filter((p) => p !== person) : [...prev, person]
    );
  };

  const getSubtext = (expense: Expense) => {
    const peopleWhoOwe = expense.splitWith ?? PARTICIPANTS.filter((p) => p !== expense.paidBy);
    return `${expense.paidBy} paid • ${peopleWhoOwe.length} people owe`;
  };

  useEffect(() => {
    if (showForm && noteInputRef.current) {
      noteInputRef.current.focus();
    }
  }, [showForm]);

  return (
    <div className="interactive-card relative rounded-[2rem] border border-sand-200 bg-white/95 p-4 sm:p-6 shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <p className="text-[9px] font-bold uppercase tracking-widest text-ink-500">LIVE DEMO</p>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">Ski Weekend 🎿</h2>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setHasClickedAdd(true);
          }}
          className={`bg-ink-900 text-white text-[10px] sm:text-xs font-bold px-4 py-2 rounded-full hover:bg-ink-700 transition-colors ${
            !hasClickedAdd && !showForm ? "animate-gentle-pulse" : ""
          }`}
        >
          {showForm ? "Cancel" : "+ Add Expense"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-sand-50 p-3 sm:p-4 rounded-2xl border border-sand-100">
          <p className="text-[9px] uppercase tracking-wider text-ink-500 mb-1">Total Spent</p>
          <p className="text-lg sm:text-xl font-bold text-ink-900">{formatCents(totalCents)}</p>
        </div>
        <div
          className={`p-3 sm:p-4 rounded-2xl border transition-colors ${
            Math.abs(yourNetCents) < 1
              ? "bg-sand-50 border-sand-100"
              : yourNetCents > 0
              ? "bg-teal-50 border-teal-100"
              : "bg-orange-50 border-orange-100"
          }`}
        >
          <p className="text-[9px] uppercase tracking-wider text-ink-500 mb-1">Your Net</p>
          {Math.abs(yourNetCents) < 1 ? (
            <>
              <p className="text-lg sm:text-xl font-bold text-ink-900">Even</p>
              <p className="text-[9px] text-ink-500">You&apos;re squared up</p>
            </>
          ) : yourNetCents > 0 ? (
            <>
              <p className="text-lg sm:text-xl font-bold text-teal-600">+{formatCents(yourNetCents)}</p>
              <p className="text-[9px] text-ink-500">Others owe you</p>
            </>
          ) : (
            <>
              <p className="text-lg sm:text-xl font-bold text-orange-600">-{formatCents(Math.abs(yourNetCents))}</p>
              <p className="text-[9px] text-ink-500">You owe others</p>
            </>
          )}
        </div>
      </div>

      {/* Expense Form */}
      {showForm && (
        <div className="mb-6 bg-teal-50/50 rounded-2xl p-4 border border-teal-200 animate-fade-in-up space-y-4">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wide text-ink-500 font-bold">What was it for?</p>
            <input
              ref={noteInputRef}
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Dinner, Airbnb, etc."
              className="w-full rounded-lg border border-sand-200 bg-white px-3 py-3 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wide text-ink-500 font-bold">How much?</p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-500">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-lg border border-sand-200 bg-white py-3 pl-7 pr-3 text-sm"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wide text-ink-500 font-bold">Paid by</p>
              <select
                value={paidBy}
                onChange={(e) => {
                  setPaidBy(e.target.value);
                  setSplitWith((prev) => prev.filter((p) => p !== e.target.value));
                }}
                className="w-full rounded-lg border border-sand-200 bg-white px-3 py-3 text-sm"
              >
                <option value="You">You paid</option>
                <option value="Alex">Alex paid</option>
                <option value="Jamie">Jamie paid</option>
                <option value="Sam">Sam paid</option>
              </select>
            </div>
          </div>

          {/* Who Owes Section */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-wide text-ink-500 font-bold">Who owes?</p>
            <div className="flex flex-wrap gap-2">
              {potentialOwers.map((person) => {
                const isSelected = splitWith.length === 0 || splitWith.includes(person);
                return (
                  <button
                    key={person}
                    type="button"
                    onClick={() => toggleOwer(person)}
                    className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                      isSelected
                        ? "bg-ink-900 text-white"
                        : "bg-sand-100 text-ink-500 hover:bg-sand-200"
                    }`}
                  >
                    {person}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-ink-300">
              {splitWith.length === 0 || splitWith.length === potentialOwers.length
                ? "Everyone owes"
                : `${splitWith.length} ${splitWith.length === 1 ? "person owes" : "people owe"}`}
            </p>
          </div>

          <button
            onClick={handleAddExpense}
            disabled={!note.trim() || !amount}
            className="w-full rounded-lg bg-teal-600 py-3 text-sm font-bold text-white transition-colors hover:bg-teal-700 shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add to tab
          </button>
        </div>
      )}

      {/* Expense List */}
      <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 no-scrollbar">
        {expenses.slice().reverse().map((expense) => (
          <div
            key={expense.id}
            className="flex items-center justify-between p-3 bg-white border border-sand-100 rounded-xl animate-fade-in-up hover:bg-sand-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-sand-100 flex items-center justify-center text-[10px] font-bold text-ink-700 border border-sand-200">
                {expense.paidBy.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-xs text-ink-900 truncate">{expense.note}</p>
                <p className="text-[9px] text-ink-500 truncate max-w-[120px]">{getSubtext(expense)}</p>
              </div>
            </div>
            <span className="font-bold text-xs text-ink-900">{formatCents(expense.amountCents)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const ACTIVITIES = [
  "Ski weekends",
  "Bachelor parties",
  "Road trips",
  "Group dinners",
  "Roommate bills",
  "Concert tickets",
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
      className={`carousel-text text-teal-600 ${
        isVisible ? "carousel-visible" : "carousel-hidden"
      }`}
    >
      {ACTIVITIES[index]}
    </span>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [tabName, setTabName] = useState("");

  const handleStartTab = (e: React.FormEvent) => {
    e.preventDefault();
    if (tabName.trim()) {
      router.push(`/tabs/new?name=${encodeURIComponent(tabName.trim())}`);
    } else {
      router.push("/tabs/new");
    }
  };

  return (
    <div className="space-y-24 md:space-y-32">
      {/* Hero Section */}
      <section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center pt-8 md:pt-16">
        <div className="space-y-8 md:space-y-10 text-center lg:text-left">
          <div className="space-y-4">
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-ink-500 bg-sand-100 inline-block px-3 py-1 rounded-full">
              Perfect for: <CyclingActivity />
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] text-ink-900">
              Split group expenses.<br />
              <span className="text-teal-600">No app required.</span>
            </h1>
          </div>

          <p className="text-lg md:text-xl text-ink-700 max-w-lg mx-auto lg:mx-0 leading-relaxed">
            Throw expenses in as you go. We track who paid what and figure out the simplest way to settle up at the end.
          </p>

          {/* Start Flow */}
          <form
            onSubmit={handleStartTab}
            className="bg-white p-2 rounded-[2rem] shadow-lg border border-sand-200 max-w-md mx-auto lg:mx-0 flex flex-col sm:flex-row gap-2 group focus-within:ring-4 ring-sand-200/50"
          >
            <input
              type="text"
              value={tabName}
              onChange={(e) => setTabName(e.target.value)}
              placeholder="Name your trip (e.g. Miami 🏖️)"
              className="flex-1 bg-transparent border-none px-6 py-4 text-base md:text-lg placeholder:text-ink-300 rounded-xl focus:shadow-none focus:ring-0"
            />
            <button
              type="submit"
              className="bg-ink-900 text-sand-50 px-8 py-4 rounded-[1.5rem] font-semibold hover:bg-ink-700 transition-colors shrink-0 flex items-center justify-center gap-2 group-focus-within:bg-teal-600 active:scale-95"
            >
              Start Tab <span>&rarr;</span>
            </button>
          </form>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs font-medium text-ink-500 pl-2">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
              App download optional
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
              Free to use
            </span>
          </div>
        </div>

        {/* Interactive Preview */}
        <div className="relative pt-6 max-w-md mx-auto w-full">
          <div className="absolute -top-12 -right-6 w-32 h-32 bg-teal-100 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute bottom-12 -left-8 w-40 h-40 bg-orange-100 rounded-full blur-3xl opacity-60"></div>
          <InteractiveDemo />
        </div>
      </section>

      {/* Comparison Section */}
      <section className="border-t border-sand-200 pt-20">
        <div className="text-center max-w-2xl mx-auto mb-16 px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-ink-900 mb-6">
            The simplest way to split bills with friends.
          </h2>
          <p className="text-lg text-ink-700 leading-relaxed">
            Instead of Alex paying Jamie, and Jamie paying Sam, and Sam paying Alex... PartyTab figures out who owes what and settles everything with the fewest payments.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          {/* Spreadsheet Way */}
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-sand-200 relative overflow-hidden group hover:border-sand-300 transition-colors">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-sand-200"></div>
            <h3 className="text-sm font-bold mb-10 text-ink-500 uppercase tracking-[0.2em] text-center">
              The &quot;Spreadsheet&quot; Way
            </h3>
            <div className="overflow-x-auto no-scrollbar">
              <svg viewBox="0 0 400 200" className="w-full min-w-[320px] h-48 drop-shadow-sm mx-auto">
                <defs>
                  <marker id="arrow-gray" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L9,3 z" fill="#a8a29a" />
                  </marker>
                </defs>
                <circle cx="100" cy="50" r="28" fill="#f5efe2" stroke="#eadfcd" strokeWidth="2" />
                <text x="100" y="55" textAnchor="middle" fontSize="24">🧑‍🦰</text>
                <text x="100" y="95" textAnchor="middle" fontSize="13" fill="#6f6a61" fontWeight="600">Alex</text>
                <circle cx="300" cy="50" r="28" fill="#f5efe2" stroke="#eadfcd" strokeWidth="2" />
                <text x="300" y="55" textAnchor="middle" fontSize="24">👩‍🦱</text>
                <text x="300" y="95" textAnchor="middle" fontSize="13" fill="#6f6a61" fontWeight="600">Jamie</text>
                <circle cx="200" cy="150" r="28" fill="#f5efe2" stroke="#eadfcd" strokeWidth="2" />
                <text x="200" y="155" textAnchor="middle" fontSize="24">🧔</text>
                <text x="200" y="195" textAnchor="middle" fontSize="13" fill="#6f6a61" fontWeight="600">Sam</text>
                <path d="M135,50 L265,50" stroke="#a8a29a" strokeWidth="2" markerEnd="url(#arrow-gray)" strokeDasharray="4" />
                <text x="200" y="40" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#a8a29a">$20</text>
                <path d="M290,75 L225,135" stroke="#a8a29a" strokeWidth="2" markerEnd="url(#arrow-gray)" strokeDasharray="4" />
                <text x="275" y="115" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#a8a29a">$20</text>
                <path d="M175,135 L110,75" stroke="#a8a29a" strokeWidth="2" markerEnd="url(#arrow-gray)" strokeDasharray="4" />
                <text x="125" y="115" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#a8a29a">$15</text>
              </svg>
            </div>
            <div className="mt-6 text-center">
              <span className="inline-block bg-sand-100 text-ink-500 text-xs px-3 py-1 rounded-full font-medium">
                Confusing, right?
              </span>
            </div>
          </div>

          {/* PartyTab Way */}
          <div className="bg-sand-50 rounded-[2rem] p-6 sm:p-8 border border-teal-100 relative overflow-hidden ring-1 ring-teal-100/50">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-teal-600"></div>
            <h3 className="text-sm font-bold mb-10 text-teal-700 uppercase tracking-[0.2em] text-center">
              The PartyTab Way
            </h3>
            <div className="overflow-x-auto no-scrollbar">
              <svg viewBox="0 0 400 200" className="w-full min-w-[320px] h-48 drop-shadow-sm mx-auto">
                <defs>
                  <marker id="arrow-teal" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L9,3 z" fill="#0a776a" />
                  </marker>
                </defs>
                <circle cx="100" cy="50" r="28" fill="#fff" stroke="#0a776a" strokeWidth="2" />
                <text x="100" y="55" textAnchor="middle" fontSize="24">🧑‍🦰</text>
                <text x="100" y="95" textAnchor="middle" fontSize="13" fill="#1b1a18" fontWeight="700">Alex</text>
                <circle cx="300" cy="50" r="28" fill="#fff" stroke="#0a776a" strokeWidth="2" />
                <text x="300" y="55" textAnchor="middle" fontSize="24">👩‍🦱</text>
                <text x="300" y="95" textAnchor="middle" fontSize="13" fill="#1b1a18" fontWeight="700">Jamie</text>
                <circle cx="200" cy="150" r="28" fill="#fff" stroke="#0a776a" strokeWidth="2" />
                <text x="200" y="155" textAnchor="middle" fontSize="24">🧔</text>
                <text x="200" y="195" textAnchor="middle" fontSize="13" fill="#1b1a18" fontWeight="700">Sam</text>
                <path d="M125,70 L175,120" stroke="#0a776a" strokeWidth="3" markerEnd="url(#arrow-teal)" className="flow-line" />
                <rect x="132" y="90" width="36" height="20" rx="6" fill="#fff" stroke="#0a776a" strokeWidth="1.5" />
                <text x="150" y="104" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#0a776a">$5</text>
              </svg>
            </div>
            <div className="mt-6 text-center">
              <span className="inline-block bg-teal-100 text-teal-800 text-xs px-3 py-1 rounded-full font-bold">
                One simple payment settles everything.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t border-sand-200 pt-20">
        <FaqJsonLd />
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-ink-900 mb-4 text-center">
            Frequently asked questions about bill splitting
          </h2>
          <p className="text-center text-ink-500 mb-12">
            Everything you need to know about splitting expenses with PartyTab.
          </p>
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-sand-200">
              <h3 className="font-semibold text-ink-900 mb-2">
                Is PartyTab free?
              </h3>
              <p className="text-ink-600">
                Yes! PartyTab is completely free to use with no ads. Create tabs, add expenses, and settle up at no cost. PartyTab Pro adds premium features like AI receipt scanning and payment reminders.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-sand-200">
              <h3 className="font-semibold text-ink-900 mb-2">
                Do my friends need to download an app?
              </h3>
              <p className="text-ink-600">
                No. PartyTab works entirely in the browser. Just share a link and anyone can view the tab and add expenses&mdash;no download, no sign-up required.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-sand-200">
              <h3 className="font-semibold text-ink-900 mb-2">
                How does PartyTab calculate who owes what?
              </h3>
              <p className="text-ink-600">
                PartyTab uses a smart settlement algorithm that minimizes the number of payments needed. Instead of everyone paying everyone else, we figure out the fewest possible transfers to settle all debts.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-sand-200">
              <h3 className="font-semibold text-ink-900 mb-2">
                Can I use PartyTab for roommate expenses?
              </h3>
              <p className="text-ink-600">
                Absolutely. PartyTab works great for recurring roommate expenses like rent, utilities, and groceries. Create a tab for your household and log expenses as they come up.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-sand-200">
              <h3 className="font-semibold text-ink-900 mb-2">
                What makes PartyTab different from Splitwise?
              </h3>
              <p className="text-ink-600">
                PartyTab works in your browser with no app download needed. It&apos;s free with no ads, and anyone can join a tab via a shared link without creating an account. <a href="/compare/splitwise" className="text-teal-600 hover:underline">See the full comparison</a>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="rounded-[2rem] md:rounded-[2.5rem] bg-ink-900 px-6 py-12 md:py-16 text-center shadow-xl mb-8 md:mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-sand-50 mb-4">
          Start splitting expenses in seconds.
        </h2>
        <p className="text-ink-300 mb-8 max-w-lg mx-auto text-sm sm:text-base">
          Create a tab in seconds. App download optional.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/tabs/new"
            className="bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-700 transition-colors shadow-lg active:scale-95 inline-block"
          >
            Start a PartyTab
          </Link>
        </div>
      </section>
    </div>
  );
}
