"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import Link from "next/link";
import { StartScreen } from "./components/StartScreen";
import { FiltersScreen } from "./components/FiltersScreen";
import { EliminateScreen } from "./components/EliminateScreen";
import { Final2Screen } from "./components/Final2Screen";
import { WinnerScreen } from "./components/WinnerScreen";
import { MapScreen } from "./components/MapScreen";
import { applyFilters } from "@/lib/idkyp/filters";
import { eliminate, startSession } from "@/lib/idkyp/elimination";
import { defaultFilters, MAP_CENTER } from "@/lib/idkyp/types";
import type { Filters, IdkypState, LatLng, Restaurant, Screen } from "@/lib/idkyp/types";

type AuthState = "loading" | "signed_out" | "signed_in";

export type Quota = {
  used: number;
  limit: number | null;
  remaining: number | null;
  unlimited: boolean;
};

export type GeoStatus =
  | "unknown"        // initial — haven't asked yet
  | "requesting"     // permission prompt or position fetch in flight
  | "granted"        // we have a real user position
  | "denied"         // user said no
  | "unavailable";   // browser API missing, timeout, or other error

type ClientState = IdkypState & {
  searchResults: Restaurant[];
  searchMode: "live" | "demo" | null;
  searchLoading: boolean;
  searchError: string | null;
  quota: Quota | null;
  geoStatus: GeoStatus;
};

type Action =
  | { type: "set_screen"; screen: Screen }
  | { type: "set_filters"; filters: Filters }
  | { type: "set_user_pin"; pin: LatLng }
  | { type: "set_search_loading" }
  | {
      type: "set_search_results";
      restaurants: Restaurant[];
      mode: "live" | "demo";
    }
  | { type: "set_search_error"; message: string }
  | { type: "set_quota"; quota: Quota }
  | { type: "set_geo_status"; status: GeoStatus }
  | { type: "start_session"; trio: Restaurant[]; pool: Restaurant[] }
  | { type: "eliminate_next"; trio: Restaurant[]; pool: Restaurant[]; eliminated: Restaurant }
  | { type: "eliminate_final"; finalists: Restaurant[]; eliminated: Restaurant }
  | { type: "pick_winner"; winner: Restaurant }
  | { type: "reset_to_filters" }
  | { type: "reset" };

function initialState(): ClientState {
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
    searchResults: [],
    searchMode: null,
    searchLoading: false,
    searchError: null,
    quota: null,
    geoStatus: "unknown",
  };
}

function reducer(state: ClientState, action: Action): ClientState {
  switch (action.type) {
    case "set_screen":
      return { ...state, screen: action.screen };
    case "set_filters":
      return { ...state, filters: action.filters };
    case "set_user_pin":
      return { ...state, userPin: action.pin };
    case "set_search_loading":
      return { ...state, searchLoading: true, searchError: null };
    case "set_search_results":
      return {
        ...state,
        searchResults: action.restaurants,
        searchMode: action.mode,
        searchLoading: false,
        searchError: null,
      };
    case "set_search_error":
      return { ...state, searchLoading: false, searchError: action.message };
    case "set_quota":
      return { ...state, quota: action.quota };
    case "set_geo_status":
      return { ...state, geoStatus: action.status };
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
    case "reset_to_filters":
      return { ...state, screen: "filters", trio: [], pool: [], eliminated: [], finalists: [] };
    case "reset":
      return {
        ...initialState(),
        screen: "map",
        userPin: state.userPin,
        searchResults: state.searchResults,
        searchMode: state.searchMode,
        quota: state.quota,
        geoStatus: state.geoStatus,
      };
    default:
      return state;
  }
}

