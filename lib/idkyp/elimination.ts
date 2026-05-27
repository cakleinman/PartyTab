import type { Restaurant } from "./types";

export function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export type SessionStart = { trio: Restaurant[]; pool: Restaurant[] };

export function startSession(filtered: Restaurant[]): SessionStart | null {
  if (filtered.length < 3) return null;
  const shuffled = shuffle(filtered);
  return { trio: shuffled.slice(0, 3), pool: shuffled.slice(3) };
}

export type EliminationStep =
  | { kind: "next"; trio: Restaurant[]; pool: Restaurant[]; eliminated: Restaurant }
  | { kind: "final"; finalists: Restaurant[]; eliminated: Restaurant };

/**
 * After elimination, reshuffle survivors + remaining pool and deal a fresh
 * trio. This breaks position bias so each round feels like a new draw.
 * When fewer than 3 cards remain total, we surface the two finalists.
 */
export function eliminate(
  trio: Restaurant[],
  pool: Restaurant[],
  idx: number,
): EliminationStep {
  const eliminated = trio[idx];
  const survivors = trio.filter((_, i) => i !== idx);
  const deck = shuffle([...survivors, ...pool]);

  if (deck.length < 3) {
    const finalists = [...deck].sort(
      (a, b) => b.rating - a.rating || b.reviews - a.reviews,
    );
    return { kind: "final", finalists: finalists.slice(0, 2), eliminated };
  }

  return {
    kind: "next",
    trio: deck.slice(0, 3),
    pool: deck.slice(3),
    eliminated,
  };
}
