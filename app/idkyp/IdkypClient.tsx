"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import Link from "next/link";
import { StartScreen } from "./components/StartScreen";
import { FiltersScreen } from "./components/FiltersScreen";
import { EliminateScreen } from "./components/EliminateScreen";
import { Final2Screen } from "./components/Final2Screen";
import { WinnerScreen } from "./components/WinnerScreen";
import { MapScreen } from "./components/MapScreen";
import { recomputeDistances } from "@/lib/idkyp/data";
import { applyFilters } from "@/lib/idkyp/filters";
import { eliminate, startSession } from "@/lib/idkyp/elimination";
import { defaultFilters, MAP_CENTER } from "@/lib/idkyp/types";
import type { Filters, IdkypState, Restaurant, Screen } from "@/lib/idkyp/types";

type AuthState = "loading" | "signed_out" | "signed_in";

type Action =
  | { type: "set_screen"; screen: Screen }
  | { type: "set_filters"; filters: Filters }
  | { type: "set_user_pin"; pin: { lat: number; lng: number } }
  | { type: "start_session"; trio: Restaurant[]; pool: Restaurant[] }
  | { type: "eliminate_next"; trio: Restaurant[]; pool: Restaurant[]; eliminated: Restaurant }
  | { type: "eliminate_final"; finalists: Restaurant[]; eliminated: Restaurant }
  | { type: "pick_winner"; winner: Restaurant }
  | { type: "reset" };

function initialState(): IdkypState {
  return {
    screen: "start",
    filters: defaultFilters(),
    userPin: MAP_CENTER,
    pool: [],
    trio: [],
    eliminated: [],
    finalists: [],
    winner: null,
    isAnimating: false,
    justReplacedIdx: null,
  };
}

function reducer(state: IdkypState, action: Action): IdkypState {
  switch (action.type) {
    case "set_screen":
      return { ...state, screen: action.screen };
    case "set_filters":
      return { ...state, filters: action.filters };
    case "set_user_pin":
      return { ...state, userPin: action.pin };
    case "start_session":
      return {
        ...state,
        screen: "eliminate",
        trio: action.trio,
        pool: action.pool,
        eliminated: [],
        finalists: [],
        winner: null,
      };
    case "eliminate_next":
      return {
        ...state,
        trio: action.trio,
        pool: action.pool,
        eliminated: [...state.eliminated, action.eliminated],
      };
    case "eliminate_final":
      return {
        ...state,
        screen: "final2",
        trio: [],
        pool: [],
        finalists: action.finalists,
        eliminated: [...state.eliminated, action.eliminated],
      };
    case "pick_winner":
      return { ...state, screen: "winner", winner: action.winner };
    case "reset":
      return initialState();
    default:
      return state;
  }
}

export default function IdkypClient() {
  const [auth, setAuth] = useState<AuthState>("loading");
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => setAuth(data?.user?.id ? "signed_in" : "signed_out"))
      .catch(() => setAuth("signed_out"));
  }, []);

  const restaurants = useMemo(() => recomputeDistances(state.userPin), [state.userPin]);
  const filtered = useMemo(
    () => applyFilters(restaurants, state.filters),
    [restaurants, state.filters],
  );

  if (auth === "loading") {
    return <div className="text-ink-500">Loading…</div>;
  }

  if (auth === "signed_out") {
    return (
      <div className="rounded-2xl border border-sand-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-ink-900">IDKYP</h1>
        <p className="mt-2 text-ink-500">I don&apos;t know, you pick. Sign in to use IDKYP.</p>
        <Link
          href="/login"
          className="mt-4 inline-block rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          Log in
        </Link>
      </div>
    );
  }

  switch (state.screen) {
    case "start":
      return <StartScreen onBegin={() => dispatch({ type: "set_screen", screen: "map" })} />;
    case "map":
      return (
        <MapScreen
          userPin={state.userPin}
          restaurants={restaurants}
          radius={state.filters.radius}
          onPinChange={(pin) => dispatch({ type: "set_user_pin", pin })}
          onRadiusChange={(radius) =>
            dispatch({ type: "set_filters", filters: { ...state.filters, radius } })
          }
          onContinue={() => dispatch({ type: "set_screen", screen: "filters" })}
        />
      );
    case "filters":
      return (
        <FiltersScreen
          filters={state.filters}
          matchCount={filtered.length}
          onChange={(filters) => dispatch({ type: "set_filters", filters })}
          onBack={() => dispatch({ type: "set_screen", screen: "map" })}
          onStart={() => {
            const session = startSession(filtered);
            if (!session) return;
            dispatch({ type: "start_session", ...session });
          }}
        />
      );
    case "eliminate":
      return (
        <EliminateScreen
          trio={state.trio}
          eliminatedCount={state.eliminated.length}
          poolSize={state.pool.length}
          onEliminate={(idx) => {
            const step = eliminate(state.trio, state.pool, idx);
            if (step.kind === "next") {
              dispatch({
                type: "eliminate_next",
                trio: step.trio,
                pool: step.pool,
                eliminated: step.eliminated,
              });
            } else {
              dispatch({
                type: "eliminate_final",
                finalists: step.finalists,
                eliminated: step.eliminated,
              });
            }
          }}
          onRestart={() => dispatch({ type: "set_screen", screen: "filters" })}
        />
      );
    case "final2":
      return (
        <Final2Screen
          finalists={state.finalists}
          onPick={(winner) => dispatch({ type: "pick_winner", winner })}
        />
      );
    case "winner":
      if (!state.winner) return null;
      return (
        <WinnerScreen
          winner={state.winner}
          onTryAgain={() => dispatch({ type: "reset" })}
        />
      );
    default:
      return null;
  }
}