export default function IdkypClient() {
  const [auth, setAuth] = useState<AuthState>("loading");
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  // Browser-history sync. Each screen transition pushes a history entry so
  // the back gesture rewinds one step inside IDKYP (start → map → filters
  // → eliminate → final2 → winner) instead of leaving /idkyp entirely.
  // The screenRef tracks the last screen we observed; suppressPushRef
  // skips the next push when the change itself came from popstate (so a
  // back gesture doesn't immediately re-push the screen we just left).
  const screenRef = useRef<Screen>(state.screen);
  const suppressPushRef = useRef(false);

  useEffect(() => {
    if (state.screen === screenRef.current) return;
    if (suppressPushRef.current) {
      suppressPushRef.current = false;
    } else if (screenRef.current === "eliminate" && state.screen === "final2") {
      // Auto-transition (last card eliminated). Replace rather than push so
      // back from final2 lands on filters, not on eliminate with empty trio.
      window.history.replaceState({ __idkypScreen: state.screen }, "");
    } else {
      window.history.pushState({ __idkypScreen: state.screen }, "");
    }
    screenRef.current = state.screen;
  }, [state.screen]);

  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const next =
        ((e.state as { __idkypScreen?: Screen } | null)?.__idkypScreen as Screen | undefined) ??
        "start";
      if (next === screenRef.current) return;
      suppressPushRef.current = true;
      dispatch({ type: "set_screen", screen: next });
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Try-again resets game state and goes back to map. We REPLACE history
  // here so a subsequent back gesture doesn't land on a stale winner entry
  // with state.winner already cleared.
  const tryAgain = useCallback(() => {
    window.history.replaceState({ __idkypScreen: "map" }, "");
    suppressPushRef.current = true;
    dispatch({ type: "reset" });
  }, []);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => setAuth(data?.user?.id ? "signed_in" : "signed_out"))
      .catch(() => setAuth("signed_out"));
  }, []);

  // Fetch usage quota once auth is known
  useEffect(() => {
    if (auth !== "signed_in") return;
    fetch("/api/idkyp/usage")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Quota | null) => {
        if (data) dispatch({ type: "set_quota", quota: data });
      })
      .catch(() => {
        // Non-blocking — if usage fetch fails, treat as unknown (no banner)
      });
  }, [auth]);

  const recordDecision = useCallback(
    async (winner: Restaurant, filters: Filters) => {
      try {
        const res = await fetch("/api/idkyp/decisions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            winnerPlaceId: winner.placeId,
            winnerName: winner.name,
            winnerLat: winner.lat,
            winnerLng: winner.lng,
            filtersSnapshot: filters,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as Quota;
          dispatch({ type: "set_quota", quota: data });
        }
      } catch {
        // Fire-and-forget; user already saw the winner
      }
    },
    [],
  );

  const requestLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      dispatch({ type: "set_geo_status", status: "unavailable" });
      return;
    }
    dispatch({ type: "set_geo_status", status: "requesting" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        dispatch({
          type: "set_user_pin",
          pin: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        });
        dispatch({ type: "set_geo_status", status: "granted" });
      },
      (err) => {
        dispatch({
          type: "set_geo_status",
          status: err.code === err.PERMISSION_DENIED ? "denied" : "unavailable",
        });
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
  }, []);

  // Auto-request location the first time we enter the map screen
  useEffect(() => {
    if (auth !== "signed_in") return;
    if (state.screen !== "map") return;
    if (state.geoStatus !== "unknown") return;
    requestLocation();
  }, [auth, state.screen, state.geoStatus, requestLocation]);

  const searchHere = useCallback(
    async (pin: LatLng, radiusMiles: number) => {
      dispatch({ type: "set_search_loading" });
      try {
        const res = await fetch("/api/idkyp/places", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat: pin.lat, lng: pin.lng, radiusMiles }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as {
          restaurants: Restaurant[];
          mode: "live" | "demo";
        };
        dispatch({
          type: "set_search_results",
          restaurants: data.restaurants,
          mode: data.mode,
        });
      } catch (e) {
        dispatch({
          type: "set_search_error",
          message: e instanceof Error ? e.message : "Search failed",
        });
      }
    },
    [],
  );

  // Auto-fetch on map entry AND on subsequent pin/radius changes.
  // Waits for geolocation to resolve so we don't waste a call on MAP_CENTER.
  // Initial fetch fires immediately; subsequent (pin drag, radius slider)
  // are debounced 600 ms to coalesce rapid changes. The lastSearched ref
  // skips redundant identical fetches.
  const lastSearched = useRef<{ lat: number; lng: number; radius: number } | null>(null);
  useEffect(() => {
    if (auth !== "signed_in") return;
    if (state.screen !== "map") return;
    if (state.geoStatus === "unknown" || state.geoStatus === "requesting") return;

    const next = {
      lat: state.userPin.lat,
      lng: state.userPin.lng,
      radius: state.filters.radius,
    };
    const prev = lastSearched.current;
    if (prev && prev.lat === next.lat && prev.lng === next.lng && prev.radius === next.radius) {
      return;
    }

    const delay = prev ? 600 : 0;
    const handle = window.setTimeout(() => {
      lastSearched.current = next;
      void searchHere({ lat: next.lat, lng: next.lng }, next.radius);
    }, delay);
    return () => window.clearTimeout(handle);
  }, [
    auth,
    state.screen,
    state.geoStatus,
    state.userPin.lat,
    state.userPin.lng,
    state.filters.radius,
    searchHere,
  ]);

  const filtered = useMemo(
    () => applyFilters(state.searchResults, state.filters),
    [state.searchResults, state.filters],
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
          restaurants={state.searchResults}
          filters={state.filters}
          mode={state.searchMode}
          loading={state.searchLoading}
          errorMessage={state.searchError}
          geoStatus={state.geoStatus}
          onPinChange={(pin) => dispatch({ type: "set_user_pin", pin })}
          onFiltersChange={(filters) => dispatch({ type: "set_filters", filters })}
          onSearchHere={() => searchHere(state.userPin, state.filters.radius)}
          onRequestLocation={requestLocation}
          onContinue={() => dispatch({ type: "set_screen", screen: "filters" })}
        />
      );
    case "filters":
      return (
        <FiltersScreen
          filters={state.filters}
          allRestaurants={state.searchResults}
          matchCount={filtered.length}
          quota={state.quota}
          onChange={(filters) => dispatch({ type: "set_filters", filters })}
          onBack={() => window.history.back()}
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
          onRestart={() => window.history.back()}
        />
      );
    case "final2":
      return (
        <Final2Screen
          finalists={state.finalists}
          onPick={(winner) => {
            dispatch({ type: "pick_winner", winner });
            void recordDecision(winner, state.filters);
          }}
        />
      );
    case "winner":
      if (!state.winner) return null;
      return (
        <WinnerScreen
          winner={state.winner}
          filters={state.filters}
          onTryAgain={tryAgain}
        />
      );
    default:
      return null;
  }
}
