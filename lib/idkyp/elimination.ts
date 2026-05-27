import type { Restaurant } from "./types";

export function initialTrio(pool: Restaurant[]): Restaurant[] {
  return pool.slice(0, 3);
}

export function replaceEliminated(
  trio: Restaurant[],
  eliminatedIdx: number,
  pool: Restaurant[],
  alreadyShown: Set<string>
): { trio: Restaurant[]; eliminated: Restaurant; replacement: Restaurant | null } {
  const eliminated = trio[eliminatedIdx];
  const replacement = pool.find((r) => !alreadyShown.has(r.placeId)) ?? null;
  const nextTrio = [...trio];
  if (replacement) {
    nextTrio[eliminatedIdx] = replacement;
  } else {
    nextTrio.splice(eliminatedIdx, 1);
  }
  return { trio: nextTrio, eliminated, replacement };
}

export function pickFinalists(survivors: Restaurant[]): Restaurant[] {
  return [...survivors].sort((a, b) => b.rating - a.rating).slice(0, 2);
}
