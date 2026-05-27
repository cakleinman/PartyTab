"use client";

import type { Restaurant } from "@/lib/idkyp/types";

type Props = {
  finalists: Restaurant[];
  onPick: (winner: Restaurant) => void;
};

export function Final2Screen({ finalists, onPick }: Props) {
  if (finalists.length < 2) {
    if (finalists.length === 1) onPick(finalists[0]);
    return null;
  }

  const [a, b] = finalists;
  const badges = computeBadges(a, b);

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-400">final two</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink-900">
          You&apos;re going to one of these.
        </h2>
        <p className="mt-1 text-sm text-ink-500">Tap the winner.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FinalCard restaurant={a} badges={badges.a} onClick={() => onPick(a)} />
        <FinalCard restaurant={b} badges={badges.b} onClick={() => onPick(b)} />
      </div>
    </div>
  );
}

function FinalCard({
  restaurant,
  badges,
  onClick,
}: {
  restaurant: Restaurant;
  badges: string[];
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Pick ${restaurant.name}`}
      className="group block overflow-hidden rounded-2xl border border-sand-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div
        className="aspect-[4/3] w-full bg-cover bg-center"
        style={{ backgroundImage: `url('${restaurant.photo}')` }}
      />
      <div className="space-y-2 p-4">
        <p className="text-xs uppercase tracking-wide text-ink-500">{restaurant.cuisine}</p>
        <p className="text-lg font-semibold text-ink-900">{restaurant.name}</p>
        <p className="text-xs text-ink-500">
          ★ {restaurant.rating.toFixed(1)} · {"$".repeat(restaurant.price)} ·{" "}
          {restaurant.distance.toFixed(1)} mi
        </p>
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {badges.map((b) => (
              <span
                key={b}
                className="rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-700"
              >
                {b}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

function computeBadges(a: Restaurant, b: Restaurant): { a: string[]; b: string[] } {
  const result = { a: [] as string[], b: [] as string[] };
  if (a.distance < b.distance) result.a.push("Closer");
  else if (b.distance < a.distance) result.b.push("Closer");

  if (a.price < b.price) result.a.push("Cheaper");
  else if (b.price < a.price) result.b.push("Cheaper");

  if (a.rating > b.rating) result.a.push("Higher rated");
  else if (b.rating > a.rating) result.b.push("Higher rated");

  if (a.reviews > b.reviews * 1.5) result.a.push("More popular");
  else if (b.reviews > a.reviews * 1.5) result.b.push("More popular");

  return result;
}
